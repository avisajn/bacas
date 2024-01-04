var http = require("http");
var fs = require("fs");
var url = require("url");
var MT = {
    "html": "text/html",
    "css": "text/css",
    "txt": "text/plain",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "application/x-javascript",
    "json": "application/json"
}
var server = http.createServer(function(req, res) {
    var urlStr = req.url;
    var method = req.method;
    var urlObj = url.parse(urlStr, true);
    var pathname = urlObj.pathname;
    fs.readFile("static/" + pathname, function(err, data) {
        if (err) {
            res.setHeader("Content-Type", "text/plain;charset-utf-8;");
            res.end("读取的" + pathname + "文件不存在！");
            return;
        }
        var extName = pathname.split(".").pop();
        res.setHeader("Content-Type", MT[extName] + ";charset=utf-8;");
        res.end(data);
    })
})
server.listen(3000, function() {
    console.log("服务器开启成功！");
})