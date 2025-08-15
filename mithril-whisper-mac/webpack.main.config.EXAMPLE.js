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
      // 🚨 SECURITY: Use environment variables instead of hardcoded values
      // Create a .env file with:
      // SUPABASE_URL=your_supabase_project_url
      // SUPABASE_ANON_KEY=your_supabase_anon_key
      'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || ''),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || ''),
      'process.env.APP_VERSION': JSON.stringify(process.env.npm_package_version || '0.0.0'),
    }),
  ],
};
