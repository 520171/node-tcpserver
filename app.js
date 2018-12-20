/* 引入net模块 */
var net = require("net");

var HOST = '127.0.0.1';
var PORT = '2020';
var clients = [];

//创建TCP服务器
var server = net.createServer(function (socket) {
    socket.setKeepAlive(true, 3000);

    socket.name = socket.remoteAddress + ':' + socket.remotePort;
    clients.push(socket);

    console.log('客户端【' + socket.name + '】已连接，当前在线人数：' + clients.length);

    //接收tcp客户端发来的消息
    socket.on("data", function (data) {
        console.log('tcp服务器：已收到客户端【' + socket.name + '】的数据，内容为【' + data + '】');
        
        // 给客户端返回数据
        socket.write('tcp服务器：你好,客户端【' + socket.name + '】，已经收到你的的数据，内容为【' + data + '】');
    });

    socket.on("close", function () {
        clients.splice(clients.indexOf(socket), 1);
        console.log('客户端【' + socket.name + '】已断开连接，当前在线人数：' + clients.length);
    });

    socket.on("error", function (err) {
        clients.splice(clients.indexOf(socket), 1);
        console.log('客户端【' + socket.name + '】发生错误，' + err + '，当前在线人数：' + clients.length);
    });
});

server.on('close', function () {
    console.log('服务器关闭');
});

server.on('error', function (error) {
    console.log('error事件：服务器异常：' + error.message);
});

server.listen(PORT, HOST, function () {
    console.log('tcp服务器正在运行 ' + server.address().address + ':' + server.address().port);
});