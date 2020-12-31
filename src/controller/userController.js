const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Config = require("config");

const Model = require("../models/userModel").model;

const config = Config.get("server");

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
    ctx.body = { message: "Successfully created user!" };
    ctx.status = 201;
    return ctx;
  } catch (error) {
    ctx.body = { error: error.message };
    ctx.status = 500;
    return ctx;
  }
}

/**
 * log in user by name and return jwt
 */
async function loginUser(ctx) {
  // retrieve user
  console.log("logging in user")
  const users = await Model.find({})
  console.log()
  const user = await Model.findOne({ email: ctx.request.body.email });

  // handle user not found
  if (!user) {
    ctx.body = { error: `user '${ctx.request.body.email}' not found` };
    ctx.status = 404;
    return ctx;
  }

  const isMatch = bcrypt.compareSync(ctx.request.body.password, user.password);

  if (isMatch) {
    // password correct
    const payload = {
      id: user._id,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorVerified: false,
    };

    const token = jwt.sign(payload, secret, { expiresIn: config.ttl });

    ctx.body = {
      access_token: `Bearer ${token}`,
      refresh_token: `${user.refreshToken}`,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorVerified: false,
    };
    ctx.status = 200;
    return ctx;
  }

  // password incorrect
  ctx.status = 400;
  ctx.body = { error: "Password not correct!" };
  return ctx;
}

/**
 * log in user by refresh token and return jwt
 */
async function loginUserRefresh(ctx) {
  try {
    const jwtUserObject = await jwt.verify(
      ctx.request.body.refresh_token,
      config.refresh_secret
    );

    // retrieve user
    const user = await Model.findById(jwtUserObject.id);

    // check if token is revoked
    if (user.refreshToken !== ctx.request.body.refresh_token) {
      ctx.status = 401;
      ctx.body = { error: "token is revoked" };
      return ctx;
    }

    const payload = {
      id: user._id,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorVerified: false,
    };

    const token = jwt.sign(payload, secret, { expiresIn: config.ttl });
    ctx.body = { access_token: `${token}` };

    return ctx;
  } catch (e) {
    ctx.status = 401;
    ctx.body = { error: "token expired" };
    return ctx;
  }
}

/**
 * delete user
 *
 * only possible if body contains email to prevent unintentional deletions
 */
async function deleteUser(ctx, passport) {
  await passport.authenticate("jwt", async (err, user, info) => {
    if (info || !user) {
      ctx.body = { error: "Unauthorized" };
      ctx.status = 401;
      return ctx;
    }
    const { email } = ctx.request.body;
    if (!email || email === "") {
      ctx.body = {
        error:
          "This route deletes a user. To delete your user account, " +
          "please provide your email address in the request body. " +
          "Be careful, this action cannot be undone",
      };
      ctx.status = 400;
      return ctx;
    }
    if (email !== user.email) {
      ctx.body = { error: "Provided email does not match user email." };
      ctx.status = 400;
      return ctx;
    }
    await Model.findOneAndDelete({ email });
    ctx.body = { message: `deleted user with email: ${email}` };
    ctx.status = 200;
    return ctx;
  })(ctx);
}

/**
 * get all users
 */
async function getUsers(ctx, passport) {
  await passport.authenticate("jwt", async (err, user, info) => {
    if (info) {
      ctx.body = { error: "Unauthorized" };
      ctx.status = 401;
      return ctx;
    }
    if (user.role !== "admin") {
      ctx.body = { error: "Forbidden" };
      ctx.status = 401;
      return ctx;
    }
    ctx.body = await Model.find({}, "-__v -password -refreshToken");
    ctx.status = 200;
    return ctx;
  })(ctx);
}

async function getUsersMail(ctx, passport) {
  await passport.authenticate("jwt", async (err, user, info) => {
    if (info) {
      ctx.body = { error: "Unauthorized" };
      ctx.status = 401;
      return ctx;
    }
    const userIds = ctx.request.body;
    const users = await Model.find({ _id: userIds });
    var res = [];
    for (i = 0; i < userIds.length; i++) {
      for (j = 0; j < userIds.length; j++) {
        if (String(userIds[i]) === String(users[j]._id)) {
          res.push({_id: users[j]._id, email: users[j].email})
        }
      }
    }
    ctx.body = res;
    ctx.status = 200;
    return ctx;
  })(ctx);
}

module.exports = {
  registerNewUser,
  loginUser,
  loginUserRefresh,
  deleteUser,
  getUsers,
  getUsersMail,
};
