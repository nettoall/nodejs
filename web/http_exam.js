var http = require('http');
var fs = require('fs');

// application 선언 
var app = http.createServer(function (request, response) {

    // node 버전에 따라 url 가져오는 방법 바꿔야 할 수 있음 
    var url = request.url;
    // index.html 이 정의가 안 되어 있으면 에러가 나면서 실행 빠져나감 
    if (request.url == '/') {
        url = '/index.html';
    }

    if (request.url == '/favicon.ico') {
        response.writeHead(404);
        //
        response.write('no files');
        response.end();
        return;
    }
    response.writeHead(200);
    console.log(__dirname + url);
    response.write(fs.readFileSync(__dirname + url));
    response.end();
});
app.listen(3000);