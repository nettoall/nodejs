var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var url = new URL('http://localhost:3000' + _url);
    console.log(url);
    var queryData = url.searchParams;
    var pathname = url.pathname;
    var title = queryData.get('id');

    if (pathname == '/') {
        // title을 queryData.get 으로 하다보니 없을 경우 null 이 출력됨 
        if (title == null) {
            fs.readFile(`data/${title}`, 'utf8', function (err, description) {
                // defulat 값 설정 
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var template = `
                <!doctype html>
                <html>
                <head>
                    <title>WEB1 - ${title}</title>
                    <meta charset="utf-8">
                </head>
                <body>
                 <h1><a href="/">WEB</a></h1>
                    <ul>
                        <li><a href="/?id=HTML">HTML</a></li>
                        <li><a href="/?id=CSS">CSS</a></li>
                        <li><a href="/?id=JavaScript">JavaScript</a></li>
                    </ul>
                    <h2>${title}</h2>
                    <p>${description}</p>
                </body>
                </html>
            `;
                response.writeHead(200);
                response.end(template);
            });
        } else {
            fs.readFile(`data/${title}`, 'utf8', function (err, description) {
                var template = `
                <!doctype html>
                <html>
                <head>
                    <title>WEB1 - ${title}</title>
                    <meta charset="utf-8">
                </head>
                <body>
                    <h1><a href="/">WEB</a></h1>
                    <ul>
                     <li><a href="/?id=HTML">HTML</a></li>
                     <li><a href="/?id=CSS">CSS</a></li>
                     <li><a href="/?id=JavaScript">JavaScript</a></li>
                    </ul>
                    <h2>${title}</h2>
                    <p>${description}</p>
                </body>
                </html>
            `;
                response.writeHead(200);
                response.end(template);
            });
        }

    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);