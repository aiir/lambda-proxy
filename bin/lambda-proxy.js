#!/usr/bin/env node

const { createServer } = require('../lib/http');
const proxy = require('../lib/lambda-proxy');

const defaultPort = 3000;

const options = {
  handler: process.env.HANDLER,
  stage: process.env.STAGE,
  taskDir: process.env.TASK_DIR,
};
const requestListener = proxy(options);

try {
  createServer(requestListener, process.env.PORT || defaultPort);
} catch ({ message }) {
  console.error(message);
}
