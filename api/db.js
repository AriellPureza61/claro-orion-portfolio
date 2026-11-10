// Rota Serverless de Demonstração (Portfólio Claro Órion)
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (req.method === 'GET') {
    return res.status(200).json({ _unconfigured: true, _demo: true });
  }
  return res.status(200).json({ ok: true, _demo: true });
};
