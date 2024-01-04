import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom';
import {routes} from './router'
import Nav from './components/nav'
import Header from './components/header'
import Layout from './components/layout'
import NotFound from './components/notFound';
import Login from './pages/login'
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import './assets/css/normalize.css'
import './assets/icon/iconfont.css'
import register from './register'

register()

const __init__  = ():ReactElement =>  {
  if (window.location.href.includes('/login')) {
    return (
      <Router>
        <Route>
          <Login />
        </Route>
      </Router>
    )
  } else {
    return (
      <Router>
        <Nav />
        <Header />
        <Switch>
          {
            routes.map((val: any, index:number) => {
              return (
                <Route path={val.url} key={index} exact strict>
                  <Layout {...val.props}>
                    <val.component {...val.props}/>
                  </Layout>
                </Route>
              )
            })
          }
          <Route path={'*'}>
            <Layout>
              <NotFound />
            </Layout>
          </Route>
        </Switch>
      </Router>
    )
  }

}  


ReactDOM.render(__init__(), document.getElementById('root'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
