const Router          = require('koa-router');
const userController  = require('../controller/userController');
const authController  = require('../controller/authController');
const healthController  = require('../controller/healthController');

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
	 * LOGIN
	 *
	 * login by refresh token and return jwt token
	 * route:					/refresh
	 * method type: 	POST
	 */
	router.unprotected.post('/refresh', async (ctx) => {
		await userController.loginUserRefresh(ctx);
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

	/**
	 * HEALTHCHECK
	 *
	 * check if service is up and running
	 * route:					/healthcheck
	 * method type: 	GET
	 */
	router.unprotected.get('/healthcheck', async (ctx) => {
		await healthController.check(ctx);
	});


	return router;
};
