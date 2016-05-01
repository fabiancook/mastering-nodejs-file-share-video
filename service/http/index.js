/*
 Copyright 2016 Packt Publishing

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
const Restify = require('restify'),
  Config = require('config'),
  Pkg = require('../../package.json'),
  Logger = require('../logger'),
  Morgan = require('morgan'),
  Routes = require('./routes'),
  User = require('../implementation/user'),
  CheckToken = require('express-jwt'),
  UnauthorizedError = require('express-jwt/lib/errors/UnauthorizedError');

exports.start = function() {
  const server = exports.createServer();

  exports.initializeLogging(server);
  exports.initializeMiddleware(server);
  exports.initializeAuthentication(server);
  exports.initializeRoutes(server);

  exports.listen(server);

  return server;
};

exports.initializeRoutes = function(server) {
  return Routes(server);
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

exports.initializeAuthentication = function(server) {
  const config = exports.getAuthenticationConfig();
  server.use(CheckToken(config));
  server.use(exports.getUserProfile);
};

exports.getAuthenticationConfig = function() {
  if(!(
    Config.has('httpAuth0.secret.contents') &&
    Config.has('httpAuth0.secret.encoding') &&
    Config.has('httpAuth0.audience')
  )) {
    throw new Error('httpAuth0 config expected');
  }
  const secretContents = Config.get('httpAuth0.secret.contents'),
    secretEncoding = Config.get('httpAuth0.secret.encoding'),
    audience = Config.get('httpAuth0.audience');

  return {
    secret: new Buffer(secretContents, secretEncoding),
    audience: audience,
    getToken: exports.getAuthenticationToken
  };
};

exports.getAuthenticationToken = function(request) {
  if(request.headers && request.headers.authorization) {
    var parts = request.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0];
      var credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        return credentials;
      } else {
        throw new UnauthorizedError('credentials_bad_scheme', { message: 'Format is Authorization: Bearer [token]' });
      }
    } else {
      throw new UnauthorizedError('credentials_bad_format', { message: 'Format is Authorization: Bearer [token]' });
    }
  } else if(request.query && (request.query.id_token || request.query.access_token)) {
    return request.query.id_token || request.query.access_token;
  }
};

exports.getUserProfile = function(request, response, next) {
  var token;
  try {
    token = exports.getAuthenticationToken(request);
  } catch(e) {
    return next(e);
  }
  return User.getWithToken(token)
    .then(function(user) {
      request.user = user;
      next(null);
    })
    .catch(next);
};