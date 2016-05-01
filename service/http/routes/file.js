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
const Logger = require('../../logger');

exports = module.exports = function(server) {

  server.post('/file', exports.create);
  server.get('/file', exports.list);
  server.get('/file/:id', exports.get);
  server.get('/file/:id/contents', exports.getContents);
  server.del('/file/:id', exports.remove);

};

exports.create = function(request, response, next) {
  Logger.info(`File create`);
  response.send(204);
};

exports.list = function(request, response, next) {
  Logger.info(`File list`);
  response.send(204);
};

exports.get = function(request, response, next) {
  Logger.info(`File get, id ${request.params.id}`);
  response.send(204);
};

exports.getContents = function(request, response, next) {
  Logger.info(`File get contents, id ${request.params.id}`);
  response.send(204);
};

exports.remove = function(request, response, next) {
  Logger.info(`File remove, id ${request.params.id}`);
  response.send(204);
};