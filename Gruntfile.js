module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: '<%= concat.dev.src %>',
                dest: 'dist/ngcrud.js'
            },
            dev: {
                src: [
                    'src/crud/js/crud.mod.js',
                    'src/crud/js/crud.svc.js',
                    'src/crud/js/crud.dir.js',
                    'src/crud/js/crud.ctrl.js'
                ],
                dest: '/home/afesguerra/Documentos/netbeans/crud-example/MusicStore.web/src/main/webapp/src/shared/ngcrud.min.js'
            }
        },
        ngtemplates: {
            dist: {
                src: '<%= ngtemplates.dev.src %>',
                dest: '<%= concat.dist.dest %>',
                options: {
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeComments: true
                    },
                    module: '<%= ngtemplates.dev.options.module %>',
                    append: true
                }
            },
            dev: {
                src: 'src/crud/templates/**.html',
                dest: '<%= concat.dist.dest %>',
                options: {
                    module: 'ngCrud',
                    append: true
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> Universidad de Los Andes */\n'
            },
            ngCrud: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/ngcrud.min.js'
            },
            ngCrudMock: {
                src: [
                    'src/mocks/js/mocks.mod.js'
                ],
                dest: 'dist/ngcrud-mocks.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat:dist', 'ngtemplates:dist', 'uglify']);

    grunt.registerTask('dev', ['concat:dev', 'ngtemplates:dev']);

};
