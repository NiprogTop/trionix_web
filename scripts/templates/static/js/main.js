var  ws_url = 'ws://192.168.1.100:9090';
// var  ws_url = 'ws://192.168.1.101:9090';
// var  ws_url = 'ws://0.0.0.0:9090';



var ros = new ROSLIB.Ros({
    url : ws_url
});

ros.on('connection', function() {
console.log('Connected to websocket server.');
});

ros.on('error', function(error) {
console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function() {
console.log('Connection to websocket server closed.');
});

// ######  Publish topics and serbvice  ######  

var cmd_publisher = new ROSLIB.Topic({
    ros: ros,
    // name: '/command',
    // messageType: 'geometry_msgs/Wrench'    
    name: '/teleop_command',
    messageType: 'geometry_msgs/Twist'
    
});

var light_publisher = new ROSLIB.Topic({
    ros: ros,
    name: '/light',
    messageType: 'std_msgs/Float64'
});

var pid_setpoint = new ROSLIB.Topic({
    ros: ros,
    name: '/pid/depth_pid/setpoint',
    messageType: 'std_msgs/Float64'
})

var pid_switch = new ROSLIB.Service({
    ros: ros,
    name: '/pid/switch',
    serviceType: 'std_srvs/SetBool'
});

// ##########    Publish param #########

var stat_flash = false
var stat_of_rec = false
const MAX_FORWARD = 0.01
const MAX_BACKWARD = 0.01
const MAX_DOWN = 0.01
const MAX_UP = 0.01
const MAX_ANGULAR = 0.01

var joy_right = new JoyStick('joyDivRight', {
    "title": "joystick_right",
    "autoReturnToCenter": true,
    "internalFillColor": "#FF0000",
    "externalStrokeColor": "#800000",
    "externalLineWidth": "5"
});

var joy_left = new JoyStick('joyDivLeft', {
    "title": "joystick_left",
    "autoReturnToCenter": true,
    "internalFillColor": "#FF0000",
    "externalStrokeColor": "#800000",
    "externalLineWidth": "5"
});

setInterval(function () { control(); }, 200);



function control() {
    var up_down = joy_left.GetY()    
    var left_right = joy_right.GetX()
    var forward_backward = joy_right.GetY()

    var cmd = new ROSLIB.Message({        
        // force: {
        linear: {
            x: forward_backward > 0 ? forward_backward * MAX_FORWARD : forward_backward * MAX_BACKWARD,
            z: up_down > 0 ? -(up_down * MAX_UP) : -(up_down * MAX_DOWN)
        },
        // torque: {
        angular: {
                z: -(left_right / 10 * MAX_ANGULAR)
        }
    });
    cmd_publisher.publish(cmd);
}


// document.getElementById('rec').onclick = function(){
//     this.stat_of_rec = !this.stat_of_rec
//     let recval = new XMLHttpRequest();
//     recval.open('GET', '/record?date_from_Nick_Kapustin=' + (this.stat_of_rec ? 1 : 0), true);
//     recval.send();
// }



// ########### Subs ##############

var roll_subscriber = new ROSLIB.Topic({
    ros: ros,
    name: '/roll',
    messageType: 'std_msgs/Float64'
});

var pitch_subscriber = new ROSLIB.Topic({
    ros: ros,
    name: '/pitch',
    messageType: 'std_msgs/Float64'
});


var depth_subscriber = new ROSLIB.Topic({
    ros: ros,
    name: '/depth',
    messageType: 'std_msgs/Float64'
});


// ############# Depth and PID #############


var depth = 0.0
var stat_pidr = false;

depth_subscriber.subscribe(function(msg) {
    document.getElementById('depth').textContent="Глубина: " + (msg.data.toFixed(2));
});

pitch_subscriber.subscribe(function(msg) {
    document.getElementById('pitch').textContent="Дифферент: " + (msg.data.toFixed(2));
});

document.getElementById('button-1').onclick = function(){
    this.stat_pidr = !this.stat_pidr
    var pidr_request = new ROSLIB.ServiceRequest({
        data: this.stat_pidr ? true : false
    });
    pid_switch.callService(pidr_request, function(result) {
        console.log(result)
    })
    console.log('send pid request')
}

document.getElementById('pid_down').onclick = function(){
    
    depth = depth - 0.1;
    depth = Math.max(depth, 0.0);
    const msg = new ROSLIB.Message({
        data: depth
    })
    document.getElementById('target_depth').textContent = depth.toFixed(1);
    pid_setpoint.publish(msg)
}


document.getElementById('pid_up').onclick = function(){
    depth = depth + 0.1;
    depth = Math.min(10.0, depth);
    const msg = new ROSLIB.Message({
        data: depth
    })
    document.getElementById('target_depth').textContent = depth.toFixed(1);
    pid_setpoint.publish(msg)
}


// ########## Video ##########

var image_subscriber = new ROSLIB.Topic({
    ros: ros,
    name: '/image_raw/compressed',
    messageType: 'sensor_msgs/CompressedImage'
});

var canvas = document.getElementById("videoCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

image_subscriber.subscribe(function (message) {
    var canvas = document.getElementById("videoCanvas");
    var ctx = canvas.getContext("2d");

    var img = new Image();
    img.src = "data:image/jpeg;base64," + message.data;
    img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
});




document.getElementById('flashlight').onclick = function(){
    this.stat_flash = !this.stat_flash
    var stat;
    this.stat_flash ? stat = 150 : stat = 0;
    var cmd = new ROSLIB.Message({
        data: stat
        // data: this.stat_flash ? 150 : 0
    });

    light_publisher.publish(cmd);
    console.log(stat);
}

