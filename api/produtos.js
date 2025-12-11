import { Client } from "pg";

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    if (req.method === "GET") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: "ID não informado." });
      }

      const result = await client.query("SELECT * FROM produtos WHERE id = $1", [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Produto não encontrado." });
      }

      return res.status(200).json(result.rows[0]);
    }

    return res.status(405).json({ message: "Método não permitido" });

  } catch (err) {
    console.error("Erro:", err);
    return res.status(500).json({ message: "Erro no servidor" });

  } finally {
    await client.end();
  }
}
