module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngtemplates: {
            CrudModule: {
                src: 'src/templates/**.html',
                dest: 'dist/templates.js',
                bootstrap: function(mod, script){
                    return "angular.module('"+mod+"').run(['$templateCache', "+script+" ]);";
                },
                htmlmin: {
                    collapseBooleanAttributes:      true,
                    collapseWhitespace:             true,
                    removeAttributeQuotes:          true,
                    removeComments:                 true, // Only if you don't use comment directives!
                    removeEmptyAttributes:          true,
                    removeRedundantAttributes:      true,
                    removeScriptTypeAttributes:     true,
                    removeStyleLinkTypeAttributes:  true
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['ngtemplates', 'uglify']);

};