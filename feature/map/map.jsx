import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { map, divIcon, marker, tileLayer, featureGroup, latLng } from 'leaflet/dist/leaflet-src.esm.js'
import { MarkerClusterGroup } from 'leaflet.markercluster.esm'
import { useGetStationsQuery } from '../../service/dataman'
import main from '../main/state'
import './map.css'

const icon = divIcon({
  html: `<img src="${main.baseUrl}/asset/pin.svg">`,
})
const activeIcon = divIcon({
  className: 'active',
  html: `<img src="${main.baseUrl}/asset/pin-contrast.svg">`,
})

export default function Map () {
  const dispatch = useDispatch()
  const { center, zoom } = useSelector(state => state.map )
  const chart = useSelector(state => state.chart)
  const { data: stations } = useGetStationsQuery()
  const selection = useSelector(state => state.station.selection)
  const { current: local } = useRef({
    map: undefined,
    markerCluster: undefined,
    markers: [],
    selection: [],
  })
  const zoomLevels = [3, 15]

  useEffect(init, [stations])
  useEffect(updateMarkers, [stations, selection])

  return (
    <div id="map" className={ chart.show ? 'overlayed' : '' }></div>
  )

  function init () {
    if (!stations) return

    local.map = map('map')

    tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> Contributors',
        minZoom: zoomLevels[0],
        maxZoom: zoomLevels[1],
      }).addTo(local.map)


    local.markerCluster = new MarkerClusterGroup({
      iconCreateFunction: cluster => divIcon({ html: `<div>${cluster.getChildCount()}</div>`})
    })
    local.map.addLayer(local.markerCluster)
    createMarkers()

    if (selection.length) {
      const selectedMarkers = _.map(selection, id => _.find(local.markers, { id }))
      const bounds = featureGroup(selectedMarkers).getBounds()
      local.map.fitBounds(bounds)
    } else local.map.setView(center, zoom)

    local.markerCluster.on('click', onMarkerClick)
  }

  function createMarkers () {
    if (_.isEmpty(stations) || local.markerCluster.getLayers().length) return

    const _markers = _.map(stations, station => {
      const _marker = marker(latLng(station.latitude, station.longitude), {
        icon,
        title: station.name,
      })
      _marker.id = station.id
      return _marker
    })
    local.markers.push(..._markers)
    local.markerCluster.addLayers(_markers)
  }

  function updateMarkers () {
    if (!local.markers.length) return

    const deactivate = _.difference(local.selection, selection)[0]
    const activate = _.difference(selection, local.selection)[0]
    _.find(local.markers, { id: activate })?.setIcon(activeIcon)
    _.find(local.markers, { id: deactivate })?.setIcon(icon)
    // local.markerCluster.getVisibleParent(myMarker)
    local.selection = selection
  }

  function onMarkerClick (_marker) {
    const id = _marker.layer.id
    dispatch({
      type: local.selection.includes(id) ? 'station/deselect' : 'station/select',
      payload: id,
    })
  }
}