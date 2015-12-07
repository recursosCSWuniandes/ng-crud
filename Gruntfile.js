module.exports = function (grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Automatically load required Grunt tasks
    require('jit-grunt')(grunt, {
        ngtemplates: 'grunt-angular-templates'
    });

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        'dist/{,*/}*',
                        '!dist/.git{,*/}*'
                    ]
                }]
            },
            server: '.tmp'
        },
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

    grunt.registerTask('default', ['clean', 'concat:dist', 'ngtemplates:dist', 'uglify:dist']);

};
