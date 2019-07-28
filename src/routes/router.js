const Router          = require('koa-router');
const userController  = require('../controller/userController');
const authController  = require('../controller/authController');

module.exports = (app, passport) => {
  const router = {
    unprotected: new Router(),
    protected: new Router(),
  };

  /**
   * REGISTER
   *
   * create a new user
   * route:					/register
   * method type: 	POST
   */
  router.unprotected.post('/register', async (ctx) => {
    await userController.registerNewUser(ctx);
  });

  /**
   * LOGIN
   *
   * login and return token
   * route:					/login
   * method type: 	POST
   */
  router.unprotected.post('/login', async (ctx) => {
    await userController.loginUser(ctx);
  });

  /**
   * Authenticate
   *
   * check if token is valid
   * route:					/authenticate
   * method type: 	POST
   */
  router.unprotected.post('/authenticate', async (ctx) => {
    await authController.handleAuthentication(ctx, passport);
  });


  return router;
};
