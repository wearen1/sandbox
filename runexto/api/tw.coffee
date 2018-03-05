lib = require '../lib'
log = lib.log()
Promise = lib.get 'bluebird'
request = Promise.promisify lib.get 'request'
qs = lib.get 'qs'

ClientError = (e)->
  e.code >= 400 && e.code < 500

executeMethod = (options)->
  requestOptions =
    host: 'api.twitter.com'
    path: "/#{config.api.tw.v}/" + options.method + '.json?' + qs.stringify(options.params)
    method: 'GET'
    port: 443
  request(requestOptions)
  .then (content)->
    try
      content = JSON.parse content
    catch e
      content
  .catch ClientError, (e)->
    log.error e
    return null

module.exports = executeMethod
