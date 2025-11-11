import { Client } from 'pg';

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    if (req.method === 'GET') {
      const result = await client.query('SELECT * FROM banners1 ORDER BY criado_em DESC');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { banner1 } = req.body;

      if (!banner1) {
        return res.status(400).json({ message: 'O campo banner1 é obrigatório.' });
      }

      await client.query('INSERT INTO banners1 (banner1) VALUES ($1)', [banner1]);
      return res.status(201).json({ message: 'Banner salvo com sucesso!' });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Método ${req.method} não permitido`);
  } catch (error) {
    console.error('Erro na API banner1:', error);
    return res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  } finally {
    await client.end();
  }
}
