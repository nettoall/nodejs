var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
// function  정의 
// create, update 를 ${control} 로 정의 , argument에 control 추가 
function templateHTML(title, list, body, control) {
    return `
    <!doctype html>
    <html>
    <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${control}
        ${body}
    </body>
    </html>
    `
}

function templateList(filelist) {
    var list = '<ul>';
    var i = 0;

    while (i < filelist.length) {
        // esc 부호 
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i = i + 1;
    }
    list = list + '</ul>';
    return list;
}

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var url = new URL('http://localhost:3000' + _url);

    var queryData = url.searchParams;
    var pathname = url.pathname;
    // 밑에 title하고 혼동이 되어 유니크한 이름으로 변경 
    var titleId = queryData.get('id');
    // console.log(pathname);
    if (pathname == '/') {
        // title을 queryData.get 으로 하다보니 없을 경우 null 이 출력됨 
        if (titleId == null) {
            fs.readdir('./data', function (error, filelist) {
                // default 값 설정 
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = templateList(filelist);
                var template = templateHTML(title, list, `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`);

                response.writeHead(200);
                response.end(template);
            });
        } else {
            fs.readdir('./data', function (error, filelist) {
                fs.readFile(`data/${titleId}`, 'utf8', function (err, description) {
                    var title = titleId;
                    var list = templateList(filelist);
                    var template = templateHTML(title, list, `<h2>${title}</h2>${description}`,
                        `<a href="/create">create</a> <a href="/update?id=${title}">update</a>
                        <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <input type="submit" value="delete">
                        </form>`
                    );
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
    } else if (pathname === '/create') {
        fs.readdir('./data', function (error, filelist) {
            var title = 'WEB - create';
            var list = templateList(filelist);
            var template = templateHTML(title, list, `
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
            response.end(template);
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
            fs.readFile(`data/${titleId}`, 'utf-8', function (err, description) {
                var title = `${titleId}`;
                var list = templateList(filelist);
                var template = templateHTML(title, list,
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
                response.end(template);
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