const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const app = require('./src/app');
const db = require('./src/database');

const PORT = process.env.PORT || 3333;

async function startServer() {
  // Inicialização do pool Oracle
  try {
    if (process.env.ORACLE_USER && process.env.ORACLE_CONNECT_STRING) {
      await db.initPool();
    } else {
      console.warn('⚠️ [Oracle] Variáveis de conexão com o banco não configuradas no .env. Inicializando API em modo standby.');
    }
  } catch (error) {
    console.error('⚠️ [Oracle] Falha na conexão inicial com o banco:', error.message);
    console.warn('ℹ️ [Oracle] A API continuará em execução para responder a verificações de health.');
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 [ÍNTEGRA API] Servidor rodando na porta ${PORT}`);
    console.log(`📡 [Health Check] http://localhost:${PORT}/health`);
    console.log(`💾 [DB Check] http://localhost:${PORT}/health/db`);
  });

  // Graceful shutdown
  const handleShutdown = async (signal) => {
    console.log(`\n🛑 [ÍNTEGRA API] Recebido sinal ${signal}. Encerrando servidor graciosamente...`);
    server.close(async () => {
      await db.closePool();
      console.log('👋 [ÍNTEGRA API] Processo finalizado com sucesso.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

startServer();