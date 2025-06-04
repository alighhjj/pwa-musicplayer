const CACHE_NAME = 'music-player-v3'; // 更新缓存版本
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/music/' // 缓存整个音乐目录
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 增强缓存策略
self.addEventListener('fetch', (e) => {
  // 添加音乐目录缓存规则
  if (e.request.url.includes('/music/')) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
    return;
  }
  // 忽略非GET请求
  if (e.request.method !== 'GET') return;
  
  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        const fetched = fetch(e.request)
          .then(network => {
            // 更新缓存
            const clone = network.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
            return network;
          })
        return cached || fetched;
      }).catch(() => caches.match('/')) // 完全离线时返回首页
  );
});

// 添加缓存清理逻辑
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    ))
  );
});