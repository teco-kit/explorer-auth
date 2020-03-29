const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Config = require('config');

const Model = require('../models/userModel').model;

const config = Config.get('server');

const secret = process.env.SECRET || config.secret;

/**
 * register a new user
 */
async function registerNewUser(ctx) {
	try {
		// create user
		const result = new Model(ctx.request.body);

		// encrypt password
		const salt = bcrypt.genSaltSync(10);
		result.password = bcrypt.hashSync(result.password, salt);

		result.refreshToken = jwt.sign(
			{
				id: result._id,
			},
			config.refresh_secret,
			{
				expiresIn: config.refresh_ttl,
			}
		);

		// store user
		await result.save();

		// send response
		ctx.body = {message: 'Successfully created user!'};
		ctx.status = 201;
		return ctx;
	} catch (error) {
		ctx.body = {error: error.message};
		ctx.status = 500;
		return ctx;
	}
}

/**
 * log in user by name and return jwt
 */
async function loginUser(ctx) {
	// retrieve user
	const user = await Model.findOne({ email: ctx.request.body.email });

	// handle user not found
	if(!user) {
		ctx.body = {error: `user '${ctx.request.body.email}' not found`};
		ctx.status = 404;
		return ctx;
	}
	const isMatch = bcrypt.compareSync(ctx.request.body.password, user.password);

	if (isMatch) {
		// password correct
		const payload = {
			id: user._id,
		};

		const token = jwt.sign(payload, secret, {expiresIn: config.ttl});

		ctx.body = {
			access_token: `Bearer ${token}`,
			refresh_token: `${user.refreshToken}`,
		};
		ctx.status = 200;
		return ctx;
	}

	// password incorrect
	ctx.status = 400;
	ctx.body = {error: 'Password not correct!'};
	return ctx;
}

/**
 * log in user by refresh token and return jwt
 */
async function loginUserRefresh(ctx) {
	try{
		const payload = await jwt.verify(ctx.request.body.refresh_token, config.refresh_secret);

		// retrieve user
		const user = await Model.findById(payload.id);

		// check if token is revoked
		if(user.refreshToken !== ctx.request.body.refresh_token){
			ctx.status = 401;
			ctx.body = {error: 'token is revoked'};
			return ctx;
		}

		const token = jwt.sign({id: user._id}, secret, {expiresIn: config.ttl});
		ctx.body = {access_token: `${token}`};

		return ctx;
	} catch(e) {
		ctx.status = 401;
		ctx.body = {error: 'token expired'};
		return ctx;
	}
}

module.exports = {
	registerNewUser,
	loginUser,
	loginUserRefresh
};
