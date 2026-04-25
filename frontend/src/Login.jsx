import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş başarısız. Kullanıcı adı veya şifre hatalı.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        <div className="bg-slate-900 p-8 text-center text-white">
          <h1 className="text-3xl font-bold">Clean Bookstore</h1>
          <p className="mt-2 text-slate-300 text-sm">Online Kitap Yönetim Sistemi</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8" autoComplete="off">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-slate-700 font-semibold mb-2 text-sm">Kullanıcı Adı</label>
            <input
              type="text"
              placeholder="Kullanıcı adınız"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-700 font-semibold mb-2 text-sm">Şifre</label>
            <input
              type="password"
              placeholder="Şifreniz"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 text-white py-4 font-bold hover:bg-slate-800 active:scale-[0.98] transition shadow-lg shadow-slate-900/20"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
