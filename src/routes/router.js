const Router = require("koa-router");
const userController = require("../controller/userController");
const authController = require("../controller/authController");

module.exports = (app, passport) => {
  const prefixRouter = new Router();
  const router = new Router();

  /**
   * REGISTER
   *
   * create a new user
   * route:					/register
   * method type: 	POST
   */
  router.post("/register", async (ctx) => {
    await userController.registerNewUser(ctx);
  });

  /**
   * LOGIN
   *
   * login and return token
   * route:					/login
   * method type: 	POST
   */
  router.post("/login", async (ctx) => {
    await userController.loginUser(ctx);
  });

  /**
   * REFRESH
   *
   * login by refresh token and return jwt token
   * route:					/refresh
   * method type: 	POST
   */
  router.post("/refresh", async (ctx) => {
    await userController.loginUserRefresh(ctx);
  });

  /**
   * 2FA-INIT
   *
   * generate a secret token to be saved in an application like Google Authenticator.
   * route:					/2fa-secret
   * method type: 	POST
   */
  router.post("/2fa/init", passport.authenticate("jwt"), async (ctx) => {
    await authController.init2Fa(ctx);
  });

  /**
   * 2FA-VERIFY
   *
   * verify a time-based one-time password (TOTP) based on the secret token
   * route:					/2fa-generate
   * method type: 	POST
   */
  router.post("/2fa/verify", passport.authenticate("jwt"), async (ctx) => {
    await authController.verify2Fa(ctx);
  });

  /**
   * 2FA-RESET
   *
   * reset 2fa
   * route:					/2fa/reset
   * method type: 	POST
   */
  router.post("/2fa/reset", passport.authenticate("jwt"), async (ctx) => {
    await authController.reset2Fa(ctx);
  });

  /**
   * AUTHENTICATE
   *
   * check if token is valid
   * route:					/authenticate
   * method type: 	POST
   */
  router.post("/authenticate", async (ctx) => {
    await authController.handleAuthentication(ctx, passport);
  });

  /**
   * UNREGISTER
   *
   * check if token is valid
   * route:					/unregister
   * method type: 	DELETE
   */
  router.delete("/unregister", async (ctx) => {
    await userController.deleteUser(ctx, passport);
  });

  /**
   * LIST ALL USERS
   *
   * lists all users, admin rights needed
   * route:					/users
   * method type: 	GET
   */
  router.get("/users", async (ctx) => {
    await userController.getUsers(ctx, passport);
  });

  /**
   *
   * Maps user._id to e-mail addresses
   * route: 				/mail
   * method type: POST
   */
  router.post("/mail", async (ctx) => {
    await userController.getUsersMail(ctx, passport);
  });

  /**
   * Maps e-mail addresses to user._id
   * route: /id
   * method: type: POST
   */
  router.post("/id", async (ctx) => {
    await userController.getUserId(ctx, passport)
  })

  /**
   * Allows a user to change his own e-mail address
   * route: /changeMail
   * method type: PUT
   */
  router.put("/changeMail", async (ctx) => {
    await userController.changeUserMail(ctx, passport);
  });

  /**
   * Changes the password of a user
   * route /changePassword
   * method type: PUT
   */
  router.put("/changePassword", async (ctx) => {
	  await userController.changeUserPassword(ctx, passport);
  })

  prefixRouter.use("/auth", router.routes(), router.allowedMethods());

  return prefixRouter;
};
