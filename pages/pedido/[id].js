import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Pedido() {
  const router = useRouter();
  const { id } = router.query;

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchPedido() {
      try {
        const res = await fetch(`/api/obterPedido?id=${id}`);
        const data = await res.json();

        if (!data.sucesso) {
          setErro(data.erro);
          setLoading(false);
          return;
        }

        setPedido(data.pedido);
        setLoading(false);
      } catch (err) {
        setErro(err.message);
        setLoading(false);
      }
    }

    fetchPedido();
  }, [id]);

  if (loading) return <p>Carregando pedido...</p>;
  if (erro) return <p>Erro: {erro}</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Resumo do Pedido #{pedido.id}</h1>
      <p><strong>Cliente:</strong> {pedido.cliente}</p>
      <p><strong>Total:</strong> R$ {pedido.total}</p>
      <p><strong>Endereço:</strong> {pedido.endereco || "Retirada na loja"}</p>
      <p><strong>Contato:</strong> (88) 99490-7177</p>
      <p><strong>Pagamento:</strong> {pedido.tipo_pagamento}</p>

      <h2>Itens:</h2>
      <ul>
        {JSON.parse(pedido.itens).map((item, index) => (
          <li key={index}>
            {item.quantidade || 1} x {item.nome} - R$ {(item.preco * (item.quantidade || 1)).toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
