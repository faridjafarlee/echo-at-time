require('dotenv').config();
const database = require('../src/database/redis');
const Worker = require('../src/worker');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379/0';

(async () => {
  try {
    const worker = new Worker();

    await database.connect(REDIS_URL, async (error) => {
      console.error('Database connection error');
      console.error(error.message);
      console.error('Shutting down Worker');

      await worker.stop();
      console.log('Worker stopped');

      await database.close();
    });
    console.log('Connection to database established');

    const path = require('path');
    const fs = require('fs');
    const fileStream = fs.createWriteStream(path.join(__dirname, '..', 'output.log'));

    worker.setOutputStream(process.stdout, fileStream); // multiple output streams feature
    await worker.run();
    console.log('Worker started');
  } catch (error) {
    console.error(error.message);
    process.exit(-1);
  }
})();
