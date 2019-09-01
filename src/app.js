/**
 * Application responsible for data load and comparison, controls, chart, map
 */
import Map from './components/map/map'
import Header from './components/header/header'
import Chart from './components/chart/chart'
import './styles/index.scss'

export default class App {
  constructor (options) {
    this.year = options.year
    this.center = options.center

    //TODO find nearest station
    //navigator.geolocation.getCurrentPosition(() => {})

    this.dateFormatter = d3.time.format('%m%d')

    this.map = new Map({container: d3.select('#map'), center: this.center, zoom: 13})
    this.map.on('station-select', this._onStationSelect.bind(this))
    this.header = new Header(d3.select('#header'))
    this.chart = new Chart(d3.select('#chart'))
    this.header.on('hide', () => this.chart.hide())
    this.header.on('remove', this.remove.bind(this))
    this.header.on('show', id => {
      if (id) this.add(this.first && this.first.id === id ? this.first : this.second)
      else this.chart.show()
    })

    this.stations = {}
    d3.csv('data/stations.csv', stations => {
      _.each(stations, station => {
        this.stations[station.id] = station
      })
      this.map.draw(stations)
    })
  }
  /**
   * Load station data from server
   */
  load (id, year) {
    d3.text('data/' + (year || this.year) + '/' + (id) + '.csv', weather => {
      weather = "date,attr,value,a,b,c,d\n" + weather
      this._onLoad(d3.csv.parse(weather), id)
    })
  }
  /**
   * format weather data from server
   */
  parse (data) {
    var weather = d3.nest()
      .key(d => d.date )
      .rollup(leaves => {
        return leaves.reduce((p, d, i, arr) => { p[d.attr] = +d.value; return p}, {})
      })
      .entries(data)

    //format weather data
    for (var i = 0; i < weather.length; i++) {
      var result = {}
      result.date = this.dateFormatter.parse(weather[i].key)
      result.tmin = +weather[i].values.TMIN / 10
      result.tmax = +weather[i].values.TMAX / 10
      result.prcp = +weather[i].values.PRCP / 10

      weather[i] = result
    }
    return weather
  }
  /**
   * add station to comparison
   */
  add (station) {
    let position

    // update existing
    if (this.first && this.first.id === station.id || this.second && this.second.id === station.id) {
      if (this.active !== station.id) {
        this.chart.shadow(this.active)
        this.chart.bringToFront(station.id)
      }
    } else {
      if (this.first) {
        if (this.second) this.chart.remove(this.second.id)
        this.second = station
        this.chart.shadow(this.first.id)
      } else {
        this.first = station
        if (this.second) this.chart.shadow(this.second.id)
      }

      this.load(station.id, this.year)
    }

    this.header.show(station, this.first === station ? 0 : 1)
    this.chart.show()
    this.map.highlight(station.id)
    this.active = station.id
  }

  remove (id) {
    if (this.first && this.first.id === id) {
      delete this.first
    } else delete this.second

    this.chart.remove(id)
    this.map.highlight(id, false)

    if (!this.first && !this.second) {
      this.chart.hide()
      this.header.comparisonOff()
    }
    else {
      var last = this.first || this.second
      if (last.id !== this.active) this.chart.bringToFront(last.id)
    }
  }

  _onStationSelect (id) {
    this.add(this.stations[id])
  }

  _onLoad (data, id) {
    var weather = this.parse(data)
    this.loaded = weather
    this.chart.render(weather, id)
  }
}
