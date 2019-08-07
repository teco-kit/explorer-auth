const Model = require('../models/userModel').model;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Config = require('config');
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
  } else {
    const isMatch = bcrypt.compareSync(ctx.request.body.password, user.password);

    if (isMatch) {
      // password correct
      const payload = {
        id: user._id,
      };

      const token = jwt.sign(payload, secret, {expiresIn: 36000});

      ctx.body = {
        success: true,
        token: `Bearer ${token}`,
      };
      ctx.status = 200;
      return ctx;

    } else {
      // password incorrect
      ctx.status = 400;
      ctx.body = {error: 'Password not correct!'};
      return ctx;
    }
  }
}

module.exports = {
  registerNewUser,
  loginUser
};
