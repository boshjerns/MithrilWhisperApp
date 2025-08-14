if ((process.env.NODE_ENV || 'development') !== 'production') {
  require('dotenv').config();
}
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  target: 'electron-renderer',
  mode: process.env.NODE_ENV || 'development',
  entry: './src/renderer/index.js',
  output: {
    path: path.resolve(__dirname, 'build/renderer'),
    filename: 'renderer.js',
  },
  ignoreWarnings: [
    // Suppress known harmless dynamic require warning from Supabase realtime
    (warning) => {
      try {
        const msg = String(warning.message || '');
        const mod = (warning.module && (warning.module.resource || warning.module.userRequest)) || '';
        return /Critical dependency: the request of a dependency is an expression/.test(msg)
          && /@supabase[\\\/]realtime-js/.test(mod);
      } catch (_) {
        return false;
      }
    },
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      filename: 'index.html',
      inject: 'body',
    }),
    // Generate dedicated HTML for the overlay window
    new HtmlWebpackPlugin({
      template: './src/renderer/overlay.html',
      filename: 'overlay.html',
      inject: 'body',
    }),
    // Generate dedicated HTML for the desktop HUD window
    new HtmlWebpackPlugin({
      template: './src/renderer/desktop-hud.html',
      filename: 'desktop-hud.html',
      inject: 'body',
    }),
    // Assistant chat window
    new HtmlWebpackPlugin({
      template: './src/renderer/assistant-chat.html',
      filename: 'assistant-chat.html',
      inject: 'body',
    }),
    new webpack.DefinePlugin({
      'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || ''),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || ''),
      'process.env.APP_VERSION': JSON.stringify(process.env.npm_package_version || '0.0.0'),
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    port: Number(process.env.DEV_SERVER_PORT || 37843),
    hot: true,
  },
}; 