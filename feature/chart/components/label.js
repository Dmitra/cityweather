import Util from './Util'

export default function label (config, data) {
  //Set defaults
  var className = 'label'
    , name = config.name || ''
    , textPather = config.textPath || ''
    , color = config.color || ''
    , center = config.center || [100, 100]

  if (textPather) {
    config.target.append('g')
      .classed(name, true)
      .selectAll('.labelTextPath')
      .data(data)
      .enter()
      .append('defs')
      .append('path')
      .attr('id', function (d) {
        d.id = Util.GUID()
        return d.id
      })
      .attr('class', 'labelTextPath')
      .attr('d', textPather)
  }

  var self = config.target.append('g')
    .attr('transform', 'translate(' + center[0] + ',' + (center[1]) + ')')
    .selectAll('.' + className)
    .data(data)

  self
    .enter()
    .append('text')
    .attr('class', className)
    .append('textPath')
    .attr('xlink:href', function (d) {
      return '#' + d.id
    })
    //render multiline labels
    .each(function (d) {
      var arr = d.label.split('\n')
      if (arr != undefined) {
        for (let i = 0; i < arr.length; i++) {
          d3.select(this)
            .append('tspan')
            .text(arr[i])
            .attr('dy', i ? '1.2em' : 0)
            .attr('x', 0)
            .attr('class', 'tspan' + i)
        }
      }
    })
}