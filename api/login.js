// Autenticação Modo Demonstração (Portfólio Claro Órion)
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, demo: true });
};
