import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { nav } from './config'
import { NavItem } from '../../interface'
import './nav.scss';



class Nav extends Component<any, any> {
  constructor (props: any) {
    super(props)
    this.state = this.inititalState()
  }
  inititalState ():Object {
    return {
      nav
    }
  }
  handleNav (e:any, item: NavItem, index:number, innerIndex: number, isChild:boolean): any {
    e.stopPropagation()
    if (item.url === window.location.pathname) {
      return
    }
    const nav:Array<any> = this.state.nav

    if (isChild) {
      nav.forEach((val: NavItem) => {
        val.slide = false
        val.select = false
        if (val.children) {
          val.children.forEach(inner => {
            inner.select = false
          })
        }
      })
      nav[index].slide = true
      nav[index].children[innerIndex].select = true
      this.setState({nav}, () => {
        this.props.history.push(item.url)
      })
    } else {
      if (!item.children) {
        nav.forEach(val => {
          val.select = false
          // val.slide = false
          if (val.children) {
            val.children.forEach((inner: any) => {
              inner.select = false
            })
          }
        })
      } else {
        nav[index].slide = !nav[index].slide
      }
      nav[index].select = true
      this.setState({nav}, () => {
        this.props.history.push(item.url)
      })
      window.$logs('button_click', {
        about: item.title,
      })
    }
    // nav.forEach(val => {
    //   val.select = false
    //   if (val.children) {
    //     val.children.forEach(inner => {
    //       inner.select = false
    //     })
    //   }
    // })
    // if (!isChild) {
    //   if (!item.children) {
    //     item.select = true
    //   }
    // } else {
    //   item.select = true
    //   nav[index].select = true
    // }
    // if (item.children && !isChild) {
    //   nav.forEach((val:NavItem) => (
    //     val.slide = false
    //   ))
    //   item.slide = !item.slide
    //   nav[index] = item
    // } else if (!isChild) {
    //   nav.forEach(val => {
    //     val.slide = false
    //     if (val.children) {
    //       val.children.forEach(inner => {
    //         inner.slide = false
    //       })
    //     }
    //   })
    //   this.props.history.push(item.url)
    // } else {
    //   this.props.history.push(item.url)
    // }
    // this.setState({
    //   nav
    // })
  }
  render ():Object {
    return (
      <ul className="nav_wrap">
        {
          this.state.nav.map((val: NavItem, index: number) => (
            <li key={index} onClick={(e) => this.handleNav(e, val, index, 0, false)} className={val.select && !val.children ? 'sel' : ''}>
              <div>
                <div className="title_info">
                  <span className="icon_wrap">
                    <i className={val.icon} />
                  </span>
                  <span>{val.title}</span>
                </div>
                {
                  val.children ? 
                  <div style={{transform: val.slide ? `rotate(90deg)` : ''}}>
                    <i className="iconfont icon-xiayiye1" ></i>
                  </div>
                  :
                  null
                }

              </div>
              {
                val.children ? 
                <div className="nav_child" key={index} style={{maxHeight:val.slide ? '500px' : '0px'}}>
                {
                  val.children.map((child:any, innerIndex:number) => {
                    return (
                      <div className={child.select ? 'inner_sel' : ''} key={innerIndex} onClick={(e) => this.handleNav(e, child, index, innerIndex, true)}>
                        <span>
                          <i className={child.icon} />
                        </span>
                        <span>{child.title}</span>
                      </div>
                    )
                  })
                }
                </div>
                :
                ''
              }
            </li>
          ))
        }
      </ul>
    )
  }
}

export default withRouter(Nav)