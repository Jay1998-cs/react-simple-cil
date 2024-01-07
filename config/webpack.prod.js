const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

// css-loader
const getStyleLoader = (pre) => {
  return [
    MiniCssExtractPlugin.loader, // 单独提取CSS文件
    "css-loader",
    {
      loader: "postcss-loader", // 处理css兼容性问题,在package.json中设置browserlist
      options: {
        postcssOptions: {
          plugins: ["postcss-preset-env"],
        },
      },
    },
    pre,
  ].filter(Boolean);
};

// webpack生产环境配置
module.exports = {
  entry: "./src/main.js",

  output: {
    path: path.resolve(__dirname, "../dist"), // 项目打包输出路径
    filename: "static/js/[name].[contenthash:10].js", // 主程序入口文件输出路径
    chunkFilename: "static/js/[name].[contenthash:10].chunk.js", // 模块输出路径
    assetModuleFilename: "static/media/[hash:10][ext][query]", // 资源输出路径(ext:补全扩展名; query: 补全其他参数)
    clean: true,
  },

  module: {
    rules: [
      // css
      {
        test: /\.css$/,
        use: getStyleLoader(),
      },
      // less
      {
        test: /\.less$/,
        use: getStyleLoader("less-loader"),
      },
      // sass
      {
        test: /\.s[ac]ss$/,
        use: getStyleLoader("sass-loader"),
      },
      // stylus
      {
        test: /\.styl$/,
        use: getStyleLoader("stylus-loader"),
      },
      // image
      {
        test: /\.(jpe?g|png|gif|webp|svg|bmp)/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 图片小于10KB,则转为base64格式(减少网络请求)
          },
        },
      },
      // 其他资源(如字体)
      {
        test: /\.(woff2?|ttf)/,
        type: "asset/resource",
      },
      // js和jsx
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, "../src"),
        loader: "babel-loader",
        options: {
          cacheDirectory: true,
          cacheCompression: false,
        },
      },
    ],
  },

  plugins: [
    // eslint检查js代码
    new ESLintWebpackPlugin({
      context: path.resolve(__dirname, "../src"),
      exclude: "node_modules",
      cache: true,
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/.eslintcache"
      ),
    }),
    // html
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
    }),
    // 单独提取CSS文件
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:10].css",
      chunkFilename: "static/css/[name].[contenthash:10].chunk.css",
    }),
    // 打包public下除html外的其他文件到输出目录dist
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../public"),
          to: path.resolve(__dirname, "../dist"),
          globOptions: {
            ignore: ["**/index.html"], // 忽略index.html
          },
        },
      ],
    }),
  ],

  mode: "production",

  devtool: "source-map",

  optimization: {
    splitChunks: {
      chunks: "all", // 代码分割(node_modules和import动态导入)
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`, // 解决代码分割后缓存失效
    },
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin(),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              // ["gifsicle", { interlaced: true }],
              // ["jpegtran", { progressive: true }],
              // ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    "preset-default",
                    "prefixIds",
                    {
                      name: "sortAttrs",
                      params: {
                        xmlnsOrder: "alphabetical",
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
  },

  // 模块加载(import)时的配置选项
  resolve: {
    extensions: [".jsx", ".js", ".json"], // 自动补全文件扩展名
  },
};
