import path from "path";
import { Configuration } from "webpack";

const config: Configuration = {
  entry: "./src/index.tsx",
  target: "node",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      assert: require.resolve("assert/"),
      os: require.resolve("os-browserify/browser"),
      https: require.resolve("https-browserify"),
      http: require.resolve("stream-http"),
      stream: require.resolve("stream-browserify"),
    },
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  devServer: {
    static: path.join(__dirname, "build"),
    compress: true,
    port: 4000,
  },
};

export default config;
