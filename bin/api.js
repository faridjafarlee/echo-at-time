require('dotenv').config();
const http = require('http');
const api = require('../src/api');
const database = require('../src/database/redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379/0';
const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '127.0.0.1';

(async () => {
  try {
    const httpServer = http.createServer(api);

    await database.connect(REDIS_URL, (error) => {
      console.error('Database connection error');
      console.error(error.message);
      console.error('Shutting down API');

      httpServer.close(async () => {
        await database.close();
      });
    });
    console.log('Connection to database established');

    httpServer.listen(PORT, HOST, () => {
      console.log(`API listening at: ${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(-1);
  }
})();
