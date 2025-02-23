const { app, BrowserWindow, session } = require("electron/main");

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600
    });

    // Устанавливаем пользовательский агент для всей сессии
    session.defaultSession.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gecko/20100101 Firefox/89.0");

    // Перехватываем запросы и модифицируем заголовки
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        // Удаляем заголовки, чтобы замаскироваться под настоящий браузер
        delete details.requestHeaders["sec-ch-ua"];
        delete details.requestHeaders["sec-ch-ua-mobile"];
        delete details.requestHeaders["sec-ch-ua-platform"];
        delete details.requestHeaders["sec-fetch-dest"];
        delete details.requestHeaders["sec-fetch-mode"];
        delete details.requestHeaders["sec-fetch-site"];

        // Разрешаем все вхоядщие данные
        details.requestHeaders["Accept"] = "*/*";

        callback({ requestHeaders: details.requestHeaders });
    });

    win.loadFile("www/index.html");
};

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
