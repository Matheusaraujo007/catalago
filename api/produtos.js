import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const result = await pool.query("SELECT * FROM produtos ORDER BY id ASC");
      return res.status(200).json(result.rows || []);
    }

    // ✅ INSERIR PRODUTO
    if (req.method === "POST") {
      const { nome, categoria, venda, estoque, codigo, descricao, imagens } = req.body;

      if (!nome || !categoria || !venda || !estoque || !codigo) {
        return res.status(400).json({ error: "Campos obrigatórios não preenchidos" });
      }

      const result = await pool.query(
        `INSERT INTO produtos (nome, categoria, preco, estoque, codigo, descricao, imagens)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [nome, categoria, venda, estoque, codigo, descricao, imagens]
      );

      return res.status(200).json(result.rows[0]);
    }

    // ✅ EDITAR PRODUTO PELO NOME ANTIGO
    if (req.method === "PUT") {
      const { nomeAntigo, nome, categoria, venda, estoque, codigo, descricao, imagens } = req.body;

      if (!nomeAntigo) {
        return res.status(400).json({ error: "Nome antigo não informado" });
      }

      const result = await pool.query(
        `UPDATE produtos
         SET nome=$1, categoria=$2, preco=$3, estoque=$4, codigo=$5, descricao=$6, imagens=$7
         WHERE nome=$8
         RETURNING *`,
        [nome, categoria, venda, estoque, codigo, descricao, imagens, nomeAntigo]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      return res.status(200).json(result.rows[0]);
    }

    // ✅ EXCLUIR PRODUTO PELO NOME
    if (req.method === "DELETE") {
      const { nome } = req.body;

      if (!nome) {
        return res.status(400).json({ error: "Nome não informado" });
      }

      const result = await pool.query("DELETE FROM produtos WHERE nome=$1 RETURNING *", [nome]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      return res.status(200).json({ success: true });
    }

    // Caso o método não seja permitido
    return res.status(405).json({ error: "Método não permitido" });
  } catch (error) {
    console.error("Erro na API /api/produtos:", error.message);
    return res.status(500).json({ error: "Erro interno no servidor", details: error.message });
  }
}
