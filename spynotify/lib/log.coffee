log4js = require 'log4js'
log4js.configure
  appenders: [
    {type: 'console'}
  ],
  replaceConsole: true

module.exports = log4js.getLogger()
