var path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            query: {
                     presets: [
			     '@babel/preset-env',
			     '@babel/preset-react',
			     {'plugins': ['@babel/plugin-proposal-class-properties']}
		     ]
                 }
          },
        ]
      }
    ]
  },

  resolve: {
    alias: {
      "./src": '/tmp/wd/src'
    },
    modules: ['/tmp/wd/node_modules']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve('/tmp/wd/dist')
  }
};
