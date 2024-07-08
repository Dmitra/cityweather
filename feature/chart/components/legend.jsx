import React from 'react'

import { tempFormatter } from '../../../util.js'
import { useSelector } from 'react-redux'

export default function Legend () {
  const selected = useSelector(state => state.chart.selectedDate)
  if (!selected) return

  return (
    <div>
      <div>{ d3.time.format('%d %b')(new Date(selected.date)) }</div>
      <div>{ tempFormatter(selected.tmin) }</div>
      <div>{ tempFormatter(selected.tavg) }</div>
      <div>{ tempFormatter(selected.tmax) }></div>
    </div>
  )
}