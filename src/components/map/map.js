import EventEmitter from 'eventemitter3'
import * as leaflet from 'leaflet'
import * as markerCluster from 'leaflet.markercluster'
L.Icon.Default.imagePath = './image/'
import './map.scss'

export default class Map extends EventEmitter {

  constructor (p) {
    super()
    p = p || {}

    this.container = p.container
    var zoomLevels = [3, 15]
    var markerSizes = [1, 40]
    this.markerScale = d3.scale.linear().domain(zoomLevels).range(markerSizes)

    this.map = L.map('map')
    this.map.setView(p.center, p.zoom)

    const mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>'
    L.tileLayer(
      'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; ' + mapLink + ' Contributors',
      minZoom: zoomLevels[0],
      maxZoom: zoomLevels[1],
    }).addTo(this.map)

    this.selectedIcon = new L.Icon.Default({
      iconUrl: L.Icon.Default.imagePath + '/marker-selected.png'
    })

    this.markers = L.markerClusterGroup()
    this.map.addLayer(this.markers)

    this.markers.on('click', a => {
      //a.layer.setIcon(this.selectedIcon)
      this.emit('station-select', a.layer.id)
    });
  }

  draw (data) {
    var markers = _.map(data, d => {
      var marker = L.marker(L.latLng(d.latitude, d.longitude), { title: d.name })
      marker.id = d.id
      return marker
    })
    this.markers.addLayers(markers)
  }

  highlight (id, state) {
    //TODO find marker and change icon by state
  }
}
