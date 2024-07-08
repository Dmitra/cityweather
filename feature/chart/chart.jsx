import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'

// const cubehelix = require('/lib/cubehelix')
import axis from './components/axis'
import rayDraw from './components/radial/ray'
import gridLine from './components/radial/gridLine'
import radialLabel from './components/radial/label'
import dot from './components/radial/dot'
import { useGetStationQuery } from 'service/dataman'
// import Legend from './components/legend.jsx'
import { tempFormatter } from '../../util.js'
import './chart.css'

const inactiveColor = 'grey'

// TODO optimize rendering functions to enable resizing

export default function Chart () {
  const dispatch = useDispatch()
  const chartState = useSelector(state => state.chart)
  const active = useSelector(state => state.station.active)
  const selection = useSelector(state => state.station.selection)
  const response = useGetStationQuery({ ids: selection, year: 2023 })
  const stations = _.cloneDeep(response.data)
  const selectedStations = _.sortBy(stations, id => id === active)

  const { current: local } = useRef({
    container: undefined,
    data: {
      size: 0,
      polarRange: [],
      datesDomain: [],
      yearRange: [0, 365],
      temperatureDomain: [-40, 40],
      tempPainter: undefined,
      positionScaler: undefined,
    },
    config: {
      base: {},
      temp: {},
      grid: {},
      avg: {},
      label: {},
      separator: {},
    },
    rendered: {
      container: false,
      grid: false,
      stations: [],
    },
    active: undefined, // id | undefined
    selected: undefined,
  })
  const config = local.config
  const svgRef = useRef()
  const doShow = chartState.show && stations

  useEffect(() => {
    window.onresize = _.debounce(resize, 100)
  }, [])

  useEffect(render, [selection, active, stations])

  return (
    <div id="chart" className={ doShow ? 'visible' : '' }>
      <svg id="rayChart" ref={ svgRef }></svg>
      {/*<Legend></Legend>*/}
      <Fab color="primary" onClick={ () => {
        if (selectedStations.length > 1) dispatch({ type: 'station/deselect', payload: active })
        dispatch({ type: 'chart/toggle' })
      } }><AddIcon/></Fab>
    </div>
  )

  function init () {
    const width = document.querySelector('body').offsetWidth
    // const headerHeight = document.querySelector('#root .header').offsetHeight
    const headerHeight = 57
    const height = document.querySelector('body').offsetHeight - headerHeight
    local.data.size = width > height ? height : width

    local.container = d3.select(svgRef.current)
      .attr('width', local.data.size)
      .attr('height', local.data.size)

    if (width > height) local.container.style('left', (width - local.data.size) / 2 + 'px')
    else local.container.style('top', (height - local.data.size) / 2 + 'px')

    local.config.base = {
      target: local.container,
      size: [local.data.size, local.data.size],
      tempFormatter,
    }

    local.container.node().addEventListener('mouseover', e => {
      if (e.target.classList.contains('bar')) {
        dispatch({ type: 'chart/selectDate', payload: e.target.__data__ })
      }
        // '.barGroup.Temperature'
        // highlight(this)
      })
    // '.barGroup.Temperature' + station.id)
    //   .on('mouseout', data => {
    //     highlight(this)
    //   })
  }

  function configure () {
    local.data.datesDomain = d3.extent(_.map(selectedStations[0].data, 'date'))

    local.data.polarRange = [local.data.size * 0.05, local.data.size / 2 * .9]
    local.data.positionScaler = d3.time.scale()
      .domain(local.data.datesDomain)
      .range(local.data.yearRange)
    //TODO set individual temperature color scale (pick color for range
    //[cruel cold, ?, frosty, cold, cool, comfort, hot, super hot]
    //[-26--18, -18--10, -10--2, 2-10, 10-18, 18-26, 26-34, 34-42
    const scaleTemp2Hue = d3.scale.linear()
      .domain([-20, 35])
      .range([250, 0])//[d3.rgb(0, 48, 112), d3.rgb(201, 28, 13)])

    local.data.tempPainter = (d) => {
      return d3.hsl(scaleTemp2Hue(d), 1, .45).rgb().toString()
      //return d3.hcl(scaleTemp2Hue(d), 150, 75).rgb().toString()
    }
  }

  function render () {
    if (!local.rendered.container) init()
    if (!_.isEmpty(stations)) configure()
    if (!_.isEmpty(stations) && !local.rendered.grid) renderGrid()

    const exitStations = _.difference(local.rendered.stations, selection)
    _.each(exitStations, id => remove(id))
    local.rendered.stations = _.without(local.rendered.stations, ...exitStations)
    _.each(selectedStations, station => {
      if (!local.rendered.stations.includes(station.id)) renderStation(station)
      else if (local.active !== active) toggleActive(station.id)
    })
    local.active = active
  }

  /**
   * render the chart for the first time
   */
  function renderStation (station) {

    //Config
    //---------------------------------------------------------------------------------
    //const local.data.tempPainter = cubehelix()
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

    config.temp = _.extend({}, local.config.base, {
      name: 'Temperature' + station.id,
      positionRange: local.data.yearRange,
      position: d => local.data.positionScaler(d.date),
      value: {
        start: d => d.tmin, end: d => d.tmax,
      },
      domain: local.data.temperatureDomain,
      range: local.data.polarRange,
      color: d => station.id === active ? local.data.tempPainter((d.tmin + d.tmax) / 2) : inactiveColor,
    })
    config.avg = _.extend({}, local.config.base, {
      name: 'Mediana' + station.id,
      positionRange: local.data.yearRange,
      position: d => local.data.positionScaler(d.date),
      value: d => d.tavg,
      cr: 1.5,
      domain: local.data.temperatureDomain,
      range: local.data.polarRange,
      color: d => station.id === active ? local.data.tempPainter(d.tavg) : inactiveColor,
    })
    config.prcp = _.extend({}, local.config.base, {
      id: 'Precipitation' + station.id,
      name: 'Precipitation',
      positionRange: local.data.yearRange,
      position: d => local.data.positionScaler(d.date),
      value: d => d.tavg || (d.tmin + d.tmax) / 2 || 20,
      cr: d => d.prcp / 2,
      fill: '#008BFF',
      domain: local.data.temperatureDomain,
      range: local.data.polarRange,
    })

    if (!local.rendered.stations.includes(station.id)) local.rendered.stations.push(station.id)
    draw(station)
  }

  function renderGrid () {
    config.gridEven = _.extend({}, local.config.base, {
      name: 'TempGridEven',
      center: [local.data.size / 2, local.data.size / 2],
      domain: local.data.temperatureDomain,
      range: local.data.polarRange,
      ticks: [-20, 0, 20, 40],
      sectors: 12,
      spacing: 8,
    })
    config.gridOdd = _.extend({}, local.config.base, {
      name: 'TempGridOdd',
      center: [local.data.size / 2, local.data.size / 2],
      domain: local.data.temperatureDomain,
      range: local.data.polarRange,
      ticks: [-30, -10, 0, 10, 30],
      sectors: 12,
      spacing: 8,
    })
    config.axis = _.extend({}, local.config.gridEven, {
      background: 'white',
    })
    const tempScaler = d3.scale.linear()
      .domain(local.data.temperatureDomain)
      .range(local.data.polarRange)

    config.label = _.extend({}, local.config.base, {
      name: 'Months',
      coordinateSystem: 'polar',
      range: undefined,
      position: d => d.position - 0.35,
      radius: local.data.size / 2.1,
    })
    config.separator = _.extend({}, local.config.base, {
      name: 'Separator',
      coordinateSystem: 'polar',
      range: undefined,
      position: d => d.position,
      radius: local.data.size / 2.42,
    })
    config.monthLabelSeparator = _.extend({}, local.config.base, {
      name: 'monthLabelSeparator',
      coordinateSystem: 'cartesian',
      position: d => d.position,
      value: {
        start: 42, end: 48,
      },
      domain: local.data.temperatureDomain,
      range: local.data.polarRange,
    })

    const timeScale = d3.time.scale()
      .domain(local.data.datesDomain)
    const ticks = timeScale.ticks(d3.time.months, 0.5)
    const monthLabels = ticks.map((d, i) => {
      return { position: i + 0.4, label: d3.time.format('%b')(d) }
    })

    gridLine(config.gridEven)
    gridLine(config.gridOdd)
    radialLabel(config.label, monthLabels)
    rayDraw(config.monthLabelSeparator, ticks.map((d, i) => ({ position: i })))
    axis(config.axis)
    local.rendered.grid = true
  }

  /**
   * draw radial bars for data
   * or colorize if already drawn and greyed out
   */
  function draw (station) {
    config.temp.name = 'Temperature' + station.id
    rayDraw(config.temp, station.data)
    d3.select('.tempAxis').remove()
    dot(config.avg, station.data)
    dot(config.prcp, station.data)
    axis(config.axis)
  }

  function remove (id) {
    d3.select('.barGroup.Temperature' + id).remove()
    d3.select('.dotGroup.Mediana' + id).remove()
    d3.select('.dotGroup.Precipitation' + id).remove()
  }

  function bringToFront (id) {
    d3.select('.barGroup.Temperature' + id).remove()
    d3.select('.dotGroup.Mediana' + id).remove()
    d3.select('.dotGroup.Precipitation' + id).remove()
    renderStation(_.find(selectedStations, { id }))
  }

  /**
   * grey out bars of inactive station
   */
  function shadow (id) {
    d3.selectAll('.barGroup.Temperature' + id + ' .bar')
      .transition()
      .ease('cubic-out')
      .duration(750)
      .style('stroke', inactiveColor)
    d3.selectAll('.dotGroup.Mediana' + id + ' circle')
      .transition()
      .ease('cubic-out')
      .duration(750)
      .style('stroke', inactiveColor)
      .style('fill', inactiveColor)
    d3.selectAll('.dotGroup.Precipitation' + id + ' circle')
      .transition()
      .ease('cubic-out')
      .duration(750)
      .style('fill', inactiveColor)
  }

  function toggleActive (id) {
    local.active === id ? shadow(id) : bringToFront(id)
  }

  function highlight (d) {
    d3.select(d).classed('highlight', !d.classList.contains('highlight'))
  }

  function resize () {
    const width = document.querySelector('body').offsetWidth
    const height = document.querySelector('body').offsetHeight
    dispatch({ type: 'chart/resize', payload: width > height ? height : width })
  }
}