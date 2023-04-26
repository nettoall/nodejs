var http = require('http');
var url = require('url');
// http://localhost:3000/?year=2022&month=November
http.createServer(function (req, res) {

    var _url = req.url;
    var queryData = new URL('http://localhost:3000' + _url).searchParams;
    var txt = queryData.get('year') + " " + queryData.get('month');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(txt);
}).listen(3000);