const mongoose     = require('mongoose');
const Config       = require('config');

const config = Config.get('server');
const Model = require('./src/models/userModel').model;

const email = process.env.npm_config_email;

// connect to Mongo
mongoose.connect(config.db, {useNewUrlParser: true});

// suppress deprecation warnings
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

async function makeUserAdmin(userEmail) {
	try {
		const user = await Model.findOne({email: userEmail});
		if (user) {
			user.role = 'admin';
			await user.save();
			console.log(`Successfully made '${email}' an admin user!`);
		} else {
			console.log(`User with email '${email}' not found!`);
		}
	} catch(e) {
		console.error(e);
	}
}

(async () => {
	if(email === undefined) {
		console.error('Please provide a username with --email=\'email\'');
	} else {
		await makeUserAdmin(email);
	}
	mongoose.disconnect();
})();
