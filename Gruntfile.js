module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: '<%= concat.dev.src %>',
                dest: 'tmp/ngcrud.js'
            },
            dev: {
                src: [
                    'src/crud/js/crud.mod.js',
                    'src/crud/js/crud.svc.js',
                    'src/crud/js/crud.dir.js',
                    'src/crud/js/crud.ctrl.js'
                ],
                dest: '../../NetbeansProjects/mp-longplay/MusicStore.web/src/main/webapp/src/ngcrud.min.js'
            }
        },
        ngtemplates: {
            options: {
                module: 'ngCrud',
                append: true
            },
            dist: {
                src: '<%= ngtemplates.dev.src %>',
                dest: '<%= concat.dist.dest %>',
                options: {
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeComments: true
                    }
                }
            },
            dev: {
                src: 'src/crud/templates/**.html',
                dest: '<%= concat.dev.dest %>'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> Universidad de Los Andes */\n'
            },
            dist: {
                files: {
                    'dist/ngcrud.min.js': '<%= concat.dist.dest %>',
                    'dist/ngcrud-mocks.min.js': 'src/mocks/js/mocks.mod.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat:dist', 'ngtemplates:dist', 'uglify:dist']);

    grunt.registerTask('dev', ['concat:dev', 'ngtemplates:dev']);

};
