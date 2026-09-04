const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Configuração de CORS para permitir acesso seguro do frontend React (incluindo acesso pelo celular via rede local)
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === allowedOrigin ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('https://192.168.') ||
        origin.startsWith('http://10.') ||
        origin.startsWith('https://10.') ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Origem não permitida pela política de CORS.'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// Rotas da aplicação
app.use(routes);

// Middleware centralizado de tratamento de erros (deve ser o último)
app.use(errorHandler);

module.exports = app;