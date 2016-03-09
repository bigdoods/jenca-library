var HttpHashRouter = require('http-hash-router')

var Version = require('./routes/version')
var AppLibrary = require('./routes/app_library')

module.exports = function(config){

  var router = HttpHashRouter();

  router.set('/v1/library/version', Version(config))

  var AppLibraryHandlers = AppLibrary(config)

  // fish out user id from headers
  router.set('/v1/library', AppLibraryHandlers.index)
  router.set('/v1/library/:appid', AppLibraryHandlers.show)


  function handler(req, res) {
    router(req, res, {}, onError);

    function onError(err) {
      if (err) {
        res.statusCode = err.statusCode || 500;
        res.end(err.message);
      }
    }
  }

  return {
    handler:handler
  }
}