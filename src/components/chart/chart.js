var Radial = require('plusjs/src/layout/Radial')
var rayDraw = require('plusjs/src/svg/radial/ray')
var gridLine = require('plusjs/src/svg/radial/gridLine')
//var cubehelix = require('/lib/cubehelix')
var graphDraw = require('plusjs/src/svg/graph')
var radialLabel = require('plusjs/src/svg/radial/label')
import './chart.scss'

export default class Chart {
  constructor (container) {
    this.stashed = {}
    this.container = container

    d3.select(window).on('resize', this._resize.bind(this))

    //Set initial size
    this._init()
  }

  show () {
    this.container.classed('fade-in', true)
  }

  hide () {
    this.container.classed('fade-in', false)
  }
  /**
   * render the chart for the first time
   */
  render (data, id) {
    this.stashed[id] = data
    if (this.rendered) return this.draw(data, id)

    var datesDomain = d3.extent(_.map(data, 'date'))

    //Config
    //---------------------------------------------------------------------------------
    this.config = {
      target: this.vis
    , size: [this.size, this.size]
    }
    var yearRange = [0,365]
    var temperatureDomain = [-40, 40]
    var chartActualSize = [0, this.size/2*.8]
    var positionScaler = d3.time.scale()
      .domain(datesDomain)
      .range(yearRange)
    //TODO set individual temperature color scale (pick color for range
    //[cruel cold, ?, frosty, cold, cool, comfort, hot, super hot]
    //[-26--18, -18--10, -10--2, 2-10, 10-18, 18-26, 26-34, 34-42
    var scaleTemp2Hue = d3.scale.linear()
      .domain([-20, 35])
      .range([250,0])//[d3.rgb(0, 48, 112), d3.rgb(201, 28, 13)])
    var tempPainter = d => {
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

    this.configTemp = _.extend({}, this.config, {
      name: 'Temperature' + id
    , positionRange: yearRange
    , position: d => positionScaler(d.date)
    , value: {
      start: d => d.tmin
    , end: d => d.tmax
    }
    , domain: temperatureDomain
    , range: chartActualSize
    , color: d => tempPainter((d.tmin + d.tmax)/2)
    })
    this.configGrid = _.extend({}, this.config, {
      name: 'TempGrid'
    , center: [this.size/2, this.size/2]
    , domain: temperatureDomain
    , range: chartActualSize
    , step: 20
    , sectors: 12
    , sectorSize: 0.9
    })
    var tempScaler = d3.scale.linear()
      .domain(temperatureDomain)
      .range(chartActualSize)

    this.configGraph = _.extend({}, this.config, {
      name: 'Mediana'
    , position: d => positionScaler(d.date)
    , radius: d => tempScaler((d.tmin + d.tmax)/2)
    , interpolate: 'basis-closed'
    , tension: 0.5
    })
    this.configLabel = _.extend({}, this.config, {
      name: 'Months'
    , coordinateSystem: 'polar'
    , range: undefined
    , position: d => d.position
    , radius: this.size/2.42
    })
    this.configSeparator = _.extend({}, this.config, {
      name: 'Separator'
    , coordinateSystem: 'polar'
    , range: undefined
    , position: d => d.position
    , radius: this.size/2.5
    })

    //Prepare data
    //---------------------------------------------------------------------------------
    var t = d3.time.scale()
        .domain(datesDomain)
    var ticks = t.ticks(d3.time.months, 0.5)
    var monthLabels = ticks.map((d, i) => {
      return { position: i + 0.4, label: d3.time.format('%b')(d) }
    })
    var monthSeparator = ticks.map((d, i) => {
      return { position: i - 0.05, label: '|' }
    })

    // Create charts
    //---------------------------------------------------------------------------------
    gridLine(this.configGrid)

    //highlight zero celsius grid line
    d3.select(d3.selectAll('.gridLine')[0][2]).attr('style', 'stroke-width:1.5px')

    radialLabel(this.configLabel, monthLabels)
    radialLabel(this.configSeparator, monthSeparator)

    this.draw(data, id)
    this.axis(this.configGrid)

    this.rendered = true
  }
  /**
   * draw radial bars for data
   * or colorize if already drawn and greyed out
   */
  draw (data, id) {
    this.active = id
    this.configTemp.name = 'Temperature' + id
    rayDraw(this.configTemp, data)
    //Radial(this.configGraph)(data)
    //graphDraw(this.configGraph, data)
    this._interactive(data, id)
  }

  axis (config) {
    const name = 'tempAxis'

    var scale = d3.scale.linear()
      .domain(config.domain)
      .range([config.range[0], -config.range[1]])

    var ticks = d3.scale.identity()
      .domain(config.domain)
      .ticks(5)

    var axis = d3.svg.axis()
      .scale(scale)
      .ticks(5)
      .orient('right')
      .tickFormat(d => this.tempFormatter(d))

    this.vis.append('g')
      .classed(name, true)
      .attr('transform', `translate(${config.center[0]}, ${config.center[1] - 10})`)
      .call(axis)

    var axisLabels = d3.selectAll('.' + name + ' .tick text')
    axisLabels.attr('style', 'text-anchor: end;')
    d3.select(axisLabels[0][0]).remove()
    d3.select(axisLabels[0][4]).remove()
    d3.select('.' + name + ' .domain').remove()
  }

  remove (id) {
    d3.select('.barGroup.Temperature' + id).remove()
    delete this.stashed[id]
  }

  bringToFront (id) {
    d3.select('.barGroup.Temperature' + id).remove()
    this.draw(this.stashed[id], id)
  }
  /**
   * grey out bars of specified data
   */
  shadow (id) {
    d3.selectAll('.barGroup.Temperature' + id + ' .bar')
      .transition()
      .duration(750)
      .style('stroke', 'grey')
  }

  _init () {
    var width = document.querySelector('body').offsetWidth
    var height = document.querySelector('body').offsetHeight
    this.size = width > height ? height : width

    if (this.vis) this.vis.remove()
    this.vis = this.container.append('svg')
      .attr('id', 'rayChart')
      //.attr('xmlns', "http://www.w3.org/2000/svg")
      //.attr('xmlns:xlink', "http://www.w3.org/1999/xlink")
      .attr('width', this.size)
      .attr('height', this.size)

    if (width > height) this.vis.style('left', (width - this.size)/2 + 'px' )
    else this.vis.style('top', (height - this.size)/2 + 'px')
  }

  _interactive (data, id) {
    const self = this
    d3.select('.barGroup.Temperature' + id).delegate('mouseover', '.bar', function (data) {
      self._showLegend(data)
      self._highlight(this)
    })
    d3.select('.barGroup.Temperature' + id).delegate('mouseout', '.bar', function (data) {
      self._highlight(this)
    })
  }

  _showLegend (d) {
    document.querySelector('#legend>#date').innerHTML = d3.time.format('%d %b')(d.date)
    document.querySelector('#legend>#tmax').innerHTML = this.tempFormatter(this.configTemp.value.start(d))
    document.querySelector('#legend>#tmin').innerHTML = this.tempFormatter(this.configTemp.value.end(d))
    document.querySelector('#legend>#tave').innerHTML = this.tempFormatter((d.tmin + d.tmax)/2)
  }

  _highlight (d) {
    d3.select(d).classed('highlight', !d.classList.contains('highlight'))
  }

  _resize () {
    this._init()
    this.rendered = false

    //TODO if no data rerender everything (on resize)
    var active = this.active
    _.each(this.stashed, (data, id) => {
      if (id !== active) {
        this.render(data, id)
        this.shadow(id)
      }
    })
    this.render(this.stashed[active], active)
  }

  tempFormatter (d) {
    return d3.format('0,000')(parseFloat(d.toFixed(2))) + ' °C'
  }
}
