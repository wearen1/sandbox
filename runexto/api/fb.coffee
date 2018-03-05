lib = require '../lib'
log = lib.log()
Promise = lib.get 'bluebird'
request = Promise.promisify lib.get 'request'
qs = lib.get 'qs'

ClientError = (e)->
  e.code >= 400 && e.code < 500

executeMethod = (path, options)->
  path += '?' + qs.stringify(options) if options
  url = 'https://' + 'graph.facebook.com/v' + config.api.fb.v + path

  request(url)
  .spread (res, content)->
    try
      content = JSON.parse content
    catch e
      content
  .catch ClientError, (e)->
    log.error e
    return null

module.exports =
  executeMethod: executeMethod
