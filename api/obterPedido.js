import { Client } from "pg";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { id } = req.query;

  const client = new Client({ connectionString: process.env.NEON_DB_URL });
  await client.connect();

  try {
    const resultado = await client.query(
      `SELECT * FROM pedidos WHERE id=$1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ sucesso: false, erro: "Pedido não encontrado" });
    }

    res.status(200).json({ sucesso: true, pedido: resultado.rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ sucesso: false, erro: err.message });
  } finally {
    await client.end();
  }
}
