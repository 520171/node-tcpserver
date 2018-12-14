var username;
var connected = false,
    typing = false;
var $window = $(window);
var $username = $('#username');
var $messagelog = $('.header');
var $message = $('#message');

var socket = io();

Date.prototype.Format = function (fmt) { //author: meizz   
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
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

var chat = {
    setUserName: function () {
        username = $username.val().trim();
        if (username) {
            socket.emit('add user', username);
        }
    },
    addOnlineMessage: function (data) {
        var message = data.username + '加入了群聊，';
        if (data.onlineUsers === 1) {
            message += '当前1人在线 ';
        } else {
            message += '当前' + data.onlineUsers + '人在线';
        }
        $messagelog.append('<p style="text-align: center">' + message + '</p>');
    },
    addOfflineMessage: function (data) {
        var message = data.username + '离开了群聊，';
        if (data.onlineUsers === 1) {
            message += '当前1人在线 ';
        } else {
            message += '当前' + data.onlineUsers + '人在线';
        }
        $messagelog.append('<p style="text-align: center;color: red">' + message + '</p>');
    },
    addChatMessage: function (data) {
        $messagelog.append('<p style="color:red"><font style="color:#111;">' + new Date().Format("hh:mm:ss") + '</font>' + '   ' + data.username + '：' + data.message + '</p>');
    },
    sendMessage: function () {
        var message = $message.val();
        if (message && connected) {
            $message.val('');
            chat.addChatMessage({
                username: username,
                message: message
            });
            //通知服务器
            socket.emit('client send message', message);
        }
    }
};
socket.on('login', function (data) {
    connected = true;
    chat.addOnlineMessage(data);
});

socket.on('logout', function (data) {
    chat.addOfflineMessage(data);
});

//接收服务器发来的通知
socket.on('server send message', function (data) {
    chat.addChatMessage({
        username: data.username,
        message: data.message
    });
});

socket.on('user joined', function (data) {
    chat.addOnlineMessage(data);
});

//连接服务器
$('#connect').click(function () {
    if (username) {

    } else {
        chat.setUserName();
    }
});

//客户端发送消息给服务器
$('#send').click(function () {
    chat.sendMessage();
});