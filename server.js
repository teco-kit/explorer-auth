const Koa          = require('koa');
const logger       = require('koa-logger');
const Config       = require('config');
const mongoose     = require('mongoose');
const cors				 = require('koa-cors');
const convert      = require('koa-convert');
const bodyParser   = require('koa-bodyparser');

const router       = require('./src/routes/router');

// parse config
const config = Config.get('server');

// instantiate koa
const server = new Koa();

// connect to Mongo
mongoose.connect(config.db.url, {useNewUrlParser: true});

// suppress deprecation warnings
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// setup koa middlewares
server.use(convert(cors()));
server.use(convert(bodyParser()));
server.use(convert(logger()));

// unprotected routing
server.use(router.unprotected.routes());
server.use(router.protected.routes());

// catch all middleware
server.use(async (ctx) => {
  ctx.body = {error: 'Not Found'};
  ctx.status = 404;
  return ctx;
});

module.exports = server.listen(3002);
