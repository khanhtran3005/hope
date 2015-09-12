'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  crate = require('mongoose-crate'),
  LocalFS = require('mongoose-crate-localfs'),
  path = require('path');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
  return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please fill in your first name']
  },
  lastName: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please fill in your last name']
  },
  displayName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please fill in your email'],
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  username: {
    type: String,
    unique: 'testing error message',
    required: 'Please fill in a username',
    trim: true
  },
  password: {
    type: String,
    default: '',
    validate: [validateLocalStrategyPassword, 'Password should be longer']
  },
  salt: {
    type: String
  },
  provider: {
    type: String,
    required: 'Provider is required'
  },
  providerData: {},
  additionalProvidersData: {},
  roles: {
    type: [{
      type: String,
      enum: ['user', 'admin']
    }],
    default: ['user']
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  /* For reset password */
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  socketId: {
    type: String
  },
  user_public: {
    type: Boolean,
    default: false
  },
  skype: {
    type: String,
    trim: true
  },
  facebook: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  desc: {
    type: String,
    trim: true
  }
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
  if (this.password && this.password.length > 6) {
    this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
  } else {
    return password;
  }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
  console.log(password);
  return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
  var _this = this;
  var possibleUsername = username + (suffix || '');

  _this.findOne({
    username: possibleUsername
  }, function(err, user) {
    if (!err) {
      if (!user) {
        callback(possibleUsername);
      } else {
        return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
      }
    } else {
      callback(null);
    }
  });
};

UserSchema.set('toJSON', {
  virtuals: true
});
UserSchema.set('toObject', {
  virtuals: true
});

UserSchema.virtual('profileURL').get(function() {
  if (this.attachment !== undefined && this.attachment.name !== undefined)
    return '/uploads/' + this.attachment.name;
  else
    return 'assets/img/empty-profile.png';
});

UserSchema.virtual('accept').get(function() {
  return this._accept;
}).set(function(value) {
  this._accept = value;
});

UserSchema.plugin(crate, {
  storage: new LocalFS({
    directory: path.resolve(__dirname, '../../public/uploads')
  }),
  fields: {
    attachment: {}
  }
});

mongoose.model('User', UserSchema);
