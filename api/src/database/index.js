const oracledb = require('oracledb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

// Configurações padrão do oracledb
// Retornar colunas em formato de objeto JavaScript com chaves nomeadas
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// Converter automaticamente CLOBs e outros tipos grandes para string quando aplicável
oracledb.autoCommit = false;

const POOL_ALIAS = 'integra_oracle_pool';
let poolInstance = null;

/**
 * Configurações do Pool obtidas de variáveis de ambiente
 */
function getPoolConfig() {
  const user = process.env.ORACLE_USER;
  const password = process.env.ORACLE_PASSWORD;
  const connectString = process.env.ORACLE_CONNECT_STRING;

  if (!user || !password || !connectString) {
    console.warn(
      '⚠️ [Oracle] Variáveis de ambiente ORACLE_USER, ORACLE_PASSWORD ou ORACLE_CONNECT_STRING não estão totalmente definidas. O pool tentará iniciar com os valores disponíveis.'
    );
  }

  return {
    poolAlias: POOL_ALIAS,
    user: user || '',
    password: password || '',
    connectString: connectString || '',
    poolMin: parseInt(process.env.ORACLE_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.ORACLE_POOL_MAX || '10', 10),
    poolIncrement: parseInt(process.env.ORACLE_POOL_INCREMENT || '2', 10),
    poolTimeout: parseInt(process.env.ORACLE_POOL_TIMEOUT || '60', 10),
  };
}

/**
 * Inicializa o Pool de conexões Oracle
 */
async function initPool() {
  if (poolInstance) {
    return poolInstance;
  }

  try {
    const config = getPoolConfig();
    poolInstance = await oracledb.createPool(config);
    console.log(`✅ [Oracle] Pool de conexões inicializado com sucesso (${config.poolAlias})`);
    return poolInstance;
  } catch (error) {
    console.error('❌ [Oracle] Falha ao criar pool de conexões:', error.message);
    throw error;
  }
}

/**
 * Obtém uma conexão ativa do pool.
 * O chamador é responsável por liberar a conexão usando connection.close() em um bloco finally.
 */
async function getConnection() {
  try {
    if (!poolInstance) {
      await initPool();
    }
    const connection = await oracledb.getConnection(POOL_ALIAS);
    return connection;
  } catch (error) {
    console.error('❌ [Oracle] Erro ao obter conexão do pool:', error.message);
    const dbError = new Error('Falha ao conectar com o banco de dados Oracle.');
    dbError.status = 503;
    dbError.originalError = error.message;
    throw dbError;
  }
}

/**
 * Executa uma query SQL com bind parameters gerenciando automaticamente aquisição e liberação da conexão.
 * 
 * @param {string} sql - Comando SQL parametrizado
 * @param {object|array} binds - Parâmetros bind
 * @param {object} options - Opções adicionais do oracledb
 * @returns {Promise<object>} Resultado da execução do oracledb
 */
async function execute(sql, binds = {}, options = {}) {
  let connection;
  try {
    connection = await module.exports.getConnection();
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: options.autoCommit ?? false,
      ...options,
    });
    return result;
  } catch (error) {
    console.error('❌ [Oracle] Erro na execução da query:', error.message);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('⚠️ [Oracle] Erro ao liberar conexão de volta ao pool:', closeErr.message);
      }
    }
  }
}

/**
 * Executa uma operação em transação com COMMIT ou ROLLBACK garantidos.
 * 
 * @param {function(connection): Promise<any>} transactionFn 
 * @returns {Promise<any>}
 */
async function withTransaction(transactionFn) {
  let connection;
  try {
    connection = await module.exports.getConnection();
    const result = await transactionFn(connection);
    await connection.commit();
    return result;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rbErr) {
        console.error('⚠️ [Oracle] Erro no rollback da transação:', rbErr.message);
      }
    }
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('⚠️ [Oracle] Erro ao liberar conexão de transação:', closeErr.message);
      }
    }
  }
}

/**
 * Encerra o pool de conexões de forma segura (graceful shutdown)
 */
async function closePool() {
  if (!poolInstance) return;
  try {
    await poolInstance.close(10);
    poolInstance = null;
    console.log('🛑 [Oracle] Pool de conexões encerrado com sucesso.');
  } catch (error) {
    console.error('⚠️ [Oracle] Erro ao fechar pool:', error.message);
  }
}

/**
 * Health check ativo da conexão Oracle
 */
async function checkHealth() {
  try {
    const result = await execute('SELECT 1 AS HEALTH FROM DUAL');
    const isHealthy = result && result.rows && result.rows.length > 0;
    return {
      status: isHealthy ? 'UP' : 'DOWN',
      database: 'Oracle Database',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'DOWN',
      database: 'Oracle Database',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = {
  oracledb,
  initPool,
  getConnection,
  execute,
  withTransaction,
  closePool,
  checkHealth,
};
