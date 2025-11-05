import bcrypt from "bcryptjs";
import { pool } from "../db.js";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "POST":
      const { nome, email, senha } = req.body;
      const hash = await bcrypt.hash(senha, 10);
      await pool.query(
        "INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3)",
        [nome, email, hash]
      );
      res.status(201).json({ message: "Usuário criado" });
      break;

    case "GET":
      const { rows } = await pool.query("SELECT id, nome, email, nivel_acesso FROM usuarios");
      res.status(200).json(rows);
      break;

    default:
      res.status(405).end();
  }
}
