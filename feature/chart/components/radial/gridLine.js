export default function radialGridLine (config) {
  //Set defaults
  const className = 'gridLine'
    , name = config.name || ''
    , sectorSize = config.sectorSize || 0
    , domain = config.domain || [0, 0]
    , range = config.range || [0, 0]
    , center = config.center || [200, 200]
    , spacing = config.spacing
    , ticks = config.ticks || d3.range(config.domain[0], config.domain[1] + config.step, config.step)

  const pixelScale = d3.scale.linear()
    .domain(domain)
    .range(range)

  const _ticks = ticks.map(pixelScale)

  config.target.append('g')
    .classed(className + 'Group', true)
    .classed(name, true)
    .selectAll('.' + className)
    .data(_ticks)
    .enter()
    .append('circle')
    .classed(className, true)
    .attr('r', d => d)
    .attr('cx', center[0])
    .attr('cy', center[1])
    .attr('stroke-dasharray', function (d) {
      const arcLength = 2 * Math.PI * d / config.sectors
      let line, space
      if (sectorSize) {
        line = arcLength * sectorSize
        space = arcLength * (1 - sectorSize)
      } else {
        space = spacing
        line = arcLength - spacing
      }
      return [line, space].toString()
    })
}