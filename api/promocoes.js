import { pool } from "../db.js";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      const { rows } = await pool.query(`
        SELECT p.*, pr.nome AS produto_nome 
        FROM promocoes p 
        LEFT JOIN produtos pr ON pr.id = p.produto_id
        ORDER BY p.id DESC
      `);
      res.status(200).json(rows);
      break;

    case "POST":
      const { produto_id, tipo, valor, data_fim } = req.body;
      await pool.query(
        "INSERT INTO promocoes (produto_id, tipo, valor, data_fim) VALUES ($1, $2, $3, $4)",
        [produto_id, tipo, valor, data_fim]
      );
      res.status(201).json({ message: "Promoção criada" });
      break;

    default:
      res.status(405).end();
  }
}
