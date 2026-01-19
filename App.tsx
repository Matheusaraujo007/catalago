
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Banner, Promotion, CartItem } from './types';
import { getLocalCache, syncData } from './services/api';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mpx_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const cache = getLocalCache();
    if (cache) {
      setProducts(cache.products || []);
      setBanners(cache.banners || []);
      setPromotions(cache.promotions || []);
      setLoading(false);
    }

    syncData().then(data => {
      if (data && data.products) setProducts(data.products);
      if (data && data.banners) setBanners(data.banners);
      if (data && data.promotions) setPromotions(data.promotions);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('mpx_cart', JSON.stringify(cart));
  }, [cart]);

  const money = (v: any) => {
    const val = typeof v === 'number' ? v : Number(v) || 0;
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getPrice = (prod: Product) => {
    const original = Number(prod.preco) || 0;
    const promo = promotions.find(p => p.nome_produto === prod.nome && p.ativo);
    if (!promo) return { current: original, discount: null };
    
    const val = promo.tipo === 'percentual' 
      ? original * (1 - promo.valor / 100) 
      : original - promo.valor;
      
    return { 
      current: Math.max(0, val), 
      discount: promo.tipo === 'percentual' ? `${promo.valor}% OFF` : 'OFERTA' 
    };
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => 
      (p.nome || '').toLowerCase().includes(q) || 
      (p.categoria_nome || p.categoria || '').toLowerCase().includes(q)
    );
  }, [products, search]);

  const categories = useMemo(() => {
    const cats: Record<string, Product[]> = {};
    filtered.forEach(p => {
      const name = String(p.categoria_nome || p.categoria || 'Outros');
      if (!cats[name]) cats[name] = [];
      cats[name].push(p);
    });
    return cats;
  }, [filtered]);

  const toggleCart = (prod: Product) => {
    const { current } = getPrice(prod);
    setCart(prev => {
      const has = prev.find(i => i.id === prod.id);
      if (has) return prev.filter(i => i.id !== prod.id);
      return [...prev, { id: prod.id, qt: 1, price: current }];
    });
  };

  const sendWhatsApp = () => {
    const itemsText = cart.map(item => {
      const p = products.find(prod => prod.id === item.id);
      return `• ${p?.nome} (${item.qt}x) - ${money(item.price * item.qt)}`;
    }).join('\n');
    const total = cart.reduce((acc, i) => acc + (i.price * i.qt), 0);
    const text = encodeURIComponent(`*Novo Pedido - ManchinhaPx*\n\n${itemsText}\n\n*Total: ${money(total)}*`);
    window.open(`https://wa.me/5588996077146?text=${text}`);
  };

  const formatImg = (img?: string) => {
    if (!img) return 'https://picsum.photos/300/300?grayscale';
    return img.startsWith('data') ? img : `data:image/jpeg;base64,${img}`;
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-black text-xl italic shadow-inner">M</div>
            <h1 className="font-extrabold text-lg tracking-tight">MANCHINHAPX <span className="text-yellow-500">ARTS</span></h1>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-gray-50 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>}
          </button>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="O que você precisa hoje?" 
            className="w-full bg-gray-100 border-none rounded-2xl py-3 px-11 text-sm focus:ring-2 focus:ring-yellow-400 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </header>

      {!search && banners.length > 0 && (
        <div className="px-4 py-4 no-scrollbar overflow-x-auto flex gap-3 snap-x">
          {banners.map(b => (
            <div key={b.id} className="min-w-[300px] h-40 rounded-3xl overflow-hidden snap-center shadow-lg bg-gray-200">
              <img src={formatImg(b.imagem_base64)} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      )}

      <main className="px-4 pb-32">
        {loading && products.length === 0 ? (
          <div className="py-10 space-y-8">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-48 bg-gray-200 rounded-2xl"></div>
                  <div className="h-48 bg-gray-200 rounded-2xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          Object.entries(categories).map(([name, items]) => (
            <section key={name} className="mt-8 animate-fade-in">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                {name}
              </h2>
              <div className="product-grid">
                {items.map(p => {
                  const { current, discount } = getPrice(p);
                  const inCart = cart.some(i => i.id === p.id);
                  return (
                    <div key={p.id} className="bg-white rounded-3xl p-3 border border-gray-50 shadow-sm flex flex-col group active:scale-95 transition-transform">
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
                        <img 
                          src={formatImg(p.imagem_base64)} 
                          className="w-full h-full object-cover" 
                          loading="lazy"
                        />
                        {discount && <span className="absolute top-2 left-2 bg-black text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter">{discount}</span>}
                      </div>
                      <h3 className="text-[13px] font-bold leading-tight mb-2 line-clamp-2 h-8">{p.nome}</h3>
                      <div className="mt-auto">
                        <div className="flex flex-col mb-3">
                          <span className="text-xs text-gray-400 line-through leading-none h-3">{discount ? money(p.preco) : ''}</span>
                          <span className="text-lg font-black">{money(current)}</span>
                        </div>
                        <button 
                          onClick={() => toggleCart(p)}
                          className={`w-full py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all ${inCart ? 'bg-black text-white' : 'bg-yellow-400 text-black hover:bg-yellow-500'}`}
                        >
                          {inCart ? 'No Carrinho' : 'Adicionar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 flex items-center justify-between border-b">
              <h2 className="text-xl font-black italic">PEDIDO</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-4xl mb-4">🛒</div>
                  <p className="text-gray-400 font-medium">Vazio.</p>
                </div>
              ) : (
                cart.map(item => {
                  const p = products.find(prod => prod.id === item.id);
                  return (
                    <div key={item.id} className="flex gap-4 items-center animate-fade-in">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                        <img src={formatImg(p?.imagem_base64)} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold line-clamp-1">{p?.nome || 'Produto'}</h4>
                        <p className="text-xs font-black text-yellow-600">{money(item.price)}</p>
                      </div>
                      <button onClick={() => toggleCart(p!)} className="text-red-400 p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-gray-400">TOTAL</span>
                <span className="text-2xl font-black">{money(cart.reduce((acc, i) => acc + (i.price * i.qt), 0))}</span>
              </div>
              <button 
                onClick={sendWhatsApp}
                disabled={cart.length === 0}
                className="w-full bg-green-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-100 disabled:bg-gray-300"
              >
                Finalizar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      <a 
        href="https://wa.me/5588996077146" 
        target="_blank" 
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-400 z-30 transition-transform active:scale-90"
      >
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.893-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.892-11.893 11.892-1.997 0-3.951-.5-5.688-1.448l-6.305 1.66z"/></svg>
      </a>
    </div>
  );
};

export default App;
