const Config = require('config');

const ourValue = Config.has('ourValue') ? Config.get('ourValue') : 'default value';

console.log(ourValue);