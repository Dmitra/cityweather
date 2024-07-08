import Features from 'feature/registry'
import initialState, * as reducers from './state'

export const NAME = 'chart'

export default Features.set({
  model: { NAME }, initialState, reducers,
})