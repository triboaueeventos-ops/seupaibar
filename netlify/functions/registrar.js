exports.handler = async function(event) {
  const SUPA_URL = 'https://ntwljssfbbdgpoquqoml.supabase.co';
  const SUPA_KEY = 'sb_publishable_OBvwr3SX2YZyFSt2pG5Xpg_Ufba8eTs';

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
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

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ erro: 'Erro ao salvar' }) };
  }
};
