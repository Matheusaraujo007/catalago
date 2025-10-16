import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM produtos ORDER BY id DESC");
      res.status(200).json(result.rows); // Retorna JSON
    } catch (error) {
      console.error("Erro no GET /api/produtos:", error);
      res.status(500).json({ error: "Erro ao buscar produtos" });
    }
  } else if (req.method === "POST") {
    try {
      const { nome, categoria, venda, estoque, codigo, descricao, imagens } = req.body;
      const result = await pool.query(
        `INSERT INTO produtos (nome, categoria, preco, estoque, codigo, descricao, imagens)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [nome, categoria, venda, estoque, codigo, descricao, imagens]
      );
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Erro no POST /api/produtos:", error);
      res.status(500).json({ error: "Erro ao salvar produto" });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
