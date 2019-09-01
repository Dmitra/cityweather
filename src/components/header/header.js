import EventEmitter from 'eventemitter3'
import './header.scss'

export default class Header extends EventEmitter {

  constructor (p) {
    super()
    this.container = p
    this.heading = this.container.select('.heading')
    this.closeBtn = '<span class="remove"></span>'
    this.toggleChartBtn = this.container.select('.toggleChart')

    this.toggleChartBtn.on('click', this._onToggleChart.bind(this))
    this.container.on('click', this._onClick.bind(this))
  }
  /**
   * Switch comparison controls off
   */
  comparisonOff () {
    this.heading.html(this.heading.title)
    this.toggleChartBtn.classed('control-hidden', true)
  }

  show (obj, position) {
    var containers = this.container.selectAll('.compared')
    , container = d3.select(containers[0][position])

    if (obj) {
      containers.classed('active', false)
      container.classed('active', true)
      container.html('<span class="name">' + obj.name + '</span>' + this.closeBtn)
      container.datum(obj.id)
      this.heading.title = this.heading.title || this.heading.html()
      this.heading.html('VS')
      this.toggleChartBtn
        .classed('show', true)
        .classed('control-hidden', false)
        .html('Show Map')
    }
  }
  /**
   * handle click on control
   */
  _onClick () {
    var eventType
    var target = d3.event.target
    var element = d3.select(target.parentElement)
    var id = element.datum()

    if (d3.select(target).classed('remove')) {
      element.html('')
      this.container.selectAll('.compared').classed('active', false)
      eventType = 'remove'
    } else if (d3.select(target).classed('name')) {
      eventType = 'show'
    }

    this.emit(eventType, id)
  }

  _onToggleChart () {
    var btn = this.toggleChartBtn
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

    this.emit(eventType)
  }
}
