var tape = require("tape")
var async = require("async")
var Router = require("./router")
var JSONFileStorage = require("./storage/jsonfile")
var path = require("path")
var http = require("http")
var from2 = require("from2-string")
var hyperquest = require("hyperquest")
var hyperrequest = require("hyperrequest")
var concat = require("concat-stream")
var settings = require('./settings')
var rimraf = require("rimraf")
var querystring = require('querystring');

var testing_port = 8060

/*

  boot a test server for each test so the state from one
  does not affect another test

*/
function createServer(done){

  // keep the storage in memory for the tests
  var router = Router({
    memory:true
  })
  var server = http.createServer(router.handler)
  server.listen(testing_port, function(err){
    done(err, server)
  })
}

/*
  Test that the version of the module returns the correct string
*/
tape("GET /v1/version", function (t) {

  var config = require(path.join(__dirname, "package.json"))
  var server;

  async.series([

    // create the server
    function(next){
      createServer(function(err, s){
        if(err) return next(err)
        server = s
        next()
      })
    },

    // read the version from the API
    function(next){
      var req = hyperquest("http://127.0.0.1:"+testing_port+"/v1/version", {
        method:"GET"
      })

      var destStream = concat(function(result){

        t.equal(result.toString(), config.version.toString(), "the version is correct")

        next()
      })

      req.pipe(destStream)

      req.on("response", function(res){
        t.equal(res.statusCode, 200, "The status code == 200")
      })

      req.on("error", function(err){
        next(err.toString())
      })
    },
  ], function(err){
    if(err){
      t.error(err)
      server.close()
      t.end()
      return
    }
    server.close()
    t.end()
  })

})


/*

  Query the api to check the apps we have saved are actually there

*/

tape("GET /v1/apps", function (t) {

  var server;

  async.series([

    // create the server
    function(next){
      createServer(function(err, s){
        if(err) return next(err)
        server = s
        next()
      })
    },

    // populate the library
    function(next){
      for(i=1;i<=10;i++)
        hyperrequest({
          url: "http://127.0.0.1:"+ testing_port +"/v1/apps",
          method: "POST",
          json: {name:'Testing App '+ i, description:"Something to test the app\nlibrary storage with."}
        }, function(err, resp){
          // always return errors so parent code is notified
          if(err) return next(err.toString())
        })
      next()
    },

    // test the length of projects matches
    function(next){
      hyperrequest({
        "url":"http://127.0.0.1:"+ testing_port +"/v1/apps",
        method:"GET"
      }, function(err, resp){
        if(err) return next(err)
        t.equal(resp.statusCode, 200, "The status code == 200")
        t.equal(Object.keys(resp.body).length, 10, "the number of apps matches")

        next()
      })

    },
  ], function(err){
    if(err){
      t.error(err)
      server.close()
      t.end()
      return
    }
    server.close()
    t.end()
  })

})

/*

  seed the system with apps and retrieve one to check it's attributes

*/
tape("GET /v1/apps/:appid", function (t) {

  var server;
  var test_app_id = null;
  async.series([

    // create the server
    function(next){
      createServer(function(err, s){
        if(err) return next(err)
        server = s
        next()
      })
    },


    // populate the library
    function(next){
      for(var i=1;i<=10;i++){
        hyperrequest({
          url: "http://127.0.0.1:"+ testing_port +"/v1/apps",
          method: "POST",
          json: {name:'Testing App '+ i, description:"Something to test the app\nlibrary storage with."}
        }, function(err, resp){
          // always return errors so parent code is notified
          if(err) return next(err.toString())

          if(test_app_id == null)
            test_app_id = resp.body.id

          // continue the series on the last response
          if(resp.body.name.match(/ 10$/))
            next()
        })
      }
    },


    // get a single project
    function(next){

      hyperrequest({
        "url": "http://127.0.0.1:"+testing_port+"/v1/apps/"+ test_app_id,
        method:"GET"
      }, function(err, resp){
        if(err) return subnext(err)

        t.equal(resp.statusCode, 200, "The status code == 200")
        t.equal(resp.body.id, test_app_id, "the requested app's id matches")

        next()
      })
    }
  ], function(err){
    if(err){
      t.error(err)
      server.close()
      t.end()
      return
    }
    server.close()
    t.end()
  })

})



/*

  seed the system with apps and retrieve one to check it's attributes

*/
tape("GET /v1/apps/:appname", function (t) {

  var server;
  var test_app_name = null;
  async.series([

    // create the server
    function(next){
      createServer(function(err, s){
        if(err) return next(err)
        server = s
        next()
      })
    },


    // populate the library
    function(next){
      for(var i=1;i<=10;i++){
        hyperrequest({
          url: "http://127.0.0.1:"+ testing_port +"/v1/apps",
          method: "POST",
          json: {name:'Testing App '+ i, description:"Something to test the app\nlibrary storage with."}
        }, function(err, resp){
          // always return errors so parent code is notified
          if(err) return next(err.toString())

          if(test_app_name == null)
            test_app_name = querystring.unescape(resp.body.name)

          // continue the series on the last response
          if(resp.body.name.match(/ 10$/))
            next()
        })
      }
    },


    // get a single project
    function(next){

      hyperrequest({
        "url": "http://127.0.0.1:"+testing_port+"/v1/apps/"+ test_app_name,
        method:"GET"
      }, function(err, resp){
        if(err) return subnext(err)

        t.equal(resp.statusCode, 200, "The status code == 200")
        t.equal(resp.body.name, test_app_name, "the requested app's name matches")

        next()
      })
    }
  ], function(err){
    if(err){
      t.error(err)
      server.close()
      t.end()
      return
    }
    server.close()
    t.end()
  })

})



/*

  Query the api to check the apps we have saved are actually there

*/

tape("GET /v1/apps?search=App 4", function (t) {

  var server;

  async.series([

    // create the server
    function(next){
      createServer(function(err, s){
        if(err) return next(err)
        server = s
        next()
      })
    },

    // populate the library
    function(next){
      for(i=1;i<=10;i++)
        hyperrequest({
          url: "http://127.0.0.1:"+ testing_port +"/v1/apps",
          method: "POST",
          json: {name:'Testing App '+ i, description:"Something to test the app\nlibrary storage with."}
        }, function(err, resp){
          // always return errors so parent code is notified
          if(err) return next(err.toString())
        })
      next()
    },

    // test the length of projects matches
    function(next){
      hyperrequest({
        "url":"http://127.0.0.1:"+ testing_port +"/v1/apps?search=App 4",
        method:"GET"
      }, function(err, resp){
        if(err) return next(err)
        t.equal(resp.statusCode, 200, "The status code == 200")
        t.equal(Object.keys(resp.body).length, 1, "the number of apps matches")
        t.equal(resp.body[Object.keys(resp.body)[0]].name, 'Testing App 4', "the found app's name matches")

        next()
      })

    },
  ], function(err){
    if(err){
      t.error(err)
      server.close()
      t.end()
      return
    }
    server.close()
    t.end()
  })

})