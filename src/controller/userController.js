const Model = require('../models/userModel').model;

/**
 * create a new user
 */
async function createUser(ctx) {
  try {
    const document = new Model(ctx.request.body);
    const result = await document.save();
    ctx.body = {data: result};
    ctx.status = 201;
    return ctx;
  } catch (error) {
    ctx.body = {error: 'invalid name or email'};
    ctx.status = 500;
    return ctx;
  }
}

/**
 * get user by username
 */
async function getUserByUsername(ctx) {
  try {
    const user = await Model.findOne({ name: ctx.request.body.name });
    if(!user) {
      throw new Error();
    } else {
      console.log(user);
      ctx.body = {data: user};
      ctx.status = 200;
      return ctx.body;
    }
  } catch (error) {
    ctx.body = {error: `user '${ctx.request.body.name}' not found`};
    ctx.status = 404;
    return ctx;
  }
}

module.exports = {
  createUser,
  getUserByUsername
};
