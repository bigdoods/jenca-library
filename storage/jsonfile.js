var fs = require('fs');
var uuid = require('uuid');
var path = require('path');
var settings = require('../settings');


module.exports = function(opts){

  opts = opts || {}
  var state = {}

  var file = opts.datafile || settings.defaultFilePath
  if(!fs.existsSync(file)){
    save_data()
  }
  reset_state()

  function reset_state(){
    state = {
      library:{}
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

  function get_app(appid, done){
    if(!state.library[appid]){
      done('there is no app with id: ' + appid)
      return
    }

    done(null, state.library[appid])
  }

  function list_apps(done){
    done(null, state.library)
  }

  return {
    get_app:get_app,
    list_apps:list_apps,
    create_app:create_app,

    reset_state:reset_state
  }
}