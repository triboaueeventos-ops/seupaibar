const SUPA_URL = 'https://ntwljssfbbdgpoquqoml.supabase.co';
const SUPA_KEY = 'sb_publishable_OBvwr3SX2YZyFSt2pG5Xpg_Ufba8eTs';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const body = req.body || {};
    const tipo = body.tipo || 'desconhecido';
    const dispositivo = body.dispositivo || 'desconhecido';
    const extra = body.extra || null;

    await fetch(SUPA_URL + '/rest/v1/cliques', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ tipo, dispositivo, extra })
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao salvar' });
  }
};
