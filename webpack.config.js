module.exports = {
  debug: true,
  entry: './src/index.js',
  output: {
    filename: './dist/js-data-sql.js',
    libraryTarget: 'commonjs2',
    library: 'js-data-sql'
  },
  externals: [
    'mout/array/map',
    'mout/lang/toString',
    'mout/string/underscore',
    'mout/array/unique',
    'js-data',
    'knex'
  ],
  module: {
    loaders: [{
      test: /(src)(.+)\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader?blacklist=useStrict'
    }]
  }
};
