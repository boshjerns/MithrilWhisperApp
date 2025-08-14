// Load environment variables for all modes
require('dotenv').config({ path: '.env' });
if (process.env.NODE_ENV === 'production') {
  // Override with production-specific env vars if they exist
  require('dotenv').config({ path: '.env.production', override: true });
}
const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'electron-main',
  mode: process.env.NODE_ENV || 'development',
  entry: {
    main: './src/main/main.js',
    preload: './src/main/preload.js',
  },
  output: {
    path: path.resolve(__dirname, 'build/main'),
    filename: '[name].js',
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
      'process.env.SUPABASE_URL': JSON.stringify('https://gufxxfaukitqghidmzef.supabase.co'),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Znh4ZmF1a2l0cWdoaWRtemVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MDIwNTMsImV4cCI6MjA3MDM3ODA1M30.JdKlLwq7Sw9xR27NwyFKCP_R0X7HughlShleL8sxl18'),
      'process.env.APP_VERSION': JSON.stringify(process.env.npm_package_version || '0.0.0'),
    }),
  ],
}; 