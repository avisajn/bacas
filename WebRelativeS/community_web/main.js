var express = require('express');
var app = express();
import { render } from "preact-render-to-string";
import { renderStylesToString } from "emotion-server";
import { IndexPage, AboutPage } from "./pages";
import { HtmlPage } from "./pages/document";
const bodyParser = require("body-parser");
// const https = require('https');
const superagent = require('superagent')
var path = require('path');
app.use(bodyParser.urlencoded({ extended: true }));
const logger = require('morgan');
const fs = require('fs')
app.use(express.static(path.join(__dirname, "public")));

const renderPage = (title, data, shareUrl, id, source, status, view, img, page) => {
    return HtmlPage({ title, data, shareUrl, id, source, status, view, img, content: renderStylesToString(render(page)) });
};

// app.get('/:id', function(req, res) {
//     const options = {
//         hostname: 'api.community.baca.co.id',
//         path: '/v1/articles/' + req.params.id,
//         method: 'GET',
//         timeout: 10000,
//         pool: false,
//         strictSSL: false,
//         rejectUnauthorized: false,
//         headers: {
//             XUserId: 'Facebook_187469825616134'
//         }
//     }
//     var shareUrl = ''
//     var shareimage = ''
//     https.get(options, (resp) => {
//         let data = '';
//         resp.on('data', (chunk) => {
//             data += chunk;
//         })
//
//         var deviceAgent = req.headers["user-agent"].toLowerCase();
//         var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
//
//         if (agentID) {
//             resp.on('end', () => {
//
//                 if (req.query.utm_source == 'skuy') {
//                     shareUrl = 'https://berita.skuy.games/'
//                 } else {
//                     shareUrl = 'https://berita.community.baca.co.id/'
//                 }
//
//                 if (typeof(JSON.parse(data).data.Images)[0] == 'undefined') {
//                     shareimage = 'bb367e3e-04ff-4493-9bf3-b131ee5c3b2f'
//                 } else {
//                     shareimage = JSON.parse(data).data.Images[0].ImageGuid
//                 }
//
//                 res.send(renderPage(JSON.parse(data).data.Abstraction, JSON.parse(data), shareUrl, req.params.id, req.query.utm_source, JSON.parse(data).data.Status, "mobile", shareimage, IndexPage()));
//                 return
//
//             });
//         } else {
//             resp.on('end', () => {
//                 if (req.query.utm_source == 'skuy') {
//                     shareUrl = 'https://berita.skuy.games/'
//                 } else {
//                     shareUrl = 'https://berita.community.baca.co.id/'
//                 }
//
//                 if (typeof(JSON.parse(data).data.Images)[0] == 'undefined') {
//                     shareimage = 'bb367e3e-04ff-4493-9bf3-b131ee5c3b2f'
//                 } else {
//                     shareimage = JSON.parse(data).data.Images[0].ImageGuid
//                 }
//                 res.send(renderPage(JSON.parse(data).data.Abstraction, JSON.parse(data), shareUrl, req.params.id, req.query.utm_source, JSON.parse(data).data.Status, "pc", shareimage, IndexPage()));
//                 return
//             });
//         }
//
//     }).on("error", (err) => {
//
//         console.log("Error: " + err.message);
//     });
// })
const stream = fs.createWriteStream(__dirname + '/access.log', {flags:'a'})
app.use(logger('combined',{stream}))
app.get('/favicon.ico', (req, res) => {
  // console.log('favicon')
  res.status(200).send('ok')
})
app.get('/:id', function (req, res) {
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
})

const port = process.env.PORT || 8084;

var server = app.listen(port, function() {
    console.log("Server running at http://localhost:%d", port);
})
