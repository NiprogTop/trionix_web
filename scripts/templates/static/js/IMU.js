window.onload = function () {

    let canvas = document.getElementById("drawingCanvas");
    let context = canvas.getContext("2d");
    
    let run = function () {
        drawAttitude(context, canvas, 320, 240, this.pitch, this.roll, 200);
    }

    let interval = setInterval(run, 1000 / 60);
};

var roll = 0
var pitch = 0

// setInterval(
//     () => {
// fetch('/angles').then(function(response) {
//     response.text().then(function(text) {
//       this.roll = Number(text.split(' ')[0])
//       this.pitch = Number(text.split(' ')[1])
//     });
//   });
//     },
//     50
// );

drawAttitude = function (ctx, canvas, centreX, centreY, pitch, roll, radius = 100) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //Проверка значений по ограничениям:
    if (pitch > 30) pitch = 30;
    if (pitch < -30) pitch = -30;

    if (roll > 45) roll = 45;
    if (roll < -45) roll = -45;
    //перевод в радианы:
    roll *= Math.PI / 180;
    pitch *= Math.PI / 180;
    //размер "макета" и шрифта:
    let vehicleSize = radius * 0.8;
    ctx.font = Math.round(radius / 8) + "px Arial";
    //корпус индикатора и заливка фона:
    ctx.lineWidth = 2;

    ctx.strokeStyle = "#9EFF00";
    // ctx.strokeStyle = "Black";
    // //нижний полукруг:
    // ctx.beginPath();
    // ctx.arc(centreX, centreY, radius, 0, Math.PI, false);
    // ctx.fillStyle = "Maroon";
    // ctx.stroke();
    // ctx.fill();
    // //верхний полукруг:
    // ctx.beginPath();
    // ctx.arc(centreX, centreY, radius, 0, Math.PI, true);
    // ctx.fillStyle = "SkyBlue";
    // ctx.stroke();
    // ctx.fill();
    //"макет":
    ctx.beginPath();
    //цвет:
    let topSideIsVisible = (pitch >= 0);
    // ctx.strokeStyle = topSideIsVisible ? "green" : "blue";
    // ctx.fillStyle = topSideIsVisible ?;
    ctx.lineWidth = 3;
    //контур
    //проходит через 4 точки, начиная с задней центральной против часовой стрелки,
    //если смотреть сверху:
    // ctx.moveTo(centreX, centreY - Math.sin(pitch) * vehicleSize / 2);
    ctx.moveTo(centreX + vehicleSize * Math.cos(roll), centreY + vehicleSize * Math.sin(roll) * Math.cos(pitch) - 1.5 * Math.sin(pitch) * vehicleSize);
    ctx.lineTo(centreX, centreY - 2 * Math.sin(pitch) * vehicleSize);
    ctx.lineTo(centreX - vehicleSize * Math.cos(roll), centreY - vehicleSize * Math.sin(roll) * Math.cos(pitch) - 1.5 * Math.sin(pitch) * vehicleSize);
    // ctx.lineTo(centreX, centreY - Math.sin(pitch) * vehicleSize / 2);
    ctx.stroke();
    //ctx.fill();
    //шкала тангажа:
    //верхняя часть:
    ctx.beginPath();
    // ctx.strokeStyle = "ffffff";
    //ctx.fillStyle = "ffffff";
    ctx.lineWidth = 1;
    //текст:
    // ctx.fillText(30, centreX - radius * 0.28, centreY - vehicleSize + radius / 20);
    // ctx.fillText(20, centreX - radius * 0.28, centreY - vehicleSize * 0.684 + radius / 20);
    // ctx.fillText(10, centreX - radius * 0.28, centreY - vehicleSize * 0.348 + radius / 20);
    //метки - линии:
    ctx.moveTo(centreX - 40 - radius / 10, centreY );
    ctx.lineTo(centreX - 40 + radius / 10, centreY );
    ctx.stroke();

    ctx.moveTo(centreX + 40 - radius / 10, centreY );
    ctx.lineTo(centreX + 40 + radius / 10, centreY );
    ctx.stroke();

    ctx.moveTo(centreX - radius / 20, centreY - vehicleSize);
    ctx.lineTo(centreX + radius / 20, centreY - vehicleSize);
    ctx.stroke();

    ctx.moveTo(centreX - radius / 15, centreY - vehicleSize * 0.684);
    ctx.lineTo(centreX + radius / 15, centreY - vehicleSize * 0.684);
    ctx.stroke();

    ctx.moveTo(centreX - radius / 10, centreY - vehicleSize * 0.348);
    ctx.lineTo(centreX + radius / 10, centreY - vehicleSize * 0.348);
    ctx.stroke();
    //нижняя часть:
    // ctx.beginPath();
    // ctx.strokeStyle = "White";
    //ctx.fillStyle = "White";
    //текст:
    // ctx.fillText(30, centreX - radius * 0.28, centreY + vehicleSize + radius / 20);
    // ctx.fillText(20, centreX - radius * 0.28, centreY + vehicleSize * 0.684 + radius / 20);
    // ctx.fillText(10, centreX - radius * 0.28, centreY + vehicleSize * 0.348 + radius / 20);
    //метки - линии:
    ctx.moveTo(centreX - radius / 20, centreY + vehicleSize);
    ctx.lineTo(centreX + radius / 20, centreY + vehicleSize);
    ctx.stroke();

    ctx.moveTo(centreX - radius / 15, centreY + vehicleSize * 0.684);
    ctx.lineTo(centreX + radius / 15, centreY + vehicleSize * 0.684);
    ctx.stroke();

    ctx.moveTo(centreX - radius / 10, centreY + vehicleSize * 0.348);
    ctx.lineTo(centreX + radius / 10, centreY + vehicleSize * 0.348);
    ctx.stroke();

    //шкала крена:
    ctx.lineWidth = 1;

    //+-15 градусов:
    // ctx.fillText(15, centreX + radius * 0.6, centreY + radius * 0.22);
    ctx.moveTo(centreX + 0.966 * 0.8 * radius, centreY + 0.259 * 0.8 * radius);
    ctx.lineTo(centreX + 0.966 * 0.95 * radius, centreY + 0.259 * 0.95 * radius);

    // ctx.fillText(15, centreX - radius * 0.75, centreY + radius * 0.22);
    ctx.moveTo(centreX - 0.966 * 0.8 * radius, centreY + 0.259 * 0.8 * radius);
    ctx.lineTo(centreX - 0.966 * 0.95 * radius, centreY + 0.259 * 0.95 * radius);

    //+-30 градусов:
    ctx.moveTo(centreX + 0.866 * 0.8 * radius, centreY + 0.5 * 0.8 * radius);
    ctx.lineTo(centreX + 0.866 * 0.95 * radius, centreY + 0.5 * 0.95 * radius);

    ctx.moveTo(centreX - 0.866 * 0.8 * radius, centreY + 0.5 * 0.8 * radius);
    ctx.lineTo(centreX - 0.866 * 0.95 * radius, centreY + 0.5 * 0.95 * radius);

    //+-45 градусов:
    ctx.moveTo(centreX + 0.707 * 0.8 * radius, centreY + 0.707 * 0.8 * radius);
    ctx.lineTo(centreX + 0.707 * 0.95 * radius, centreY + 0.707 * 0.95 * radius);

    ctx.moveTo(centreX - 0.707 * 0.8 * radius, centreY + 0.707 * 0.8 * radius);
    ctx.lineTo(centreX - 0.707 * 0.95 * radius, centreY + 0.707 * 0.95 * radius);
    ctx.stroke();
}