/**
 * Copyright 2016 Kitware Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module.exports = function (grunt) {
    grunt.config.requires('pluginDir');

    grunt.config.merge({
        geojs: {
            root: '<%= pluginDir %>/geojs',
            node: '<%= geojs.root %>/node_modules',
            main: '<%= geojs.node %>/geojs',
            bower: '<%= geojs.main %>/bower_components',
            js: '<%= geojs.root %>/web_client/js',
            ext: '<%= geojs.js %>/ext'
        },
        concat: {
            'geojs-ext': {
                files: [
                    {
                        '<%= geojs.ext %>/geo.js': [
                            '<%= geojs.bower %>/gl-matrix/dist/gl-matrix.js',
                            '<%= geojs.bower %>/proj4/dist/proj4-src.js',
                            '<%= geojs.node %>/pnltri/pnltri.js',
                            '<%= geojs.main %>/geo.js'
                        ]
                    }
                ]
            }
        },
        init: {
            'concat:geojs-ext': {
                dependencies: ['plugin-install:geojs']
            }
        }
    });
};
