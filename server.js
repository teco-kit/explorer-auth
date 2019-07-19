const Koa          = require('koa');
const logger       = require('koa-logger');
const Config       = require('config');
const mongoose     = require('mongoose');
const cors				 = require('koa-cors');
const convert      = require('koa-convert');
const bodyParser   = require('koa-bodyparser');

// parse config
const config = Config.get('server');

// instantiate koa
const server = new Koa();

// connect to Mongo
mongoose.connect(config.db.url, {useNewUrlParser: true})
  .then(
    () => { },
    (e) => {
      console.error(e, 'MongoDB connection error:');
      server.close();
    }
  );

// suppress deprecation warnings
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// setup koa middlewares
server.use(convert(cors()));
server.use(convert(bodyParser()));

// only display logs in development
if(config.logger) {
  server.use(convert(logger()));
}

// catch errors
server.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.body = {error: error.message};
    ctx.status = error.status || 500;
    return ctx;
  }
});

// catch all middleware
server.use(async (ctx) => {
  ctx.body = {error: 'Not Found'};
  ctx.status = 404;
  return ctx;
});

module.exports = server.listen(3002);
