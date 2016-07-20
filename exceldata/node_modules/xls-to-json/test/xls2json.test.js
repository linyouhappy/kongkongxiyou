var should = require('should');
var xls2json = require('../');
var fs = require('fs');

describe('xls to json', function() {

	it('should convert xls to json', function() {
		xls2json({
			input: './sample/sample-xls.xls',
			output: null
		}, function(err, result) {
			should.not.exist(err)
			result.should.be.an.instanceOf(Object)
		})
	})

	it('should convert xls to json file', function() {
		xls2json({
			input: './sample/sample-xls.xls',
			output: './sample/test.json'
		}, function(err, result) {
			should.not.exist(err)
			result.should.be.an.instanceOf(Object)
		})

	})

	it('should read file in test.json', function() {
		var exist = fs.existsSync('./sample/test.json')
		exist.should.be.true;
	})

	it('should trim', function() {
		xls2json({
			input: './sample/testtrim.xls',
			output: './sample/test.json'
		}, function(err, result) {
			should.not.exist(err)
			result.should.be.an.instanceOf(Object)

			//test any space
			var re= /\s/;
			re.test(result[0].name).should.be.false;
		})
	})

})