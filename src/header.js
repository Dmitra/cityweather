var Events = require('backbone-events-standalone')

var Self = function (p) {
  var self = this

  self.container = p
  self.heading = self.container.select('.heading')
  self.closeBtn = '<span class="remove"></span>'
  self.toggleChartBtn = self.container.select('.toggleChart')

  self.toggleChartBtn.on('click', self._onToggleChart.bind(self))
  self.container.on('click', self._onClick.bind(self))
}
/**
 * Switch comparison controls off
 */
Self.prototype.comparisonOff = function () {
  var self = this
  self.heading.html(self.heading.title)
  self.toggleChartBtn.classed('control-hidden', true)
}

Self.prototype.show = function (obj, position) {
  var self = this
  , containers = self.container.selectAll('.compared')
  , container = d3.select(containers[0][position])

  if (obj) {
    containers.classed('active', false)
    container.classed('active', true)
    container.html('<span class="name">' + obj.name + '</span>' + self.closeBtn)
    container.datum(obj.id)
    self.heading.title = self.heading.title || self.heading.html()
    self.heading.html('VS')
    self.toggleChartBtn
      .classed('show', true)
      .classed('control-hidden', false)
      .html('Show Map')
  }
}
/**
 * handle click on control
 */
Self.prototype._onClick = function () {
  var self = this
  var eventType
  var target = d3.event.target
  var element = d3.select(target.parentElement)
  var id = element.datum()

  if (d3.select(target).classed('remove')) {
    element.html('')
    self.container.selectAll('.compared').classed('active', false)
    eventType = 'remove'
  } else if (d3.select(target).classed('name')) {
    eventType = 'show'
  }

  self.trigger(eventType, id)
}

Self.prototype._onToggleChart = function () {
  var self = this
  , btn = self.toggleChartBtn
  , eventType
  
  if (btn.classed('show')) {
    eventType = 'hide'
    btn.classed('show', false)
      .html('Show Chart')
  } else {
    eventType = 'show'
    btn.classed('show', true)
      .html('Show Map')
  }

  self.trigger(eventType)
}

Events.mixin(Self.prototype)
module.exports = Self
