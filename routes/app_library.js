var path = require('path')
var JSONFileStorage = require('../storage/jsonfile')
var concat = require('concat-stream')
var url = require('url');


module.exports = function(config){

  var storage = JSONFileStorage(config)

  return {
    index:{
      GET:function(req, res, opts, cb){
        res.setHeader('content-type', 'application/json')

        var url_parts = url.parse(req.url, true);

        storage.list_apps(url_parts.query, function(err, data){
          if(err){
            res.statusCode = 500;
            res.end(err.toString());
            return;
          }

          res.end(JSON.stringify(data))
        })
      },
      POST:function(req, res, opts, cb){
        res.setHeader('content-type', 'application/json')

        req.pipe(concat(function(body){
          body = JSON.parse(body.toString())
          storage.create_app(body, function(err, data){
            if(err){
              res.statusCode = 500;
              res.end(err.toString());
              return;
            }

            res.statusCode = 201
            res.end(JSON.stringify(data))
          })
        }))

      }
    },
    show:{
      GET:function(req, res, opts, cb){
        res.setHeader('content-type', 'application/json')
        storage.get_app(opts.params.appid, function(err, data){
          if(err){
            res.statusCode = 500;
            res.end(err.toString());
            return;
          }
          res.end(JSON.stringify(data))
        })
      }
    }
  }
}