'use strict';

var should = require('should');
var server = require('../app.js');
var request = require('supertest');

describe('tools.gyengus.hu test', function(done) {
	it('should be respond html for /', function() {
		request(server).get('/').expect('Content-Type', /html/).expect(200, done);
	});

	it('should be respond text for /api/genpassword', function(done) {
		request(server).get('/api/genpassword').end(function(err, res) {
			should.not.exist(err);
        	should(res).have.property('status', 200);
			should(res.text).be.String;
			done();
		});
	});

	it('should be respond ["195.228.252.138"] for /api/getip/hup.hu', function(done) {
		request(server).get('/api/getip/hup.hu').end(function(err, res) {
			should.not.exist(err);
        	should(res).have.property('status', 200);
			should(res.text).be.String().and.eql('["195.228.252.138"]');
			done();
		});
	});

	it('should be respond ["portal.fsn.hu"] for /api/gethostname/195.228.252.138', function(done) {
		request(server).get('/api/gethostname/195.228.252.138').end(function(err, res) {
			should.not.exist(err);
        	should(res).have.property('status', 200);
			should(res.text).be.String().and.eql('["portal.fsn.hu"]');
			done();
		});
	});
});
