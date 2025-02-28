const buttonGetConfig = document.getElementById("getConfig");
const buttonSaveConfig = document.getElementById("saveConfig");

let robotUrl = "";

function tryGetRobotUrl() {
    let tempIP = localStorage.getItem("ipRobot");
    if (tempIP === undefined) {
        alert("Введите IP робота");
        throw new Error("Empty robot ip");
    }

    robotUrl = `http://${tempIP}:8899/`;
}

buttonGetConfig.addEventListener("click", async () => {
    tryGetRobotUrl();

    initEditor(JSON.parse(await getData(robotUrl, "get_schema")));

    if (!editorIsInstance()) {
        alert("Сначала загрузите схему");
        return;
    }

    editor.setValue(JSON.parse(await getData(robotUrl, "get_all_configs")));
});

buttonSaveConfig.addEventListener("click", async () => {
    tryGetRobotUrl();

    if (!editorIsInstance()) {
        alert("Сначала загрузите схему");
        return;
    }

    const validateResult = editor.validate();

    if (validateResult.length) {
        editor.showValidationErrors();
        console.log("validateResult:", validateResult);
        alert("Некоторые поля заполнены некорректно.");
        return;
    }

    await sendData(robotUrl, "post_config", JSON.stringify(editor.getValue()));
});