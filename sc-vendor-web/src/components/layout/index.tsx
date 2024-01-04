import React, {Component} from 'react'
import { withRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import 'moment/locale/id'
import id_ID from 'antd/lib/locale-provider/id_ID';

import './layout.scss'
// type LayoutProps = {
//   title?: string,
//   theme?: string
// }
// interface BacsLayOut {
//   props: LayoutProps
// }

class Layout extends Component<any, any> {
  constructor (props: any) {
    super(props)
    this.state = this.inititalState()
  }
  inititalState ():Object {
    return {
      childComponent: null,
      minHeight: document.documentElement.clientHeight + 'px'
    }
  }
  componentDidMount () {
    if (!sessionStorage.load) {
      window.$logs('web_start', {origin: window.location.href})
      sessionStorage.setItem('load', '1')
    }
    window.$utils.$firebase.auth().onAuthStateChanged(function(user:any) {
      if (!user) {
        window.$utils.$firebase.auth().signOut().then((res:any) => {
          localStorage.clear()
        }).then(() => {
          setTimeout(() => {
            window.location.href = window.location.origin + '/login'
          }, 1000)
        }).catch((err: any) => {
          localStorage.clear()
          window.location.href = window.location.origin + '/login'
        })
      }
    })
  }
  render () {
    return (
      <ConfigProvider locale={id_ID}>

        <div className="base_layout" style={{"minHeight": this.state.minHeight}}>
          <h4>{this.props.title}</h4>
          {
            this.props.children || <div/>
          }
        </div>
      </ConfigProvider>

    )
  }
}

export default withRouter(Layout)