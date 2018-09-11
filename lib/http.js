const http = require('http');

function normalisePort(value) {
  const port = parseInt(value, 10);
  if (Number.isNaN(port)) {
    return value;
  }
  if (port >= 0) {
    return port;
  }
  const error = new Error(`Invalid port ${value}`);
  throw error;
}

function createServer(requestListener, port) {
  const server = http.createServer(requestListener)
    .on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      let bind = 'Port';
      if (port !== undefined) {
        bind = (typeof port === 'string') ? `Pipe ${port}` : `Port ${port}`;
      }
      switch (error.code) {
        case 'EACCES':
          console.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    })
    .on('listening', () => {
      const address = server.address();
      const bind = (typeof addr === 'string') ? `pipe ${address}` : `port ${address.port}`;
      console.log(`Listening on ${bind}`);
    });
  if (port !== undefined) {
    server.listen(normalisePort(port));
  }
  return server;
}

module.exports.normalisePort = normalisePort;
module.exports.createServer = createServer;
