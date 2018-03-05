var mongoose            = require('mongoose');
var crypto              = require('crypto');

var mongoPath;

if (process.env.NODE_ENV === 'production') {
  mongoPath = "mongodb://" + config.app.mongo.user + ":" + config.app.mongo.pwd + "@" + config.app.mongo.host + ":27017/admin";
} else {
  mongoPath = "mongodb://" + config.app.mongo.host + ":27017/hi_" + process.env.NODE_ENV;
}

mongoose.connect(mongoPath);
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error:'+ err.message);
});
db.once('open', function callback () {
    console.log("Connected to DB!");
});

var Schema = mongoose.Schema;

// Schemas
var Images = new Schema({
    kind: {
        type: String,
        enum: ['thumbnail', 'detail'],
        required: true
    },
    url: { type: String, required: true }
});

// User
var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

var schemaOptions = {
    toObject: {
        virtuals: true
    }
    ,toJSON: {
        virtuals: true
    }
};

var User = new Schema({
    login: {
        type: String
    },
    email: {
        type: String,
        trim: true,
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String
    },
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    chat_background:{
        type: String
    },
    preferences: {
        theme: {
            type: Number,
            default: 8
        },
        isPrivate: {
            type: Boolean,
            default: false
        },
        message_life: {
            type: Number,
            default: 0
        },
        chat_open: {
            type: Number,
            default: 2
        },
        font:{
            type: Number,
            default: 15
        },
        global:{
            type: Boolean,
            default: true
        },
        color:{
            type: String,
            default: 'dark'
        },
        locale:{
            type: String,
            default: 'ru',
            enum: ['en', 'ru']
        }
    },
    status: {
        type: String,
        enum: ['Online', 'Away', 'DND'],
        default: 'Online'
    },
    last_date: {
        type: Date,
        default: Date.now
    },
    reg_date: {
        type: Date,
        default: Date.now
    },
    contacts: [{
        user:       {type: Schema.Types.ObjectId, requred: true, ref: 'User'},
        state:      {type: Number, default: 0}, //0 - requested, 1 - in request, 2 - approved,
        last_change: {
            type: Date,
            default: Date.now
        }
    }],
    social: {
        fb:{
            accessToken: {type: String},
            refreshToken: {type: String}
        },
        vk:{
            accessToken: {type: String},
            refreshToken: {type: String}
        },
        tw:{
            token: {type: String},
            tokenSecret: {type: String}
        }
    }
}, schemaOptions);

User.virtual('name').get(function () {
  return this.firstname + ' ' + this.lastname;
});

var UserModel = mongoose.model('User', User);



var Message = new Schema({
    user:           {type: Schema.Types.ObjectId, requred: true, ref: 'User'},
    conversation:   {type: Schema.Types.ObjectId, required: true, ref: 'Conversation'},
    text:           {type: String},
    readed:         {type: Boolean, default: false},
    visible:        {type: Boolean, default: true},
    date:           {type: Date, default: Date.now},
    last_date:      {type: Date, default: Date.now},
    isAttach:       {type: Boolean, default: false},
    attachment:     {
            name:       {type: String},
            kind:       {type: String},
            url:        {type: String}
    },
    isChange:       {type: Boolean, default: false},
    change:         {
            kind:       {
                type: String,
                enum: ['name', 'image', 'invite', 'left', 'fw']
            },
            subject:    {type: String} //e.g. user name
    },
    isForward:      {type: Boolean, default: false},
    forward:        [{type: Schema.Types.ObjectId, required: true, ref: 'Message'}]

});

var MessageModel = mongoose.model('Message', Message);

var Conversation = new Schema({
    name:           {type: String, required: true},
    image:          {type: String},
    members:        [{type: Schema.Types.ObjectId, unique: true, ref: 'User'}],
    typing:         [{user: {type: Schema.Types.ObjectId, ref: 'User'}, last_date: {type: Date, default: Date.now}}],//Чекаем печтающих
    update:         {type: Date, default: Date.now},//Везде last_date, а здесь update
    isConv:         {type: Boolean, default: false},
    messages:       [{type: Schema.Types.ObjectId, required: true, ref: 'Message'}]
});

var ConversationModel = mongoose.model('Conversation', Conversation);

module.exports.MessageModel =       MessageModel;
module.exports.ConversationModel =  ConversationModel;
module.exports.UserModel =          UserModel;
