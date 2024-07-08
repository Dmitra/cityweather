import _ from 'lodash'
import Effects from '../../boot/effects'
import main from '../main/state.js'
const selection = _.compact(window.location.hash.replace('#/', '').split('/'))

export default {
  active: selection[selection.length - 1], // id or undefined
  selection, // ids
}

export function select (state, { payload: id }) {
  if (state.selection.includes(id)) return state

  const selection = [...state.selection]
  if (selection[1]) selection[1] = id
  else selection.push(id)

  state.selection = selection
}

export function deselect (state, { payload: id }) {
  const selection = _.without(state.selection, id)
  if (!_.difference(state.selection, selection).length) return state

  state.selection = selection
}

export function activate (state, { payload: id }) {
  if (id === state.active) return

  state.active = id
}

Effects.set('station/select', (action, api) => {
  const selection = api.getState().station.selection
  window.history.pushState(null, '', main.baseUrl + '/#/' + selection.join('/'))
  api.dispatch({ type: 'station/activate', payload: action.payload })
  api.dispatch({ type: 'chart/toggle', payload: !!selection.length })
})

Effects.set('station/deselect', (action, api) => {
  const state = api.getState().station
  window.history.pushState(null, '', main.baseUrl + '/#/' + state.selection.join('/'))
  if (action.payload === state.active) {
    api.dispatch({ type: 'station/activate', payload: state.selection[0] })
  }
  api.dispatch({ type: 'chart/toggle', payload: !!state.selection.length })
})