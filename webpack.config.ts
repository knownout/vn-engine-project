import webpack = require("webpack");
import server = require("webpack-dev-server");

import HtmlWebpackPlugin = require("html-webpack-plugin");
import path = require("path");
import fs = require("fs");

const MODE =
	(process.env.npm_lifecycle_script as string).toString().split(" ").reduce((a, e) => {
		const map = e.split("=").map(e => e.replace(/(\"|\-\-)/g, ""));
		if (typeof map[1] !== "undefined") a[map[0]] = map[1];
		return a;
	}, {} as any).mode || "development";
const IS_PROD = MODE === "production" ? true : false;

module.exports = {
	target: "web",
	mode: MODE,

	devtool: IS_PROD ? undefined : "eval-source-map",
	resolve: { extensions: [ ".ts", ".js", ".tsx", ".jsx" ] },

	parallelism: 4,
	entry: {
		main: "./src/main.ts"
	},

	optimization: IS_PROD
		? {
				minimize: true,
				splitChunks: {
					chunks: "all",
					maxAsyncRequests: 16,
					maxInitialRequests: 20,
					cacheGroups: {
						vendor: {
							test: /[\\/]node_modules[\\/]/,
							name (module) {
								const packageName = module.context.match(
									/[\\/]node_modules[\\/](.*?)([\\/]|$)/
								)[1];
								return `module~${packageName.replace("@", "~")}`;
							}
						}
					}
				},
				providedExports: true,
				concatenateModules: true,
				usedExports: true,
				removeAvailableModules: true
			}
		: undefined,

	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "dist")
	},

	module: {
		rules: [
			{
				test: /\.css$/,
				use: [ "style-loader", "css-loader", "postcss-loader" ]
			},
			{ test: /\.tsx?$/, loader: "ts-loader" },

			{
				test: /\.less$/g,
				loaders: [ "style-loader", "css-loader", "postcss-loader", "less-loader" ]
			}
		]
	},

	plugins: [
		new HtmlWebpackPlugin({
			inject: true,
			template: "./src/index.html",
			filename: "index.html"
		})
	],

	devServer: {
		host: "0.0.0.0",
		port: 8080,

		// hot: true,
		writeToDisk: true, // default: IS_PROD
		historyApiFallback: true,
		contentBase: path.resolve("images"),
		publicPath: "/",

		https: {
			cert: fs.readFileSync("C:\\Users\\knownOut\\.certificates\\localhost.pem", "utf8"),
			key: fs.readFileSync("C:\\Users\\knownOut\\.certificates\\localhost-key.pem", "utf8")
		}
	} as server.Configuration
} as webpack.Configuration;
