import React, { Component } from 'react'
import { withRouter } from 'react-router'
import bg from '../../assets/img/login/bg.png'
import iconPic from '../../assets/img/logo/logo.png'
import wordPic from '../../assets/img/logo/word.png'
import { message } from 'antd'
import $header from '../../libs/headers'
import { serviceItem } from '../../interface/pages/login'
import { LoadingOutlined } from '@ant-design/icons'
import { words, serviceWhatsapp, terms, waBase } from './config'
import './index.scss'

type firebaseError = {
  a: null | any,
  code: string,
  message: string
}



class Login extends Component<any, any> {
  constructor (props: unknown) {
    super(props)
    this.state = this.initialState()
  }
  initialState ():object {
    return {
      email: '',
      loading: false,
      password: '',
      words,
      terms: Object.values(terms),
      waUrl: waBase + serviceWhatsapp
    }
  }
  // 获取输入值
  handleInput (e: React.ChangeEvent<HTMLInputElement>, key: string): void {
    if (key === 'email') {
      this.setState({
        email: e.target?.value
      })
    } else {
      this.setState({
        password: e.target?.value
      }) 
    }
  }
  // 登录
  handleSubmit () :void {
    if (!this.state.loading) {
      if (!this.state.email) {
        message.error(this.state.words.errorEmail)
      } else if (!this.state.password) {
        message.error(this.state.words.errorPassword)
      } else {
        this.setState({loading: true})
        window.$utils.$firebase.auth().setPersistence(window.$utils.$firebase.auth.Auth.Persistence.LOCAL).then((result:any) => {
          window.$utils.$firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(async (res:any) => {
            const token:string = await window.$utils.$firebase.auth().currentUser.getIdToken()
            localStorage.setItem('access_token', token)
            if (res.user) {
              localStorage.setItem('user_email', this.state.email)
              localStorage.setItem('valid_time', res.user.h.c)
              localStorage.setItem('rtf', res.user.refreshToken)
              // localStorage.setItem('access_token', res.user.Aa)
              localStorage.setItem('user_name', res.user.displayName)
              localStorage.setItem('user_id', res.user.uid)
              localStorage.setItem('login_event', '1')
              window.open(window.location.origin, '_self')
            } else {
              setTimeout(() => {
                this.setState({
                  loading: false
                })
              }, 200)
              window.$logs('login_fail', {reason: 'net error'})
            }
          }).catch((err:firebaseError) => {
              window.$logs('login_fail', {reason: err.code, email: this.state.user_email})
              if (err.code === 'auth/invalid-email') {
              message.error(this.state.words.firebaseErrorEmail)
            } else if (err.code === 'auth/user-not-found') {
              message.error(this.state.words.firebaseErrorUesr)
            } else if (err.code === 'auth/wrong-password') {
              message.error(this.state.words.firebaseErrorPassword)
            }
            setTimeout(() => {
              this.setState({
                loading: false
              })
            }, 2000)
          })
        })

      }
    }

    // console.log(asr)
  }
  // 绑定键盘事件
  handleKeyboard (e: any) {
    if (e.keyCode === 13) {
      const inputs:any = document.getElementsByTagName('input')
      for (let i = 0; i <= inputs.length - 1; i++) {
        inputs[i].blur()
      }
      this.handleSubmit()
    }
  }
  // 焦点获取
  handleFocus (e:any) {
    e.target.parentElement.className += ' active_border'
  }
  // 失焦获取
  handleBlur(e:any) {
    const classList:string = e.target?.parentElement.className
    e.target.parentElement.className = classList.replace('active_border', '')
  }
  // 组件加载
  componentDidMount () {
    $header({title: this.state.words.pageTitle})
    window.$logs('web_start', {origin: window.location.href})
    sessionStorage.setItem('load', '1')
    window.addEventListener('keydown', this.handleKeyboard.bind(this), true)
  }
  // 组件注销
  componentWillUnmount () {
    window.removeEventListener('keydown', this.handleKeyboard.bind(this), true)
  }
  render () {
    return (
      <div className="login">
        <div className="window_wrap" >
          <div className="login_window">
            <div className="window_left" style={{backgroundImage: `url(${bg})`}}>
              <div className="branch">
                <img src={wordPic} alt="" />
              </div>
              <div className="logo">
                <img src={iconPic} alt="" />
              </div>
            </div>
            <div className="window_right">
              <div className="login_line">
                <p>{this.state.words.emailTitle}</p>
                <div className="input_line">
                  <div className="icon_wrap">
                    <i className="iconfont icon-email"></i>
                  </div>
                  <input type="text" onChange={(e) => this.handleInput(e, 'email')} onFocus={(e) => this.handleFocus(e)} onBlur={(e) => this.handleBlur(e)} />
                </div>
              </div>
              <div className="login_line">
                <p>{this.state.words.passwordTitle}</p>
                <div className="input_line">
                  <div className="icon_wrap">
                    <i className="iconfont icon-password"></i>
                  </div>
                  <input type="password" onChange={(e) => this.handleInput(e, 'password') }onFocus={(e) => this.handleFocus(e)} onBlur={(e) => this.handleBlur(e)} />
                </div>
              </div>
              <div className="button_line">
                <button onClick={() => this.handleSubmit()}>
                  <div className={this.state.loading ? 'loading' : ''}>
                  {
                    this.state.loading ?
                    <LoadingOutlined />
                    :
                    <span className="button_word">{this.state.words.submitButon}</span>
                  }
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="service">
            <p>
              {this.state.words.serviceTipTop}
              {
                this.state.terms.map((val:serviceItem, index: number) => {
                  return (
                    <span key={index}>
                      <a target="black" href={val.url}>{val.title}</a>
                      {
                        index !== this.state.terms.length - 1 ? this.state.words.serviceTipMiddle : ''
                      }
                    </span>
                  )
                })
              }
              {this.state.words.serviceTipBottom}
            </p>
            <div className="line" />
            <div className="contact_btn">
              <a href={this.state.waUrl} target="blank">
                <i className="iconfont icon-whatsapp" />
                <span>{this.state.words.serviceButotn}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Login)