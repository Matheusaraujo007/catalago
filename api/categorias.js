import { pool } from "../db.js";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      const { rows } = await pool.query("SELECT * FROM categorias ORDER BY id DESC");
      res.status(200).json(rows);
      break;

    case "POST":
      const { nome, descricao } = req.body;
      await pool.query(
        "INSERT INTO categorias (nome, descricao) VALUES ($1, $2)",
        [nome, descricao]
      );
      res.status(201).json({ message: "Categoria criada" });
      break;

    case "DELETE":
      const { id } = req.query;
      await pool.query("DELETE FROM categorias WHERE id = $1", [id]);
      res.status(200).json({ message: "Categoria removida" });
      break;

    default:
      res.status(405).end();
  }
}
