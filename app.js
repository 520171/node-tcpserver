/**
 * 通过net.Server类来创建一个TCP服务器
 */

/* 引入net模块 */
var net = require("net");
var host = {
    ip: '127.0.0.1',
    port: 2020
};
var clients = [];

/* 创建TCP服务器 */
var server = net.createServer(function (socket) {
    /* 更新当前客户端数组 */
    socket.name = socket.remoteAddress + ':' + socket.remotePort;
    clients.push(socket);
    console.log('客户端【' + socket.name + '】已上线...');
    showOnline(clients);
    /* 接收客户端发来的消息 */
    socket.on("data", function (data) {
        console.log('服务器：已收到客户端【' + socket.name + '】的数据，内容为【' + data + '】');
        // 给客户端返回数据
        socket.write('服务器：你好,客户端【' + socket.name + '】，已经收到你的消息');

        //给其他客户端转发消息
        for (let i = 0; i < clients.length; i++) {
            if (socket != clients[i]) {
                clients[i].write('服务器：这是客户端【' + socket.name + '】转发的消息');
            }
        }
    });

    /* 服务器与客户端连接断开 */
    socket.on("close", function () {
        console.log('客户端【' + socket.name + '】已断开连接');
        clients.splice(clients.indexOf(socket), 1);
        showOnline(clients);
    });

    /* 服务器与客户端连接发生错误 */
    socket.on("error", function () {
        console.log('客户端【' + socket.name + '】发生错误');
        clients.splice(clients.indexOf(socket), 1);
        showOnline(clients);
    });
});

/* 监听服务 */
server.listen(host.port, host.ip, function () {
    console.log('tcp服务正在运行 ' + host.ip + ':' + host.port);
});

server.on('close', function () {
    console.log('服务器关闭');
});

server.on('error', function (error) {
    console.log('error事件：服务器异常：' + error.message);
});

function showOnline(clients) {
    console.log('当前在线人数：' + clients.length);
}