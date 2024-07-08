export default function bar (config, data) {
  //Set defaults
  const className = 'bar'
    , name = config.name || ''
    , dashed = config.dashed || ''
    , color = config.color || ''
    , key = config.key || undefined

  const self = config.target.append('g')
    .classed(className + 'Group', true)
    .classed(name, true)
    .selectAll('.' + className)
    .data(data, key)

  const enter = self.enter()
  enter.append('path')
    .attr('class', className)
    //.attr('stroke', 'url(#grad1)')
    .attr('stroke-dasharray', dashed)
    .attr('d', bar)
    .transition()
    .ease('cubic-out')
    .duration(750)
    .style('stroke', color)

  if (key) enter.attr(id, function (d) {
    return d.id
  })

  function bar (d) {
    return 'M' + d.x0 + ' ' + d.y0 + 'L' + d.x + ' ' + d.y
  }
}