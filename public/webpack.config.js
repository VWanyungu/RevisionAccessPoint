import path from 'path'
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = {
    entry: './index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'),
    },
    plugins: [
        new InjectManifest({
            swSrc: './service-worker.js',
            swDest: 'service-worker.js',
        })
    ]
}