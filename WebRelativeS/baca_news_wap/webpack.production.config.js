var webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const productionConfig = [{
    entry: {
       category: './client/category',
        error: './client/error',
        's-adsense': './client/adsense',
        newslist: './client/newslist',
        newsinfo: './client/newsinfo',
        search: './client/search',
        info: './client/info',

        vendor : ['zepto', 'fastclick']
    },
    output: {
        filename: './[name]/bundle.js',
        path: path.resolve(__dirname, './public'),
        publicPath: '/'
    },
    mode: 'production',
    module: {
        rules: [{
            test: /\.(png|jpg|gif)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 8192,
                    context: 'client',
                    name: '[path][name].[ext]'
                }
            }]
        }, {
            test: /\.scss$/,
            use: [{
                loader: MiniCssExtractPlugin.loader,
            }, {
                loader: 'css-loader'
            }, {
                loader: 'resolve-url-loader'
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
        new CleanWebpackPlugin(['public']),
        new ExtractTextPlugin('./[name]/index.css', {
            allChunks: true
        })
    ]
}];

module.exports = productionConfig;
