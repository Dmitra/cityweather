import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

import { useGetStationsQuery } from '../../../service/dataman'
import './header.css'

export default function Header () {
  const dispatch = useDispatch()
  const { data: list } = useGetStationsQuery()
  const active = useSelector(state => state.station.active)
  const selection = useSelector(state => state.station.selection)

  if (!list) return null

  const heading = 'City weather comparison 2023'
  const stations = _.map(selection, (id, i) => {
    const station = list[id]

    return (
      <City key={ station.id }
        dispatch={ dispatch }
        station={ station }
        active={ active }></City>
    )
  })

  return (
    <Paper className="header" elevation={ 3 } color="primary">
      { !selection.length && <h1>{ heading }</h1> }
      { !!selection.length && <div className="toggle-group"> { stations } </div> }
    </Paper>
  )
}

function City (p) {
  return (
    <div className={ `compared ${ p.station.id === p.active ? 'active' : '' }` } onClick={ () => {
      p.dispatch({ type: 'station/activate', payload: p.station.id })
    } }>
      { p.station.name }
      <IconButton size="small" onClick={ e => {
        p.dispatch({ type: 'station/deselect', payload: p.station.id })
        e.stopPropagation()
      } }><CloseIcon/></IconButton>
    </div>
  )
}