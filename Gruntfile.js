
module.exports = function(grunt){

	var banner = grunt.template.process(
		grunt.file.read("src/banner.js"),
		{data: grunt.file.readJSON("package.json")}
	);

	grunt.initConfig({
		concat: {
			dist: {
				options: {banner: banner},
				files: {
					"dist/swiperize.js": ["src/swiperize.js"]
				}
			}
		},
		uglify: {
			dist: {
				options: {banner: banner},
				files: {
					"dist/swiperize.min.js": ["src/swiperize.js"]
				}
			}
		}
	});

	grunt.registerTask("default", ["concat", "uglify"]);
	
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");

};