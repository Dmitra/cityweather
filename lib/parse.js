#!/usr/bin/env node
var fs = require('fs')
  , wrench = require('wrench')

function split(file) {
  var ids = {}
  , id = ''
  , line = ''
  , i = 0
  , data
  , writeLine = ''

  var now = new Date()
  while(file.hasNextLine()) { //
    line = file.getNextLine()
    id = line.substr(0,11)
    //data = ids[id] || []
    data = ids[id] || ''
    writeLine = line.substring(16, Infinity).replace('\r','')

    //data.push(writeLine)
    data += writeLine + '\n'

    ids[id] = data

    //progress
    i++
    if (!(i%1000)) {
      console.log(i);
      console.log(writeLine);
    }
    if (!(i%9000000)) {
      write(ids)
      ids = {}
    }
  }
  console.log('TIME: ' + (new Date() - now));
  write(ids)
}

function write(data) {
  var i = 0
  var filename;
  data.forEach(function (value,id) {
    filename = '2014/' + id + '.csv'
    if (fs.existsSync(filename)) {
      fs.appendFileSync(filename, value)
    } else {
      fs.writeFileSync(filename, value)
    }

    //progress
    i++
    if (!(i%100)) console.log(i);
  })
}

//var files = wrench.readdirSyncRecursive('.');
var file = new wrench.LineReader('2014.csv');
split(file)
