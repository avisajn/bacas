var webpack = require('webpack');
var path = require('path');

var publicPath = 'http://localhost:3000/';
var hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';

var devConfig = {
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
    module: {
        loaders: [{
            test: /\.(png|jpg|gif)$/,
            loader: 'url?limit=100&context=client&name=[path][name].[ext]'
        }, {
            test: /\.scss$/,
            loader: 'style!css?sourceMap!resolve-url!sass?sourceMap'
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'zepto',
            Zepto: 'zepto',
            'window.Zepto': 'zepto'
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ]
};

module.exports = devConfig;
