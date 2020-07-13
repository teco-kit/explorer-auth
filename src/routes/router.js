const Router          = require('koa-router');
const userController  = require('../controller/userController');
const authController  = require('../controller/authController');

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
	router.post('/register', async (ctx) => {
		await userController.registerNewUser(ctx);
	});

	/**
	 * LOGIN
	 *
	 * login and return token
	 * route:					/login
	 * method type: 	POST
	 */
	router.post('/login', async (ctx) => {
		await userController.loginUser(ctx);
	});

	/**
	 * REFRESH
	 *
	 * login by refresh token and return jwt token
	 * route:					/refresh
	 * method type: 	POST
	 */
	router.post('/refresh', async (ctx) => {
		await userController.loginUserRefresh(ctx);
	});

	/**
	 * Authenticate
	 *
	 * check if token is valid
	 * route:					/authenticate
	 * method type: 	POST
	 */
	router.post('/authenticate', async (ctx) => {
		await authController.handleAuthentication(ctx, passport);
	});

	/**
   * UNREGISTER
   *
   * check if token is valid
   * route:					/unregister
   * method type: 	DELETE
   */
	router.delete('/unregister',  async (ctx) => {
		await userController.deleteUser(ctx, passport);
	});

	/**
   * LIST ALL USERS
   *
   * lists all users, admin rights needed
   * route:					/users
   * method type: 	GET
   */
	router.get('/users', async (ctx) => {
		await userController.getUsers(ctx, passport);
	});

	prefixRouter.use('/auth', router.routes(), router.allowedMethods());

	return prefixRouter;
};
