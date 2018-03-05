var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: './logs/connect.log', category: 'clog' }
  ],
  replaceConsole: true
});

module.exports = log4js;