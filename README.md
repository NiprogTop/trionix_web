Данная версия `trionix_web` ориентирована на desktop платформы.<br />
Переосмысление архитерктуры приложения.

Данный репозиторий показывает как создать свое приложение с помощью Electron на базе WEB.

# Как запустить программу / собрать конечную версию.
Команды описаны в файле `package.json`. Для их использования нужно в командной строке написать:
```schell
npm run <тут команда>
```
Автодополнение команды с помощью `Tab` **работает**.

# Как собрать приложение в первый раз
## Одна команда
```schell
npm install package.json && sudo npm install -g n && sudo n lts && sudo n latest && npm install electron-packager && sudo apt install wine64 wine32 wine
```
## Разбор команды
1. Находясь в директории инициализировать его:
```schell
npm install package.json
```
2. Обносить Electron:
```schell
sudo npm install -g n && sudo n lts && sudo n latest
```
3. Установить собиратель приложений:
```schell
npm install electron-packager
```
4. Для сборки `windows` приложения из под `linux` требуется установить:
```schell
sudo apt install wine64 wine32 wine
```