import { Client } from "pg";

export default function Pedido({ pedido }) {
  if (!pedido) return <p>Pedido não encontrado!</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Resumo do Pedido #{pedido.id}</h1>
      <p><strong>Cliente:</strong> {pedido.cliente}</p>
      <p><strong>Total:</strong> R$ {pedido.total}</p>
      <p><strong>Endereço:</strong> {pedido.endereco || "Retirada na loja"}</p>
      <p><strong>Telefone:</strong> {pedido.telefone}</p>
      <h2>Itens:</h2>
      <ul>
        {pedido.itens.map((item, index) => (
          <li key={index}>{item.quantidade} x {item.nome} - R$ {item.preco}</li>
        ))}
      </ul>
    </div>
  );
}

// Busca o pedido do banco pelo ID
export async function getServerSideProps({ params }) {
  const client = new Client({ connectionString: process.env.NEON_DB_URL });
  await client.connect();

  try {
    const res = await client.query("SELECT * FROM pedidos WHERE id=$1", [params.id]);
    if (res.rows.length === 0) return { props: { pedido: null } };

    const pedido = res.rows[0];
    pedido.itens = JSON.parse(pedido.itens); // converte string JSON de volta para array

    return { props: { pedido } };
  } catch (err) {
    console.log(err);
    return { props: { pedido: null } };
  } finally {
    await client.end();
  }
}
