const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');
const path = require('path');
const AWS = require('aws-sdk');


module.exports = async (env, argv) => {

  const s3 = new AWS.S3({ region: env.bucket_region, sslEnabled: false });
  let config = {};

  console.log(`Retrieving configuration for bucket ${env.bucket_name} and key ${env.bucket_key}`);
  let response = await s3.getObject(
    {
      Bucket: env.bucket_name,
      Key: env.bucket_key
    }
  ).promise();

  config = JSON.parse(response.Body.toString());
  
  if(config.tenants !== undefined) {
    console.log(`Retrieved configuration: ${JSON.stringify(config)}`);
  } else {
    console.log('Failed to retrieve configuration');
    console.log(response.Body.toString());
  }

  return config.tenants.map((tenant) => {   
    return {
      name: tenant.instance,
      entry: {
        vendor: [
          'react',
          'react-dom',
          'core-js',
          'office-ui-fabric-react'
        ],
        taskpane: [
            'react-hot-loader/patch',
            './src/taskpane/index.tsx',
        ],
      },
      resolve: {
        extensions: ['.ts', '.tsx', '.html', '.js'],
      },
      output: {
        path: path.resolve(__dirname, `dist/${tenant.addinId}`)
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: [
              'react-hot-loader/webpack',
              'ts-loader'
            ],
            exclude: /node_modules/
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
          },
          {
            test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
            use: {
              loader: 'file-loader',
              query: {
                name: 'assets/[name].[ext]'
              }
            }  
          }   
        ]
      },
      plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
          __ADDIN_ID__: JSON.stringify(tenant.addinId),
          __API_BASE_PATH__: JSON.stringify(tenant.bridgeURL),
          __SCHEDULE_BASE_PATH__: JSON.stringify(config.baseScheduleURL)
        }),
        new CopyWebpackPlugin([{ 
          to: 'taskpane.css', 
          from: './src/taskpane/taskpane.css' 
        }]),
        new ExtractTextPlugin('[name].[hash].css'),
        new HtmlWebpackPlugin({ 
          filename: 'taskpane.html', 
          template: './src/taskpane/taskpane.html', 
          chunks: ['taskpane', 'vendor', 'polyfills'] 
        }),
        new HtmlWebpackPlugin({
          filename: 'manifest.xml',
          template: './manifest-template.xml',
          addinId: tenant.addinId,
          addinURL: `${config.baseURL}/${tenant.addinId}/taskpane.html`,
          inject: false
        }),
        new CopyWebpackPlugin([{ 
          to: 'assets', 
          from: './assets', 
          ignore: ['*.scss'] 
        }]),
        new webpack.ProvidePlugin({
          Promise: ["es6-promise", "Promise"]
        })
      ],
      devServer: {
        headers: {
          "Access-Control-Allow-Origin": "*"
        },      
        https: false,
        port: process.env.npm_package_config_dev_server_port || 3000
      }
    };
  });
}