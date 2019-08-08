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
		ctx.body = {error: 'user object'};
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
	let payload;
	try{
		payload = await new Promise((resolve, reject) => {
			jwt.verify(ctx.request.body.refresh_token, config.refresh_secret, (err, decoded) => {
				if(err){
					reject(err);
				}else{
					resolve(decoded);
				}
			});
		});
	}catch(e){
		ctx.status = 401;
		ctx.body = {message: 'cant decode token'};
		return ctx;
	}

	// check if token is expired
	if (Date.now() >= payload.exp * 1000) {
		ctx.status = 401;
		ctx.body = {message: 'expired'};
		return ctx;
	}

	// retrieve user
	const user = await Model.findById(payload.id);

	// check if user exists
	if(!user) {
		ctx.body = {error: `user not found`};
		ctx.status = 404;
		return ctx;
	}

	// check if token is revoked
	if(user.refreshToken !== ctx.request.body.refresh_token){
		ctx.status = 401;
		ctx.body = {message: 'token is revoked'};
		return ctx;
	}

	const tokenPayload = {
		id: user._id,
	};

	const token = jwt.sign(tokenPayload, secret, {expiresIn: config.ttl});

	ctx.body = {
		access_token: `${token}`,
	};

	return ctx;
}

module.exports = {
	registerNewUser,
	loginUser,
	loginUserRefresh
};
