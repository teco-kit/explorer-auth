const Config = require('config');
const {Strategy, ExtractJwt} = require('passport-jwt');
const User = require('./../models/userModel').model;

const config = Config.get('server');

const secret = process.env.SECRET || config.secret;

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: secret
};

const strategy = new Strategy(opts, (jwt_payload, done) => {
	User.findOne({id: jwt_payload.sub}, (err, user) => {
		if (err) {
			return done(err, false);
		}
		if (user) {
			return done(null, user);
		}
		return done(null, false);
	});
});


module.exports = {
	strategy
};
