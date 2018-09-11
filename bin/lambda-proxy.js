#!/usr/bin/env node

const { createServer } = require('../lib/http');
const proxy = require('../lib/lambda-proxy');

const defaultPort = 3000;

const options = {
  handler: process.env.HANDLER,
  runtime: process.env.RUNTIME,
  stage: process.env.STAGE,
  taskDir: process.env.TASK_DIR,
  network: process.env.NETWORK,
};
const requestListener = proxy(options);

try {
  createServer(requestListener, process.env.PORT || defaultPort);
} catch ({ message }) {
  console.error(message);
}
