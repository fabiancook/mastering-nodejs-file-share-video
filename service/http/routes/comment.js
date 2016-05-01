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

  server.post('/file/:fileId/comment', exports.create);
  server.get('/file/:fileId/comment', exports.list);
  server.get('/file/:fileId/comment/:id', exports.get);
  server.del('/file/:fileId/comment/:id', exports.remove);

};

exports.create = function(request, response, next) {
  Logger.info(`Comment create, file ${request.params.fileId}`);
  response.send(204);
};

exports.list = function(request, response, next) {
  Logger.info(`Comment list, file ${request.params.fileId}`);
  response.send(204);
};

exports.get = function(request, response, next) {
  Logger.info(`Comment get, file ${request.params.fileId}, comment ${request.params.id}`);
  response.send(204);
};

exports.remove = function(request, response, next) {
  Logger.info(`Comment delete, file ${request.params.fileId}, comment ${request.params.id}`);
  response.send(204);
};