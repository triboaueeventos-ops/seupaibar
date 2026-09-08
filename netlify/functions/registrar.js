const https = require('https');

const SUPA_HOST = 'ntwljssfbbdgpoquqoml.supabase.co';
const SUPA_KEY = 'sb_publishable_OBvwr3SX2YZyFSt2pG5Xpg_Ufba8eTs';

// Faz o POST pro Supabase usando só o módulo nativo 'https' do Node, em vez
// do fetch() global. Motivo: o fetch() global só existe em versões mais
// novas do Node, e dependendo de qual runtime a Netlify usa pra rodar essa
// function, ele pode não existir — nesse caso "await fetch(...)" nem chega
// a fazer a requisição, já estoura "fetch is not defined" e cai direto no
// catch, dando 500 sempre, pra qualquer clique, sem nunca salvar nada. Como
// 'https' é nativo do Node desde sempre, isso elimina essa causa de erro.
function postToSupabase(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: SUPA_HOST,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          apikey: SUPA_KEY,
          Authorization: 'Bearer ' + SUPA_KEY,
          Prefer: 'return=minimal',
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
            // Antes, uma resposta de erro do Supabase (chave inválida,
            // tabela renomeada, política de segurança bloqueando) não dava
            // exceção nenhuma — o fetch() resolve normalmente mesmo com
            // status 4xx/5xx. Isso fazia o código achar que salvou (200
            // pro navegador) quando na real nunca gravou nada. Agora
            // qualquer status fora de 2xx vira erro de verdade.
            reject(new Error(`Supabase respondeu ${res.statusCode}: ${body}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ erro: 'JSON inválido no corpo da requisição' }),
    };
  }

  const tipo = body.tipo || 'desconhecido';
  const dispositivo = body.dispositivo || 'desconhecido';
  const extra = body.extra || null;

  try {
    await postToSupabase('/rest/v1/cliques', { tipo, dispositivo, extra });
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error('Erro ao salvar clique no Supabase:', e.message);
    // Devolve o motivo real do erro na resposta (não é dado sensível de
    // cliente, é só detalhe técnico) — assim, se voltar a falhar por outro
    // motivo no futuro, dá pra ver a causa direto no Console do navegador,
    // sem precisar entrar no painel da Netlify pra achar o log.
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ erro: 'Erro ao salvar', detalhe: e.message }),
    };
  }
};
