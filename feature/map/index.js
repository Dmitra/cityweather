import Features from 'feature/registry'
import initialState, * as reducers from './state'

export const NAME = 'map'

export default Features.set({
  model: { NAME }, initialState, reducers,
})