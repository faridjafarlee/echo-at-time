require('dotenv').config();
const database = require('../src/database/redis');
const Worker = require('../src/worker');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379/0';
database.connect(REDIS_URL);

const path = require('path');
const fs = require('fs');
const fileStream = fs.createWriteStream(path.join(__dirname, '..', 'output.log'));

const worker = new Worker();
worker.setOutputStream(process.stdout, fileStream); // multiple output streams feature
worker.run(() => console.log('Worker started'));
