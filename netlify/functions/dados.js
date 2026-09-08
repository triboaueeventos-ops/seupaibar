const https = require('https');

const SENHA_ADMIN = 'seupai2026';
const SUPA_HOST = 'ntwljssfbbdgpoquqoml.supabase.co';
const SUPA_KEY = 'sb_publishable_OBvwr3SX2YZyFSt2pG5Xpg_Ufba8eTs';

// Mesma troca de fetch() global por 'https' nativo do Node explicada em
// registrar.js — evita que a function falhe inteira só por causa da versão
// do runtime, e agora também checa o status da resposta do Supabase.
function getFromSupabase(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SUPA_HOST,
        path,
        method: 'GET',
        headers: {
          apikey: SUPA_KEY,
          Authorization: 'Bearer ' + SUPA_KEY,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`Supabase respondeu ${res.statusCode}: ${body}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const params = event.queryStringParameters || {};
  if (params.senha !== SENHA_ADMIN) {
    return { statusCode: 401, headers, body: JSON.stringify({ erro: 'Acesso negado' }) };
  }

  let path = '/rest/v1/cliques?select=*&order=criado_em.desc&limit=1000';
  if (params.tipo) path += '&tipo=eq.' + encodeURIComponent(params.tipo);
  if (params.disp) path += '&dispositivo=eq.' + encodeURIComponent(params.disp);
  if (params.data) {
    path += '&criado_em=gte.' + params.data + 'T00:00:00&criado_em=lte.' + params.data + 'T23:59:59';
  }

  try {
    const raw = await getFromSupabase(path);
    // raw já vem como JSON (texto) direto do Supabase — repassa como está,
    // sem re-serializar, pra não arriscar mudar o formato que o admin.html
    // espera.
    return { statusCode: 200, headers, body: raw };
  } catch (e) {
    console.error('Erro ao buscar dados de cliques:', e.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ erro: 'Erro ao buscar dados', detalhe: e.message }),
    };
  }
};
