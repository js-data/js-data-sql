module.exports = {
  entry: './src/index.js',
  output: {
    filename: './dist/js-data-sql.js',
    libraryTarget: 'commonjs2',
    library: 'js-data-sql'
  },
  externals: [
    'mout/string/underscore',
    'mout/lang/toString',
    'mout/array/unique',
    'js-data',
    'knex'
  ],
  module: {
    loaders: [
      {
        test: /(src)(.+)\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
