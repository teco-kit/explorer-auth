
/**
 * check if service is up and running
 */
async function check(ctx) {
	// TODO: add more logic here if needed
	ctx.status = 200;
	return ctx;
}

module.exports = {
	check
};
