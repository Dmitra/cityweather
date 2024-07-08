import React from 'react'

import './legend.css'

export default function Legend (p) {

  return (
    <div id="legend">
      <div id="date">{ p.date }</div>
      <div id="tmax">{ p.tmax }</div>
      <div id="tave">{ p.tave }</div>
      <div id="tmin">{ p.tmin }</div>
    </div>
  )
}