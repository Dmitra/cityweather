import React from 'react'
import { createHashRouter } from 'react-router-dom'

import Main from '../feature/main/main'

export default createHashRouter([
  {
    path: '/',
    element: <Main />,
    // loader: rootLoader,
    children: [
      {
        path: '/:station1',
        element: <Main />,
        children: [
          {
            path: '/:station1/:station2',
            element: <Main/>,
          },
        ],
      }
    ],
  },
])