if ((process.env.NODE_ENV || 'development') !== 'production') {
  require('dotenv').config();
}
const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'electron-main',
  mode: process.env.NODE_ENV || 'development',
  entry: './src/main/main.js',
  output: {
    path: path.resolve(__dirname, 'build/main'),
    filename: 'main.js',
    clean: true,
  },
  externals: {
    // Ensure native addon loads at runtime instead of being bundled
    'win-audio': 'commonjs2 win-audio',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || ''),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || ''),
      'process.env.APP_VERSION': JSON.stringify(process.env.npm_package_version || '0.0.0'),
    }),
  ],
}; 