const selectCurRobotType = document.getElementById("selectCurRobotType");

const robot_t = {
    trionix: "trionix",
    guppy: "guppy",
    bag: "bag"
};
const allRobotArray = Object.values(robot_t);

const elementsForChange = {
    "main_screen": [robot_t.trionix, robot_t.bag],
    "mission_screen": [robot_t.guppy],
    "settings_screen": allRobotArray,
    "photo_screen": allRobotArray.filter(type => ![robot_t.bag].includes(type)) // Для всех роботов, кроме "bag"
};

function reDisplayELements(dictElement, robotType) {
    for (var elementId in dictElement) {
        var curElement = document.getElementById(elementId);

        if (curElement == undefined) {
            console.error(`elementId '${elementId}' is undefined, but it should not be undefined.`)
            continue;
        }

        curElement.style.display = dictElement[elementId].includes(robotType) ? "block" : "none";
    }
}

reDisplayELements(elementsForChange, selectCurRobotType.value);

selectCurRobotType.addEventListener("change", () => {
    reDisplayELements(elementsForChange, selectCurRobotType.value);
});