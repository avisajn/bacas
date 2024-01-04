import React, { Component } from 'react'

import { ApiOutlined } from '@ant-design/icons'
import './index.scss'

class NotFound extends Component {
  render () {
    return (
      <div className="not_fount">
        <ApiOutlined />
        <h3>404</h3>
      </div>
    )
  }
}

export default NotFound