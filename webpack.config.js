const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const isProd = process.env.NODE_ENV === 'production';

const hashedModuleIds = new webpack.HashedModuleIdsPlugin();

module.exports = {
  mode: isProd ? 'production' : 'development',

  devtool: isProd ? 'inline-source-map' : '',

  entry: './src/index.js',

  output: {
    path: path.join(__dirname, 'lib'),
    filename: 'game-engine.js',
    library: 'game-engine',
    libraryTarget: 'umd'
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

  plugins: [hashedModuleIds],

  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
  },
};
