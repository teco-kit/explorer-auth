const supertest   = require('supertest');
const mongoose    = require('mongoose');
const chai        = require('chai');
const server      = require('../server');

const Model = require('../src/models/userModel').model;

const {expect} = chai;
const request = supertest(server);

const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkNTE4YTc0MjNjNGZlMTQ5ZGRiOGM1ZCIsImlhdCI6MTU2NTYyNDk0OCwiZXhwIjoxNTY1NjI0OTQ5fQ.KPY1kI-t-QbQlYVwPYrcMCQZMy3GfjLQx78j6pzdpvI'
let accessToken = '';
let refreshToken = '';
let userID = '';

describe('Testing API Routes', () => {
	before('check connection', (done) => {
		mongoose.connection.on('connected', () => {
			done();
		});
	});

	before('drop collections', (done) => {
		mongoose.connection.db.dropDatabase();
		done();
	});

	// REGISTER
	describe('POST /register', () => {
		// create a new user with a valid dummy
		it('saves a new user', (done) => {
			request.post('/auth/register')
				.send({
					email: 'dummyUser@aura.com',
					password: 'testpw',
				})
				.expect(201)
				.end((err, res) => {
					expect(res.body.message)
						.to.be.equal('Successfully created user!');
					done(err);
				});
		});

		// creating a user with an invalid dummy should not be possible
		it('returns status 500 when object format wrong', (done) => {
			request.post('/auth/register')
				.send({
					password: 'testpw',
				})
				.expect(500)
				.end((err, res) => {
					expect(res.body.error)
						.to.include('User validation failed');
					done(err);
				});
		});
	});

	// LOGIN
	describe('POST /login', () => {
		it('200 and token on correct password', (done) => {
			request.post(`/auth/login`)
				.send({
					email: 'dummyUser@aura.com',
					password: 'testpw'
				})
				.expect(200)
				.end((err, res) => {
					expect(res.body)
						.to.have.all.keys('access_token', 'refresh_token');
					accessToken = res.body.access_token;
					refreshToken = res.body.refresh_token;
					userID = res.body._id;
					done(err);
				});
		});

		it('400 on incorrect password', (done) => {
			request.post(`/auth/login`)
				.send({
					email: 'dummyUser@aura.com',
					password: 'wrongpw'
				})
				.expect(400)
				.end((err, res) => {
					expect(res.body.error)
						.to.be.equal('Password not correct!');
					done(err);
				});
		});

		// get user with invalid id should return 404
		it('returns status 404 when user not found', (done) => {
			request.post('/auth/login')
				.send({
					email: 'un@known.com'
				})
				.expect(404)
				.end((err, res) => {
					expect(res.body.error)
						.to.be.equal(`user 'un@known.com' not found`);
					done(err);
				});
		});
	});

	// AUTHENTICATE
	describe('POST /authenticate', () => {
		it('authenticate with right token', (done) => {
			request.post(`/auth/authenticate`)
				.set({Authorization: accessToken})
				.expect(200)
				.end((err, res) => {
					expect(res.body.success)
						.to.be.equal(true);
					done(err);
				});
		});

		it('authenticate with empty token', (done) => {
			request.post(`/auth/authenticate`)
				.expect(401)
				.end((err, res) => {
					expect(res.body.error)
						.to.be.equal('Unauthorized');
					done(err);
				});
		});

		it('authenticate with malformed token', (done) => {
			request.post(`/auth/authenticate`)
				.set({Authorization: 'Bearer invalid'})
				.expect(401)
				.end((err, res) => {
					expect(res.body.error)
						.to.be.equal('Unauthorized');
					done(err);
				});
		});
	});

	// REFRESH
	describe('POST /refresh', () => {
		it('login with refresh token', (done) => {
			request.post(`/auth/refresh`)
				.send({refresh_token: refreshToken})
				.expect(200)
				.end((err, res) => {
					expect(res.body)
						.to.have.all.keys('access_token');
					done(err);
				});
		});

		it('token revoked', (done) => {
      request.post(`/auth/refresh`)
        .send({refresh_token: expiredToken})
        .expect(401)
        .end((err, res) => {
          expect(res.body.error)
            .to.be.equal('token expired');
          done(err);
        });
		});

    it('token expired', (done) => {
      Model.updateOne(userID, {refreshToken: 'revoked'}, (error) => {
        if(error) done(error);
        request.post(`/auth/refresh`)
          .send({refresh_token: refreshToken})
          .expect(401)
          .end((err, res) => {
            expect(res.body.error)
              .to.be.equal('token is revoked');
            done(err);
          });
      });
    });
	});

	// FALLBACK ROUTE
	describe('Health Check', () => {
		it('check if service is up and running', (done) => {
			request.get('/auth/healthcheck')
				.expect(200)
				.end((err, res) => {
					done(err);
				});
		});
	});

	// FALLBACK ROUTE
	describe('Test Errors', () => {
		it('404 on unknown route', (done) => {
			request.post('/something')
				.expect(404)
				.end((err, res) => {
					expect(res.body.error)
						.to.be.equal('Not Found');
					done(err);
				});
		});
	});
});

module.exports = mongoose;
