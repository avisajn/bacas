var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var productionConfig = [{
    entry: {
        form: './client/form',
        info: './client/info',

        vendor : ['zepto', 'fastclick']
    },
    output: {
        filename: './[name]/bundle.js',
        path: path.resolve(__dirname, './public'),
        publicPath: '/'
    },
    module: {
        loaders: [, {
            test: /\.(png|jpg|gif)$/,
            loader: 'url?limit=100&context=client&name=[path][name].[ext]'
        }, {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract('style', 'css!resolve-url!sass?sourceMap')
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'zepto',
            Zepto: 'zepto',
            'window.Zepto': 'zepto'
        }),
        new CleanWebpackPlugin(['public']),
        new ExtractTextPlugin('./[name]/index.css', {
            allChunks: true
        })
    ]
}];

module.exports = productionConfig;
