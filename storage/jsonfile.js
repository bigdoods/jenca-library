var fs = require('fs');
var uuid = require('uuid');
var path = require('path');
var settings = require('../settings');
var querystring = require('querystring');
var apploader = require('./apploader');

module.exports = function(opts){

  opts = opts || {}
  var state = null

  var file = opts.datafile || settings.defaultFilePath
  if(!fs.existsSync(file)){
    save_data()
  }
  reset_state()

  function reset_state(){
    state = {
      library:apploader()
    }
  }

  function save_data(){
    if(opts.memory) return
    fs.writeFileSync(file, state, 'utf8', (err) => {
      if (err) throw err;
    })
  }

  function create_app(data, done){
    data.id = uuid.v1()
    state.library[data.id] = data
    done(null, data)
  }

  function search_by_name(name, done){
    var found = {}
    Object.keys(state.library).forEach(function(appid){
      if(state.library[appid].name == name)
        found[appid] = state.library[appid]
    })

    done(null, found)
  }

  function get_app(appid, done){
    if(!state.library[appid]){
      var found_apps = search_by_name(querystring.unescape(appid), function(err, found){
        if(Object.keys(found).length ==0) return done('there is no app with id or name: ' + appid)

        done(null, found[Object.keys(found)[0]])
      })
    }

    done(null, state.library[appid])
  }

  function list_apps(params, done){
    var library = state.library

    // add all filtering params here
    if(params.search != undefined)
      Object.keys(library).forEach(function(appid){
        var app = library[appid]
        if(app.name.indexOf(params.search) <0 && app.description.indexOf(params.search))
          delete(library[appid])
      })

    done(null, library)
  }

  return {
    get_app:get_app,
    list_apps:list_apps,
    create_app:create_app,

    reset_state:reset_state
  }
}