var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var yaml = require('js-yaml')
var libraryFolder = path.join(__dirname, '..', 'apps')

function loadAppFile(appname, filename){
  var filePath = path.join(libraryFolder, appname, filename)
  var ext = filename.split('.').pop()
  var content = null
  if(fs.existsSync(filePath)){
    content = fs.readFileSync(filePath, 'utf8')
  }
  if(ext=='yaml'){
    content = yaml.safeLoad(content)
  }
  else if(ext=='json'){
    content = JSON.parse(content)
  }
  return content
}

function loadApp(appname){

  var appFolder = path.join(libraryFolder, appname)
  var files = fs.readdirSync(appFolder)
  var data = {}

  files.forEach(function(filename){
    var keyname = filename.split('.').shift()
    data[keyname] = loadAppFile(appname, filename)
  })

  data.id = uuid.v1()
  data.name = appname
  data.description = data.description || ''
  if (data.url){
    data.type = "link"
  }
  if (data.controller){
    data.type = "run"
  }

  return data
  
}

module.exports = function(opts){
  var apps = fs.readdirSync(libraryFolder)
  var library = {}

  apps.forEach(function (appname){
    var app = loadApp(appname)
    if (app.controller || app.url){
      library[appname] = app
    }
  })

  return library
}