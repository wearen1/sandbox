Promise = require 'bluebird'

module.exports = (condition, action)->
  resolver = Promise.defer()
  fn = ->
    condition()
    .then (result)->
      unless result
        resolver.resolve()
      else
        Promise.resolve action()
        .then fn
        .catch resolver.reject

  process.nextTick fn
  resolver.promise
