export function tempFormatter (d) {
  return d3.format('0,000')(parseFloat(d.toFixed(2))) + ' °C'
}