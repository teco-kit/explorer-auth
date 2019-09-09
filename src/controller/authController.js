/**
 * handle authentication response
 */
async function handleAuthentication(ctx, passport) {
	await passport.authenticate('jwt', (err, user, info) => {
		if(info) {
			ctx.body = {error: 'Unauthorized'};
			ctx.status = 401;
			return ctx;
		}
		ctx.body = {
			success: true,
			userId: user._id
		};
		ctx.status = 200;
		return ctx;
	})(ctx);
}

module.exports = {
	handleAuthentication
};
