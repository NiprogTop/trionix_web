const configEditorELement = document.getElementById("configEditorForm");

var editor = null;

function editorIsInstance() {
    return editor !== null;
}

function destroyEditor() {
    editor.destroy();
}

function initEditor(newSchema) {
    if (editorIsInstance())
        destroyEditor();

    editor = new JSONEditor(configEditorELement,
        {
            theme: "spectre",
            iconlib: "spectre",
            disable_edit_json: true,
            disable_properties: true,
            show_errors: "always",
            schema: newSchema
        });
}
