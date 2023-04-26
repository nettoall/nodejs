var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
// module 정의 
var template = require('./lib/template.js');
var path = require('path');
// script 저장 보안 문제 해결을 위한 import, sanitize-html 을 설치해야 함 (npm install -S sanitize-html) - package.json 에 정의됨
var sanitizeHtml = require('sanitize-html');

// path를 사용하는 예제 보안 XSS를 방지하기 위해 path 사용 (url 에 .. 입력으로 인한 보안문제 방지를 위해 )
// create, update 시 <script></script> 입력으로 XSS 보안 문제 발생 
var app = http.createServer(function (request, response) {
    var _url = request.url;
    var url = new URL('http://localhost:3000' + _url);

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
                var list = template.list(filelist);
                var html = template.HTML(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`
                );

                response.writeHead(200);
                response.end(html);
            });
        } else {
            // 화면 출력할 때에만 sanitizeHtml 적용하여 <,/ 특수문자를 변환 
            fs.readdir('./data', function (error, filelist) {
                // path.parse 로 경로를 검증
                var filteredId = path.parse(queryData.get('id')).base;

                fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
                    var title = titleId;
                    // sanitizeHtml() 사용
                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description, { allowedTags: ['hi'] });

                    var list = template.list(filelist);
                    var html = template.HTML(sanitizedTitle, list,
                        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                        `<a href="/create">create</a> 
                         <a href="/update?id=${sanitizedTitle}">update</a>
                        <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="delete">
                        </form>`
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathname === '/create') {
        fs.readdir('./data', function (error, filelist) {
            var title = 'WEB - create';
            var list = template.list(filelist);
            var html = template.HTML(title, list, `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
            `, '');
            response.writeHead(200);
            response.end(html);
        });
    } else if (pathname === '/create_process') {
        var body = '';
        // data가 들어 오면 callback 함수 호출  정의 , 조각조각 들어옴 
        request.on('data', function (data) {
            body = body + data;
        });
        // 더 이상 들어오지 않을 때 end 
        request.on('end', function () {

            // body 정보를 parsing 
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;

            // post 로 받은 데이터 처리하는 로직 
            fs.writeFile(`data/${title}`, description, 'utf-8', function (err) {
                response.writeHead(302, { Location: `/?id=${title}` });
                response.end();
            })
        });

    } else if (pathname === '/update') {   //  update 추가 
        fs.readdir('./data', function (error, filelist) {
            // path.parse 로 경로를 검증
            var filteredId = path.parse(queryData.get('id')).base;
            fs.readFile(`data/${filteredId}`, 'utf-8', function (err, description) {
                var title = `${titleId}`;
                var list = template.list(filelist);
                var html = template.HTML(title, list,
                    `
                    <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === '/update_process') {
        var body = '';
        // data가 들어 오면 callback 함수 호출  정의 , 조각조각 들어옴 
        request.on('data', function (data) {
            body = body + data;
        });
        // 더 이상 들어오지 않을 때 end 
        request.on('end', function () {

            // body 정보를 parsing 
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;

            // post 로 받은 데이터 처리하는 로직 
            fs.rename(`data/${id}`, `data/${title}`, function (err) {
                fs.writeFile(`data/${title}`, description, 'utf-8', function (err) {
                    response.writeHead(302, { Location: `/?id=${title}` });
                    response.end();
                })
            });
        });

    } else if (pathname === '/delete_process') {
        var body = '';
        // data가 들어 오면 callback 함수 호출  정의 , 조각조각 들어옴 
        request.on('data', function (data) {
            body = body + data;
        });

        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            fs.unlink(`data/${id}`, function (err) {
                response.writeHead(302, { Location: `/` });
                response.end();
            })
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }

});
app.listen(3000);