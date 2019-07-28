const {Strategy, ExtractJwt} = require('passport-jwt');
const User = require('./../models/userModel').model;
const Config = require('config');

const config = Config.get('server');

const secret = process.env.SECRET || config.secret;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret
};

const strategy = new Strategy(opts, (jwt_payload, done) => {
  User.findOne({id: jwt_payload.sub}, function(err, user) {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
});



module.exports = {
  strategy
};


