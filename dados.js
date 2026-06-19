const SENHA_ADMIN = 'seupai2026';
const SUPA_URL = 'https://ntwljssfbbdgpoquqoml.supabase.co';
const SUPA_KEY = 'sb_publishable_OBvwr3SX2YZyFSt2pG5Xpg_Ufba8eTs';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const params = req.query || {};
  if (params.senha !== SENHA_ADMIN) {
    res.status(401).json({ erro: 'Acesso negado' });
    return;
  }

  let url = SUPA_URL + '/rest/v1/cliques?select=*&order=criado_em.desc&limit=1000';
  if (params.tipo) url += '&tipo=eq.' + params.tipo;
  if (params.disp) url += '&dispositivo=eq.' + params.disp;
  if (params.data) url += '&criado_em=gte.' + params.data + 'T00:00:00&criado_em=lte.' + params.data + 'T23:59:59';

  try {
    const resp = await fetch(url, {
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY
      }
    });
    const dados = await resp.json();
    res.status(200).json(dados);
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
};
