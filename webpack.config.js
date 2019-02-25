const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const isProd = process.env.NODE_ENV === 'production';

const CopyWebpackPlugin = require('copy-webpack-plugin');
const copy = new CopyWebpackPlugin([{ from: 'public', ignore: ['img/*'] }]);

const HtmlWebpackPlugin = require('html-webpack-plugin');

const html = new HtmlWebpackPlugin({
  template: 'src/index.html',
  inject: true,
  vars: {
    title: 'Hello',
    description: '',
  },
});

const hashedModuleIds = new webpack.HashedModuleIdsPlugin();

module.exports = {
  mode: isProd ? 'production' : 'development',

  devtool: isProd ? 'inline-source-map' : '',

  entry: './src/main.js',

  output: {
    path: path.join(__dirname, 'bin'),
    filename: 'bundle.[hash].js',
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@public': path.resolve(__dirname, 'public'),
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/env'],
              plugins: [
                '@babel/plugin-transform-object-assign',
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-proposal-class-properties',
              ],
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'img/',
            },
          },
        ],
      },
      {
        test: /\.(frag|vert|txt)$/,
        use: [
          {
            loader: 'raw-loader',
          },
        ],
      },
    ],
  },

  plugins: [hashedModuleIds, copy, html],

  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
  },
};
