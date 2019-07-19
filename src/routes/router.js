const Router          = require('koa-router');
const userController  = require('../controller/userController');

// authentication
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
  await userController.createUser(ctx);
});

/**
 * LOGIN
 *
 * description -> get jwt oder so
 * route:					/login
 * method type: 	POST
 */
router.unprotected.post('/login', async (ctx) => {
  //TODO: hier weitermachen
  await userController.getUserByUsername(ctx);
});

// unprotected routes


module.exports = router;
