module.exports = process.env.STREAM_PKG_COV ?
  require('./lib-cov/composer') :
  require('./lib/composer');