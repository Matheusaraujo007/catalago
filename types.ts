
export interface Product {
  id: number;
  nome: string;
  preco: number | string;
  categoria: string;
  categoria_nome?: string;
  descricao?: string;
  imagem_base64?: string;
  imagens?: string[];
}

export interface Banner {
  id: number;
  titulo?: string;
  imagem_base64: string;
  link?: string;
}

export interface Promotion {
  id: number;
  nome_produto: string;
  tipo: 'percentual' | 'valor';
  valor: number;
  ativo: boolean;
  data_fim?: string;
}

export interface CartItem {
  id: number;
  qt: number;
  price: number;
  material?: string;
  tamanho?: string;
  modelo?: string;
  virtual?: boolean;
}

export interface CacheData {
  products: Product[];
  banners: Banner[];
  promotions: Promotion[];
  timestamp: number;
}
