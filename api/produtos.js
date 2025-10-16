// api/produtos.js
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL, // URL do Neon
  ssl: { rejectUnauthorized: false }          // necessário para Neon
});

export default async function handler(req, res) {
  if(req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM produtos ORDER BY id DESC");
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar produtos" });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      await pool.query("DELETE FROM produtos WHERE id=$1", [id]);
      res.status(200).json({ message: "Produto excluído" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao excluir produto" });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM produtos ORDER BY id DESC");
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar produtos" });
    }
  } 
  else if (req.method === "POST") {
    try {
      const { nome, categoria, venda, estoque, codigo, descricao, imagens } = req.body;
      const query = `
        INSERT INTO produtos (nome, categoria, venda, estoque, codigo, descricao, imagens)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const values = [nome, categoria, venda, estoque, codigo, descricao, imagens];
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao salvar produto" });
    }
  } 
  else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
