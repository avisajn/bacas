const superagent = require('superagent')
const renderPage = require('../utils/renderPage')
import { IndexPage, AboutPage } from "../views";
// import { renderStylesToString } from "emotion-server";
// import { render } from "preact-render-to-string";

module.exports = {
  sharePage: function (req, res) {
    let shareUrl = ''
    let shareimage = ''
    const url =  `https://api.community.baca.co.id/v1/articles/${req.params.id}`

    superagent.get(url).set("Context-Type", "application/json").set("XUserId", "Facebook_187469825616134").then(body => {
      const response = JSON.parse(body.text)
      if (!response.code) {
        // 判断UA
        const deviceAgent = req.headers["user-agent"].toLowerCase()
        const agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/)
        if (agentID) {
          if (req.query.utm_source == 'skuy') {
              shareUrl = 'https://berita.skuy.games/'
          } else {
              shareUrl = 'https://berita.community.baca.co.id/'
          }

          if (typeof(response.data.Images)[0] == 'undefined') {
              shareimage = 'bb367e3e-04ff-4493-9bf3-b131ee5c3b2f'
          } else {
              shareimage = response.data.Images[0].ImageGuid
          }

          res.send(renderPage(response.data.Abstraction, response, shareUrl, req.params.id, req.query.utm_source, response.data.Status, "mobile", shareimage, IndexPage()));
        } else {
          if (req.query.utm_source == 'skuy') {
              shareUrl = 'https://berita.skuy.games/'
          } else {
              shareUrl = 'https://berita.community.baca.co.id/'
          }

          if (typeof(response.data.Images)[0] == 'undefined') {
              shareimage = 'bb367e3e-04ff-4493-9bf3-b131ee5c3b2f'
          } else {
              shareimage = response.data.Images[0].ImageGuid
          }
          res.send(renderPage(response.data.Abstraction, response, shareUrl, req.params.id, req.query.utm_source, response.data.Status, "pc", shareimage, IndexPage()));
        }
      } else {
        res.status(500).send('Internal server error')
      }
    }).catch(err => {
      // console.log(err)
      res.status(500).send('Internal server error')
    })
  }
}
