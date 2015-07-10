var Events = require('backbone-events-standalone')

var Self = function (p) {
  var self = this

  self.container = p
  self.closeBtn = '<span class="remove"></span>'

  self.container.on('click', self._onClick.bind(self))
}

Self.prototype.render = function (first, second) {
  var self = this

  self._show(first, 0)
  self._show(second, 1)
}

Self.prototype._show = function (obj, position) {
  var self = this
  , containers = self.container.selectAll('.compared')
  , container = d3.select(containers[0][position])

  if (obj) {
    container.html('<span class="name">' + obj.name + '</span>' + self.closeBtn)
    container.datum(obj.id)
    self.container.select('.heading').html('VS</br><span class="hide">Hide</span>')
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
    eventType = 'remove'
  } else if (d3.select(target).classed('hide')) {
    eventType = 'hide'
  } else if (d3.select(target).classed('name')) {
    eventType = 'show'
  }

  self.trigger(eventType, id)
}

Events.mixin(Self.prototype)
module.exports = Self
