// ==UserScript==
// @name         Filmix AdBlock v2
// @name:uk      Filmix AdBlock v2
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Точкове блокування всієї реклами на filmix.my
// @author       Ant1gon (фінальна версія)
// @match        *://filmix.my/*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // ==================== КОНФІГУРАЦІЯ ====================
    // ⚠️ Додавайте нові рекламні домени сюди
    const adDomains = [
        // Попередні домени
        'kxcdn.com',
        'nogravity4.click',
        'franecki.net',
        'reichelcormier.bid',
        'bashirian.biz',
        'adstag0102.xyz',
        'pjstat.com',           // v2.pjstat.com, v3.pjstat.com, v5.pjstat.com
        'plrjs.org',            // v2.plrjs.org
        'ad2the.net',
        'servetraff.com',
        'cdn.servetraff.com',
        'kingads.digital',      // s.ads.kingads.digital
        'doubleclick.net',      // ad.doubleclick.net
        'google-analytics.com', // www.google-analytics.com
        'get2.fun',
        'adpod.in',             // track.adpod.in (НОВИЙ)
        'srv224.com',           // НОВИЙ - основний домен
        'cdn77.srv224.com',     // НОВИЙ - CDN для рекламних відео

        // Додаткові варіанти для підстраховки
        'kx1cdn.com',           // 6421-c73e.kx1cdn.com
        'plrjs.org',
        'pjstat.com'
    ];

    // Дозволені домени (щоб не зламати плеєр)
    const allowedDomains = [
        'filmix.my',           // Основний сайт
        'youtube.com',         // Можливі вбудовані трейлери
        'vimeo.com',           // Можливі вбудовані трейлери
        'googleapis.com'       // Для YouTube
    ];

    // ==================== ДОПОМІЖНІ ФУНКЦІЇ ====================
    function isAdUrl(url) {
        if (!url || typeof url !== 'string') return false;

        // Перевіряємо чи це не дозволений домен
        const urlLower = url.toLowerCase();
        for (let allowed of allowedDomains) {
            if (urlLower.includes(allowed)) return false;
        }

        // Перевіряємо чи це рекламний домен
        for (let domain of adDomains) {
            if (urlLower.includes(domain)) {
                console.log('🔴 Знайдено рекламу:', domain, 'в', url.substring(0, 100));
                return true;
            }
        }
        return false;
    }

    // ==================== БЛОКУВАННЯ МЕРЕЖЕВИХ ЗАПИТІВ ====================

    // 1. Блокування fetch
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (isAdUrl(url)) {
            console.log('🟡 Блоковано fetch:', url.substring(0, 100));
            return new Promise(() => {}); // Зависаючий проміс
        }
        return originalFetch.apply(this, args);
    };

    // 2. Блокування XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (isAdUrl(url)) {
            console.log('🟡 Блоковано XHR:', url.substring(0, 100));
            url = 'about:blank';
        }
        return originalXHROpen.call(this, method, url, ...rest);
    };

    // 3. Блокування WebSocket
    const originalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        if (isAdUrl(url)) {
            console.log('🟡 Блоковано WebSocket');
            return {};
        }
        return new originalWebSocket(url, protocols);
    };

    // 4. Блокування створення елементів з рекламними src
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName, options) {
        const element = originalCreateElement.call(document, tagName, options);

        const originalSetAttribute = element.setAttribute;
        element.setAttribute = function(name, value) {
            if (name === 'src' && isAdUrl(value)) {
                console.log('🟡 Блоковано встановлення src для', tagName);
                value = 'about:blank';
            }
            return originalSetAttribute.call(this, name, value);
        };

        return element;
    };

    // ==================== ОЧИЩЕННЯ DOM ====================

    function removeAds() {
        const adSelectors = [
            // Iframe з рекламних доменів
            'iframe[src*="kxcdn"]',
            'iframe[src*="pjstat"]',
            'iframe[src*="plrjs"]',
            'iframe[src*="ad2the"]',
            'iframe[src*="servetraff"]',
            'iframe[src*="kingads"]',
            'iframe[src*="doubleclick"]',
            'iframe[src*="get2.fun"]',
            'iframe[src*="adpod.in"]',           // НОВИЙ
            'iframe[src*="srv224.com"]',          // НОВИЙ
            'iframe[src*="cdn77.srv224.com"]',    // НОВИЙ

            // Скрипти з рекламних доменів
            'script[src*="kxcdn"]',
            'script[src*="pjstat"]',
            'script[src*="plrjs"]',
            'script[src*="ad2the"]',
            'script[src*="servetraff"]',
            'script[src*="kingads"]',
            'script[src*="doubleclick"]',
            'script[src*="srv224.com"]',          // НОВИЙ

            // Зображення-трекери
            'img[src*="pjstat"]',
            'img[src*="servetraff"]',
            'img[src*="doubleclick"]',
            'img[src*="franecki.net"]',
            'img[src*="srv224.com"]',             // НОВИЙ

            // Рекламні відео
            'video source[src*="kxcdn"]',
            'video source[src*="nogravity4"]',
            'video source[src*="adstag0102"]',
            'video source[src*="servetraff"]',
            'video source[src*="srv224.com"]',    // НОВИЙ
            'video source[src*="cdn77.srv224.com"]' // НОВИЙ
        ];

        document.querySelectorAll(adSelectors.join(',')).forEach(el => {
            // Захищаємо плеєр
            if (!el.closest('#player, .players, .video-player, .video-js')) {
                console.log('✅ Видалено:', el.tagName, el.src ? el.src.substring(0, 50) : '');
                el.remove();
            }
        });

        // Обережна обробка відео
        document.querySelectorAll('video').forEach(video => {
            // Не чіпаємо, якщо це основний плеєр Filmix
            if (video.closest('#player, .players')) return;

            const sources = video.querySelectorAll('source');
            sources.forEach(source => {
                if (source.src && isAdUrl(source.src)) {
                    console.log('✅ Видалено рекламне джерело відео');
                    source.remove();
                }
            });
        });
    }

    // ==================== БЛОКУВАННЯ НА РІВНІ МЕРЕЖІ ====================

    // Додатковий захист - перехоплення динамічного створення скриптів
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Елемент
                    // Перевіряємо script теги
                    if (node.tagName === 'SCRIPT' && node.src && isAdUrl(node.src)) {
                        console.log('✅ Видалено рекламний скрипт:', node.src);
                        node.remove();
                    }

                    // Перевіряємо iframe
                    if (node.tagName === 'IFRAME' && node.src && isAdUrl(node.src)) {
                        console.log('✅ Видалено рекламний iframe:', node.src);
                        node.remove();
                    }

                    // Перевіряємо img
                    if (node.tagName === 'IMG' && node.src && isAdUrl(node.src)) {
                        console.log('✅ Видалено рекламне зображення:', node.src);
                        node.remove();
                    }
                }
            });
        });
    });

    // ==================== ІНІЦІАЛІЗАЦІЯ ====================

    function init() {
        console.log('🎬 Filmix Upgrade: активовано захист від реклами v0.5');
        console.log('📋 Заблоковано доменів:', adDomains.length);
        console.log('📋 Список доменів:', adDomains);

        if (document.body) {
            removeAds();
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                removeAds();
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            });
        }

        // Періодичне очищення
        setInterval(removeAds, 2000);
    }

    init();

})();
