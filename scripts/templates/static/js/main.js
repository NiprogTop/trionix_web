// var  ws_url = 'ws://192.168.1.100:9090';
// var  ws_url = 'ws://192.168.1.47:9090';
// var  ws_url = 'ws://192.168.1.101:9090';
var  ws_url = 'ws://0.0.0.0:9090';

let control_type = "web"
let mission_stat_vel = 0


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

teleop_status.get(function(data) {
    console.log('control_type: ' + data);
    control_type = data;
});

var mission_status = new ROSLIB.Param({
    ros : ros,
    name : 'mis_status'
});

mission_status.get(function(data) {
    console.log('mission_status: ' + data);
    mission_stat_vel = data;
});

var mission_publisher = new ROSLIB.Topic({
    ros: ros,
    name: '/sm_msg',
    messageType: 'std_msgs/String'
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

// ##########    Publish param #########

var stat_flash = false
var stat_of_rec = false
const MAX_FORWARD = 0.01
const MAX_BACKWARD = 0.01
const MAX_DOWN = 0.01
const MAX_UP = 0.01
const MAX_ANGULAR = 0.01
let thr_config_name
let thr_config_position
let mission = []


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
    if (control_type == 'web'){
        var up_down = joy_left.GetY()    
        var left_right = joy_right.GetX()
        var forward_backward = joy_right.GetY()
        
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
                z: (left_right / 10 * MAX_ANGULAR)
            }
        });
        cmd_publisher.publish(cmd)
    // console.log(cmd)
    }
}


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
    // console.log("<")
    pid_setpoint.publish(msg)
}


document.getElementById('pid_up').onclick = function(){
    depth = depth + 0.1;
    depth = Math.min(10.0, depth);
    const msg = new ROSLIB.Message({
        data: depth
    })
    document.getElementById('target_depth').textContent = depth.toFixed(1);
    // console.log(">")
    pid_setpoint.publish(msg)
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
    document.getElementById('missions').style.display == 'block' ? document.getElementById('missions').style.display = 'none' : document.getElementById('missions').style.display = 'none';
    document.getElementById('black_page').style.display == 'block' ? document.getElementById('black_page').style.display = 'none' : document.getElementById('black_page').style.display = 'none';
    document.getElementById('menu__toggle').checked = false;
}

document.getElementById('settings_screen').onclick = function(){
    document.getElementById('missions').style.display == 'block' ? document.getElementById('missions').style.display = 'none' : document.getElementById('missions').style.display = 'none';
    document.getElementById('settings').style.display == 'block' ? document.getElementById('settings').style.display = 'block' : document.getElementById('settings').style.display = 'block';
    document.getElementById('black_page').style.display == 'block' ? document.getElementById('black_page').style.display = 'block' : document.getElementById('black_page').style.display = 'block';
    document.getElementById('menu__toggle').checked = false;
    // const save_data = new ROSLIB.Message({
    //     data: 1
    // })
    get_thr_data_publisher.publish()
}



  
  


// document.getElementById('settings_screen').onclick = function(){
//     const save_data = new ROSLIB.Message({
//         data: 1
//     })
//     get_thr_data_publisher.publish()
// }


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



// ########      State_Machine      #########

setInterval(function () { control(); }, 1000);
let update_status = function(){
    mission_status.get(function(data) {
        // console.log('mission_status: ' + data);
        mission_stat_vel = data;
    }); 
    teleop_status.get(function(data) {
        // console.log('control_type: ' + data);
        control_type = data;
    });
};

document.getElementById('mission_screen').onclick = function(){
    document.getElementById('missions').style.display == 'block' ? document.getElementById('missions').style.display = 'block' : document.getElementById('missions').style.display = 'block';
    document.getElementById('settings').style.display == 'block' ? document.getElementById('settings').style.display = 'none' : document.getElementById('settings').style.display = 'none';
    document.getElementById('black_page').style.display == 'block' ? document.getElementById('black_page').style.display = 'block' : document.getElementById('black_page').style.display = 'block';
    document.getElementById('menu__toggle').checked = false;
    mission_load_signal.publish()
}

let ssm_pub = function(dat){
    const mis_str = JSON.stringify(dat);
    var mission_dat = new ROSLIB.Message({
        data: mis_str
    });
    mission_publisher.publish(mission_dat);
    console.log("pub");
}

document.getElementById('upload-button').addEventListener('click', function() {
    var jsonText = document.getElementById('json-text').value;
    try {
      var jsonData = JSON.parse(jsonText);
      // Действия с данными JSON
      ssm_pub(jsonData);
      console.log("ssm_publ");
      document.getElementById('message').innerText = 'Mission upload successfully';
      document.getElementById('message').classList.remove('error');
      document.getElementById('message').classList.add('success');
      
      mission_stat_vel = 1
      mission_status.set(mission_stat_vel)
    } catch (error) {
      document.getElementById('message').innerText = 'Error: Invalid mission format';
      document.getElementById('message').classList.remove('success');
      document.getElementById('message').classList.add('error');
    }
  });

  document.getElementById('mission-start-button').addEventListener('click', function() {
    // if (mission_stat_vel == 0){
    //     mission_stat_vel = 1;
    //     mission_status.set(mission_stat_vel);
    // } else{
    // mission_stat_vel = 2;
    // mission_status.set(mission_stat_vel);
    // }
    control_type = "sm"
    teleop_status.set(control_type)
    teleop_start.callService();
    console.log("Start Mission!")
  });
  
  document.getElementById('format-button').addEventListener('click', function() {
    var jsonText = document.getElementById('json-text').value;
    try {
      var formattedJson = JSON.stringify(JSON.parse(jsonText), null, 2);
      document.getElementById('json-text').value = formattedJson;
      document.getElementById('message').innerText = 'Mission formatted successfully';
      document.getElementById('message').classList.remove('error');
      document.getElementById('message').classList.add('success');
    } catch (error) {
      document.getElementById('message').innerText = 'Error: Invalid mission format';
      document.getElementById('message').classList.remove('success');
      document.getElementById('message').classList.add('error');
    }
  });


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


// document.getElementById('rec').onclick = function(){
//     this.stat_of_rec = !this.stat_of_rec
//     let recval = new XMLHttpRequest();
//     recval.open('GET', '/record?date_from_Nick_Kapustin=' + (this.stat_of_rec ? 1 : 0), true);
//     recval.send();
// }