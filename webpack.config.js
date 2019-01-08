var path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  resolve: {
    alias: {
      src: '/tmp/src/'
    }
  }
  output: {
    filename: 'bundle.js',
    path: path.resolve('/tmp/')
  }
};
