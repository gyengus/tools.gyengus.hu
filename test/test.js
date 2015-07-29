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

	it('MD5 test', function(done) {
		request(server).get('/api/genhash/md5/test').end(function(err, res) {
			should.not.exist(err);
        	should(res).have.property('status', 200);
			should(res.text).be.String().and.eql('098f6bcd4621d373cade4e832627b4f6');
			done();
		});
	});

	it('SHA1 test', function(done) {
		request(server).get('/api/genhash/sha1/test').end(function(err, res) {
			should.not.exist(err);
        	should(res).have.property('status', 200);
			should(res.text).be.String().and.eql('a94a8fe5ccb19ba61c4c0873d391e987982fbbd3');
			done();
		});
	});

	it('SHA256 test', function(done) {
		request(server).get('/api/genhash/sha256/test').end(function(err, res) {
			should.not.exist(err);
        	should(res).have.property('status', 200);
			should(res.text).be.String().and.eql('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
			done();
		});
	});

	it('SHA512 test', function(done) {
		request(server).get('/api/genhash/sha512/test').end(function(err, res) {
			should.not.exist(err);
        	should(res).have.property('status', 200);
			should(res.text).be.String().and.eql('ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff');
			done();
		});
	});

});
