module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: [
                    'src/**/*.mod.js',
                    'src/**/*.js'
                ],
                dest: 'dist/ngcrud.js'
            }
        },
        ngtemplates: {
            options: {
                module: 'ngCrud',
                append: true
            },
            dist: {
                src: 'src/crud/templates/**.html',
                dest: '<%= concat.dist.dest %>',
                options: {
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeComments: true
                    }
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> Universidad de Los Andes */\n'
            },
            dist: {
                files: {
                    'dist/ngcrud.min.js': '<%= concat.dist.dest %>'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat:dist', 'ngtemplates:dist', 'uglify:dist']);

};
