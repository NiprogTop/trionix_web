const buttonSettingsLoad = document.getElementById("settings_load");
const buttonSettingsSave = document.getElementById("settings_save");

const pathToSettingsSchema = "schema/settings.schema.json";

async function loadShemaFile(schemUrl) {
    return JSON.stringify(await (await fetch(schemUrl)).json());
}

async function reInitSettingsForm(schemaUrl) {
    let schemaContent;

    try {
        schemaContent = await loadShemaFile(schemaUrl);
        initEditor(JSON.parse(schemaContent));

        if (!editorIsInstance())
            throw new Error();

    } catch {
        alert("Не удалось загрузить схему настроек");
        throw new Error(`Editor is not instance correctly.\nSchema file from "${schemaUrl || "[null]"}":\n${schemaContent || "[null]"}`);
    }
}

buttonSettingsLoad.addEventListener("click", async () => {
    await reInitSettingsForm(pathToSettingsSchema);
});

/*buttonSettingsSave.addEventListener("click", async () => {
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
});*/