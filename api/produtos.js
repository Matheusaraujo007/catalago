import { Client } from "pg";

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    // === [GET] Buscar produtos ===
    if (req.method === "GET") {
      const result = await client.query(`
        SELECT 
          p.id,
          p.nome,
          p.categoria,
          p.preco AS preco_original,
          p.estoque,
          p.codigo,
          p.descricao,
          p.imagens,
          p.imagem_base64,
          pr.tipo AS tipo_promocao,
          pr.valor AS valor_promocao,
          pr.data_fim,
          pr.ativo,
          CASE 
            WHEN pr.ativo = true 
              AND (pr.data_fim IS NULL OR pr.data_fim > NOW())
              THEN 
                CASE 
                  WHEN pr.tipo = 'percentual' THEN ROUND(p.preco * (1 - pr.valor / 100), 2)
                  WHEN pr.tipo = 'valor' THEN ROUND(p.preco - pr.valor, 2)
                  ELSE p.preco
                END
            ELSE p.preco
          END AS preco_final
        FROM produtos p
        LEFT JOIN promocoes pr ON pr.produto_id = p.id
        ORDER BY p.id DESC
      `);

      return res.status(200).json(result.rows);
    }

    // === [POST] Adicionar produto ===
    else if (req.method === "POST") {
      const { nome, categoria, venda, estoque, codigo, descricao, imagens } = req.body;

      if (!nome || !categoria || !venda || !estoque || !codigo) {
        return res.status(400).json({ message: "Campos obrigatórios não preenchidos." });
      }

      const query = `
        INSERT INTO produtos (nome, categoria, preco, estoque, codigo, descricao, imagens, imagem_base64)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const values = [
        nome,
        categoria,
        venda,
        estoque,
        codigo,
        descricao || "",
        imagens || [],
        imagens?.[0] || null,
      ];

      const result = await client.query(query, values);
      return res.status(201).json(result.rows[0]);
    }

    // === [PUT] Editar produto ===
    else if (req.method === "PUT") {
      const { nomeAntigo, nome, categoria, venda, estoque, codigo, descricao, imagens } = req.body;

      if (!nomeAntigo) {
        return res.status(400).json({ message: "Nome antigo não informado." });
      }

      const query = `
        UPDATE produtos
        SET nome=$1, categoria=$2, preco=$3, estoque=$4, codigo=$5, descricao=$6, imagens=$7, imagem_base64=$8
        WHERE nome=$9
        RETURNING *
      `;
      const values = [
        nome,
        categoria,
        venda,
        estoque,
        codigo,
        descricao,
        imagens || [],
        imagens?.[0] || null,
        nomeAntigo,
      ];

      const result = await client.query(query, values);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Produto não encontrado." });
      }

      return res.status(200).json(result.rows[0]);
    }

    // === [DELETE] Excluir produto ===
    else if (req.method === "DELETE") {
      const nome = req.query.nome;
      if (!nome) return res.status(400).json({ message: "Nome não informado." });

      const result = await client.query("DELETE FROM produtos WHERE nome=$1", [nome]);
      if (result.rowCount === 0)
        return res.status(404).json({ message: "Produto não encontrado." });

      return res.status(200).json({ message: "Produto excluído com sucesso!" });
    }

    // === [Método não permitido] ===
    else {
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Método ${req.method} não permitido`);
    }
  } catch (error) {
    console.error("Erro no servidor:", error);
    return res
      .status(500)
      .json({ message: "Erro interno do servidor", error: error.message });
  } finally {
    await client.end();
  }
}
