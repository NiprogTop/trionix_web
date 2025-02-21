const mapElement = document.getElementById("map");
const mapProviderSelect = document.getElementById("mapProvider");
const deleteAllDBButton = document.getElementById("deleteAllDBButton");
const latInput = document.getElementById("latInput");
const lngInput = document.getElementById("lngInput");
const setCoordsButton = document.getElementById("setCoords");
const coordinateDisplay = document.getElementById("curCoords");
const loadGeoJSONButton = document.getElementById("loadGeoJSON");
const uploadGeoJSONButton = document.getElementById("uploadGeoJSON");
var markerTypeSelector = document.getElementById("markerTypeSelector");

const markersIconSettings = {
    regular: {
        iconUrl: "/leaflet_components/images/marker-icon-regular.png",
        shadowUrl: "/leaflet_components/images/marker-shadow-visible.png",
        iconAnchor: [12, 41]
    },
    home: {
        iconUrl: "/leaflet_components/images/marker-icon-home.png",
        shadowUrl: "/leaflet_components/images/marker-shadow-visible.png",
        iconAnchor: [12, 41]
    }
};

L.Marker.prototype.options.icon.iconUrl = "/leaflet_components/images/marker-crosshair.png";

let map;
let currentProvider = localStorage.getItem("lastSelectedMapProvider") || "osm";
mapProviderSelect.value = currentProvider;

var drawnItems = new L.geoJSON(JSON.parse(localStorage.getItem("GeoJsonLayer")), { pointToLayer: castomMarkerHandler }) || new L.FeatureGroup();
var leaflet_control_draw_settings = {
    edit: {
        featureGroup: drawnItems,
        poly: {
            allowIntersection: true
        }
    },
    draw: {
        polyline: {
            shapeOptions: {
                color: "red",
                opacity: 0.7,
                weight: 4
            }
        },
        polygon: {
            allowIntersection: false,
            showArea: true,
            drawError: {
                color: "orange",
                timeout: 1000
            },
            shapeOptions: {
                color: "black",
                opacity: 0.7,
                fillColor: "green",
                fillOpacity: 0.5,
                weight: 2
            }
        },
        circle: false,
        circlemarker: false,
        rectangle: false,
        marker: true
    }
};

const providers = {
    osm: {
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "<a href=\"http://osm.org/copyright\">OpenStreetMap</a>",
        dbName: "osm_map",
        storeName: "Tiles",
        dbVersion: 1,
        crs: L.CRS.EPSG3857
    },
    google: {
        url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        attribution: "<a href=\"https://about.google/brand-resource-center/products-and-services/geo-guidelines/#required-attribution\">Google maps</a>",
        dbName: "google_map",
        storeName: "Tiles",
        dbVersion: 1,
        crs: L.CRS.EPSG3857
    },
    yandex: {
        url: "https://core-sat.maps.yandex.net/tiles?l=sat&v=3.1025.0&x={x}&y={y}&z={z}&scale=1&lang=ru_RU",
        attribution: "<a href=\"https://yandex.ru/legal/maps_mobile_agreement/\">Яндекс карты</a>",
        dbName: "yandex_map",
        storeName: "Tiles",
        dbVersion: 1,
        crs: L.CRS.EPSG3395
    }
};

function openIndexedDB(dbName, storeName, dbVersion) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        // Обработчик события при создании новой версии базы данных
        request.onupgradeneeded = event => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: ["x", "y", "z"] });
            }
        };

        // Обработчик успешного открытия базы данных
        request.onsuccess = event => resolve(event.target.result);

        // Обработчик ошибки при открытии базы данных
        request.onerror = event => reject(event.target.errorCode);
    });
}

async function blobToString(blob) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(blob);

        reader.onload = function () {
            console.log("blobToString:", reader.result);
            resolve(reader.result);
        };

        reader.onerror = function (error) {
            reject(error);
        };
    });
}

async function stringToBlob(str) {
    // Разделение строки на части
    const parts = str.split(",");
    const contentType = parts[0].split(":")[1]; // Извлекаем тип содержимого
    const base64Data = parts[1]; // Извлекаем Base64-данные

    // Декодирование Base64 в массив байт
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    // Преобразование массива чисел в Uint8Array
    const byteArray = new Uint8Array(byteNumbers);

    // Создание нового Blob
    const blob = new Blob([byteArray], { type: contentType });

    console.log("stringToBlob:", blob);
    return blob;
}

async function fetchAndSaveTile(url, x, y, z, db, storeName) {
    try {
        url = url.replace("{x}", x).replace("{y}", y).replace("{z}", z);
        console.log("url:", url);

        // Загружаем тайл по URL
        const response = await fetch(url);
        console.log("response:", response);

        if (!response.ok) {
            console.log(`Failed to fetch tile from ${url}: ${response.statusText}`);
            return;
        }

        var blob = await response.blob();
        console.log("blob:", blob);

        var strBlob = await blobToString(blob);

        var record = { x, y, z, data: strBlob };
        console.log("record:", record);
        await db.transaction([storeName], "readwrite").objectStore(storeName).put(record);

        console.log(`Saved tile ${x},${y},${z} to the database.`);
    } catch (err) {
        console.error(err);
    }
}

async function getTileFromDatabaseOrFetch(url, x, y, z, dbName, storeName, dbVersion) {
    try {
        const db = await openIndexedDB(dbName, storeName, dbVersion);
        const tileKey = [x, y, z];

        // Сначала пытаемся получить тайл из базы данных
        const request = db.transaction([storeName], "readonly").objectStore(storeName).get(tileKey);

        const result = await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result?.data); // Возвращаем данные, если они найдены
            request.onerror = () => reject(new Error(`Could not find or load tile ${x},${y},${z}.`));
        });

        if (result) {
            console.log(`Found tile ${x},${y},${z} in the database.`);
            return await stringToBlob(result); // Если нашли в базе данных, сразу возвращаем
        }

        // Если тайл не найден в базе данных, загружаем его и сохраняем
        await fetchAndSaveTile(url, x, y, z, db, storeName);

        // Теперь снова пробуем получить тайл из базы данных
        const newRequest = db.transaction([storeName], "readonly").objectStore(storeName).get(tileKey);

        const updatedResult = await new Promise((resolve, reject) => {
            newRequest.onsuccess = () => resolve(newRequest.result.data);
            newRequest.onerror = () => reject(new Error(`Could not find or load tile ${x},${y},${z}.`));
        });

        console.log(`Loaded tile ${x},${y},${z} from network and saved to database.`);
        return await stringToBlob(updatedResult);

    } catch (err) {
        console.error(err);
    }
}

class OfflineTileLayer extends L.TileLayer {
    constructor(options) {
        super(null, options);
    }

    createTile(coords, done) {
        const tile = document.createElement("img");
        tile.alt = "";

        async function load() {
            try {
                const blob = await getTileFromDatabaseOrFetch(
                    providers[currentProvider].url,
                    coords.x,
                    coords.y,
                    coords.z,
                    providers[currentProvider].dbName,
                    providers[currentProvider].storeName,
                    providers[currentProvider].dbVersion);

                if (blob) {
                    const url = URL.createObjectURL(blob);
                    tile.src = url;
                    done(null, tile);
                } else {
                    done(new Error("Tile could not be loaded."));
                }
            } catch (err) {
                done(err);
            }
        }

        load().then(() => {
            console.log("tile", tile);
        });

        return tile;
    }
}

// Инициализация карты
function initMap() {
    // Получение сохраненных координат из localStorage
    const savedLat = localStorage.getItem("mapLat");
    const savedLng = localStorage.getItem("mapLng");
    const savedZoom = localStorage.getItem("mapZoom");

    map = L.map(mapElement, { crs: providers[currentProvider].crs }).setView([savedLat || 60, savedLng || 30], savedZoom || 10);

    // Убираем флаг
    map.attributionControl.setPrefix("<a href=\"https://leafletjs.com\" title=\"A JavaScript library for interactive maps\">Leaflet</a>");

    new OfflineTileLayer({ attribution: providers[currentProvider].attribution }).addTo(map);

    // Добавляем панель для создания geojson и применяем к нему стили
    map.addLayer(drawnItems).eachLayer((layer) => {
        console.log(layer);
        if (layer instanceof L.Polygon) {
            layer.setStyle(leaflet_control_draw_settings.draw.polygon.shapeOptions);
        } else if (layer instanceof L.Polyline) {
            layer.setStyle(leaflet_control_draw_settings.draw.polyline.shapeOptions);
            layer.arrowheads({ frequency: "allvertices", size: "50px"});
        }
    });
    var drawControl = new L.Control.Draw(leaflet_control_draw_settings);
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (event) {
        var layer = event.layer;

        if (layer instanceof L.Marker) {
            layer.feature = {
                type: "Feature",
                properties: {
                    markerType: markerTypeSelector.value
                },
                geometry: {
                    type: "Point",
                    coordinates: [layer.getLatLng().lng, layer.getLatLng().lat]
                }
            };

            layer.setIcon(new L.Icon(markersIconSettings[layer.feature.properties.markerType || "regular"]));
            layer.bindPopup(`<b>markerType:</b> ${layer.feature.properties.markerType}<br /><b>lat:</b> ${layer.getLatLng().lat}<br /><b>lng:</b> ${layer.getLatLng().lng}`);

            console.log(layer);
        }

        // Рисуем стрелочки для ломаных
        if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
            layer.arrowheads({ frequency: "allvertices", size: "50px"});
        }

        drawnItems.addLayer(layer);

        localStorage.setItem("GeoJsonLayer", JSON.stringify(drawnItems.toGeoJSON()));
    });

    map.on(L.Draw.Event.EDITMOVE, function (event) {
        var layer = event.layer;

        if (layer instanceof L.Marker) {
            layer.bindPopup(`<b>markerType:</b> ${layer.feature.properties.markerType}<br /><b>lat:</b> ${layer.getLatLng().lat}<br /><b>lng:</b> ${layer.getLatLng().lng}`);
        }
    });

    map.on(L.Draw.Event.EDITED, function (event) {
        localStorage.setItem("GeoJsonLayer", JSON.stringify(drawnItems.toGeoJSON()));
    });

    map.on(L.Draw.Event.DELETED, function (event) {
        localStorage.setItem("GeoJsonLayer", JSON.stringify(drawnItems.toGeoJSON()));
    });

    map.on("moveend", () => {
        const center = map.getCenter();

        localStorage.setItem("mapLat", center.lat);
        localStorage.setItem("mapLng", center.lng);
        localStorage.setItem("mapZoom", map.getZoom());

        displayCurrentCoordinates();
    });

    map.on(L.Draw.Event.DRAWSTART, function (event) {
        if (event.layerType === "marker") {
            // Не разрешаем выходить из режима редактирования при выборе типа маркера
            markerTypeSelector.addEventListener("click", function (e) {
                e.stopPropagation();
            });

            // Добавляем селектор при выборе маркера
            mapElement.getElementsByClassName("leaflet-control-container")[0]
                .getElementsByClassName("leaflet-draw-section")[0]
                .getElementsByClassName("leaflet-draw-actions leaflet-draw-actions-bottom")[0]
                .appendChild(markerTypeSelector);
            
            markerTypeSelector.style.display = "inline";
        }
    });
}

// Установка координат из полей ввода
setCoordsButton.addEventListener("click", () => {
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng]);
    } else {
        alert("Пожалуйста, введите корректные координаты.");
    }
});

// Обработчик изменения источника карт
mapProviderSelect.addEventListener("change", (event) => {
    currentProvider = event.target.value;

    localStorage.setItem("lastSelectedMapProvider", currentProvider);

    map.remove();
    initMap();
    displayCurrentCoordinates();
});

// Инициализация карты при загрузке
document.addEventListener("DOMContentLoaded", () => { initMap(); displayCurrentCoordinates(); });

async function deleteAllIndexDB() {
    const dbs = await window.indexedDB.databases();
    dbs.forEach(db => { window.indexedDB.deleteDatabase(db.name) });
}

// Очистка всех тайлов из IndexedDB
deleteAllDBButton.addEventListener("click", () => {
    deleteAllIndexDB();
});

function displayCurrentCoordinates() {
    const center = map.getCenter();
    coordinateDisplay.innerHTML = "Текущие координаты: lat:{lat}; lng:{lng}; zoom:{zoom}".replace("{lat}", center.lat).replace("{lng}", center.lng).replace("{zoom}", map.getZoom());
}

function downloadAsFile(filename, text) {
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

uploadGeoJSON.addEventListener("click", () => {
    downloadAsFile("route.geojson", localStorage.getItem("GeoJsonLayer"));
});

loadGeoJSONButton.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".geojson";

    input.addEventListener("change", () => {
        const file = input.files[0]; // Получаем первый выбранный файл

        if (!file.name.endsWith(".geojson")) {
            alert("Файл должен иметь расширение .geojson");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            try {
                console.log("load from file:", event.target.result);
                localStorage.setItem("GeoJsonLayer", event.target.result);

                drawnItems = new L.geoJSON(JSON.parse(localStorage.getItem("GeoJsonLayer")), { pointToLayer: castomMarkerHandler }) || new L.FeatureGroup();

                map.remove();
                initMap();
                displayCurrentCoordinates();
            } catch (error) {
                alert("Ошибка при чтении файла: " + error.message);
            }
        };

        reader.readAsText(file);
    });

    input.click(); // Открываем диалог выбора файла
});

// Функция для обработки каждого маркера при десериализации GeoJSON
function castomMarkerHandler(feature, latlng) {
    var marker = new L.Marker(latlng, { icon: new L.Icon(markersIconSettings[feature.properties.markerType || "regular"]) });

    marker.bindPopup(`<b>markerType:</b> ${feature.properties.markerType}<br /><b>lat:</b> ${latlng.lat}<br /><b>lng:</b> ${latlng.lng}`);

    return marker;
}

// Сохранил на будущее, вдруг пригодится
// Переопределяем метод toGeoJSON для добавления дополнительной информации
/*L.LayerGroup.include({
    toGeoJSON: function () {
        var layers = [];

        // Проходимся по каждому слою в группе
        this.eachLayer((layer) => {
            let feature;

            console.log("(toGeoJson) layer:", layer);

            if (layer instanceof L.Marker) {
                const latlng = layer.getLatLng();

                feature = {
                    type: "Feature",
                    properties: {
                        markerType: layer.properties.markerType || "undefined"
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [latlng.lng, latlng.lat]
                    }
                };
            }
            else {
                feature = layer.toGeoJSON();
            }

            layers.push(feature);
        });

        return {
            type: "FeatureCollection",
            features: layers
        };
    }
});*/