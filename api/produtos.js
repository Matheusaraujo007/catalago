// api/produtos.js
import { Client } from 'pg';

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    if (req.method === 'GET') {
      const result = await client.query('SELECT * FROM produtos ORDER BY id DESC');
      res.status(200).json(result.rows);
    }

    else if (req.method === 'POST') {
      const { nome, preco, estoque, categoria } = req.body;
      await client.query(
        'INSERT INTO produtos (nome, preco, estoque, categoria) VALUES ($1, $2, $3, $4)',
        [nome, preco, estoque, categoria]
      );
      res.status(201).json({ message: 'Produto cadastrado com sucesso!' });
    }

    else {
      res.status(405).json({ message: 'Método não permitido' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  } finally {
    await client.end();
  }
}
