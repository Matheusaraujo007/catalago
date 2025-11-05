import { pool } from "../db.js";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      const { rows } = await pool.query(`
        SELECT p.*, c.nome AS categoria_nome 
        FROM produtos p
        LEFT JOIN categorias c ON c.id = p.categoria_id
        ORDER BY p.id DESC
      `);
      res.status(200).json(rows);
      break;

    case "POST":
      const { nome, descricao, preco, estoque, codigo_produto, categoria_id, imagem_url } = req.body;
      await pool.query(
        `INSERT INTO produtos (nome, descricao, preco, estoque, codigo_produto, categoria_id, imagem_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [nome, descricao, preco, estoque, codigo_produto, categoria_id, imagem_url]
      );
      res.status(201).json({ message: "Produto cadastrado" });
      break;

    case "DELETE":
      const { id } = req.query;
      await pool.query("DELETE FROM produtos WHERE id = $1", [id]);
      res.status(200).json({ message: "Produto excluído" });
      break;

    default:
      res.status(405).end();
  }
}
