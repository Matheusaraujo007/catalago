import { pool } from "../db.js";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      const { rows } = await pool.query(`
        SELECT m.*, c.nome AS cliente_nome 
        FROM mensagens m 
        LEFT JOIN clientes c ON c.id = m.cliente_id 
        ORDER BY m.id DESC
      `);
      res.status(200).json(rows);
      break;

    case "POST":
      const { cliente_id, mensagem, resposta } = req.body;
      await pool.query(
        "INSERT INTO mensagens (cliente_id, mensagem, resposta) VALUES ($1, $2, $3)",
        [cliente_id, mensagem, resposta || null]
      );
      res.status(201).json({ message: "Mensagem adicionada" });
      break;

    default:
      res.status(405).end();
  }
}
