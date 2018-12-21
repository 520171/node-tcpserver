var express = require('express');
var app = express();
var path = require('path');
var http = require('http').createServer(app),
    io = require('socket.io').listen(http),
    net = require('net');

var clients = [];
var port = process.env.PORT || 2018;
var tcp_HOST = '127.0.0.1';
var tcp_PORT = 2020;

//Routing
app.use(express.static(path.join(__dirname, 'public')));

http.listen(port, function () {
    console.log('HTTP Server listening on port %d', port);
});

io.sockets.on('connection', function (socket) {
    //tcp客户端
    var tcpClient = new net.Socket();
    // tcpClient.setEncoding('ascii');
    tcpClient.setKeepAlive(true);

    tcpClient.connect(tcp_PORT, tcp_HOST, function () {
        console.info('已连接tcp服务器：' + tcp_HOST + ':' + tcp_PORT);

        tcpClient.on("data", function (data) {
            var message = data.toString();
            console.log("tcp服务器：" + message);
            socket.emit('message', {
                username: socket.username,
                message: message
            });
        });

        tcpClient.on('end', function (data) {
            console.log('END DATA : ' + data);
        });

        tcpClient.on('error', function () {});
    });

    socket.on('news', function (data) {
        console.log('客户端[' + socket.username + ']：' + data);
        tcpClient.write('websocket：:' + data);
        return;
    });

    socket.emit("join", "websocket server connect success");

    socket.on('disconnect', function () {
        if (socket.username) {
            client--;

            // //通知除自己以外的所有人
            // socket.broadcast.emit('logout', {
            //     username: socket.username,
            //     onlineUsers: onlineUsers
            // });
        }
        socket.emit('leave', '你已离开');
    });
});


//ChatRom
// var onlineUsers = 0;
// io.on('connect', function (socket) {
// var client = new net.Socket();
//     var addedUser = false;

//     //当客户端执行new message事件时，这里将会监听到
//     socket.on('client send message', function (data) {
//         console.log('客户端[' + socket.username + ']：' + data);
//         //websocket服务端通知客户端去执行接收事件
//         socket.broadcast.emit('server send message', {
//             username: socket.username,
//             message: data
//         });

//         //当客户端发来消息时，websocket服务器当成一个tcp客户端，并给tcp服务器转发消息
//         if (client._handle == null) {
//             client.connect(2020, '127.0.0.1', function () {
//                 console.log('已连接tcp服务器');
//             });
//         }
//         //向tcp服务器发送来自浏览器、小程序的消息
//         client.write(data);

//         // 监听tcp服务器传来的data数据，并转发给浏览器
//         client.on("data", function (data) {
//             var message = data.toString();
//             console.log("tcp服务器：" + message);
//             socket.emit('tcpserver send message', {
//                 username: socket.username,
//                 message: message
//             });
//         });

//         client.on("end", function () {
//             console.log('断开与tcp服务器的连接');
//         });

//         client.on('error', function () {
//             console.log('【本机提示】服务器异常');
//         });
//     });

//     socket.on('add user', function (username) {
//         if (addedUser) return;

//         socket.username = username;
//         ++onlineUsers;
//         addedUser = true;
//         console.log('当前加入的客户端[' + username + '],当前在线人数[' + onlineUsers + ']');
//         socket.emit('login', {
//             username: username,
//             onlineUsers: onlineUsers
//         });
//         //通知其他客户端，当前有新用户进入
//         socket.broadcast.emit('user joined', {
//             username: socket.username,
//             onlineUsers: onlineUsers
//         });
//     });

//     //断开连接的事件
//     socket.on('disconnect', function () {
//         //将断开连接的用户从users中删除
//         // users.splice(socket.userIndex, 1);
//         if (socket.username) {
//             onlineUsers--;

//             //通知除自己以外的所有人
//             socket.broadcast.emit('logout', {
//                 username: socket.username,
//                 onlineUsers: onlineUsers
//             });
//         }
//     });
// });

io.sockets.on('connection', function (socket) {
    var tcpClient = new net.Socket();
    tcpClient.setEncoding('ascii');
    tcpClient.setKeepAlive(true);

    tcpClient.connect(tcp_PORT, tcp_HOST, function () {
        console.info('已连接tcp服务器：' + tcp_HOST + ':' + tcp_PORT);

        tcpClient.on('data', function (data) {
            console.log('DATA: ' + data);
            socket.emit("httpServer", data);
        });

        tcpClient.on('end', function (data) {
            console.log('END DATA : ' + data);
        });
    });

    socket.on('news', function (data) {
        console.log('客户端[' + socket.username + ']：' + data);
        tcpClient.write('tcp:' + data);
        return;
    });

    socket.emit("httpServer", "Initial Data");
});