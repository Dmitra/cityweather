import _ from 'lodash'
import { createSlice } from '@reduxjs/toolkit'

class Registry {
  constructor () {
    this.index = {}
    this.reducers = {}
  }

  get (name) {
    return this.index[name.toLowerCase()]
  }

  set (...args) {
    const name = _.isString(args[0]) ? args[0] : args[0].model.NAME
    const p = _.isString(args[0]) ? args[1] : args[0]
    const lName = name.toLowerCase()
    const feature = {}

    if (p.initialState && p.reducers) {
      let _reducers = p.reducers
      const slice = createSlice({
        name: lName,
        initialState: p.initialState,
        reducers: _reducers,
      })
      _.assign(feature, slice)
      _.each(feature.actions, (actionCreator, key) => {
        feature.actions[key] = (payload, meta) => {
          const action = actionCreator(payload)
          if (!_.isUndefined(meta)) action.meta = meta
          return action
        }
      })
      this.reducers[lName] = feature.reducer
    }
    this.index[lName] = feature

    feature.name = name
    feature.model = p.model
    feature.select = p.selectors
    feature.utils = p.utils

    return feature
  }
}

const registry = new Registry()
export default registry
window.Feature = registry