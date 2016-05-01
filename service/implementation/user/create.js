const Data = require('packt-mastering-node-file-share-data');

module.exports = function(user) {
  return Data.Users
    .update(
      {
        user_id: user.user_id
      },
      {
        $set: user
      },
      {
        upsert: true
      }
    );
};