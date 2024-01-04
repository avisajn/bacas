var express = require('express');
var app = express();
import { render } from "preact-render-to-string";
import { renderStylesToString } from "emotion-server";
import { IndexPage, AboutPage } from "./pages";
import { HtmlPage } from "./pages/document";
const https = require('https');
var path = require('path');

const renderPage = (title, data, id, source, status, view, page) => {
    return HtmlPage({ title, data, id, source, status, view, content: renderStylesToString(render(page)) });
};

app.get('/:id', function(req, res) {
    const options = {
        hostname: 'api.community.baca.co.id',
        path: '/v1/articles/' + req.params.id,
        method: 'GET',
        timeout: 10000,
        pool: false,
        strictSSL: false,
        rejectUnauthorized: false,
        headers: {
            XUserId: 'Facebook_187469825616134'
        }
    }
    https.get(options, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        var deviceAgent = req.headers["user-agent"].toLowerCase();
        var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
        if (agentID) {
            resp.on('end', () => {
                res.send(renderPage(JSON.parse(data).data.Abstraction, JSON.parse(data), req.params.id, req.query.utm_source, JSON.parse(data).data.Status, "mobile", IndexPage()));
            });
        } else {
            resp.on('end', () => {
                res.send(renderPage(JSON.parse(data).data.Abstraction, JSON.parse(data), req.params.id, req.query.utm_source, JSON.parse(data).data.Status, "pc", IndexPage()));
            });
        }
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
})

const port = process.env.PORT || 8084;
app.use(express.static(path.join(__dirname, "public")));

var server = app.listen(port, function() {
    console.log("Server running at http://localhost:%d", port);
})