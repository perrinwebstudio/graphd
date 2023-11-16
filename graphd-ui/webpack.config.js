const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
// const config = require('./chartdConfig.js');

const config = {
    entry: './src/index.js',
    output: {
        path: __dirname + '/build',
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
        }),
    ],
    // externals: { // TODO: check what is wrong with this.
    //     'chartdConfig': chartdConfig,
    // }
};

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.devtool = 'source-map';
        config.mode = 'development';
        config.devServer = {
            static: path.resolve(__dirname, 'build'),
            port: 3000,
            historyApiFallback: true,
        };
    }

    return config;
};
