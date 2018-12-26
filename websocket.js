var config = require('./config'),
    express = require('express'),
    app = express(),
    path = require('path'),
    http = require('http').createServer(app),
    fs = require("fs"),
    io = require('socket.io').listen(http),
    net = require('net');

var clients = [];
var http_port = process.env.PORT || config.http_port;

//Routing
app.use(express.static(path.join(__dirname, 'public')));

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

    tcpClient.connect(config.tcp_port, config.tcp_host, function () {
        console.info('connect to tcp server success, ' + config.tcp_host + ':' + config.tcp_port);

        //tcp客户端接收消息
        tcpClient.on('data', function (data) {
            // console.log(data.toString());
            socket.emit("receive tcp", data.toString());
        });

        tcpClient.on('end', function (data) {
            console.log('客户端[' + socket.username + ']与tcp server断开连接');
        });
    });

    socket.on('receive', function (data, callback) {
        console.log('浏览器【' + socket.username + '】：' + data+' '+new Date().Format("yyyy/MM/dd hh:mm:ss"));

        //回调函数，websocket服务器回复给浏览器端
        callback({
            username: socket.username,
            message: data
        });
        if (tcpClient) {
            tcpClient.write('【' + socket.username + '】：' + data);
        }
        return;
    });

    socket.on('join', function (username, callback) {
        if (addUser) return;

        socket.username = username;
        clients.push(socket);
        addUser = true;
        console.log('客户端[' + username + ']连接成功,当前在线人数：' + clients.length);
        callback({
            username: username,
            onlineUsers: clients.length
        })
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

Date.prototype.Format = function (fmt) {  
    var o = {
        "M+": this.getMonth() + 1, //月份   
        "d+": this.getDate(), //日   
        "h+": this.getHours(), //小时   
        "m+": this.getMinutes(), //分   
        "s+": this.getSeconds(), //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds() //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(
                ("" + o[k]).length)));
    return fmt;
};