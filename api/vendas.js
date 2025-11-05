// api/vendas.js
import { pool } from "../db.js";

export default async function handler(req, res) {
  const method = req.method;

  if (method === "POST") {
    const { cliente_id, valor_total, status, itens } = req.body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: "Itens obrigatórios" });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertVenda = await client.query(
        `INSERT INTO vendas (cliente_id, valor_total, status) VALUES ($1, $2, $3) RETURNING id, criado_em`,
        [cliente_id || null, valor_total, status || 'pendente']
      );
      const vendaId = insertVenda.rows[0].id;

      // Inserir itens_venda (array de {produto_id, quantidade, preco_unitario})
      const insertText = `INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4) RETURNING id`;
      for (const it of itens) {
        const { produto_id, quantidade, preco_unitario } = it;
        await client.query(insertText, [vendaId, produto_id, quantidade, preco_unitario]);
        // Opcional: decrementar estoque (se quiser)
        await client.query(`UPDATE produtos SET estoque = GREATEST(0, estoque - $1) WHERE id = $2`, [quantidade, produto_id]);
      }

      await client.query('COMMIT');
      res.status(201).json({ success: true, vendaId });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Erro criando venda:', err);
      res.status(500).json({ error: 'Erro ao criar venda' });
    } finally {
      client.release();
    }
    return;
  }

  // GET (opcional: listar vendas)
  if (method === "GET") {
    try {
      const { rows } = await pool.query("SELECT * FROM vendas ORDER BY id DESC");
      return res.status(200).json(rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao listar vendas' });
    }
  }

  res.setHeader('Allow', 'GET,POST');
  res.status(405).end(`Method ${method} Not Allowed`);
}
