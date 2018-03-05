lib = require appRoot + '/lib'
mongoose = lib.get 'mongoose'

UserSchema = mongoose.Schema
  password: String
  link:
    type: String
    index: true
    unique: true
    required: true
  personal:
    name: String
    surname: String
    interests: String
    photo: String
  settings:
    search:
      sources:
        posts_of:
          type: String
          enum: ['groups', 'people']
          default: 'groups'
        wiki:
          type: Boolean
          default: false
        vk:
          type: Boolean
          default: true
        fb:
          type: Boolean
          deafult: true
        tw:
          type: Boolean
          default: false
      types:
        events:
          type: Boolean
          default: false
        groups:
          type: Boolean
          default: false
        posts:
          type: Boolean
          default: true
    lang:
      type: String
      enum: ['ru', 'en']
      default: 'ru'
    theme:
      type: Number
      default: 8
    interface:
      show_top_menu:
        type: Boolean
        default: true
      show_hints:
        type: Boolean
        default: true
  socials:
    vk:
      id:
        type: Number
        index: true
        unique: true
      access_token:
        type: String
        index: true
    tw:
      id:
        type: Number
        index: true
        unique: true
      token:
        type: String
        index: true
      token_secret:
        type: String
        index: true
    fb:
      id:
        type: Number
        index: true
        unique: true
      access_token:
        type: String
        index: true
      refresh_token:
        type: String
        index: true
  bookmarks: []
  register_date:
    type: Date
    default: Date.now
# ,
#   strict: false

AllowedIP = mongoose.Schema
  ip:
    type: String
    unique: true
    required: true
  createdAt:
    type: Date
    expires: '24h'

module.exports =
  User: mongoose.model 'User', UserSchema
  AllowedIP: mongoose.model 'AllowedIP', AllowedIP
