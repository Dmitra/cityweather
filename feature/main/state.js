export default {
  ready: false,
  year: 2023,
  // TODO derive from deployment target
  // baseUrl: '',
  baseUrl: '/demo/cityweather',
}

export function ready (state, action) {
  state.ready = true
}