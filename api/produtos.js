// api/produtos.js
import { Client } from "pg";

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    // === LISTAR PRODUTOS ===
    if (req.method === "GET") {
      const result = await client.query(`
        SELECT 
          p.id,
          p.nome,
          p.preco,
          p.estoque,
          p.categoria,
          p.codigo,
          p.descricao,
          p.imagens,
          pr.tipo AS tipo_promocao,
          pr.valor AS valor_promocao,
          pr.data_fim
        FROM produtos p
        LEFT JOIN promocoes pr 
          ON pr.produto_id = p.id 
          AND pr.data_fim >= CURRENT_DATE
        ORDER BY p.id DESC
      `);

      const produtos = result.rows.map((p) => {
        let preco_final = Number(p.preco);
        let desconto_label = null;

        // 🧮 Calcula o preço com promoção, se houver
        if (p.tipo_promocao) {
          if (p.tipo_promocao === "percentual") {
            preco_final -= preco_final * (Number(p.valor_promocao) / 100);
            desconto_label = `${p.valor_promocao}% OFF`;
          } else if (p.tipo_promocao === "fixo") {
            preco_final -= Number(p.valor_promocao);
            desconto_label = `R$ ${Number(p.valor_promocao).toFixed(2)} OFF`;
          }
        }

        // 🖼️ Converte o campo imagens para array real
        let imagens = [];
        try {
          if (p.imagens) {
            imagens = typeof p.imagens === "string" ? JSON.parse(p.imagens) : p.imagens;
          }
        } catch {
          imagens = [];
        }

        return {
          id: p.id,
          nome: p.nome,
          preco: Number(p.preco).toFixed(2),
          preco_final: preco_final.toFixed(2),
          estoque: p.estoque,
          categoria: p.categoria,
          codigo: p.codigo,
          descricao: p.descricao,
          imagens,
          desconto_label,
        };
      });

      res.status(200).json(produtos);
    }

    // === CADASTRAR PRODUTO ===
    else if (req.method === "POST") {
      const { nome, categoria, venda, estoque, codigo, descricao, imagens } = req.body;

      const result = await client.query(
        `INSERT INTO produtos (nome, categoria, preco, estoque, codigo, descricao, imagens)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [nome, categoria, venda, estoque, codigo, descricao, JSON.stringify(imagens)]
      );

      res.status(201).json(result.rows[0]);
    }

    // === EDITAR PRODUTO ===
    else if (req.method === "PUT") {
      const { nomeAntigo, nome, categoria, venda, estoque, codigo, descricao, imagens } = req.body;

      const result = await client.query(
        `UPDATE produtos
         SET nome=$1, categoria=$2, preco=$3, estoque=$4, codigo=$5, descricao=$6, imagens=$7
         WHERE nome=$8
         RETURNING *`,
        [nome, categoria, venda, estoque, codigo, descricao, JSON.stringify(imagens), nomeAntigo]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      res.status(200).json(result.rows[0]);
    }

    // === EXCLUIR PRODUTO ===
    else if (req.method === "DELETE") {
      const { nome } = req.body;
      const result = await client.query(`DELETE FROM produtos WHERE nome=$1`, [nome]);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      res.status(200).json({ message: "Produto excluído com sucesso!" });
    }

    // === MÉTODO INVÁLIDO ===
    else {
      res.status(405).json({ message: "Método não permitido" });
    }
  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  } finally {
    await client.end();
  }
}
