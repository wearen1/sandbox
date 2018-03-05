deferred = require 'deferred'
log = (require './log').getLogger()
vkAPI = require '../indexer/vk/api'
_ = require 'lodash'

db = {}

vkAPI.executeMethod
  method: 'database.getCountries'
  params:
    need_all: 1
    v: 5.24
.then (countries)->
  db.countries = _.mapValues countries.response.items, (i)->
    return {title: i.title}


  log.trace db.countries
#
#  deferred.map db.countries, (country)->
#    vkAPI.executeMethod
#      method: 'database.getRegions'
#      params:
#        country_id: country.id
#        count: 1000
#    .then (regions)->
#      country.regions
#      log.debug regions.response
#  log.trace data.response.items[0]