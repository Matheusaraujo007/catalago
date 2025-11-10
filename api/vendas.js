import { Client } from "pg";

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    if (req.method === "GET") {
      const result = await client.query("SELECT * FROM vendas ORDER BY id DESC");
      return res.status(200).json(result.rows);
    }

    if (req.method === "PUT") {
      const { id, status } = req.body;
      if (!id || !status) {
        return res.status(400).json({ message: "ID e status são obrigatórios." });
      }

      const result = await client.query(
        "UPDATE vendas SET status=$1 WHERE id=$2 RETURNING *",
        [status, id]
      );

      if (result.rowCount === 0)
        return res.status(404).json({ message: "Venda não encontrada." });

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === "POST") {
      const { cliente_id, valor_total, status, metodo_pagamento, observacoes } = req.body;
      const result = await client.query(
        "INSERT INTO vendas (cliente_id, valor_total, status, metodo_pagamento, observacoes) VALUES ($1,$2,$3,$4,$5) RETURNING *",
        [cliente_id || null, valor_total || 0, status || "pendente", metodo_pagamento || null, observacoes || ""]
      );
      return res.status(201).json(result.rows[0]);
    }

    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    return res.status(405).end(`Método ${req.method} não permitido.`);
  } catch (err) {
    console.error("Erro API vendas:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
}
