const Restify = require('restify'),
  Config = require('config'),
  Pkg = require('../../package.json'),
  Logger = require('../logger'),
  Morgan = require('morgan');

exports.start = function() {
  const server = exports.createServer();

  exports.initializeLogging(server);
  exports.initializeMiddleware(server);

  exports.listen(server);

  return server;
};

exports.initializeLogging = function(server) {
  if(!Config.has('httpServer.logging') || !Config.get('httpServer.logging.enabled')){
    return;
  }
  const middleware = exports.createLoggerMiddleware();
  server.use(middleware);
};

exports.createLoggerMiddleware = function() {
  const write = function(message){
    const args = Array.prototype.slice.call(arguments);
    return Logger.info.apply(Logger, args);
  };
  return Morgan(
    Config.has('httpServer.logging.format') ? Config.get('httpServer.logging.format') : 'common',
    {
      stream: {
        write: write
      }
    }
  );
};

exports.createServer = function() {
  const plainFormatter = Restify.formatters['text/plain; q=0.3'];
  return Restify.createServer({
    name: Pkg.name,
    version: Pkg.version,
    formatters: {
      '*/*': plainFormatter,
      'text/html': plainFormatter,
      'text/xml': plainFormatter
    }
  });
};

exports.getPort = function() {
  const def = 8080;
  var port;
  if(process.env['PORT']) {
    port = process.env['PORT'];
  } else if(Config.has('httpServer.port')) {
    port = Config.get('httpServer.port');
  } else {
    port = def;
  }
  if(typeof port === 'string') {
    port = +port;
  }
  if(isNaN(port)) {
    port = def;
  }
  return port;
};

exports.listen = function(server) {
  const port = exports.getPort();
  return server.listen(port, exports.listening.bind(exports, port));
};

exports.listening = function(port) {
  console.log(`HTTP Server listening on port ${port}`);
};

exports.initializeMiddleware = function(server) {
  server.use(Restify.acceptParser(server.acceptable));
  server.use(Restify.authorizationParser());
  server.use(Restify.dateParser());
  server.use(Restify.queryParser());
  server.use(Restify.jsonp());
  server.use(Restify.gzipResponse());
  server.use(Restify.bodyParser());
  server.use(Restify.requestExpiry({
    header: 'x-request-expiry-time'
  }));
  server.use(Restify.throttle({
    burst: 100,
    rate: 50,
    ip: true,
    overrides: {
      '192.168.1.1': {
        rate: 0,
        burst: 0
      },
      '0.0.0.0': {
        rate: 0,
        burst: 0
      },
      '127.0.0.1': {
        rate: 0,
        burst: 0
      }
    }
  }));
  server.use(Restify.conditionalRequest());
};