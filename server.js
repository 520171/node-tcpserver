var express = require('express');
var app = express();
var path = require('path');
var net = require('net');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 2018;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

//Routing
app.use(express.static(path.join(__dirname, 'public')));

//ChatRom
var onlineUsers = 0;
io.on('connect', function (socket) {
    var addedUser = false;
    var client = new net.Socket();

    //当客户端执行new message事件时，这里将会监听到
    socket.on('client send message', function (data) {
        console.log('客户端[' + socket.username + ']：' + data);
        //服务端通知客户端去执行接收事件
        socket.broadcast.emit('server send message', {
            username: socket.username,
            message: data
        });

        //当客户端发来消息时，websocket服务器当成一个tcp客户端，并给tcp服务器转发消息
        if (client._handle == null) {
            client.connect(2020, '127.0.0.1', function () {
                console.log('已连接tcp服务器');
            });
        }
        //向tcp服务器发送消息
        client.write("浏览器：" + data);

        // 监听tcp服务器传来的data数据，并转发给浏览器
        client.on("data", function (data) {
            var message = data.toString();
            console.log("tcp服务器：" + message);
            socket.emit('server send message', {
                username: socket.username,
                message: message
            })
        });

        client.on("end", function () {
            console.log('断开与tcp服务器的连接');
        });
    });

    socket.on('add user', function (username) {
        if (addedUser) return;

        socket.username = username;
        ++onlineUsers;
        addedUser = true;
        console.log('当前加入的客户端[' + username + '],当前在线人数[' + onlineUsers + ']');
        socket.emit('login', {
            username: username,
            onlineUsers: onlineUsers
        });
        //通知其他客户端，当前有新用户进入
        socket.broadcast.emit('user joined', {
            username: socket.username,
            onlineUsers: onlineUsers
        });
    });

    //断开连接的事件
    socket.on('disconnect', function () {
        //将断开连接的用户从users中删除
        // users.splice(socket.userIndex, 1);
        if (socket.username) {
            onlineUsers--;

            //通知除自己以外的所有人
            socket.broadcast.emit('logout', {
                username: socket.username,
                onlineUsers: onlineUsers
            });
        }
    });
});