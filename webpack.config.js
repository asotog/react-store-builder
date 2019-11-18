const path = require('path');
const pkg = require('./package.json');

const libraryName = pkg.name;

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  output: {
    path: path.join(__dirname, './lib'),
    filename: 'react-store-builder.js',
    library: libraryName,
    libraryTarget: 'umd',
    publicPath: '/lib/',
    umdNamedDefine: true,
  },
  optimization: {
    minimize: false,
  },
  externals: {
    react: 'react',
    reactDOM: 'react-dom',
  },
};
