import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Home, Users, Package, Settings, LogOut, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const API_URL = 'http://localhost:5001/api';

function AdminPanel({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('Home');
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [newBook, setNewBook] = useState({ title: '', author: '', price: '', image_url: '', stock: '' });

  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (token) {
      refreshData();
    }
  }, [token]);

  const refreshData = async () => {
    try {
      const [bRes, oRes] = await Promise.all([
        axios.get(`${API_URL}/books`),
        axios.get(`${API_URL}/orders`, { headers })
      ]);
      setBooks(bRes.data);
      setOrders(oRes.data);
    } catch (err) {
      console.error("Veri hatası:", err);
      // Kitapları en azından göster
      try {
        const bRes = await axios.get(`${API_URL}/books`);
        setBooks(bRes.data);
      } catch (e) { console.error("Kitaplar alınamadı:", e); }
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/books`, newBook, { headers });
      setNewBook({ title: '', author: '', price: '', image_url: '', stock: '' });
      refreshData();
    } catch (err) {
      console.error('Ekleme hatası:', err);
      alert('Kitap eklenemedi: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      const { id, title, author, price, image_url, stock } = editingBook;
      await axios.put(`${API_URL}/books/${id}`, { title, author, price, image_url, stock }, { headers });
      setEditingBook(null);
      refreshData();
    } catch (err) {
      console.error('Güncelleme hatası:', err);
      alert('Kitap güncellenemedi: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm("Bu kitabı silmek istediğinize emin misiniz?")) {
      try {
        await axios.delete(`${API_URL}/books/${id}`, { headers });
        refreshData();
      } catch (err) {
        console.error('Silme hatası:', err);
        alert('Kitap silinemedi: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleReset = async () => {
    if (window.confirm("Sistem 'Golden State' durumuna döndürülecek. Emin misiniz?")) {
      await axios.post(`${API_URL}/admin/reset`, {}, { headers });
      refreshData();
    }
  };

  const handleCorrupt = async () => {
    await axios.post(`${API_URL}/admin/corrupt`, {}, { headers });
    refreshData();
  };

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Aylık Kazanç',
      data: [1200, 1900, 3000, totalRevenue > 0 ? totalRevenue : 4500, 5200, 6000],
      borderColor: '#0f172a',
      backgroundColor: 'rgba(15, 23, 42, 0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#0f172a'
    }]
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9fa] text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg text-white"><BookOpen size={20} /></div>
            <span className="font-bold text-lg tracking-tight">Clean Bookstore</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { label: 'Home', icon: Home },
            { label: 'Inventory', icon: Package },
            { label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.label ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 font-semibold hover:bg-rose-50 rounded-xl transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">Yönetim Paneli</p>
            <h1 className="text-3xl font-black">{activeTab === 'Home' ? 'Genel Bakış' : activeTab}</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCorrupt} className="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition">Junk Data</button>
            <button onClick={handleReset} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg">Admin Reset</button>
          </div>
        </header>

        {/* --- HOME TAB --- */}
        {activeTab === 'Home' && (
          <div className="space-y-8">
            {/* İstatistik Kartları */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kitap Türü</p>
                <p className="text-3xl font-black mt-2">{books.length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Siparişler</p>
                <p className="text-3xl font-black mt-2">{orders.length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Toplam Ciro</p>
                <p className="text-3xl font-black mt-2 text-emerald-600">₺{totalRevenue.toFixed(2)}</p>
              </div>
            </div>

            {/* Kitap Tablosu */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
                <h3 className="font-bold text-lg">Aktif Kitap Listesi</h3>
                <span className="bg-slate-100 text-slate-600 text-[10px] px-3 py-1 rounded-full font-bold uppercase">Canlı Veri</span>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-8 py-4">Kitap Adı / Yazar</th>
                    <th className="px-8 py-4">Fiyat</th>
                    <th className="px-8 py-4">Stok</th>
                    <th className="px-8 py-4 text-center">Önizleme</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {books.map(book => (
                    <tr key={book.id} className="hover:bg-slate-50/30 transition">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-900">{book.title}</div>
                        <div className="text-xs text-slate-400">{book.author}</div>
                      </td>
                      <td className="px-8 py-5 font-black text-slate-900 text-sm">₺{book.price}</td>
                      <td className="px-8 py-5 text-sm">{book.stock} Adet</td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <img src={book.image_url} alt="kapak" className="h-12 w-9 object-cover rounded shadow-sm border border-slate-100" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Satış Grafiği */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                  Satış Performansı (2026)
                </h3>
                <div className="text-xs text-slate-400 font-medium">Aylık bazda ciro değişimi</div>
              </div>
              <div className="h-[300px]">
                <Line
                  data={chartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                      x: { grid: { display: false } }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'Inventory' && (
          <div className="space-y-6">
            {/* Yeni Kitap Ekleme Formu */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-xl mb-6">{editingBook ? 'Kitap Düzenle' : 'Yeni Kitap Ekle'}</h3>
              <form onSubmit={editingBook ? handleUpdateBook : handleAddBook} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">Kitap Adı *</label>
                    <input type="text" placeholder="Kitap Adı" value={editingBook ? editingBook.title : newBook.title} onChange={(e) => editingBook ? setEditingBook({ ...editingBook, title: e.target.value }) : setNewBook({ ...newBook, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">Yazar *</label>
                    <input type="text" placeholder="Yazar Adı" value={editingBook ? editingBook.author : newBook.author} onChange={(e) => editingBook ? setEditingBook({ ...editingBook, author: e.target.value }) : setNewBook({ ...newBook, author: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">Fiyat (₺) *</label>
                    <input type="number" step="0.01" placeholder="Fiyat Bilgisi" value={editingBook ? editingBook.price : newBook.price} onChange={(e) => editingBook ? setEditingBook({ ...editingBook, price: e.target.value }) : setNewBook({ ...newBook, price: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">Stok (Adet) *</label>
                    <input type="number" placeholder="Stok Miktarı" value={editingBook ? editingBook.stock : newBook.stock} onChange={(e) => editingBook ? setEditingBook({ ...editingBook, stock: e.target.value }) : setNewBook({ ...newBook, stock: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" required />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase">Resim URL</label>
                  <input type="text" placeholder="/images/bookcover.jpg" value={editingBook ? editingBook.image_url : newBook.image_url} onChange={(e) => editingBook ? setEditingBook({ ...editingBook, image_url: e.target.value }) : setNewBook({ ...newBook, image_url: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition">
                    {editingBook ? 'Güncelle' : 'Kitap Ekle'}
                  </button>
                  {editingBook && (
                    <button type="button" onClick={() => setEditingBook(null)} className="flex-1 bg-slate-200 text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-300 transition">
                      İptal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Kitaplar Listesi */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
                <h3 className="font-bold text-lg">Kitap Envanteri</h3>
                <span className="bg-slate-100 text-slate-600 text-[10px] px-3 py-1 rounded-full font-bold uppercase">{books.length} Kitap</span>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-8 py-4">Kitap</th>
                    <th className="px-8 py-4">Fiyat</th>
                    <th className="px-8 py-4">Stok</th>
                    <th className="px-8 py-4 text-center">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {books.map(book => (
                    <tr key={book.id} className="hover:bg-slate-50/30 transition">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-900">{book.title}</div>
                        <div className="text-xs text-slate-400">{book.author}</div>
                      </td>
                      <td className="px-8 py-5 font-black text-slate-900">₺{book.price}</td>
                      <td className="px-8 py-5 text-sm">{book.stock} Adet</td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setEditingBook(book)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition">Düzenle</button>
                          <button onClick={() => handleDeleteBook(book.id)} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition">Sil</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'Settings' && (
          <div className="max-w-xl bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-black mb-4 italic">Sistem Operasyonları</h2>
            <div className="space-y-4 mt-8">
              <button onClick={handleReset} className="w-full p-6 bg-slate-900 text-white rounded-2xl font-bold flex justify-between items-center shadow-xl shadow-slate-200">
                Restore Golden State
                <Save size={20} />
              </button>
              <button onClick={handleCorrupt} className="w-full p-6 border-2 border-rose-100 text-rose-500 rounded-2xl font-bold hover:bg-rose-50 transition">
                Inject Junk Data
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;