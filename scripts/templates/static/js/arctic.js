import { System, Azipod, Deadwood, Rudder, SystemBlock, RudderButtons, DeadwoodButtons, AzipodButtons, stat_mes, sys_mes } from './import_classes.js';

// let deadwoodID_1 = document.getElementById('3');
// let deadwoodID_2 = document.getElementById('4');
// let deadwoodID_3 = document.getElementById('5');
// let azipodID_1 = document.getElementById('6');
// let azipodID_2 = document.getElementById('7');
// let azipodID_3 = document.getElementById('8');


// let controllerIndex = null;
// let contrTimer = 0;

// window.addEventListener("gamepadconnected", (event) => {
//   handleConnectDisconnect(event, true);
// });

// window.addEventListener("gamepaddisconnected", (event) => {
//   handleConnectDisconnect(event, false);
// });

// function handleConnectDisconnect(event, connected) {
//   const gamepad = event.gamepad;
//   console.log(gamepad);

//   if (connected) {
//     controllerIndex = gamepad.index;
//     console.log(gamepad.axes);
//     console.log(gamepad.buttons);
//     // controllerAreaNotConnected.style.display = "none";
//     // controllerAreaConnected.style.display = "block";
//     // createButtonLayout(gamepad.buttons);
//     // createAxesLayout(gamepad.axes);
//   } else {
//     controllerIndex = null;
//     // console.log(controllerIndex);
//     // controllerAreaNotConnected.style.display = "block";
//     // controllerAreaConnected.style.display = "none";
//   }
// }

const butList = {};

function gameList(listax, listd){  
  // console.log(listd);
  for (const prop in listd){
    // console.log(prop);
    butList[prop] = listd[prop].value;
  }
  // console.log(butList);
  // console.log(listax);
  // return butList;
}

// let JoyById = document.getElementById(0);

function handleRumble(gamepad) {
  // const rumbleOnButtonPress = document.getElementById("rumble-on-button-press");

  // if (rumbleOnButtonPress.checked) {
    if (gamepad.buttons.some((button) => button.value > 0)) {
      gamepad.vibrationActuator.playEffect("dual-rumble", {
        startDelay: 0,
        duration: 100,
        weakMagnitude: 1.0,
        strongMagnitude: 1.0,
      });
    }
  // }
}

function joy_teleop(gameP){
  // if(gameP.axes[3] != 0){
    
    if (gameP.axes[3] > 0){
      azipod_2.inputRPMValue = gameP.axes[3] * 800;
      azipod_2.direction = false;}
    else if (gameP.axes[3] == 0){azipod_2.inputRPMValue = 0;}
    else {
      azipod_2.inputRPMValue = gameP.axes[3] * -800;
      azipod_2.direction = true;}
  // }
  // if(gameP.axes[1] != 0){
    if (gameP.axes[1] > 0){
      azipod_3.inputRPMValue = gameP.axes[1] * 800;
      azipod_3.direction = false;}
      // console.log(azipod_3.inputRPMValue);
    else if (gameP.axes[1] == 0){azipod_3.inputRPMValue = 0;}
    else {
      azipod_3.inputRPMValue = gameP.axes[1] * -800;
      azipod_3.direction = true;}
    // console.log(azipod_3.inputRPMValue);
  // }

  if (gameP.axes[0] > 0 && azipod_3.setAngleValue < 180){
    azipod_3.inputAngleValue = 180;}
  else if (gameP.axes[0] == 0){azipod_3.inputAngleValue = azipod_3.setAngleValue;}
  else if (azipod_3.setAngleValue > 0){azipod_3.inputAngleValue = 0;}

  if (gameP.axes[2] > 0 && azipod_2.setAngleValue < 0){
    azipod_2.inputAngleValue = 0;}
  else if (gameP.axes[2] == 0){azipod_2.inputAngleValue = azipod_2.setAngleValue;}
  else if (azipod_2.setAngleValue > -180) {azipod_2.inputAngleValue = -180;}

  if(gameP.buttons[8].value != 0){
    sys_main.sysStat = false;
    // SysControl.publish(new ROSLIB.Message(
    //   sys_mes(objList)      
    // ));
  }
  if(gameP.buttons[9].value != 0){
    sys_main.sysStat = true;
    // SysControl.publish(new ROSLIB.Message(
    //   sys_mes(objList)
    // ));
  }
}

// function gameLoop() {
//   if (controllerIndex !== null && JoyById.querySelector('.joy_stat').checked) {
//     const gamepad = navigator.getGamepads()[controllerIndex];
//     // handleButtons(gamepad.buttons);
//     // handleSticks(gamepad.axes);
//     // handleRumble(gamepad);    
//     gameList(gamepad.axes, gamepad.buttons);
//     joy_teleop(gamepad);
//     if (contrTimer < 12){
//       contrTimer = 0;
//       elementsParam.publish(new ROSLIB.Message(
//         stat_mes(objList)      
//       ));
//       SysControl.publish(new ROSLIB.Message(
//         sys_mes(objList)
//       ));
//     }
//     else{
//       contrTimer++;
//     }
//   }
//   requestAnimationFrame(gameLoop);
// }
// gameLoop();

let sys_main = new System(0);

let rudder_1 = new Rudder(1);
let rudder_2 = new Rudder(2);

let deadwood_1 = new Deadwood(3);
let deadwood_2 = new Deadwood(4);
let deadwood_3 = new Deadwood(5);

let azipod_1 = new Azipod(6);
let azipod_2 = new Azipod(7);
let azipod_3 = new Azipod(8);

let objList = {
  sys: sys_main,
  rud_1: rudder_1,
  rud_2 : rudder_2,
  dead_1 : deadwood_1,
  dead_2 : deadwood_2,
  dead_3 : deadwood_3,
  azi_1 : azipod_1,
  azi_2 : azipod_2,
  azi_3 : azipod_3,
};

// var  ws_url = 'ws://192.168.0.106:9090';
// var  ws_url = 'ws://45.10.1.1:9090';
var  ws_url = 'ws://0.0.0.0:9090';


//  ######  ROS Activation  ######  

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


// ######  Publisher  ######  

var SysControl = new ROSLIB.Topic({
  ros : ros,
  name : '/sys_status',
  messageType : 'std_msgs/Int16MultiArray'
  });

var FileName = new ROSLIB.Topic({
  ros : ros,
  name : '/log_file_name',
  messageType : 'std_msgs/String'
  });

var objsStatus = new ROSLIB.Topic({
  ros : ros,
  name : '/elements_activation_status',
  messageType : 'std_msgs/Int16MultiArray'
});

var windStatus = new ROSLIB.Topic({
  ros : ros,
  name : '/wind_activation_status',
  messageType : 'std_msgs/Int16MultiArray'
});

var elementsParam = new ROSLIB.Topic({
  ros : ros,
  name : '/set_elements_param',
  messageType : 'std_msgs/Int16MultiArray'
});

var pidParam = new ROSLIB.Topic({
  ros : ros,
  name : '/pid_param',
  messageType : 'std_msgs/Float32MultiArray'
})

var StepsCalibration = new ROSLIB.Topic({
  ros : ros,
  name : '/steps_calibration',
  messageType : 'std_msgs/Int16MultiArray'
});

var CalibAngle = new ROSLIB.Topic({
  ros : ros,
  name : '/calib_angle_param',
  messageType : 'std_msgs/Int16'
});

//  ######  Subscriber  ######  

var firstArduino = new ROSLIB.Topic(
  {
  ros : ros,
  name : '/deadwoods_rudders',
  messageType : 'std_msgs/Int16MultiArray'
  });

var secondArduino = new ROSLIB.Topic(
  {
  ros : ros,
  name : '/azipods',
  messageType : 'std_msgs/Int16MultiArray'
  });

var arduinoPid = new ROSLIB.Topic(
  {
  ros : ros,
  name : '/azipods_pid',
  messageType : 'std_msgs/Float32MultiArray'
  });

firstArduino.subscribe(function(message) {
  // console.log('Real angle: ' + realAngle.name + ': ' + message.data[0]);
  document.getElementById(rudder_1.id).querySelector('.real_value').innerHTML = message.data[0];
  rudder_1.duck.value = message.data[0];

  document.getElementById(rudder_2.id).querySelector('.real_value').innerHTML = message.data[1];
  rudder_2.duck.value = message.data[1];

  document.getElementById(deadwood_1.id).querySelector('.real_value').innerHTML = message.data[2];
  document.getElementById(deadwood_1.id).querySelector('#moment').innerHTML = message.data[3];
  // document.getElementById(deadwood_1.id).querySelector('#force').innerHTML = message.data[4];

  document.getElementById(deadwood_2.id).querySelector('.real_value').innerHTML = message.data[4];
  document.getElementById(deadwood_2.id).querySelector('#moment').innerHTML = message.data[5];
  // document.getElementById(deadwood_2.id).querySelector('#force').innerHTML = message.data[7];

  document.getElementById(deadwood_3.id).querySelector('.real_value').innerHTML = message.data[6];
  document.getElementById(deadwood_3.id).querySelector('#moment').innerHTML = message.data[7];
  // document.getElementById(deadwood_3.id).querySelector('#force').innerHTML = message.data[7];
    // if (message.data[0] > inputVal){
    //   rubberID_1.querySelector('.real_value').style.backgroundColor = 'blue';
    // } else if (message.data[0] < inputVal){
    //   rubberID_1.querySelector('.real_value').style.backgroundColor = 'red';
    // } else{
    //   rubberID_1.querySelector('.real_value').style.backgroundColor = 'green';
    // }
});

secondArduino.subscribe(function(message) {
  document.getElementById(azipod_1.id).querySelector('#real_angle').innerHTML = message.data[0];
  // azipod_1.duck.value = message.data[0];

  document.getElementById(azipod_1.id).querySelector('#real_rpm').innerHTML = message.data[1];
  document.getElementById(azipod_1.id).querySelector('#moment').innerHTML = message.data[2];
  // document.getElementById(azipod_1.id).querySelector('#force').innerHTML = message.data[3];

  document.getElementById(azipod_2.id).querySelector('#real_angle').innerHTML = message.data[3];
  azipod_2.setAngleValue = message.data[3];
  // azipod_2.duck.value = message.data[3];

  document.getElementById(azipod_2.id).querySelector('#real_rpm').innerHTML = message.data[4];
  document.getElementById(azipod_2.id).querySelector('#moment').innerHTML = message.data[5];
  // document.getElementById(azipod_2.id).querySelector('#force').innerHTML = message.data[7];

  document.getElementById(azipod_3.id).querySelector('#real_angle').innerHTML = message.data[6];
  azipod_3.setAngleValue = message.data[6];
  // azipod_3.duck.value = message.data[6];

  document.getElementById(azipod_3.id).querySelector('#real_rpm').innerHTML = message.data[7];
  document.getElementById(azipod_3.id).querySelector('#moment').innerHTML = message.data[8];
  // document.getElementById(azipod_3.id).querySelector('#force').innerHTML = message.data[11];  
});



let timerId1 = setInterval(() => angle_timer(), 500);

function angle_timer (){
  azipod_1.duck.value = document.getElementById(azipod_1.id).querySelector('#real_angle').innerHTML;
  azipod_2.duck.value = document.getElementById(azipod_2.id).querySelector('#real_angle').innerHTML;
  azipod_3.duck.value = document.getElementById(azipod_3.id).querySelector('#real_angle').innerHTML;

  rudder_1.duck.value = document.getElementById(rudder_1.id).querySelector('.real_value').innerHTML;
  rudder_2.duck.value = document.getElementById(rudder_2.id).querySelector('.real_value').innerHTML;
}

// secondArduino_pid.subscribe(function() {
//   none;
// })


var force_azipod_1 = new ROSLIB.Topic({
  ros : ros,
  name : '/force_azipod_1',
  messageType : 'std_msgs/Float32'
});

var force_azipod_2 = new ROSLIB.Topic({
  ros : ros,
  name : '/force_azipod_2',
  messageType : 'std_msgs/Float32'
});

var force_azipod_3 = new ROSLIB.Topic({
  ros : ros,
  name : '/force_azipod_3',
  messageType : 'std_msgs/Float32'
});

var force_deadwood_1 = new ROSLIB.Topic({
  ros : ros,
  name : '/force_deadwood_1',
  messageType : 'std_msgs/Float32'
});

var force_deadwood_2 = new ROSLIB.Topic({
  ros : ros,
  name : '/force_deadwood_2',
  messageType : 'std_msgs/Float32'
});

var force_deadwood_3 = new ROSLIB.Topic({
  ros : ros,
  name : '/force_deadwood_3',
  messageType : 'std_msgs/Float32'
});

force_azipod_1.subscribe(function(message) {
  document.getElementById(azipod_1.id).querySelector('#force').innerHTML = message.data.toFixed(2);
});

force_azipod_2.subscribe(function(message) {
  document.getElementById(azipod_2.id).querySelector('#force').innerHTML = message.data.toFixed(2);
});

force_azipod_3.subscribe(function(message) {
  document.getElementById(azipod_3.id).querySelector('#force').innerHTML = message.data.toFixed(2);
});

force_deadwood_1.subscribe(function(message) {
  document.getElementById(deadwood_1.id).querySelector('#force').innerHTML = message.data.toFixed(2);
});

force_deadwood_2.subscribe(function(message) {
  document.getElementById(deadwood_2.id).querySelector('#force').innerHTML = message.data.toFixed(2);
});

force_deadwood_3.subscribe(function(message) {
  document.getElementById(deadwood_3.id).querySelector('#force').innerHTML = message.data.toFixed(2);
});

let objSteps = [0, 0, 0, 0, 0];

let topicList = {
  wind : windStatus,
  obj: objsStatus,
  elemStat: elementsParam,
  sysCon: SysControl,
  sysFile: FileName,
  calibSteps: StepsCalibration,
  calibAng: CalibAngle,
  pidSend: pidParam,
}

SystemBlock(sys_main, objList , topicList, objSteps);

RudderButtons(rudder_1, objList , topicList, 1);
RudderButtons(rudder_2, objList , topicList, 2);

DeadwoodButtons(deadwood_1, objList , topicList);
DeadwoodButtons(deadwood_2, objList , topicList);
DeadwoodButtons(deadwood_3, objList , topicList);

AzipodButtons(azipod_1, objList , topicList, 3);
AzipodButtons(azipod_2, objList , topicList, 4);
AzipodButtons(azipod_3, objList , topicList, 5);

// var fs = require('fs');
// var files = fs.readdirSync('./');
// console.log(files);


