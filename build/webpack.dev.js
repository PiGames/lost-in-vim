/* eslint-disable import/no-commonjs, import/no-extraneous-dependencies */
const webpack = require( "webpack" );
const FriendlyErrorsPlugin = require( "friendly-errors-webpack-plugin" );
const cssLoaders = require( "./css-loaders" );
const common = require( "./common" );

const { config, iP } = common;

module.exports = {
  entry: [
    ...config.entry,
    "webpack/hot/only-dev-server",
    "webpack-dev-server/client?http://localhost:8080",
  ],

  output: config.output,

  devServer: {
    hot: true,
    overlay: true,
    quiet: true,
  },

  devtool: "eval",

  module: {
    rules: [ ...config.rules, {
      test: /\.s[ca]ss$/,
      use: [ {
        loader: "style-loader",
        options: {
          sourceMap: true,
        },
      } ].concat( cssLoaders( iP ) ),
    } ],
  },

  plugins: [
    ...config.plugins,
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin(),
  ],
};
