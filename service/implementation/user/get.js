const Data = require('packt-mastering-node-file-share-data');

module.exports = function(id, projection) {
  return Data.Users
    .findOne(
      {
        _id: id
      },
      projection
    );
};