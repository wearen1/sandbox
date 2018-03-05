lib = require appRoot + '/lib'
indexes = require './indexes'

Promise = lib.get 'bluebird'
_ = lib.get '_'
log = lib.log()

#mc is a mongo client
module.exports =
  ensureIndexes: (mc)->
    indexesToEnsure = []

    _.forIn indexes, (v, k)->
      indexesToEnsure.push v() if _.contains k, 'ensure_'

    Promise.all indexesToEnsure
  models: require './models'
