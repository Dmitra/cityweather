var Radial = require('plusjs/src/layout/Radial')
var rayDraw = require('plusjs/src/svg/radial/ray')
var gridLine = require('plusjs/src/svg/radial/gridLine')
//var cubehelix = require('/lib/cubehelix')
var graphDraw = require('plusjs/src/svg/graph')
var radialLabel = require('plusjs/src/svg/radial/label')

var Self = function (container) {
  var self = this
  self.stashed = {}
  self.container = container

  d3.select(window).on('resize', self._resize.bind(self))

  //Set initial size
  self._init()
}

Self.prototype.show = function () {
  this.container.classed('fade-in', true)
}

Self.prototype.hide = function () {
  this.container.classed('fade-in', false)
}
/**
 * render the chart for the first time
 */
Self.prototype.render = function (data, id) {
  var self = this
  self.stashed[id] = data
  if (self.rendered) return self.draw(data, id)

  var datesDomain = d3.extent(_.pluck(data, 'date'))

  //Config
  //---------------------------------------------------------------------------------
  self.config = {
    target: self.vis,
    size: [self.size, self.size],
  }
  var yearRange = [0,365]
  var temperatureDomain = [-40, 40]
  var chartActualSize = [0, self.size/2*.8]
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

  self.configTemp = _.extend({}, self.config, {
    name: 'Temperature' + id,
    positionRange: yearRange,
    position: function (d) { return positionScaler(d.date) },
    value: {
      start: function (d) { return d.tmin },
      end: function (d) { return d.tmax },
    },
    domain: temperatureDomain,
    range: chartActualSize,
    color: function (d) { return tempPainter((d.tmin + d.tmax)/2) },
  })
  self.configGrid = _.extend({}, self.config, {
    name: 'TempGrid',
    domain: temperatureDomain,
    range: chartActualSize,
    step: 10,
    sectors: 12,
    sectorSize: 0.9,
  })
  var tempScaler = d3.scale.linear()
    .domain(temperatureDomain)
    .range(chartActualSize)

  self.configGraph = _.extend({}, self.config, {
    name: 'Mediana',
    position: function (d) { return positionScaler(d.date) },
    radius: function (d) { return tempScaler((d.tmin + d.tmax)/2) },
    interpolate: 'basis-closed',
    tension: 0.5,
  })
  self.configLabel = _.extend({}, self.config, {
    name: 'Months',
    coordinateSystem: 'polar',
    range: undefined,
    position: function (d) { return d.position },
    radius: self.size/2.42,
  })
  self.configSeparator = _.extend({}, self.config, {
    name: 'Separator',
    coordinateSystem: 'polar',
    range: undefined,
    position: function (d) { return d.position },
    radius: self.size/2.5,
  })

  //Prepare data
  //---------------------------------------------------------------------------------
  var t = d3.time.scale()
      .domain(datesDomain)
  var ticks = t.ticks(d3.time.months, 0.5)
  var monthLabels = ticks.map(function (d, i) {
    return { position: i + 0.4, label: d3.time.format('%b')(d) }
  })
  var monthSeparator = ticks.map(function (d, i) {
    return { position: i - 0.05, label: '|' }
  })

  // Create charts
  //---------------------------------------------------------------------------------
  gridLine(self.configGrid)

  radialLabel(self.configLabel, monthLabels)
  radialLabel(self.configSeparator, monthSeparator)

  self.draw(data, id)

  //TODO draw axis labels
  //var scale = d3.scale.identity().domain(self.config.range)

  //var ticks = d3.scale.identity()
    //.domain(self.config.range)
    //.ticks(self.config.range[1]/self.config.step)

  //var axis = d3.svg.axis()
    //.scale(scale)
    //.orient('right')
    //.tickFormat(function (d) { return d + '°C' })

  //self.config.target.append('g').attr('transform', d3.svg.transform().translate(self.center))
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
    //.attr('y', function (d) { return d * self.config.factor})
    //.text(function (d) { return d})

  self.rendered = true
}
/**
 * draw radial bars for data
 * or colorize if already drawn and greyed out
 */
Self.prototype.draw = function (data, id) {
  var self = this
  self.active = id
  console.log('Active: ' + id);
  self.configTemp.name = 'Temperature' + id
  rayDraw(self.configTemp, data)
  //Radial(self.configGraph)(data)
  //graphDraw(self.configGraph, data)
  self._interactive(data, id)
}

Self.prototype.remove = function (id) {
  var self = this
  d3.select('.barGroup.Temperature' + id).remove()
  delete self.stashed[id]
}
Self.prototype.bringToFront = function (id) {
  var self = this
  d3.select('.barGroup.Temperature' + id).remove()
  self.draw(self.stashed[id], id)
}
/**
 * grey out bars of specified data
 */
Self.prototype.shadow = function (id) {
  d3.selectAll('.barGroup.Temperature' + id + ' .bar')
    .transition()
    .duration(750)
    .style('stroke', 'grey')
}

Self.prototype._init = function () {
  var self = this

  var width = document.querySelector('body').offsetWidth
  var height = document.querySelector('body').offsetHeight
  self.size = width > height ? height : width

  if (self.vis) self.vis.remove()
  self.vis = self.container.append('svg')
    .attr('id', 'rayChart')
    //.attr('xmlns', "http://www.w3.org/2000/svg")
    //.attr('xmlns:xlink', "http://www.w3.org/1999/xlink")
    .attr('width', self.size)
    .attr('height', self.size)

  if (width > height) self.vis.style('left', (width - self.size)/2 )
  else self.vis.style('top', (height - self.size)/2 )
}

Self.prototype._interactive = function (data, id) {
  var self = this

  d3.select('.barGroup.Temperature' + id).delegate('mouseover', '.bar', function (data) {
    self._showLegend(data)
    self._highlight(this)
  })
  d3.select('.barGroup.Temperature' + id).delegate('mouseout', '.bar', function (data) {
    self._highlight(this)
  })
}

Self.prototype._showLegend = function (d) {
  var self = this

  document.querySelector('#legend>#date').innerHTML = d3.time.format('%d %b')(d.date)
  document.querySelector('#legend>#tmax').innerHTML = self.configTemp.value.start(d) + ' C'
  document.querySelector('#legend>#tmin').innerHTML = self.configTemp.value.end(d) + ' C'
  document.querySelector('#legend>#tave').innerHTML = (d.tmin + d.tmax)/2
}

Self.prototype._highlight = function (d) {
  d3.select(d).classed('highlight', !d.classList.contains('highlight'))
}

Self.prototype._resize = function () {
  var self = this
  self._init()
  self.rendered = false

  //TODO if no data rerender everything (on resize)
  var active = self.active
  _.each(self.stashed, function (data, id) {
    if (id !== active) {
      self.render(data, id)
      self.shadow(id)
    }
  })
  self.render(self.stashed[active], active)
}

module.exports = Self
