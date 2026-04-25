import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, ShoppingBag, ShoppingCart, UserCheck, LogOut, ImageOff } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

function CustomerPanel({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('Market');
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState([]);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchBooks();
    fetchCart();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API_URL}/books`);
      setBooks(res.data);
    } catch (err) {
      console.error("Kitaplar yüklenemedi:", err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API_URL}/cart`, { headers });
      setCart(res.data);
    } catch (err) {
      console.error("Sepet yüklenemedi:", err);
    }
  };

  const addToCart = async (bookId) => {
    // Junk verideki hataları yakalamak için ön kontrol
    const targetBook = books.find(b => b.id === bookId);

    // Eğer stok negatifse veya 0 ise backend muhtemelen reddeder
    if (!targetBook || targetBook.stock <= 0) {
      alert("Hata: Bu kitap geçersiz stok (Junk Data) nedeniyle sepete eklenemez!");
      return;
    }

    // Fiyat kontrolü - saçma değerleri engelle
    if (!targetBook.price || parseFloat(targetBook.price) <= 0) {
      alert("Hata: Bu kitap geçersiz fiyat (Junk Data) nedeniyle sepete eklenemez!");
      return;
    }

    try {
      // Miktarı her zaman güvenli (1) gönderiyoruz
      await axios.post(`${API_URL}/cart`,
        { book_id: parseInt(bookId), quantity: 1 },
        { headers }
      );
      fetchCart();
    } catch (err) {
      // Backend'den gelen spesifik hata mesajını göster (Örn: Foreign Key hatası)
      const errorMsg = err.response?.data?.message || "Veri tabanı kısıtlaması nedeniyle eklenemedi.";
      alert(`Hata: ${errorMsg}`);
    }
  };

  const removeFromCart = async (cartId) => {
    await axios.delete(`${API_URL}/cart/${cartId}`, { headers });
    fetchCart();
  };

  const checkout = async () => {
    if (validCartItems.length === 0) {
      alert("Sepetinizde geçerli ürün bulunmamaktadır.");
      return;
    }
    try {
      await axios.post(`${API_URL}/orders`, {}, { headers });
      setCart([]);
      alert('Satın alma işlemi başarıyla tamamlandı! Teşekkürler.');
      fetchBooks(); // Stok güncellemesi için
      fetchCart();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Sipariş işlenemedi. Stok kontrolü yapın.";
      alert(`Hata: ${errorMsg}`);
    }
  };

  // --- HESAPLAMA GÜVENLİĞİ (NaN ÖNLEYİCİ + Junk Data Filtreleme) ---
  const validCartItems = cart.filter(item => item.title && item.price && parseFloat(item.price) > 0);
  const totalItems = validCartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
  const totalAmount = validCartItems.reduce((sum, item) => {
    const itemPrice = parseFloat(item.price) || 0;
    const itemQty = parseInt(item.quantity) || 0;
    return sum + (itemQty * itemPrice);
  }, 0);

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 shadow-sm flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-200">
          <div className="inline-flex items-center gap-3">
            <BookOpen className="text-slate-700" size={28} />
            <div>
              <h1 className="text-xl font-bold tracking-tight">Clean Bookstore</h1>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Customer</p>
            </div>
          </div>
        </div>
        <nav className="mt-6 px-4 space-y-2 text-slate-700 flex-1">
          {[
            { label: 'Market', icon: ShoppingBag },
            { label: 'Cart', icon: ShoppingCart },
            { label: 'Profile', icon: UserCheck },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition font-medium ${activeTab === item.label
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 mb-2">
                {activeTab === 'Market' ? 'Shopping' : activeTab === 'Cart' ? 'My Cart' : 'Account'}
              </p>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                {activeTab === 'Market' ? 'Kitap Mağazası' : activeTab === 'Cart' ? 'Sepetim' : 'Profilim'}
              </h2>
              <p className="mt-2 text-slate-500 max-w-2xl font-medium">
                {activeTab === 'Market'
                  ? 'Katalogdaki kitapları inceleyin ve güvenle satın alın.'
                  : activeTab === 'Cart'
                    ? 'Sepetinizdeki ürünleri düzenleyin ve satın alışı tamamlayın.'
                    : 'Hesap bilgileriniz ve siparişleriniz.'}
              </p>
            </div>
          </header>

          {/* İstatistikler */}
          <div className="grid gap-6 sm:grid-cols-3">
            <article className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Katalog</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{books.length}</p>
            </article>
            <article className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sepetim</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{totalItems} Ürün</p>
            </article>
            <article className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Toplam Tutar</p>
              <p className="mt-2 text-3xl font-black text-emerald-600">₺{totalAmount.toFixed(2)}</p>
            </article>
          </div>

          {/* MARKET TAB */}
          {activeTab === 'Market' && (
            <div className="grid gap-8">
              {/* Book List Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <h3 className="text-xl font-bold text-slate-800">Kitap Listesi</h3>
                  <span className="bg-slate-900 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase">Live Market</span>
                </div>
                <div className="grid gap-4">
                  {books.map((book) => (
                    <div key={book.id} className="flex items-center gap-6 rounded-[2rem] border border-slate-200 bg-white p-5 hover:shadow-md transition-all">
                      {book.image_url && book.image_url.length > 5 && book.image_url.startsWith('/') ? (
                        <img src={book.image_url} alt={book.title} className="h-28 w-20 rounded-xl shadow-md object-cover border border-slate-100" />
                      ) : (
                        <div className="h-28 w-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                          <ImageOff size={24} />
                        </div>
                      )}

                      <div className="flex-1">
                        <h4 className={`text-lg font-black ${!book.title || book.title.length < 2 ? 'text-rose-500 italic' : 'text-slate-900'}`}>
                          {book.title && book.title.length >= 2 ? book.title : "TANIMSIZ VERİ (Junk)"}
                        </h4>
                        <p className="text-slate-500 font-semibold">{book.author && book.author.length >= 2 ? book.author : "Bilinmeyen Yazar"}</p>
                        <div className="mt-3 flex items-center gap-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Fiyat</span>
                            <span className={`text-sm font-black ${!book.price || parseFloat(book.price) <= 0 || parseFloat(book.price) > 10000 ? 'text-rose-600' : 'text-slate-900'}`}>
                              {book.price && parseFloat(book.price) > 0 && parseFloat(book.price) <= 10000 ? `₺${book.price}` : 'GEÇERSİZ'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Stok</span>
                            <span className={`text-sm font-bold ${!book.stock || book.stock < 0 ? 'text-rose-600' : book.stock === 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                              {book.stock && book.stock >= 0 ? `${book.stock} Adet` : 'GEÇERSİZ'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(book.id)}
                        disabled={!book.stock || book.stock <= 0 || !book.price || parseFloat(book.price) <= 0 || parseFloat(book.price) > 10000}
                        className="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-black text-white hover:bg-black transition shadow-lg active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        {!book.stock || book.stock <= 0 ? 'STOK YOK' : !book.price || parseFloat(book.price) <= 0 || parseFloat(book.price) > 10000 ? 'GEÇERSİZ FİYAT' : 'SEPETE EKLE'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* CART TAB */}
          {activeTab === 'Cart' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-2xl font-bold mb-6">Sepet Detayları</h3>
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="mx-auto text-slate-200 mb-3" size={48} />
                  <p className="text-slate-400 font-medium text-lg">Sepetiniz boş.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.filter(item => item.title && item.price && parseFloat(item.price) > 0).map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 hover:shadow-md transition">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-lg">{item.title}</h4>
                        <p className="text-slate-500">{item.author}</p>
                        <div className="mt-3 flex items-center gap-4">
                          <span className="text-sm font-bold text-slate-600">{item.quantity} Adet</span>
                          <span className="text-lg font-black text-slate-900">₺{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg font-bold hover:bg-rose-100 transition">Sil</button>
                    </div>
                  ))}
                  <div className="mt-8 pt-6 border-t-2 border-slate-200">
                    <div className="flex justify-between items-center text-2xl font-black text-slate-900 mb-6">
                      <span>Genel Toplam:</span>
                      <span className="text-emerald-600">₺{totalAmount.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={checkout}
                      disabled={validCartItems.length === 0}
                      className="w-full rounded-2xl bg-slate-900 px-6 py-4 text-lg font-black text-white hover:bg-black transition shadow-xl disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      ŞİMDİ SATIN AL
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'Profile' && (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-2xl font-bold mb-6">Hesap Bilgileri</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Kullanıcı Adı</p>
                    <p className="text-lg font-bold text-slate-900">{user?.username || 'Bilinmiyor'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Rol</p>
                    <p className="text-lg font-bold text-emerald-600">{user?.role === 'customer' ? 'Müşteri' : 'Admin'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Kullanıcı ID</p>
                    <p className="text-lg font-bold text-slate-700">{user?.id}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-2xl font-bold mb-6">Özet İstatistikler</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Katalogdaki Kitaplar:</span>
                    <span className="text-2xl font-black text-slate-900">{books.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Sepetinizdeki Ürünler:</span>
                    <span className="text-2xl font-black text-slate-900">{totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Toplam Sepet Değeri:</span>
                    <span className="text-2xl font-black text-emerald-600">₺{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CustomerPanel; 