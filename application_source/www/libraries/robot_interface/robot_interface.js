async function sendData(robotUrl, functionName, data) {
    try {
        const response = await fetch(robotUrl + functionName, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        console.log(`(sendData) (robotUrl: ${robotUrl}) (functionName: ${functionName}) (data: ${data})`, await response.json());
    } catch (error) {
        console.error("Ошибка при отправке данных:", error);
    }
}

async function getData(robotUrl, functionName) {
    try {
        const response = await fetch(robotUrl + functionName);
        console.log(response);
        const data = await response.json();
        console.log(`(getData) (robotUrl: ${robotUrl}) (functionName: ${functionName})`, data);
        return data;
    } catch (error) {
        console.error("Ошибка при получении данных:", error);
    }
}