const Q = require('q'),
  Request = require('request-promise'),
  JWT = require('jsonwebtoken'),
  Create = require('./create');

exports = module.exports = function(token) {
  const options = exports.getRequestOptions(token);
  return Q.fcall(Request, options)
    .then(Create);
};

exports.getRequestOptions = function(token) {
  const decoded = JWT.decode(token);
  return {
    method: 'GET',
    baseUrl: decoded.iss,
    url: '/tokeninfo',
    qs: {
      id_token: token
    },
    json: true
  };
};