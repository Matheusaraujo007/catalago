import { pool } from "../db.js";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      const { rows } = await pool.query(`
        SELECT v.*, c.nome AS cliente_nome 
        FROM vendas v 
        LEFT JOIN clientes c ON c.id = v.cliente_id
        ORDER BY v.id DESC
      `);
      res.status(200).json(rows);
      break;

    case "POST":
      const { cliente_id, valor_total, status } = req.body;
      await pool.query(
        "INSERT INTO vendas (cliente_id, valor_total, status) VALUES ($1, $2, $3)",
        [cliente_id, valor_total, status]
      );
      res.status(201).json({ message: "Venda registrada" });
      break;

    default:
      res.status(405).end();
  }
}
