import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import '@fontsource/quicksand'
import '@fontsource/jura'
import '@fontsource/enriqueta'

import Header from './header/header'
import Map from '../map/map'
import Chart from './../chart/chart'
import './main.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#7cc9d3',
    },
    secondary: {
      main: '#C0C0C0',
    },
  },
})

export default function Main () {
  const dispatch = useDispatch()
  const state = useSelector(state => state.main)
  // TODO
  // const currentPosition = navigator.geolocation.getCurrentPosition(() => {
  // })

  useEffect(() => {
    onBoot()
  }, [])

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={ theme }>
        <Header></Header>
        <main>
          <Map></Map>
          <Chart></Chart>
        </main>
        <footer>
          Design & visualization by <a href="/">DaVisTe.com</a>
        </footer>
      </ThemeProvider>
    </StyledEngineProvider>
  )

  async function onBoot () {
    window.onpopstate = e => {
      location.reload()
    }
  }
}