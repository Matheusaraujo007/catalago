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
          p.imagem_base64,
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

        if (p.tipo_promocao) {
          if (p.tipo_promocao === "percentual") {
            preco_final -= preco_final * (Number(p.valor_promocao) / 100);
            desconto_label = `${p.valor_promocao}% OFF`;
          } else if (p.tipo_promocao === "fixo") {
            preco_final -= Number(p.valor_promocao);
            desconto_label = `R$ ${Number(p.valor_promocao).toFixed(2)} OFF`;
          }
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
          imagem_base64: p.imagem_base64,
          desconto_label,
        };
      });

      return res.status(200).json(produtos);
    }

    // === CADASTRAR PRODUTO ===
    else if (req.method === "POST") {
      const { nome, categoria, preco, estoque, codigo, descricao, imagem_base64 } = req.body;

      const result = await client.query(
        `INSERT INTO produtos (nome, categoria, preco, estoque, codigo, descricao, imagem_base64)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [nome, categoria, preco, estoque, codigo, descricao, imagem_base64]
      );

      return res.status(201).json(result.rows[0]);
    }

    // === EDITAR PRODUTO ===
    else if (req.method === "PUT") {
      const { id, nome, categoria, preco, estoque, codigo, descricao, imagem_base64 } = req.body;

      const result = await client.query(
        `UPDATE produtos
         SET nome=$1, categoria=$2, preco=$3, estoque=$4, codigo=$5, descricao=$6, imagem_base64=$7
         WHERE id=$8
         RETURNING *`,
        [nome, categoria, preco, estoque, codigo, descricao, imagem_base64, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      return res.status(200).json(result.rows[0]);
    }

    // === EXCLUIR PRODUTO ===
    else if (req.method === "DELETE") {
      const { id } = req.body;

      const result = await client.query(`DELETE FROM produtos WHERE id=$1`, [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      return res.status(200).json({ message: "Produto excluído com sucesso!" });
    }

    // === MÉTODO INVÁLIDO ===
    else {
      return res.status(405).json({ message: "Método não permitido" });
    }
  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  } finally {
    await client.end();
  }
}
