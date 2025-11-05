// api/produtos.js
import { Client } from "pg";

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    if (req.method === "GET") {
      const result = await client.query(`
        SELECT 
          p.id,
          p.nome,
          p.preco,
          p.estoque,
          p.categoria,
          p.imagem, -- <== Aqui garantimos que o campo de imagem venha
          pr.tipo AS tipo_promocao,
          pr.valor AS valor_promocao,
          pr.data_fim
        FROM produtos p
        LEFT JOIN promocoes pr 
          ON pr.produto_id = p.id 
          AND pr.data_fim >= CURRENT_DATE
        ORDER BY p.id DESC
      `);

      const produtos = result.rows.map((p) => {
        let preco_final = Number(p.preco);
        let desconto_label = null;

        if (p.tipo_promocao) {
          if (p.tipo_promocao === "percentual") {
            preco_final -= preco_final * (Number(p.valor_promocao) / 100);
            desconto_label = `${p.valor_promocao}% OFF`;
          } else if (p.tipo_promocao === "fixo") {
            preco_final -= Number(p.valor_promocao);
            desconto_label = `R$ ${Number(p.valor_promocao).toFixed(2)} OFF`;
          }
        }

        return {
          id: p.id,
          nome: p.nome,
          preco: Number(p.preco).toFixed(2),
          preco_final: preco_final.toFixed(2),
          estoque: p.estoque,
          categoria: p.categoria,
          imagem: p.imagem, // ✅ agora o frontend recebe a imagem também
          desconto_label,
        };
      });

      res.status(200).json(produtos);
    }

    else if (req.method === "POST") {
      const { nome, preco, estoque, categoria, imagem } = req.body;
      await client.query(
        "INSERT INTO produtos (nome, preco, estoque, categoria, imagem) VALUES ($1, $2, $3, $4, $5)",
        [nome, preco, estoque, categoria, imagem]
      );
      res.status(201).json({ message: "Produto cadastrado com sucesso!" });
    }

    else {
      res.status(405).json({ message: "Método não permitido" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  } finally {
    await client.end();
  }
}
