import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Camada de persistência híbrida (Servidor Local SQLite OU Turso Cloud na Vercel + Espelho no Navegador).
const nativeLS = (() => {
  try { return window.localStorage; } catch (e) { return null; }
})();

const mem = {};
const pending = {};
let timer, sending = false, failNotified = false;
const H = { 'Content-Type': 'application/json', 'X-Orion': '1' };

const banner = (msg, ok) => {
  let el = document.getElementById('orion-save-banner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'orion-save-banner';
    el.style.cssText = 'position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:9999;padding:10px 18px;border-radius:12px;font:600 13px Segoe UI,system-ui,sans-serif;box-shadow:0 10px 25px rgba(0,0,0,.15)';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = ok ? '#10b981' : '#DA291C';
  el.style.color = '#fff';
  el.style.display = 'block';
  if (ok) setTimeout(() => { el.style.display = 'none'; }, 2500);
};

const send = async () => {
  if (sending) { schedule(); return; }
  const keys = Object.keys(pending);
  if (!keys.length) return;
  const batch = {};
  keys.forEach(k => { batch[k] = pending[k]; delete pending[k]; });
  sending = true;
  try {
    const r = await fetch('/api/db', { method: 'POST', headers: H, body: JSON.stringify(batch) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    if (failNotified) { failNotified = false; banner('Conexão com o banco restabelecida. Dados sincronizados.', true); }
  } catch (e) {
    Object.keys(batch).forEach(k => { if (!(k in pending)) pending[k] = batch[k]; });
    if (!failNotified) { failNotified = true; banner('Sem conexão com o servidor no momento. Salvando no aparelho e tentando sincronizar...', false); }
    clearTimeout(timer); timer = setTimeout(send, 3000);
  } finally { sending = false; }
};
const schedule = () => { clearTimeout(timer); timer = setTimeout(send, 400); };
const queue = (k, v) => { pending[k] = v; schedule(); };

const flushNow = () => {
  const keys = Object.keys(pending);
  if (!keys.length) return;
  const body = JSON.stringify(pending);
  try { fetch('/api/db', { method: 'POST', headers: H, body, keepalive: body.length < 60000 }); } catch (e) {}
};
window.addEventListener('pagehide', flushNow);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushNow(); });

async function boot() {
  const root = document.getElementById('root');
  let data = null;
  for (let i = 0; i < 4 && !data; i++) {
    try {
      const r = await fetch('/api/db', { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      data = await r.json();
    } catch (e) { await new Promise(r => setTimeout(r, 600)); }
  }

  // Se o banco remoto ainda não estiver configurado ou se estiver offline mas houver cache no navegador:
  if (!data || typeof data !== 'object' || data._unconfigured) {
    data = {};
    if (nativeLS) {
      try {
        for (let i = 0; i < nativeLS.length; i++) {
          const k = nativeLS.key(i);
          if (k && k.startsWith('orion_demo_')) data[k.replace('orion_demo_', 'orion_')] = nativeLS.getItem(k);
        }
      } catch (e) {}
    }
  } else if (nativeLS) {
    // Espelha os dados do servidor/Turso no navegador para segurança extra
    try {
      Object.entries(data).forEach(([k, v]) => {
        if (k && !k.startsWith('_') && typeof v === 'string') nativeLS.setItem(k, v);
      });
    } catch (e) {}
  }

  Object.assign(mem, data);
  delete mem._unconfigured;

  const shim = {
    getItem: k => (k in mem ? mem[k] : null),
    setItem: (k, v) => {
      v = String(v);
      if (mem[k] !== v) {
        mem[k] = v;
        if (nativeLS) { try { nativeLS.setItem(k.replace(/^orion_/, 'orion_demo_'), v); } catch (e) {} }
      }
    },
    removeItem: k => {
      if (k in mem) {
        delete mem[k];
        if (nativeLS) { try { nativeLS.removeItem(k.replace(/^orion_/, 'orion_demo_')); } catch (e) {} }
      }
    },
    clear: () => {
      Object.keys(mem).forEach(k => {
        delete mem[k];
        if (nativeLS) { try { nativeLS.removeItem(k); } catch (e) {} }
        queue(k, null);
      });
    },
    key: i => Object.keys(mem)[i] ?? null,
    get length() { return Object.keys(mem).length; },
  };
  Object.defineProperty(window, 'localStorage', { value: shim, configurable: true });
  createRoot(root).render(<App />);
}
boot();
