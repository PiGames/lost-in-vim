/* eslint-disable import/no-commonjs, import/no-extraneous-dependencies */
const webpack = require( 'webpack' );
const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );
const FriendlyErrorsPlugin = require( 'friendly-errors-webpack-plugin' );
const HtmlWebpackInlineSourcePlugin = require( 'html-webpack-inline-source-plugin' );
const cssLoaders = require( './css-loaders' );
const common = require( './common' );

const { config, iP } = common;


const ExtractSASSConfig = {
  filename: 'style.css',
};

const ExtractSASS = new ExtractTextPlugin( ExtractSASSConfig );

module.exports = {
  entry: [
    ...config.entry,
    'webpack/hot/only-dev-server',
    'webpack-dev-server/client?http://localhost:8080',
  ],

  output: config.output,

  devServer: {
    hot: true,
    overlay: true,
    quiet: true,
  },

  devtool: 'eval',

  module: {
    rules: [
      ...config.rules,
      {
        test: /\.s[ca]ss$/,
        use: ExtractSASS.extract( {
          fallback: 'style-loader',
          use: cssLoaders( iP ),
        } ),
      },
    ],
  },

  plugins: [
    ...config.plugins,
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin(),
    ExtractSASS,
    new HtmlWebpackInlineSourcePlugin(),
  ],
};
