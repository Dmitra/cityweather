import React from 'react'
import * as ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import _ from 'lodash'

import router from 'boot/router'
import { listenerMiddleware } from 'boot/effects'
import { api } from 'service/dataman'
import Main from 'feature/main'
import Map from 'feature/map'
import Station from 'feature/station'
import Chart from 'feature/chart'

window._ = _
const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [Main.name]: Main.reducer,
    [Station.name]: Station.reducer,
    [Map.name]: Map.reducer,
    [Chart.name]: Chart.reducer,
  },
  middleware: getDefaultMiddleware => (
    getDefaultMiddleware().concat(listenerMiddleware.middleware, api.middleware)
  ),
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={ store }>
    <RouterProvider router={ router }/>
  </Provider>,
)