crypto = require 'crypto'
moment = require 'moment'

exports.User = User = sequelize.define 'users',
  email:
    type: Sequelize.STRING
  password:
    type: Sequelize.STRING
    set: (passString)->
      shasum = crypto.createHash 'sha1'
      shasum.update passString
      @setDataValue 'password', shasum.digest('hex').toString()
    matches: (passString)->
      shasum = crypto.createHash 'sha1'
      shasum.update passString
      @getDataValue('password') is shasum.digest('hex').toString()
,
  freezeTableName: true
,
  timestamps: true

exports.Spy = Spy = sequelize.define 'spies',
  user_notified:
    type: Sequelize.BOOLEAN
    default: false
  client:
    type: Sequelize.JSON
  latest_version:
    type: Sequelize.JSON
  next_check_at:
    type: Sequelize.DATE
  check_interval:
    type: Sequelize.INTEGER
    set: (intervalName)->
      log.trace "setting interval... #{ intervalName }"
      if typeof intervalName is 'string'
        intervalValue = [\
          15 * 1e3 * 60,              # 15m
          15 * 1e3 * 60 * 4,          # 1h
          15 * 1e3 * 60 * 4 * 24,     # 1d
          15 * 1e3 * 60 * 4 * 24 * 7  # 1w
        ][config.spy.checkIntervals.indexOf intervalName]

        @setDataValue 'check_interval', intervalValue
        @setDataValue 'next_check_at', new Date
        # @setDataValue 'next_check_at', new Date moment(moment().valueOf() + intervalValue).valueOf()
      if typeof intervalName is 'integer'
        @setDataValue 'check_interval', intervalName
        @setDataValue 'next_check_at', new Date
        # @setDataValue 'next_check_at', new Date moment(moment().valueOf() + intervalValue).valueOf()
  custom_message:
    type: Sequelize.STRING
  color:
    type: Sequelize.STRING
  img:
    type: Sequelize.STRING
  type:
    type: Sequelize.INTEGER
    set: (typeName)->
      @setDataValue 'type', config.spy.spyTypes.indexOf typeName
    get: ->
      config.spy.spyTypes[@getDataValue 'type']
  active:
    type: Sequelize.BOOLEAN
    default: true
  last_checked:
    type: Sequelize.DATE
  excluded_content:
    type: Sequelize.JSON
  url:
    type: Sequelize.STRING
  selectors:
    type: Sequelize.JSON
,
  freezeTableName: true
,
  timestamps: true


exports.Element = Element = sequelize.define 'elements',
  img_version:
    type: Sequelize.INTEGER
  latest_version:
    type: Sequelize.JSON
  name:
    type: Sequelize.STRING
  type:
    type: Sequelize.INTEGER
    set: (typeName)->
      @setDataValue 'type', config.spy.elementTypes.indexOf typeName
    get: ->
      config.spy.elementTypes[@getDataValue 'type']
  # xpath selector
  selector:
    type: Sequelize.STRING
,
  freezeTableName: true
,
  timestamps: true


exports.Event = Event = sequelize.define 'events',
  type:
    type: Sequelize.INTEGER
    set: (typeName)->
      @setDataValue 'type', config.spy.eventTypes.indexOf typeName
    get: ->
      config.spy.eventTypes[@getDataValue 'type']
  diff:
    type: Sequelize.JSON
,
  freezeTableName: true
,
  timestamps: true


# associations
Spy.hasMany Event
Event.belongsTo Spy

Spy.hasMany Element
Element.belongsTo Spy

Element.hasMany Event
Event.belongsTo Element
