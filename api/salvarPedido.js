import { Client } from "pg";

export default async function handler(req, res) {
  if(req.method !== "POST") return res.status(405).end();

  const { nomeCliente, carrinho, total, endereco, telefone, formaPagamento, tipoPagamento } = req.body;

  const client = new Client({ connectionString: process.env.NEON_DB_URL });
  await client.connect();

  try {
    const resultado = await client.query(
      `INSERT INTO pedidos 
        (cliente, itens, total, endereco, telefone, forma_pagamento, tipo_pagamento)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [
        nomeCliente,
        JSON.stringify(carrinho),
        total,
        endereco,
        telefone,
        formaPagamento,
        tipoPagamento
      ]
    );

    const pedidoID = resultado.rows[0].id;
    const linkResumo = `https://catalago-ashen.vercel.app/pedido/${pedidoID}`; // ajuste com seu domínio

    res.status(200).json({ sucesso: true, linkResumo });
  } catch (err) {
    console.log(err);
    res.status(500).json({ sucesso: false, erro: err.message });
  } finally {
    await client.end();
  }
}
