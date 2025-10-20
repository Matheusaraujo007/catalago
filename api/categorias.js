// /api/categorias.js
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM categorias ORDER BY id DESC");
      res.status(200).json(result.rows || []);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      res.status(500).json({ error: "Erro ao buscar categorias" });
    }
  }

  else if (req.method === "POST") {
    try {
      const { nome } = req.body;

      if (!nome || nome.trim() === "") {
        return res.status(400).json({ error: "Nome da categoria é obrigatório" });
      }

      const result = await pool.query(
        "INSERT INTO categorias (nome) VALUES ($1) RETURNING *",
        [nome.trim()]
      );

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      res.status(500).json({ error: "Erro ao salvar categoria" });
    }
  }

  else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
