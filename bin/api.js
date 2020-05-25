require('dotenv').config();
const http = require('http');
const api = require('../src/api');
const database = require('../src/database/redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379/0';
database.connect(REDIS_URL);

const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '127.0.0.1';

const httpServer = http.createServer(api);
httpServer.listen(PORT, HOST, () => {
  console.log(`API listening at: ${HOST}:${PORT}`);
});
