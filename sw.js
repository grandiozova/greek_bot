/* Service worker: приложение открывается без сети.
 *
 * Стратегии:
 *   навигация      — сеть, при неудаче кэш (обновление доходит сразу, офлайн работает)
 *   свои файлы     — кэш, параллельно обновляем (мгновенно и не устаревает)
 *   шрифты Google  — кэш, при промахе сеть (они версионированы в URL)
 *
 * ВАЖНО: подняв CACHE_VERSION, вы гарантированно раздаёте новую версию —
 * старые кэши удаляются в activate.
 */
const CACHE_VERSION = 'greek-v2';
const CORE_CACHE = CACHE_VERSION + '-core';
const FONT_CACHE = CACHE_VERSION + '-fonts';

// Всё, что нужно для холодного старта без сети.
const CORE_ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CORE_CACHE)
            // addAll — всё или ничего; один недоступный файл не должен рушить установку
            .then(cache => Promise.all(CORE_ASSETS.map(url =>
                cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
            )))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CORE_CACHE && k !== FONT_CACHE).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// Кладём в кэш только полноценные ответы: ошибку или редирект кэшировать нельзя.
function isCacheable(response) {
    return response && response.status === 200 && response.type !== 'error';
}

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // --- переходы: сеть вперёд, кэш как страховка ---
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (isCacheable(response)) {
                        const copy = response.clone();
                        caches.open(CORE_CACHE).then(c => c.put('./index.html', copy));
                    }
                    return response;
                })
                .catch(() => caches.match('./index.html', { ignoreSearch: true })
                    .then(hit => hit || caches.match('./')))
        );
        return;
    }

    // --- шрифты: кэш вперёд (URL уже содержит версию) ---
    if (FONT_HOSTS.indexOf(url.hostname) !== -1) {
        event.respondWith(
            caches.match(request).then(hit => hit || fetch(request).then(response => {
                // у шрифтов ответ opaque (status 0) — его тоже кладём, иначе офлайна нет
                if (response && (response.status === 200 || response.type === 'opaque')) {
                    const copy = response.clone();
                    caches.open(FONT_CACHE).then(c => c.put(request, copy));
                }
                return response;
            }).catch(() => hit))
        );
        return;
    }

    // --- свои файлы: кэш вперёд, обновление в фоне ---
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.match(request).then(hit => {
                const network = fetch(request).then(response => {
                    if (isCacheable(response)) {
                        const copy = response.clone();
                        caches.open(CORE_CACHE).then(c => c.put(request, copy));
                    }
                    return response;
                }).catch(() => hit);
                return hit || network;
            })
        );
    }
});
