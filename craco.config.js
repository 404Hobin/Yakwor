module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /pdf\.worker\.mjs$/,
        type: "javascript/auto",
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
          },
        },
      });
      return webpackConfig;
    },
  },
};
