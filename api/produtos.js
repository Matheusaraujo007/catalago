import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM produtos ORDER BY id ASC");
      res.status(200).json(result.rows || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      res.status(500).json({ error: "Erro ao buscar produtos" });
    }
  }

  else if (req.method === "POST") {
    try {
      const { nome, categoria, venda, estoque, codigo, descricao, imagens } = req.body;
      const result = await pool.query(
        "INSERT INTO produtos (nome, categoria, preco, estoque, codigo, descricao, imagens) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
        [nome, categoria, venda, estoque, codigo, descricao, imagens]
      );
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      res.status(500).json({ error: "Erro ao salvar produto" });
    }
  }

  else if (req.method === "PUT") {
    try {
      const { id, nome, categoria, venda, estoque, codigo, descricao, imagens } = req.body;
      const result = await pool.query(
        `UPDATE produtos SET nome=$1, categoria=$2, preco=$3, estoque=$4, codigo=$5, descricao=$6, imagens=$7 WHERE id=$8 RETURNING *`,
        [nome, categoria, venda, estoque, codigo, descricao, imagens, id]
      );
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      res.status(500).json({ error: "Erro ao atualizar produto" });
    }
  }

  else if (req.method === "DELETE") {
    try {
      const { id } = req.body;
      await pool.query("DELETE FROM produtos WHERE id=$1", [id]);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      res.status(500).json({ error: "Erro ao excluir produto" });
    }
  }

  else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
