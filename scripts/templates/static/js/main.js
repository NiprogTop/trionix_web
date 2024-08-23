var  ws_url = 'ws://192.168.1.100:9090';
// var  ws_url = 'ws://192.168.1.47:9090';
// var  ws_url = 'ws://192.168.1.101:9090';
// var  ws_url = 'ws://0.0.0.0:9090';

let control_type = "web"
let mission_stat_vel = 0
let video_status = 0


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

var teleop_start =  new ROSLIB.Service({
    ros : ros,
    name : '/state_machine/start',
    serviceType : 'std_srvs/Empty'
});

// ros.getParams(function(params) {
//     console.log(params);
//     console.log(params['/run_id'])
// });

var teleop_status = new ROSLIB.Param({
    ros : ros,
    name : 'control_type'
});

// teleop_status.get(function(data) {
//     console.log('control_type: ' + data);
//     control_type = data;
// });

var mission_status = new ROSLIB.Param({
    ros : ros,
    name : 'mis_status'
});

mission_status.get(function(data) {
    console.log('mission_status: ' + data);
    mission_stat_vel = data;
});

var teleop_status = new ROSLIB.Param({
    ros : ros,
    name : 'video_status'
});

teleop_status.get(function(data) {
    console.log('video_status: ' + data);
    video_status = data;
});

var mission_publisher = new ROSLIB.Topic({
    ros: ros,
    name: '/sm_msg',
    messageType: 'std_msgs/String'
});

var cam_comm_publisher = new ROSLIB.Topic({
    ros: ros,
    name: '/cam_writer_command',
    messageType: 'std_msgs/Int16'
});

var mission_load_signal = new ROSLIB.Topic({
    ros: ros,
    name: '/sm_msg_signal',
    messageType: 'std_msgs/Int16'
});


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

var manipulator_publisher = new ROSLIB.Topic({
    ros: ros,
    name: '/manipulator',
    messageType: 'std_msgs/Float64'
});

var pid_setpoint = new ROSLIB.Topic({
    ros: ros,
    name: '/pid/depth_pid/setpoint',
    messageType: 'std_msgs/Float64'
})

var get_thr_data_publisher = new ROSLIB.Topic({
    ros: ros,
    name: '/thrusters_data_pub',
    messageType: 'std_msgs/Int16'
});

var thr_save_publisher = new ROSLIB.Topic({
    ros: ros,
    name: '/thrusters_save',
    messageType: 'std_msgs/String'
});

var pid_switch = new ROSLIB.Service({
    ros: ros,
    name: '/pid/switch',
    serviceType: 'std_srvs/SetBool'
});

// ##########    Joy Contol    #########

// var stat_flash = false
// var stat_of_rec = false
const MAX_FORWARD = 0.01
const MAX_BACKWARD = 0.01
const MAX_DOWN = 0.01
const MAX_UP = 0.01
const MAX_ANGULAR = 0.001
const MAX_PITCH_ANGULAR = 0.01
let thr_config_name
let thr_config_position
let mission = []

let G_MAX_FORWARD_BACKWARD = [-0.35, -0.65, -1.0] // -1 
// const G_MAX_BACKWARD = 1
let G_MAX_UP_DOWN = [-0.4, -0.6, -1.0] // -1 
// const G_MAX_UP = 1
let G_MAX_ANGULAR = [0.07, 0.08, 0.05] // 0.15 
let G_MAX_PITCH_ANGULAR = [0.1, 0.1, 0.1] //0.2

let G_K_id = 0 
let G_K_color = ['green', 'yellow' ,'red']

function G_mode(){
    if (G_MAX_FORWARD_BACKWARD.length -2 < G_K_id){
        G_K_id = 0;
    } else {
        G_K_id++;
    }
    console.log(G_K_id);
    document.getElementById('mode').style.backgroundColor = G_K_color[G_K_id]
}

document.getElementById('mode').onclick = function(){
    G_mode();
}

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




let up_down = 0
let left_right = 0
let forward_backward = 0
let pitch_moment_down = 0
let pitch_moment_up = 0

setInterval(function () { control(); }, 100);

function control() {
    if (control_type == 'web'){
        up_down = joy_left.GetY()
        left_right = joy_right.GetX()
        forward_backward = joy_right.GetY()
        
        // if ((left_right < 0.2) || (left_right > -0.2)){
        //     left_right = 0;
        // }
    // forward_backward *= 0.5;

        var cmd = new ROSLIB.Message({        
            // force: {
            linear: {
                x: forward_backward > 0 ? forward_backward * MAX_FORWARD : forward_backward * MAX_BACKWARD,
                z: up_down > 0 ? (up_down * MAX_UP) : (up_down * MAX_DOWN)
            },
            // torque: {
            angular: {
                // y: up_down > 0 ? -(up_down * MAX_UP) : -(up_down * MAX_DOWN),
                z: (left_right * MAX_ANGULAR)
            }
        });
        cmd_publisher.publish(cmd)
    // console.log(cmd)
    }
    if (control_type == 'web_joy_1'){
        gameLoop()

        up_down = smooth_force( up_down, axList[1])
        left_right = smooth_force(left_right, axList[2])
        forward_backward = smooth_force(forward_backward, axList[3])
        // console.log(forward_backward)
        pitch_moment_down = butList[6]
        pitch_moment_up = butList[7]

        var cmd = new ROSLIB.Message({        
            // force: {
            linear: {
                x: forward_backward > 0 ? forward_backward * G_MAX_FORWARD_BACKWARD[G_K_id] : forward_backward * G_MAX_FORWARD_BACKWARD[G_K_id] ,
                z: up_down > 0 ? (up_down * G_MAX_UP_DOWN[G_K_id]) : (up_down * G_MAX_UP_DOWN[G_K_id] )
            },
            // torque: {
            angular: {
                y: pitch_moment_down * G_MAX_PITCH_ANGULAR[G_K_id] + pitch_moment_up * G_MAX_PITCH_ANGULAR[G_K_id] * -1,
                z: (left_right * G_MAX_ANGULAR[G_K_id] )
            }
        });
        cmd_publisher.publish(cmd)                
    }
    if (control_type == 'web_joy'){
        gameLoop2()
        gamepadAPI.update()
        gamepadAPI.control_gamepad_but();
        up_down = smooth_force( up_down, gamepadAPI.axesStatus[1])
        left_right = smooth_force(left_right, gamepadAPI.axesStatus[2])
        forward_backward = smooth_force(forward_backward, gamepadAPI.axesStatus[3])
        // console.log(forward_backward)
        pitch_moment_down = butList[6]
        pitch_moment_up = butList[7]

        var cmd = new ROSLIB.Message({        
            // force: {
            linear: {
                x: forward_backward > 0 ? forward_backward * G_MAX_FORWARD_BACKWARD[G_K_id] : forward_backward * G_MAX_FORWARD_BACKWARD[G_K_id] ,
                z: up_down > 0 ? (up_down * G_MAX_UP_DOWN[G_K_id]) : (up_down * G_MAX_UP_DOWN[G_K_id] )
            },
            // torque: {
            angular: {
                // y: pitch_moment_down * G_MAX_PITCH_ANGULAR[G_K_id] + pitch_moment_up * G_MAX_PITCH_ANGULAR[G_K_id] * -1,
                z: (left_right * G_MAX_ANGULAR[G_K_id] )
            }
        });
        // console.log(cmd)
        cmd_publisher.publish(cmd)                
    }
}

// setInterval(function () { gamepadAPI.control_gamepad_but(); }, 200);


const FORCE_STEP = 0.2

// const f = 1
function smooth_force(real_f, f){
    // real_f = 0;
    // console.log(real_f);
    if ((f - real_f) > FORCE_STEP){real_f = real_f + FORCE_STEP}
    else if ((f - real_f) * -1 > FORCE_STEP){real_f = real_f - FORCE_STEP}
    else {real_f = f};
    return real_f;
}

// function control_gamepad_but(){
//     if (control_type == 'web_joy'){
//         if (butList[1]){
//             light();
//         }
//         if (butList[3]){
//             photo();
//             // light();
//         }
//         if (butList[9]){
//             pid_act();
//         }
//         if (butList[12]){
//             pid_set(-1)
//         }
//         if (butList[13]){
//             pid_set(1)
//         }
//         if (butList[4]){
//             greb(-1)
//         }
//         if (butList[5]){
//             greb(1)
//         }
//         if (butList[8]){
//             G_mode()
//         }
//         if (butList[0]){
//             depth_change();
//         }
        
//     }
// }

// ########       Gamepad Joy      ############

// setInterval(function () { control(); }, 100);
// setInterval(function () { gamepadAPI.update(); }, 1000);

let controllerIndex = null;
const butList = {};
let axList = [];

let gamepadAPI = {
	controller: {},
	turbo: false,
	connect: function(evt) {
		gamepadAPI.controller = evt.gamepad;
		gamepadAPI.turbo = true;
		console.log('Gamepad connected.');
	},
	disconnect: function(evt) {
		gamepadAPI.turbo = false;
		delete gamepadAPI.controller;
		console.log('Gamepad disconnected.');
	},
	update: function() {
		gamepadAPI.buttonsCache = [];
		for(var k=0; k<gamepadAPI.buttonsStatus.length; k++) {
			gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
		}
		gamepadAPI.buttonsStatus = [];
		var c = gamepadAPI.controller || {};
		var pressed = [];
		if(c.buttons) {
			for(var b=0,t=c.buttons.length; b<t; b++) {
				if(c.buttons[b].pressed) {
					pressed.push(gamepadAPI.buttons[b]);
				}
			}
		}
		var axes = [];
		if(c.axes) {
			for(var a=0,x=c.axes.length; a<x; a++) {
				axes.push(c.axes[a].toFixed(2));
			}
		}
		gamepadAPI.axesStatus = axes;
		gamepadAPI.buttonsStatus = pressed;
        // console.log(gamepadAPI.axesStatus);
        // console.log(gamepadAPI.buttonsCache);
        // console.log(gamepadAPI.buttonsStatus);
        // console.log(gamepadAPI.buttonPressed("select", 0));
		return pressed;
	},
	buttonPressed: function(button, hold) {
		var newPress = false;
		for(var i=0,s=gamepadAPI.buttonsStatus.length; i<s; i++) {
			if(gamepadAPI.buttonsStatus[i] == button) {
				newPress = true;
				if(!hold) {
					for(var j=0,p=gamepadAPI.buttonsCache.length; j<p; j++) {
						if(gamepadAPI.buttonsCache[j] == button) {
							newPress = false;
						}
					}
				}
			}
		}
		return newPress;
	},
	// buttons: [ // XBox360 layout
	// 	'A','B','---','X',
	// 	'Y','----','LB','RB',
	// 	'LT','RT','select','start','-','LJ','RJ',
	// ],
    buttons: [ // PG-9076 linux layout
    'A','B','X','Y',
    'LB','RB','LT','RT',
    'select','start','--','---',
    'up','down','left','right',
    ],
	buttonsCache: [],
	buttonsStatus: [],
	axesStatus: [],

    control_gamepad_but(){
        if (control_type == 'web_joy'){
            if (gamepadAPI.buttonPressed("B", 0)){
                light();
            }
            if (gamepadAPI.buttonPressed("A", 0)){
                photo();
            }
            if (gamepadAPI.buttonPressed("start", 0)){
                pid_act();
            }

            if (gamepadAPI.axesStatus[7] < 0){
                pid_set(-1);
            }
            if (gamepadAPI.axesStatus[7] > 0){
                pid_set(1);
            }

            if (gamepadAPI.buttonPressed("up", "hold")){
                // console.log("+up");
                pid_set(-1);
            }

            if (gamepadAPI.buttonPressed("down", "hold")){
                // console.log("down-");
                pid_set(1);
            }


            // if (gamepadAPI.buttonPressed("LB", "hold")){
            //     greb(-1)
            // }
            // if (gamepadAPI.buttonPressed("RB", "hold")){
            //     greb(1)
            // }
            if (gamepadAPI.buttonPressed("select", 0)){
                G_mode()
            }
            if (gamepadAPI.buttonPressed("Y", "hold")){
                depth_change();
            }
            
        }
    }
};

// window.addEventListener("gamepadconnected", gamepadAPI.connect);
// window.addEventListener("gamepaddisconnected", gamepadAPI.disconnect);
  

window.addEventListener("gamepadconnected", (event) => {
  handleConnectDisconnect(event, true);
//   const gamepad = event.gamepad;
  control_type = 'web_joy';
  teleop_status.set(control_type);
  document.getElementById('joy_screen').style.display == 'block' ? document.getElementById('joy_screen').style.display = 'none' : document.getElementById('joy_screen').style.display = 'none';
});

window.addEventListener("gamepaddisconnected", (event) => {
  handleConnectDisconnect(event, false);
  control_type = 'web'
  teleop_status.set(control_type);
  document.getElementById('joy_screen').style.display == 'none' ? document.getElementById('joy_screen').style.display = 'block' : document.getElementById('joy_screen').style.display = 'none';
});

function handleConnectDisconnect(event, connected) {
    const gamepad = event.gamepad;
    console.log(gamepad);

    if (connected) {
        controllerIndex = gamepad.index;
        console.log(gamepad.axes);
        console.log(gamepad.buttons);
    } else {
        controllerIndex = null;
    }
}

function gameList(listax, listd){
    for (const prop in listd){
      butList[prop] = listd[prop].value;
    }
    // console.log(butList);
    axList = listax;
    // console.log(axList);
  }

function gameLoop() {
  if (controllerIndex !== null) {
    const gamepad = navigator.getGamepads()[controllerIndex];
    // handleButtons(gamepad.buttons);
    // handleSticks(gamepad.axes);
    // handleRumble(gamepad);    
    gameList(gamepad.axes, gamepad.buttons);
  }
  requestAnimationFrame(gameLoop);
}

function gameLoop2() {
    if (controllerIndex !== null) {
      gamepadAPI.controller = navigator.getGamepads()[controllerIndex];
    }
    requestAnimationFrame(gameLoop2);
  }
  
//  gameLoop();


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


var heading_subscriber = new ROSLIB.Topic({
    ros: ros,
    name: '/heading',
    messageType: 'std_msgs/Float64'
});

heading_subscriber.subscribe(function(msg) {
    document.getElementById('heading').textContent="Курс: " + (msg.data.toFixed(2));
});


var depth_subscriber = new ROSLIB.Topic({
    ros: ros,
    name: '/depth',
    messageType: 'std_msgs/Float64'
});

var thr_data_subscriber = new ROSLIB.Topic({
    ros: ros,
    name: '/thrusters_list',
    messageType: 'std_msgs/String'
});

var mission_sub = new ROSLIB.Topic({
    ros: ros,
    name: '/mission_data',
    messageType: 'std_msgs/String'
});

mission_sub.subscribe(function(msg){
    console.log(msg.data);
    mission = JSON.parse(msg.data.replace(/'/g, '"'));
    var formattedJson = JSON.stringify(mission, null, 2);
    document.getElementById('json-text').value = formattedJson;
});

let mission_read = function(msg){

}

// ############# Depth and PID #############


var depth = 0.0
let depth_real = 0.0
let stat_pidr = false;

depth_subscriber.subscribe(function(msg) {
    document.getElementById('depth').textContent="Глубина: " + (msg.data.toFixed(2));
    depth_real = msg.data.toFixed(2);
    depth_real = parseFloat(depth_real);
});

pitch_subscriber.subscribe(function(msg) {
    document.getElementById('pitch').textContent="Дифферент: " + (msg.data.toFixed(2));
});

function pid_act(){
    stat_pidr = !stat_pidr
    var pidr_request = new ROSLIB.ServiceRequest({
        data: stat_pidr ? true : false
    });
    pid_switch.callService(pidr_request, function(result) {
        // console.log(result)
    });
    // console.log('send pid request');
    if (control_type == 'web_joy'){
        document.getElementById('button-ch').checked ? document.getElementById('button-ch').checked = false : document.getElementById('button-ch').checked = true;
    }
}

document.getElementById('button-1').onclick = function(){
    pid_act();
}

function pid_set(kk){
    depth = depth + (0.05 * kk);
    depth = Math.min(10.0, Math.max(depth, 0.0));
    const msg = new ROSLIB.Message({
        data: depth
    })
    document.getElementById('target_depth').textContent = depth.toFixed(2);
    // console.log(depth);
    pid_setpoint.publish(msg)
}

function depth_change(){
    
    const msg = new ROSLIB.Message({
        data: depth_real
    });
    depth = depth_real;
    document.getElementById('target_depth').textContent = depth_real;
    // console.log("<")
    pid_setpoint.publish(msg);
    console.log(depth_real);
}

document.getElementById('pid_down').onclick = function(){
    pid_set(-1);
}


document.getElementById('pid_up').onclick = function(){
    pid_set(1);
}


// ########## Thrusters Data ##########
let thr_data_parser = function(data){
    thr_config_name = JSON.parse(data.data);
    thr_list_generation();
};

// let thrust_table_create = function(){
//     for (const property in thr_config_name) {
//         console.log(`${property}: ${thr_config_name[property]}`);
//       }      
// };

thr_data_subscriber.subscribe(function(msg){
    thr_data_parser(msg);
});

let setting_block = document.getElementById('settings_grid');

let thr_list_generation = function(){
    while (setting_block.firstChild) {
        setting_block.removeChild(setting_block.lastChild);
    }
    let thr_num = 0;
    for (const thr_name in thr_config_name) {
        // console.log(`${thr_name}: ${thr_config_name[thr_name]["thruster_number"]}`);
        let nameDiv = document.createElement('div');
        nameDiv.className = 'thrust_name';
        nameDiv.textContent = thr_name;
        thr_num++;
        // nameDiv.textContent = thr_name;

        let numDiv = document.createElement('div');
        numDiv.className = 'select';

        let invertDiv = document.createElement('div');
        invertDiv.className = 'invert';

        let invertInput = document.createElement('input');
        invertInput.id = thr_name + '_invert_input';
        invertInput.type = 'checkbox';
        if (thr_config_name[thr_name]["k_forward"] > 0){
            invertInput.checked = false;
        }else{
            invertInput.checked = true;
        }
        // invertInput.checked = false;

        let invertLabel = document.createElement('label');
        // invertLabel.className = '_invert_lable';
        invertLabel.textContent = 'Реверс';
        

        invertDiv.appendChild(invertInput);
        invertDiv.appendChild(invertLabel);

        let numSelect = document.createElement('select');
        numSelect.id = thr_name;
        let lo = Object.keys(thr_config_name).length;

        for (let i = 0; i < lo; i++){
            let numOption = document.createElement('option');
            numOption.textContent = i;
            numOption.value = i;
            numSelect.appendChild(numOption);
        }
        numSelect.value = thr_config_name[thr_name]["thruster_number"];

        setting_block.appendChild(nameDiv);
        setting_block.appendChild(numDiv);
        setting_block.appendChild(invertDiv);
        numDiv.appendChild(numSelect);
      }
}


document.getElementById('settings_save').onclick = function(){
    for (const thr_name in thr_config_name) {
        thr_config_name[thr_name]["thruster_number"] = document.getElementById(thr_name).value; 
        document.getElementById(thr_name + '_invert_input').checked == true ? thr_config_name[thr_name]["k_forward"] = -1.0 : thr_config_name[thr_name]["k_forward"] = 1.0;
        // thr_config_name[thr_name]["k_forward"] = 1.0 ? document.getElementById(thr_name + '_invert_input').checked: -1.0 :
        // console.log(document.getElementById(thr_name).value);
    }
    console.log(thr_config_name);
    const thr_config_name_str = JSON.stringify(thr_config_name);
    const save_data = new ROSLIB.Message({
        data: thr_config_name_str
    })
    thr_save_publisher.publish(save_data)

}

document.getElementById('settings_upload').onclick = function(){
    const save_data = new ROSLIB.Message({
        data: 1
    })
    get_thr_data_publisher.publish()
}

document.getElementById('main_screen').onclick = function(){
    document.getElementById('settings').style.display == 'block' ? document.getElementById('settings').style.display = 'none' : document.getElementById('settings').style.display = 'none';
    // document.getElementById('missions').style.display == 'block' ? document.getElementById('missions').style.display = 'none' : document.getElementById('missions').style.display = 'none';
    document.getElementById('black_page').style.display == 'block' ? document.getElementById('black_page').style.display = 'none' : document.getElementById('black_page').style.display = 'none';
    document.getElementById('photo_galary').style.display == 'block' ? document.getElementById('photo_galary').style.display = 'none' : document.getElementById('photo_galary').style.display = 'none';
    document.getElementById('menu__toggle').checked = false;
}

document.getElementById('settings_screen').onclick = function(){
    // document.getElementById('missions').style.display == 'block' ? document.getElementById('missions').style.display = 'none' : document.getElementById('missions').style.display = 'none';
    document.getElementById('settings').style.display == 'block' ? document.getElementById('settings').style.display = 'block' : document.getElementById('settings').style.display = 'block';
    document.getElementById('photo_galary').style.display == 'none' ? document.getElementById('photo_galary').style.display = 'none' : document.getElementById('photo_galary').style.display = 'none';
    document.getElementById('black_page').style.display == 'block' ? document.getElementById('black_page').style.display = 'block' : document.getElementById('black_page').style.display = 'block';
    document.getElementById('menu__toggle').checked = false;
    // const save_data = new ROSLIB.Message({
    //     data: 1
    // })
    get_thr_data_publisher.publish()
}

document.getElementById('photo_screen').onclick = function(){
    // document.getElementById('missions').style.display == 'block' ? document.getElementById('missions').style.display = 'none' : document.getElementById('missions').style.display = 'none';
    document.getElementById('settings').style.display == 'none' ? document.getElementById('settings').style.display = 'none' : document.getElementById('settings').style.display = 'none';
    document.getElementById('photo_galary').style.display == 'block' ? document.getElementById('photo_galary').style.display = 'block' : document.getElementById('photo_galary').style.display = 'block';
    document.getElementById('black_page').style.display == 'block' ? document.getElementById('black_page').style.display = 'block' : document.getElementById('black_page').style.display = 'block';
    document.getElementById('menu__toggle').checked = false;
    // const save_data = new ROSLIB.Message({
    //     data: 1
    // })
    // get_thr_data_publisher.publish()
}


  


// ######## SCREEN CONTROLE ########

// let nameDiv = document.createElement('div');
// nameDiv.className = 'thrust_name';
// nameDiv.textContent = 'right'

// let numDiv = document.createElement('div');
// numDiv.className = 'select';

// let numSelect = document.createElement('select');
// // numSelect.className = 'select';

// setting_block.appendChild(nameDiv);
// setting_block.appendChild(numDiv);
// numDiv.appendChild(numSelect);


// // Your existing code unmodified...
// var iDiv = document.createElement('div');
// iDiv.id = 'block';
// iDiv.className = 'block';
// document.getElementsByTagName('body')[0].appendChild(iDiv);

// // Now create and append to iDiv
// var innerDiv = document.createElement('div');
// innerDiv.className = 'block-2';

// // The variable iDiv is still good... Just append to it.
// iDiv.appendChild(innerDiv);






// ########## Video ##########

// var image_subscriber = new ROSLIB.Topic({
//     ros: ros,
//     name: '/image_raw/compressed',
//     // name: '/raspicam_node/image/compressed',
//     messageType: 'sensor_msgs/CompressedImage'
// });

// var canvas = document.getElementById("videoCanvas");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// image_subscriber.subscribe(function (message) {
//     var canvas = document.getElementById("videoCanvas");
//     var ctx = canvas.getContext("2d");

//     var img = new Image();
//     img.src = "data:image/jpeg;base64," + message.data;
//     img.onload = function () {
//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//     };
// });



// let image_subscriber = new ROSLIB.Topic({
//     ros: ros,
//     name: '/image_raw/compressed',
//     messageType: 'sensor_msgs/CompressedImage'
// });

// var videoImage = document.getElementById("videoImage");

// image_subscriber.subscribe(function(message) {
//     updateVideoFrame(message);
// });

// function updateVideoFrame(data) {
//     let imageData = "data:image/jpeg;base64," + data.data; // Предполагается, что кадры в формате JPEG
//     videoImage.src = imageData;
// }



// image_subscriber.subscribe(function(message) {

//     img.src = "data:image/jpeg;base64," + message.data;
//     img.onload = function () {
//         videoImage.src = img.src;
//     };
// });


// ##############     Additional options     #################

let stat_flash = [0, 50, 150, 250];
let stat_flash_id = 0 

function light(){
    if (stat_flash.length -2 < stat_flash_id){
        stat_flash_id = 0;
    } else {
        stat_flash_id++;
    }
    var cmd = new ROSLIB.Message({
        data: stat_flash[stat_flash_id]
    });

    light_publisher.publish(cmd);
    // console.log(stat_flash_id);
}

document.getElementById('flashlight').onclick = function(){
    light();    
}

let manipulator = 50

function greb(v){
    manipulator = Math.min(100, Math.max(manipulator + 5 * v, 0));
    document.getElementById('trionixGrab').value = manipulator;

    var cmd = new ROSLIB.Message({
        data: Math.floor(manipulator)
    });
    manipulator_publisher.publish(cmd);
    console.log(cmd);
}


// setInterval(function () { greb_auto(); }, 500);


// function greb_auto(){
//     manipulator = document.getElementById('trionixGrab').value;
    
//     var cmd = new ROSLIB.Message({
//         data: Math.floor(manipulator)
//     });
//     manipulator_publisher.publish(cmd);
//     // console.log("touch: " + cmd);
// }



function video_rec(){
    if (video_status != 1){
        document.getElementById('rec').style.backgroundColor = "#d31e1e8c";
        video_status = 1;
        var cmd = new ROSLIB.Message({
            data: 1
        });
        cam_comm_publisher.publish(cmd)
    } else {
        video_status = 3;
        document.getElementById('rec').style.backgroundColor = "#faf5f58c";
        var cmd = new ROSLIB.Message({
            data: 3
        });
        cam_comm_publisher.publish(cmd)
    }
}

// document.getElementById('rec').onclick = function(){
//     video_rec();
// }

function photo(){
    var cmd = new ROSLIB.Message({
        data: 5
    });
    cam_comm_publisher.publish(cmd)
    // console.log(cmd + " photo")
}

document.getElementById('photo').onclick = function(){
    photo();
}

// // ########      State_Machine      #########

// setInterval(function () { control(); }, 1000);
// let update_status = function(){
//     mission_status.get(function(data) {
//         // console.log('mission_status: ' + data);
//         mission_stat_vel = data;
//     }); 
//     teleop_status.get(function(data) {
//         // console.log('control_type: ' + data);
//         control_type = data;
//     });
// };

// document.getElementById('mission_screen').onclick = function(){
//     document.getElementById('missions').style.display == 'block' ? document.getElementById('missions').style.display = 'block' : document.getElementById('missions').style.display = 'block';
//     document.getElementById('settings').style.display == 'block' ? document.getElementById('settings').style.display = 'none' : document.getElementById('settings').style.display = 'none';
//     document.getElementById('black_page').style.display == 'block' ? document.getElementById('black_page').style.display = 'block' : document.getElementById('black_page').style.display = 'block';
//     document.getElementById('menu__toggle').checked = false;
//     mission_load_signal.publish()
// }

// let ssm_pub = function(dat){
//     const mis_str = JSON.stringify(dat);
//     var mission_dat = new ROSLIB.Message({
//         data: mis_str
//     });
//     mission_publisher.publish(mission_dat);
//     console.log("pub");
// }

// document.getElementById('upload-button').addEventListener('click', function() {
//     var jsonText = document.getElementById('json-text').value;
//     try {
//       var jsonData = JSON.parse(jsonText);
//       // Действия с данными JSON
//       ssm_pub(jsonData);
//       console.log("ssm_publ");
//       document.getElementById('message').innerText = 'Mission upload successfully';
//       document.getElementById('message').classList.remove('error');
//       document.getElementById('message').classList.add('success');
      
//       mission_stat_vel = 1
//       mission_status.set(mission_stat_vel)
//     } catch (error) {
//       document.getElementById('message').innerText = 'Error: Invalid mission format';
//       document.getElementById('message').classList.remove('success');
//       document.getElementById('message').classList.add('error');
//     }
//   });

//   document.getElementById('mission-start-button').addEventListener('click', function() {
//     // if (mission_stat_vel == 0){
//     //     mission_stat_vel = 1; 
//     //     mission_status.set(mission_stat_vel);
//     // } else{
//     // mission_stat_vel = 2;
//     // mission_status.set(mission_stat_vel);
//     // }
//     control_type = "sm"
//     teleop_status.set(control_type)
//     teleop_start.callService();
//     console.log("Start Mission!")
//   });
  
//   document.getElementById('format-button').addEventListener('click', function() {
//     var jsonText = document.getElementById('json-text').value;
//     try {
//       var formattedJson = JSON.stringify(JSON.parse(jsonText), null, 2);
//       document.getElementById('json-text').value = formattedJson;
//       document.getElementById('message').innerText = 'Mission formatted successfully';
//       document.getElementById('message').classList.remove('error');
//       document.getElementById('message').classList.add('success');
//     } catch (error) {
//       document.getElementById('message').innerText = 'Error: Invalid mission format';
//       document.getElementById('message').classList.remove('success');
//       document.getElementById('message').classList.add('error');
//     }
//   });




















// let control_type_switch = function(){
//     control_type == "web" ? (control_type = "sm") : (control_type = "web") 
//     return control_type
// }

// let mission_status_change = function(){    
//     // control_type == "web" ? (control_type = "sm") : (control_type = "web") 
//     return mission_stat_vel
// }

// document.getElementById('flashlight').onclick = function(){
//     teleop_status.set(control_type_switch());
//     console.log('New control_type: ' + control_type);
// }

// document.getElementById('flashlight').onclick = function(){
//     teleop_status.set(control_type_switch());
//     console.log('New mission_status: ' + mission_stat_vel);
// }


// var canvas = document.getElementById("videoCanvas");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// image_subscriber.subscribe(function (message) {
//     var canvas = document.getElementById("videoCanvas");
//     var ctx = canvas.getContext("2d");

//     var img = new Image();
//     img.src = "data:image/jpeg;base64," + message.data;
//     img.onload = function () {
//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//     };
// });


