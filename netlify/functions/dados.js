exports.handler = async function(event) {
  const SENHA_ADMIN = 'seupai2026';
  const SUPA_URL = 'https://ntwljssfbbdgpoquqoml.supabase.co';
  const SUPA_KEY = 'sb_publishable_OBvwr3SX2YZyFSt2pG5Xpg_Ufba8eTs';

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const params = event.queryStringParameters || {};
  if (params.senha !== SENHA_ADMIN) {
    return { statusCode: 401, headers, body: JSON.stringify({ erro: 'Acesso negado' }) };
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
    return { statusCode: 200, headers, body: JSON.stringify(dados) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ erro: 'Erro ao buscar dados' }) };
  }
};
