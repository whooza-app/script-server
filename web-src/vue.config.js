const webpack = require('webpack');

module.exports = {
    // don't set absolute paths, otherwise reverse proxies with a custom path won't work
    publicPath: '',

    outputDir: '../web',

    devServer: {
        proxy: {
            '': {
                target: 'http://localhost:5000'
            },
            '/': {
                target: 'ws://localhost:5000',
                ws: true,
                headers: {
                    Origin: 'http://localhost:5000'
                }
            }
        }
    },

    pages: {
        index: {
            entry: 'src/main-app/index.js',
            template: 'public/index.html',
            chunks: ['chunk-index-vendors', 'index']
        },
        admin: {
            entry: 'src/admin/admin.js',
            template: 'public/admin.html',
            chunks: ['chunk-admin-vendors', 'admin']
        },
        login: {
            entry: 'src/login/login.js',
            template: 'public/login.html',
            chunks: ['chunk-login-vendors', 'login']
        }
    },

    css: {
        loaderOptions: {
            scss: {
                prependData: '@import "./src/assets/css/color_variables.scss"; '
                    + '@import "materialize-css/sass/components/_variables.scss"; '
                    + '@import "materialize-css/sass/components/_normalize.scss"; '
                    + '@import "materialize-css/sass/components/_global.scss"; '
                    + '@import "materialize-css/sass/components/_typography.scss"; '
            }
        }
    },

    configureWebpack: {
        // webpack removes "class Component" during tree-shaking. Even if it's imported somewhere
        // so we explicitly load it
        plugins: [new webpack.ProvidePlugin({Component: 'exports-loader?Component!materialize-css/js/component.js'})]
    },

    chainWebpack: config => {
        const options = module.exports;
        const pages = options.pages;
        const pageKeys = Object.keys(pages);

        const IS_VENDOR = /[\\/]node_modules[\\/]/;

        // ATTENTION! do not use minSize/maxSize until vue-cli moved to the 4th version of html-webpack-plugin
        // Otherwise plugin won't be able to find split packages
        config.optimization
            .splitChunks({
                cacheGroups: {
                    ...pageKeys.map(key => ({
                        name: `chunk-${key}-vendors`,
                        priority: -11,
                        chunks: chunk => chunk.name === key,
                        test: IS_VENDOR,
                        enforce: true
                    }))
                }
            })
    }
};