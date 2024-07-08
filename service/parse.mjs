#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import _ from 'lodash'

// TODO get from args
const Params = ['TMIN', 'TMAX', 'TAVG', 'PRCP']
const Year = '2023'

// extract all archives
// 7z -r e ../ghcn/gz ../ghcn/csv
function stationsData () {
  const sourcePath = '../ghcn/csv'
  const destPath = `./data/${Year}`
  const files = fs.readdirSync(sourcePath).map((filename, i) => {
    const filePath = path.join(sourcePath, filename)
    const stationData = fs.readFileSync(filePath).toString().split('\n')
    const filtered = []
    _.each(stationData, d => {
      const [name, date, param, value] = d.split(',')
      if (date && param && value && date.startsWith(Year) && Params.includes(param)) {
        filtered.push([date.slice(4, 8), param, value].join(','))
      }
    })
    if (filtered.length) fs.writeFileSync(path.join(destPath, filename), filtered.join('\n'))
    console.log(i)
  })
}

// parses all stations from txt file and filters those which have corresponding extracted csv
function stationsList () {
  const source = fs.readFileSync('../ghcn/ghcnd-stations.txt').toString().split('\n')
  const stations = ['id,latitude,longitude,name']
  _.each(source, line => {
    const data = _.compact(line.slice(0, 70).split(' '))
    if (fs.existsSync(`./data/${Year}/${data[0]}.csv`)) {
      stations.push([data[0], data[1], data[2], `"${_.trimEnd(line.slice(41, 70))}"`].join(','))
    }
  })
  fs.writeFileSync('./data/stations.csv', stations.join('\n'))
}

// works on the folder from noaa/by_station
// stationsData()
stationsList()