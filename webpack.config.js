const path = require("path");

module.exports = (env, argv) => {
  return {
    mode: process.env.NODE_ENV,
    entry: {
      main: path.resolve(__dirname, "main.js"),
    },
    output: {
      path: path.resolve(__dirname, "."),
      filename: "[name].bundle.js",
    },
    resolve: {
      modules: ["node_modules"],
      extensions: [".js"],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loaders: ["babel-loader"],
        },
      ],
    },
  };
};
