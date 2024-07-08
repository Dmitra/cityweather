import Radial from './layout'

export default function dot (config, data) {
  //Set defaults
  const className = 'dot'
    , id = config.id
    , name = config.name || ''
    , color = config.color || ''
    , key = config.key || undefined
    , domain = config.domain || [0, 0]
    , range = config.range || [0, 0] //pixels from center
    , stroke = config.stroke || config.color
    , fill = config.fill || config.color
    , cr = config.cr || 1

  const pixelScaler = d3.scale.linear()
    .domain(domain)
    .range(range)

  const valuer = d3.functor(config.value || 0)

  const radiuser = function (d) {
    return pixelScaler(valuer(d))
  }

  const layoutConfig = _.extend({}, config, {
    range: config.positionRange,
    radius: radiuser,
  })

  const radialLayout = Radial(layoutConfig)
  radialLayout(data)

  const self = config.target.append('g')
    .classed(className + 'Group', true)
    .classed(id, !!id)
    .classed(name, true)
    .selectAll('.' + className)
    .data(data, key)

  const enter = self.enter()
  enter.append('circle')
    .attr('class', className)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', cr)
    .transition()
    .ease('cubic-out')
    .duration(750)
    .style('stroke', stroke)
    .style('fill', fill)

  if (key) enter.attr(id, function (d) {
    return d.id
  })
}