/**
 * Middleware centralizado de tratamento de erros no Express.
 * Formata as respostas com códigos HTTP semânticos (400, 401, 403, 404, 409, 500, 502, 503)
 * e evita vazamento de stack traces e informações confidenciais para o frontend.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Log seguro no backend
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ [API Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  let status = err.status || 500;
  let message = err.message || 'Ocorreu um erro interno no servidor.';

  // Tratamento específico para erros do driver Oracle
  if (err.errorNum || (err.message && err.message.includes('ORA-'))) {
    console.error(`[${timestamp}] ⚠️ [Oracle DB Error Code]:`, err.errorNum || 'N/A');

    // Violação de chave primária ou única (ORA-00001)
    if (err.errorNum === 1 || err.message.includes('ORA-00001')) {
      status = 409;
      message = 'Conflito: Já existe um registro com os dados informados.';
    }
    // Erro de integridade referencial (ORA-02291, ORA-02292)
    else if (err.errorNum === 2291 || err.message.includes('ORA-02291')) {
      status = 400;
      message = 'Dados inválidos: Registro pai referenciado não existe.';
    } else if (err.errorNum === 2292 || err.message.includes('ORA-02292')) {
      status = 409;
      message = 'Não é possível excluir: existem registros dependentes associados.';
    }
    // Falhas de conexão com o banco (ORA-12170, ORA-12541, etc)
    else if (
      err.errorNum === 12170 ||
      err.errorNum === 12541 ||
      err.errorNum === 12514 ||
      err.message.includes('NJS-') ||
      err.message.includes('ORA-125')
    ) {
      status = 503;
      message = 'Serviço temporariamente indisponível: Falha de comunicação com o banco de dados Oracle.';
    } else {
      status = 500;
      message = 'Erro no processamento da base de dados.';
    }
  }

  // Sanitização de resposta: nunca expor stack traces em produção
  const isDev = process.env.NODE_ENV === 'development';
  const responsePayload = {
    error: message,
    status,
    timestamp,
    ...(isDev && err.originalError ? { debugDetails: err.originalError } : {}),
  };

  return res.status(status).json(responsePayload);
}

module.exports = errorHandler;
