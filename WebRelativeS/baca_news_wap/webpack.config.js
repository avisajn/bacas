const webpack = require('webpack');
const path = require('path');

const publicPath = 'http://localhost:3000/';
const hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';
const devConfig = {
    entry: {
        category: ['./client/category', hotMiddlewareScript],
        error: ['./client/error', hotMiddlewareScript],
        's-adsense': ['./client/adsense', hotMiddlewareScript],
        newslist: ['./client/newslist', hotMiddlewareScript],
        newsinfo: ['./client/newsinfo', hotMiddlewareScript],
        search: ['./client/search', hotMiddlewareScript],
        info: ['./client/info', hotMiddlewareScript],

        vendor : ['zepto', 'fastclick']
    },
    output: {
        filename: './[name]/bundle.js',
        path: path.resolve(__dirname, './public'),
        publicPath: publicPath
    },
    devtool: 'eval-source-map',
    mode: 'development',
    module: {
        rules: [{
            test: /\.(png|jpg|gif)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 100,
                    context: 'client',
                    name: '[path][name].[ext]'
                }
            }]
        }, {
            test: /\.scss$/,
            use: [{
                loader: 'style-loader',
            }, {
                loader: 'css-loader',
                options: {
                    sourceMap: true
                }
            }, {
                loader: 'resolve-url-loader',
            }, {
                loader: 'sass-loader',
                options: {
                    sourceMap: true
                }
            }]
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'zepto',
            Zepto: 'zepto',
            'window.Zepto': 'zepto'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ]
};

module.exports = devConfig;
