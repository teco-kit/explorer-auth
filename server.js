const Koa          = require('koa');
const KoaStatic    = require('koa-static');
const logger       = require('koa-logger');
const Config       = require('config');
const mongoose     = require('mongoose');
const cors         = require('koa-cors');
const convert      = require('koa-convert');
const bodyParser   = require('koa-bodyparser');
const passport     = require('koa-passport');

const passportConfig     = require('./src/auth/passport-config');

// Set mongoose.Promise to any Promise implementation
mongoose.Promise = Promise;

// parse config
const config = Config.get('server');

// instantiate koa
const server = new Koa();

// connect to Mongo
mongoose.connect(config.db, {useNewUrlParser: true});

// suppress deprecation warnings
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// setup passport
server.use(passport.initialize());
passport.use(passportConfig.strategy);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// setup koa middlewares
server.use(convert(cors()));
server.use(convert(bodyParser()));
server.use(convert(logger()));
server.use(KoaStatic('./public'));

// unprotected routing
const router = require('./src/routes/router')(server, passport);

server.use(router.routes());

// catch all middleware
server.use(async (ctx) => {
	ctx.body = {error: 'Not Found'};
	ctx.status = 404;
	return ctx;
});

module.exports = server.listen(3002);
