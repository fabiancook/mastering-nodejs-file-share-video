const Service = require('./service');

exports.start = Service.start;

if(require.main === module) {
  exports.start();
}
