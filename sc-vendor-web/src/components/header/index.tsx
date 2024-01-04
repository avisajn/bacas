import React, {Component} from 'react'
import './header.scss'
import logo from '../../assets/img/logo/logo.png'
import { word } from './config'
import { Modal, Popover } from 'antd'
import userModel from '../../model/user.model'
import { LogoutOutlined, QuestionCircleOutlined, RedoOutlined, FrownOutlined } from '@ant-design/icons'

const contentInfo = {
  cancel_rate: word.cancelRateNote,
  complaint_rate: word.complaintRateNote,
  delivery_speed: word.deliverySpeedNote
}

class Header extends Component<any, any> {
  constructor (props: unknown) {
    super(props)
    this.state = this.initialState()
  }
  initialState () :any  {
    return {
      showRate: false,
      falidRate: false,
      word,
      rates: {},
      contentInfo,
      userEmail: localStorage.getItem('user_email'),
      shopName: localStorage.getItem('user_name'),
      user_id: localStorage.getItem('user_id')
    }
  }
  componentDidMount () {
    this.handleGetRate()
    if (localStorage.getItem('login_event')) {
      window.$logs('login_success', {time: new Date().getTime()})
      localStorage.removeItem('login_event')
    }
  }
  handleGetRate () {
    this.setState({showRate: false, falidRate: false})
    userModel.getVendorRates(this.state.user_id).then(res => {
      if (res && !res.data.code) {
        this.setState({rates: {
          cancel_rate: res.data.data.real_cancel_rate,
          complaint_rate: res.data.data.real_complaint_rate,
          delivery_speed: res.data.data.real_delivery_speed
        }}, () => { 
          window.$logs('module_show', {
            type: 'shop_ratings',
            about: 'shop_ratings_ratings_module_show',
            from: window.location.href,
            source: 'vendor_pc',
            result: 'success'
          })
          window.$logs('module_show', {
            type: 'shop_ratings',
            about: 'shop_ratings_cancel_rate_show',
            from: window.location.href,
            source: 'vendor_pc'
          })
          window.$logs('module_show', {
            type: 'shop_ratings',
            about: 'shop_ratings_after_seal_rate_show',
            from: window.location.href,
            source: 'vendor_pc'
          })
          window.$logs('module_show', {
            type: 'shop_ratings',
            about: 'shop_ratings_send_goods_time_show',
            from: window.location.href,
            source: 'vendor_pc',
            result: 'fail'
          })
          this.setState({showRate: true})
        })
      }
    }).catch(err => {
      console.log(err)
      window.$logs('module_show', {
        type: 'shop_ratings',
        about: 'shop_ratings_ratings_module_show',
        from: window.location.href,
        source: 'vendor_pc'
      })
      this.setState({showRate: false, falidRate: true})
    })
  }
  handleLogout () {
    Modal.info({
      centered: true,
      keyboard: true,
      okText: 'ya',
      title: this.state.word.logout,
      cancelText: 'no',
      icon: <LogoutOutlined className="theme-color" />,
      closable: true,
      onOk: (e) => {
        return new Promise((resolve:any, reject:any) => {
          window.$utils.$firebase.auth().signOut().then((res:any) => {
            localStorage.clear()
          }).then(() => {
            setTimeout(() => {
              window.location.href = window.location.origin + '/login'
              resolve(true)
            }, 1000)
          }).catch((err: any) => {
            localStorage.clear()
            window.location.href = window.location.origin + '/login'
          })
        })
      },
    })
  }
  handleLog (e:boolean, from:string) {
    // console.log(e)
    if (e) {
      window.$logs('button_click', {
        type: 'shop_ratings',
        about: 'shop_ratings_question_nark_article_show',
        page: window.location.href,
        source: 'vendor_pc',
        from_module: from,
      })
    }
  }
  render () {
    return (
      <div className="base_header">
        <div className="top_info">
          <div className='name_card'>
            <img src={logo} alt="" />
            <span>{this.state.shopName}</span>
          </div>
          {
            this.state.showRate ? 
            <ul className="slide_rate">
              <li>
                <span>*</span>
                <Popover onVisibleChange={(e:boolean) => this.handleLog(e, 'canel')} placement="bottom" content={this.state.contentInfo.cancel_rate} trigger="click" overlayClassName="pop_content">
                  <span>{ this.state.word.cancelRate }:</span>
                  <span>{ this.state.rates.cancel_rate }%</span>
                  <QuestionCircleOutlined className='rate_pop_up' />
                </Popover>
              </li>
              <li>
                <span>*</span>
                <Popover onVisibleChange={(e:boolean) => this.handleLog(e, 'after_seal')} placement="bottom" content={this.state.contentInfo.complaint_rate} trigger="click" overlayClassName="pop_content">
                  <span>{ this.state.word.complaintRate }:</span>
                  <span>{ this.state.rates.complaint_rate }%</span>
                  <QuestionCircleOutlined className='rate_pop_up' />
                </Popover>
              </li>
              <li>
                <span>*</span>
                <Popover onVisibleChange={(e:boolean) => this.handleLog(e, 'send_time')} placement="bottom" content={this.state.contentInfo.delivery_speed} trigger="click" overlayClassName="pop_content">
                  <span>{ this.state.word.deliverySpeed }:</span>
                  <span>{ this.state.rates.delivery_speed } h</span>
                  <QuestionCircleOutlined className='rate_pop_up' />
                </Popover>
              </li>
            </ul>
            :
            null
          }
          {
            this.state.falidRate && !this.state.showRate ?
            <div className="faild_line">
              <div>
                <FrownOutlined />
                <span>{ this.state.word.shopRatingFaild }</span>
              </div>
              <div>
                <RedoOutlined onClick={() => this.handleGetRate()} />
              </div>
            </div>
            :
            null
          }
        </div>
        <ul className="slide_tools">
          <li>
            <i className="iconfont icon-icon-user"></i>
            <span>hi, {this.state.userEmail}</span>
            </li>
          <li className="logout" onClick={() => this.handleLogout()}>
            <LogoutOutlined />
            <span>{this.state.word.logout}</span>
          </li>
        </ul>
      </div>
    )
  }
}

export default Header