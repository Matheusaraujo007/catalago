import { Client } from "pg";

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    // SOMENTE dados essenciais + 1 imagem
    const query = `
      SELECT 
        id,
        nome,
        categoria AS categoria_nome,
        preco,
        imagem_base64
      FROM produtos
      ORDER BY id DESC
    `;

    const result = await client.query(query);
    res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno" });

  } finally {
    await client.end();
  }
}
