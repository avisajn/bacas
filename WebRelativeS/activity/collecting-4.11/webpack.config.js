const path = require('path');
const pkg = require('./package.json');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

module.exports = {
    context: path.join(__dirname, 'src'),
    entry: {
        js: './app.js',
        vendor: ['jquery', 'fastclick']
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.less$/,
                exclude: /node_modules/,
                loader: 'style!css?modules&importLoaders=1&localIdentName=[local]!postcss!less'
            }, {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style', 'css', 'postcss')
            }
        ]
    },
    postcss: [autoprefixer],
    resolve: {
        extensions: ['', '.js']
    },
    plugins: [
        new webpack.DefinePlugin({
            VERSION: pkg.version,
            DEBUG: process.env.NODE_ENV !== 'production'
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'vendor.bundle.js'),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new ExtractTextPlugin('style.css'),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/index.html')
        })
    ],
    devServer: {
        contentBase: './dist',
        hot: true
    }
};