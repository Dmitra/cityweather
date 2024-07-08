import { createListenerMiddleware } from '@reduxjs/toolkit'

export const listenerMiddleware = createListenerMiddleware()

class Effects {
  constructor () {
    this.index = []
  }

  set (type, effect) {
    listenerMiddleware.startListening({ type, effect})
  }
}

export default new Effects()