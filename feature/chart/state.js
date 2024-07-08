import _ from 'lodash'
const selection = _.compact(window.location.hash.replace('#/', '').split('/'))

export default {
  show: !!selection.length,
  size: 0,
  selectedDate: undefined,
}

export function toggle (state, { payload }) {
  state.show = _.isNil(payload) ? !state.show : payload
}

export function resize (state, action) {
  state.size = action.payload
}

export function selectDate (state, action) {
  state.selectedDate = action.payload
}