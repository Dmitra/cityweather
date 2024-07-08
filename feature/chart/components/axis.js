export default function axis (config) {
  const name = 'tempAxis'

  const scale = d3.scale.linear()
    .domain(config.domain)
    .range([-config.range[0], -config.range[1]])

  const ticks = config.ticks.map(scale)

  const _axis = d3.svg.axis()
    .scale(scale)
    .tickValues(config.ticks)
    .orient('right')
    .tickFormat(d => config.tempFormatter(d))

  config.target.append('g')
    .classed(name, true)
    .attr('transform', `translate(${ config.center[0] }, ${ config.center[1] })`)
    .call(_axis)
}