import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import WebpackStrip from 'webpack-strip';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import FixStyleOnlyEntriesPlugin from 'webpack-fix-style-only-entries';
import cssnano from 'cssnano';

import { getStyleRules } from './base';

export default function makeProdConfig(
  baseConfig,
  { basePath, libraryInclude, libraryExclude, buildDir },
) {
  const config = { ...baseConfig };

  config.mode = 'production';
  config.bail = true; // this helps automatic build tools not waste time
  config.output.pathinfo = false;
  config.plugins.push(
    new webpack.IgnorePlugin(/DevTools/),
    new CleanWebpackPlugin(),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new FixStyleOnlyEntriesPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[name].[contenthash].css',
    }),
  );
  config.optimization = {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 10,
      maxAsyncRequests: 20,
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler|object-assign|loose-envify)[\\/]/,
          name: 'react',
          chunks: 'all',
        },
        polyfill: {
          test: /[\\/]node_modules[\\/](core-js|regenerator-runtime|ric-shim|babel-runtime)[\\/].*/,
          name: 'polyfill',
          chunks: 'all',
        },
        styles: {
          test: /style\/.*\.scss$/,
          name: 'style',
          chunks: 'all',
          enforce: true,
        },
      },
    },
    // https://webpack.js.org/configuration/optimization/#optimization-runtimechunk
    runtimeChunk: {
      name: 'webpack-runtime',
    },
  };
  config.optimization.minimizer = [
    new TerserPlugin({
      terserOptions: {
        keep_fnames: true,
      },
      sourceMap: true,
      extractComments: true,
      parallel: true,
      cache: true,
    }),
    new OptimizeCSSAssetsPlugin({}),
  ];
  config.performance = {
    maxEntrypointSize: 300000,
    assetFilter(assetFilename) {
      return !/\.(map|LICENSE)$/.test(assetFilename);
    },
  };
  config.module.rules.push({
    test: /\.jsx?$/,
    use: WebpackStrip.loader(
      'debug',
      'logger',
      'console.log',
      'console.warn',
      'console.error',
    ),
    exclude: libraryExclude,
  });

  const styleRules = getStyleRules({
    basePath,
    libraryInclude,
    libraryExclude,
  }).map(rule =>
    rule.enforce === 'pre'
      ? rule
      : {
          ...rule,
          use: [
            MiniCssExtractPlugin.loader,
            ...rule.use.slice(1).map(use =>
              // this map just adds cssnano to postcss plugins
              use.loader === 'postcss-loader'
                ? {
                    ...use,
                    options: {
                      ...use.options,
                      plugins: [...use.options.plugins, cssnano()],
                    },
                  }
                : use,
            ),
          ],
        },
  );
  config.module.rules = [...config.module.rules, ...styleRules];

  return config;
}
