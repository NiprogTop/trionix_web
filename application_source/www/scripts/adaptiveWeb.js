//const selectCurRobotType = document.getElementById("selectCurRobotType");
const selectScreen = document.getElementById("screenSelector");

const robot_t = {
    trionix: "trionix",
    guppy: "guppy",
    bag: "bag",
};
const allRobotArray = Object.values(robot_t);

const dependsOnRobotType = {
    "control_select": allRobotArray,
    "mission_select": [robot_t.guppy],
    "settings_select": allRobotArray,
    "map_select": allRobotArray,
    "config_select": allRobotArray,
};

const screenButtonPairs = {
    "control_screen": ["control_select"],
    "map_screen": ["map_select"],
    "config_screen": ["config_select"],
    "settings_screen": ["settings_select"],
};

function reDisplayELements(dictElement, targetElement) {
    for (let elementId in dictElement) {
        let curElement = document.getElementById(elementId);

        if (curElement == undefined) {
            console.error(`elementId "${elementId}" is undefined, but it should not be undefined.`)
            continue;
        }

        curElement.style.display = dictElement[elementId].includes(targetElement) ? "block" : "none";
    }
}

reDisplayELements(dependsOnRobotType, robot_t.trionix);
reDisplayELements(screenButtonPairs, "control_select");

/*selectCurRobotType.addEventListener("change", () => {
    reDisplayELements(elementsForChange, selectCurRobotType.value);
});*/

selectScreen.addEventListener("click", (event) => {
    reDisplayELements(screenButtonPairs, event.target.id);
    document.getElementById("hamburger_toggle").checked = false;
});