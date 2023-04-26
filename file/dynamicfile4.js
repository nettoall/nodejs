var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var url = new URL('http://localhost:3000' + _url);
    console.log(url);
    var queryData = url.searchParams;
    var pathname = url.pathname;
    // 밑에 title하고 혼동이 되어 유니크한 이름으로 변경 
    var titleId = queryData.get('id');

    if (pathname == '/') {
        // title을 queryData.get 으로 하다보니 없을 경우 null 이 출력됨 
        if (titleId == null) {
            fs.readdir('./data', function (error, filelist) {
                // default 값 설정 
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = '<ul>';
                var i = 0;
                while (i < filelist.length) {
                    // esc 부호 
                    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
                    i = i + 1;
                }
                list = list + '</ul>';
                var template = `
                  <!doctype html>
                  <html>
                  <head>
                    <title>WEB1 - ${title}</title>
                    <meta charset="utf-8">
                  </head>
                  <body>
                    <h1><a href="/">WEB</a></h1>
                    ${list}
                    <h2>${title}</h2>
                    <p>${description}</p>
                  </body>
                  </html>
              `;
                response.writeHead(200);
                response.end(template);
            })
        } else {
            console.log('else title : ' + titleId);
            fs.readdir('./data', function (error, filelist) {
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = '<ul>';
                var i = 0;
                while (i < filelist.length) {
                    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
                    i = i + 1;
                }
                list = list + '</ul>';
                console.log('second title : ' + titleId);
                fs.readFile(`data/${titleId}`, 'utf8', function (err, description) {
                    var title = titleId;
                    var template = `
                    <!doctype html>
                    <html>
                    <head>
                        <title>WEB1 - ${title}</title>
                        <meta charset="utf-8">
                    </head>
                    <body>
                        <h1><a href="/">WEB</a></h1>
                        ${list}
                        <h2>${title}</h2>
                        <p>${description}</p>
                    </body>
                    </html>
                    `;
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }

    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);