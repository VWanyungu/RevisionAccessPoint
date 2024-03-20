importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js' )

workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.NetworkFirst()
)

workbox.routing.registerRoute(
    ({request}) => request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate()
)

workbox.routing.registerRoute(
    ({request}) => request.destination === 'navigate',
    new workbox.strategies.NetworkFirst()
)
  