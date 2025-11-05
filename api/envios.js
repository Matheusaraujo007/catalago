import { pool } from "../db.js";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      const { rows } = await pool.query("SELECT * FROM envios ORDER BY id DESC");
      res.status(200).json(rows);
      break;

    case "POST":
      const { venda_id, codigo_rastreamento, transportadora, status_envio } = req.body;
      await pool.query(
        "INSERT INTO envios (venda_id, codigo_rastreamento, transportadora, status_envio) VALUES ($1, $2, $3, $4)",
        [venda_id, codigo_rastreamento, transportadora, status_envio]
      );
      res.status(201).json({ message: "Envio cadastrado" });
      break;

    default:
      res.status(405).end();
  }
}
