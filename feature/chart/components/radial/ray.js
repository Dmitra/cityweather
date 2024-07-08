import Radial from './layout'
import Bar from './bar'

export default function ray (config, data) {
  //Set defaults
  let domain = config.domain || [0, 0]
    , range = config.range || [0, 0] //pixels from center
    , dashed = config.dashed || 1 //unbroken line
    , startValuer
    , endValuer

  const pixelScaler = d3.scale.linear()
    .domain(domain)
    .range(range)

  if (_.isFunction(config.value)) {
    startValuer = d3.functor(domain[0] || 0)
    endValuer = d3.functor(config.value || 0)
  } else {
    startValuer = d3.functor(config.value.start || 0)
    endValuer = d3.functor(config.value.end || 0)
  }

  const radiuser1 = function (d) {
    return pixelScaler(startValuer(d))
  }
  const radiuser2 = function (d) {
    return pixelScaler(endValuer(d))
  }

  const layoutConfig = _.extend({}, config, {
    range: config.positionRange,
    radius: radiuser1,
  })

  const pixelPerDomainUnit = (range[1] - range[0]) / (domain[1] - domain[0])
  config.dashed = [pixelPerDomainUnit * dashed, pixelPerDomainUnit * (1 - dashed)]

  const radialLayout = Radial(layoutConfig)
  radialLayout(data)
  _.each(data, function (d) {
    d.x0 = d.x
    d.y0 = d.y
  })

  radialLayout.radius(radiuser2)
  radialLayout(data)

  Bar(config, data)
}