#!/usr/bin/env node
var fs = require('fs')
, fs = require('fs')
, _ = require('lodash')
, readline = require('readline')
, stream = require('stream')
, i = 0
, start = new Date

function parseStations () {

  var instream = fs.createReadStream('2014.csv')
  , outstream = new stream
  , rl = readline.createInterface(instream, outstream)
  , data = {}
  , stations = []

  rl.on('line', function(line) {
    var id = line.substr(0,11)

    var dataId = data[id] || {l: 0, p: false, x: false, i: false}
    dataId.l += 1
    dataId.p = dataId.p || !!line.match(/PRCP/)
    dataId.x = dataId.x || !!line.match(/MAX/)
    dataId.i = dataId.i || !!line.match(/MIN/)
    data[id] = dataId

    log()
  });

  rl.on('close', function() {
    log('end')

    _.each(data, function (value, id) {
      if (value.l >= 3 * 365 && value.p && value.x && value.i) stations.push(id)
    })
    console.log(stations.length);

    filterStationsData(stations)
  })
}

function filterStationsData(stations) {
  var stationsData = fs.readFileSync('../data/stations.csv').toString().split('\n')
  var filteredStations = []
  stationsData.forEach(function (item) {
    if (_.contains(stations, item.substr(0,11))) filteredStations.push(item)
  })
  fs.writeFileSync('stations.csv', filteredStations.join('\n'))
}

function getStations() {
  var stationIds = fs.readFileSync('../data/stations.csv').toString().split('\n')
  var idsHash = {}
  stationIds = _.compact(stationIds)
  stationIds = _.each(stationIds, function (item) { idsHash[item.substr(0,11)] = true })

  var instream = fs.createReadStream('2014.csv')
  , outstream = new stream
  , rl = readline.createInterface(instream, outstream)
  , data = {}
  , stations = []

  rl.on('line', function(line) {
    var id = line.substr(0,11)
    if (idsHash[id]) {
      var line = line.replace('\r','')
      var value = line.substring(16, Infinity)
      var item = data[id] || ''
      item += value + '\n'
      data[id] = item
    }

    log()
    if (!(i%10000000)) {
      write(data)
      data = {}
    }
  });

  rl.on('close', function() {
    log('end')

    write(data)
  })
}

function log(mark) {
  i++
  if (!(i%1000)) console.log(i)
  if (mark && mark == 'end') console.log('Time: ' + (new Date - start)/1000 + ' sec');
}

function write(data) {
  var i = 0
  var filename;
  _.each(data, function (value,id) {
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

//parseStations()
getStations()
