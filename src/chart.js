var Radial = require('plusjs/src/layout/Radial')
var rayDraw = require('plusjs/src/svg/radial/ray')
var gridLine = require('plusjs/src/svg/radial/gridLine')
//var cubehelix = require('/lib/cubehelix')
var graphDraw = require('plusjs/src/svg/graph')
var radialLabel = require('plusjs/src/svg/radial/label')

var Self = function () {
  var self = this

  var width = 800, height = 800;
  self.container = d3.select('chart')
  self.vis = self.container.append('svg')
    .attr('id', 'rayChart')
    //.attr('xmlns', "http://www.w3.org/2000/svg")
    //.attr('xmlns:xlink', "http://www.w3.org/1999/xlink")
    .attr('width', width)
    .attr('height', height)
}

Self.prototype.draw = function (data) {
  Data = data

  //TODO use crossfilter for RAW data
  //Transform ghcn data excerpt
  //w = {}
  //data.map(function (d) {
  //w[d.date] = w[d.date] || {}
  //w[d.date].date = d.date
  //w[d.date][d.attr] = parseInt(d.value)
  //})
  //var a = d3.csv.format(_.toArray(w))
  
  var dateFormatter = d3.time.format('%Y%m%d')
  var datesDomain = d3.extent(data.map(function(d) {
    return dateFormatter.parse(d.DATE);
  }))

  //Config
  //---------------------------------------------------------------------------------
  var config = {
    target: self.vis,
    size: [width, height],
  }
  var yearRange = [0,365]
  var positionScaler = d3.time.scale()
    .domain(datesDomain)
    .range(yearRange)
  //TODO set individual temperature color scale (pick color for range
  //[cruel cold, ?, frosty, cold, cool, comfort, hot, super hot]
  //[-26--18, -18--10, -10--2, 2-10, 10-18, 18-26, 26-34, 34-42
  var scaleTemp2Hue = d3.scale.linear()
    .domain([-20, 35])
    .range([250,0])//[d3.rgb(0, 48, 112), d3.rgb(201, 28, 13)])
  var tempPainter = function (d) {
    return d3.hsl(scaleTemp2Hue(d), 1, .45).rgb().toString()
    //return d3.hcl(scaleTemp2Hue(d), 150, 75).rgb().toString()
  }
  //var tempPainter = cubehelix()
      //.domain([5, 20, 40])
      //.range([
        //d3.hsl( 260, 0.75, 0.35),
        //d3.hsl(  80, 1.50, 0.80),
        //d3.hsl(-100, 0.75, 0.35),
      //])
      //.domain([-0, 15, 30])
      //.range([
        //d3.hsl( 260, 0.75, 0.35),
        //d3.hsl( 110, 1, 0.80),
        //d3.hsl(   0, 1.00, 0.35),
      //])

  var configTemp = _.extend({}, config, {
    name: 'Temperature',
    positionRange: yearRange,
    position: function (d) { return positionScaler(dateFormatter.parse(d.DATE)) },
    value: {
      start: function (d) { return +d.TMIN/10 },
      end: function (d) { return +d.TMAX/10 },
    },
    domain: [-40, 40],
    range: [0, width/2*.8],
    color: function (d) { return tempPainter((+d.TMIN + +d.TMAX)/2/10) },
  })
  var configGrid = _.extend({}, config, {
    name: 'TempGrid',
    center: [width/2, height/2],
    domain: [-40, 40],
    range: [0, width/2*.8],
    step: 10,
    sectors: 12,
    sectorSize: 0.9,
  })
  var tempScaler = d3.scale.linear()
    .domain([-40, 40])
    .range([0, width/2*.8])
  var configGraph = _.extend({}, config, {
    name: 'Mediana',
    position: function (d) { return positionScaler(dateFormatter.parse(d.DATE)) },
    radius: function (d) { return tempScaler((+d.TMIN + +d.TMAX)/2/10) },
    interpolate: 'basis-closed',
    tension: 0.5,
  })
  var configLabel = _.extend({}, config, {
    name: 'Months',
    coordinateSystem: 'polar',
    range: undefined,
    position: function (d) { return d.position },
    radius: 330,
  })

  //Prepare data
  //---------------------------------------------------------------------------------
  var t = d3.time.scale()
      .domain(datesDomain)
  var ticks = t.ticks(d3.time.months, 1)
  var monthLabels = ticks.map(function (d, i) {
    return { position: i, label: d3.time.format('%b')(d) }
  })

  // Create charts
  //---------------------------------------------------------------------------------
  gridLine(configGrid)
  rayDraw(configTemp, data)

  Radial(configGraph)(data)
  graphDraw(configGraph, data)
  radialLabel(configLabel, monthLabels)

  interactive()

  //TODO draw axis labels
  //var scale = d3.scale.identity().domain(config.range)

  //var ticks = d3.scale.identity()
    //.domain(config.range)
    //.ticks(config.range[1]/config.step)

  //var axis = d3.svg.axis()
    //.scale(scale)
    //.orient('right')
    //.tickFormat(function (d) { return d + '°C' })

  //config.target.append('g').attr('transform', d3.svg.transform().translate(self.center))
    //.call(axis)
    //.transition()
    //.duration(750)

  //self._g.append('g').attr('transform', d3.svg.transform().translate(self.center))
    //.selectAll('.axisTick' + name)
    //.data(ticks)
    //.enter()
    //.append('text')
    //.attr('text-anchor', 'middle')
    //.attr('class', '.axisTick' + name)
    //.attr('x', 0)
    //.attr('y', function (d) { return d * config.factor})
    //.text(function (d) { return d})

  function interactive () {
    function showLegend(d) {
      document.querySelector('#legend>#date').html = d3.time.format('%d %b')(dateFormatter.parse(d.DATE))
      document.querySelector('#legend>#tmax').html = configTemp.value.start(d) + ' C'
      document.querySelector('#legend>#tmin').html = configTemp.value.end(d) + ' C'
      document.querySelector('#legend>#tave').html = (+d.TMIN + +d.TMAX)/2/10
    }
    function highlight(d) {
      d3.select(d).classed('highlight', !d.classList.contains('highlight'))
    }
    $('#barTemperatureGroup').on('mouseover', function (e) {
      showLegend(e.target.__data__)
      highlight(e.target)
    })
    $('#barTemperatureGroup').on('mouseout', function (e) {
      highlight(e.target)
    })
  }
}

module.exports = Self