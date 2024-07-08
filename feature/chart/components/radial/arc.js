import Radial from './layout'

export default function arc (config, data) {
  //Set defaults
  let className = 'arc'
    , name = config.name || ''
    , innerRadius = config.innerRadius || 100
    , radius = config.radius || 110
    , color = config.color || ''

  const layout = Radial(config)
  layout(data)

  var arc = d3.svg.arc()
    .startAngle(function (d) {
      return d.rad
    })
    .endAngle(function (d) {
      return d !== _.last(data) ? data[data.indexOf(d) + 1].rad : 2 * Math.PI
    })
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + radius)

  var self = config.target.append('g')
    .classed(className + 'Group', true)
    .classed(name, true)
    //Move to center
    .attr('transform', 'translate(' + layout.center()[0] + ',' + layout.center()[1] + ')')
    .selectAll('.' + className)
    .data(data)

  self
    .enter()
    .append('path')
    .attr('class', className)
    .attr('d', arc)
    .style('fill', color)
}