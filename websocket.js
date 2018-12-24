var http = require('http').createServer(httpHandler),
    fs = require("fs"),
    io = require('socket.io').listen(http),
    net = require('net');

var clients = [];
var http_port = process.env.PORT || 2018;
var tcp_HOST = '127.0.0.1';
var tcp_PORT = 2020;

/**
 * http server
 */
function httpHandler(req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

http.listen(http_port);
console.info("HTTP server listening on " + http_port);

// middleware，token验证
io.use(function (socket, next) {
    var token = socket.handshake.query.token;

    if (typeof token == 'undefined' || token == null || token == '') {
        console.error('Authentication  error');
        socket.disconnect();
        next(new Error("Socket auth error: No token provided"));
    } else {
        return next();
    }
});

io.on('connection', function (socket) {
    var token = socket.handshake.query.token;
    console.log(token);

    var addUser = false;

    var tcpClient = new net.Socket();
    // tcpClient.setEncoding("ascii");
    tcpClient.setKeepAlive(true);

    tcpClient.connect(tcp_PORT, tcp_HOST, function () {
        console.info('connect to tcp server success, ' + tcp_HOST + ':' + tcp_PORT);

        //tcp客户端接收消息
        tcpClient.on('data', function (data) {
            // console.log(data.toString());
            socket.emit("receive tcp", data.toString());
        });

        tcpClient.on('end', function (data) {
            console.log('客户端[' + socket.username + ']与tcp server断开连接');
        });
    });

    socket.on('receive', function (data) {
        console.log('浏览器【' + socket.username + '】：' + data);
        ////websocket服务器回复给浏览器端，暂时屏蔽
        // socket.emit('receive websocket', {
        //     username: socket.username,
        //     message: data
        // });
        if (tcpClient) {
            tcpClient.write('【' + socket.username + '】：' + data);
        }
        return;
    });

    socket.on('join', function (username) {
        if (addUser) return;

        socket.username = username;
        clients.push(socket);
        addUser = true;
        console.log('客户端[' + username + ']连接成功,当前在线人数：' + clients.length);
        socket.emit('login', {
            username: username,
            onlineUsers: clients.length
        });
    });

    socket.on('disconnect', function () {
        tcpClient.end();
        clients.splice(clients.indexOf(socket), 1);
        console.log('客户端[' + socket.username + ']已断开连接,当前在线人数：' + clients.length);
        socket.emit('logout', {
            username: socket.username,
            onlineUsers: clients.length
        });
    });
});