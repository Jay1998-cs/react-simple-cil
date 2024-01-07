const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

// css-loader
const getStyleLoader = (pre) => {
  return [
    "style-loader",
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

// webpack开发环境配置
module.exports = {
  entry: "./src/main.js",

  output: {
    path: undefined, // 开发模式下使用服务器devServer，无打包数据输出
    filename: "static/js/[name].js", // 主程序入口文件输出路径
    chunkFilename: "static/js/[name].chunk.js", // 模块输出路径
    assetModuleFilename: "static/media/[hash:10][ext][query]", // 资源输出路径(ext:补全扩展名; query: 补全其他参数)
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
          plugins: ["react-refresh/babel"], // 启用js和jsx的HMR功能
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
    // react HMR
    new ReactRefreshWebpackPlugin(),
  ],

  mode: "development",

  devtool: "cheap-module-source-map", // 便于调试

  optimization: {
    splitChunks: {
      chunks: "all", // 代码分割(node_modules和import动态导入)
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`, // 解决代码分割后缓存失效
    },
  },

  // 模块加载(import)时的配置选项
  resolve: {
    extensions: [".jsx", ".js", ".json"], // 自动补全文件扩展名
  },

  devServer: {
    host: "localhost",
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true, // 解决刷新页面出现404问题，重定向到首页再解析路由
  },
};
