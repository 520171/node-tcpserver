var config = require('./config');
var net = require('net');

var clients = [];
var server = net.createServer();

server.listen(config.tcp_port, config.tcp_host, function () {
    console.log('tcp服务器正在运行 ' + server.address().address + ':' + server.address().port);
});

server.on('connection', function (socket) {
    socket.name = socket.remoteAddress + ':' + socket.remotePort;
    clients.push(socket);

    console.log('客户端【' + socket.name + '】已连接，当前在线人数：' + clients.length + ' ' + new Date().Format("yyyy/MM/dd hh:mm:ss"));
    socket.write('你好，我是tcp服务器！');

    socket.on('data', function (data) {
        console.log(data.toString() + ' ' + new Date().Format("yyyy/MM/dd hh:mm:ss"));
        socket.write(data + '\n');
    });

    socket.on('end', function () {
        clients.splice(clients.indexOf(socket), 1);
        console.log('客户端【' + socket.name + '】已断开连接，当前在线人数：' + clients.length + ' ' + new Date().Format("yyyy/MM/dd hh:mm:ss"));
    });

    socket.on('timeout', function () {
        console.log('客户端【' + socket.name + '】已超时' + ' ' + new Date().Format("yyyy/MM/dd hh:mm:ss"));
        socket.end();
    });

    socket.on("error", function (err) {
        clients.splice(clients.indexOf(socket), 1);
        console.log('客户端【' + socket.name + '】发生错误，' + err + '，当前在线人数：' + clients.length) + ' ' + new Date().Format("yyyy/MM/dd hh:mm:ss");
    });

    socket.on("close", function () {
        clients.splice(clients.indexOf(socket), 1);
        // console.log('客户端【' + socket.name + '】已断开连接，当前在线人数：' + clients.length);
    });
});

server.on('close', function () {
    console.log('服务器关闭');
});

server.on('error', function (error) {
    console.log('error事件：服务器异常：' + error.message);
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