import Radial from './layout'
import Label from '../label'

export default function radialLabel (config, data) {
  //Set defaults
  var radius = config.radius || 100

  var layout = Radial(config)
  layout(data)

  //svg path calculation to draw labels upon
  config.textPath = d3.svg.arc()
    .startAngle(d => d.rad)
    //length of arc is half of a circle
    .endAngle(d => d.rad + Math.PI)
    .outerRadius(radius)
  config.center = layout.center()

  Label(config, data)
}