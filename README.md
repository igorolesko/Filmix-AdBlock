# Filmix-AdBlock
UserScript для блокування реклами на Filmix
# 🎬 Filmix Upgrade

![Version](https://img.shields.io/badge/version-0.5-blue)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Supported-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

**UserScript** для блокування реклами на сайті [filmix.my](https://filmix.my). Скрипт видаляє VAST-рекламу, трекери, банери та інші рекламні елементи, залишаючи тільки чистий плеєр.

## 📋 Зміст
- [Можливості](#-можливості)
- [Встановлення](#-встановлення)
- [Заблоковані домени](#-заблоковані-домени)
- [Як це працює](#-як-це-працює)
- [Оновлення](#-оновлення)
- [Внесок у розробку](#-внесок-у-розробку)
- [Ліцензія](#-ліцензія)

## ✨ Можливості

✓ **Повне блокування реклами** - VAST-реклама, банери, трекери, спливаючі вікна  
✓ **Захист плеєра** - не видаляє кнопки та елементи керування  
✓ **Точкове блокування** - працює тільки з рекламними доменами  
✓ **Автоматичне оновлення** - через GitHub (при змінах)  
✓ **Сумісність** - працює з Tampermonkey, Greasemonkey, Violentmonkey  

## 📥 Встановлення

### Спосіб 1: Пряме встановлення (найпростіший)
1. Встановіть розширення для браузера:
   - [Tampermonkey для Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Tampermonkey для Firefox](https://addons.mozilla.org/uk/firefox/addon/tampermonkey/)
   - [Violentmonkey (альтернатива)](https://violentmonkey.github.io/)

2. Відкрийте [пряме посилання на скрипт](https://raw.githubusercontent.com/ВАШ_ЛОГІН/filmix-upgrade/main/filmix-upgrade.user.js)

3. Натисніть **"Встановити"** у вікні Tampermonkey

### Спосіб 2: Ручне встановлення
1. Відкрийте Tampermonkey → **"Create a new script"**
2. Видаліть весь код за замовчуванням
3. Скопіюйте код з [`filmix-upgrade.user.js`](filmix-upgrade.user.js)
4. Вставте та натисніть `Ctrl+S` (зберегти)

## 🚫 Заблоковані домени

Скрипт блокує запити до наступних рекламних доменів:
kxcdn.com # VAST-реклама
nogravity4.click # Відеореклама
franecki.net # Трекінг
reichelcormier.bid # Трекінг
bashirian.biz # Трекінг
adstag0102.xyz # VAST-реклама
pjstat.com # Піксельні трекери (v2,v3,v5)
plrjs.org # XML-реклама
ad2the.net # Зображення-трекери
servetraff.com # Рекламні відео
cdn.servetraff.com # CDN для реклами
kingads.digital # Рекламні банери
doubleclick.net # Реклама Google
google-analytics.com # Аналітика
get2.fun # XHR-запити
adpod.in # Трекінг
srv224.com # Основний рекламний сервер
cdn77.srv224.com # CDN для рекламних відео
kx1cdn.com # Додатковий CDN


## 🔧 Як це працює

### Рівні блокування:

1. **Мережевий рівень** - перехоплює `fetch`, `XHR`, `WebSocket` запити
2. **DOM-рівень** - видаляє рекламні iframe, скрипти, зображення
3. **Спостереження** - `MutationObserver` відстежує появу нової реклами
4. **Захист плеєра** - перевіряє, чи елемент належить плеєру перед видаленням

### Ключові функції:

```javascript
- isAdUrl()           // Перевірка URL на рекламні домени
- removeAds()         // Видалення рекламних елементів з DOM
- перехоплення fetch  // Блокування запитів до рекламних серверів
- MutationObserver    // Відстеження нових елементів
