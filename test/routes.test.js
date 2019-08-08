const supertest   = require('supertest');
const mongoose    = require('mongoose');
const chai        = require('chai');
const server      = require('../server');

const {expect} = chai;
const request = supertest(server);

let token = '';

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
      request.post('/register')
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
      request.post('/register')
        .send({
          password: 'testpw',
        })
        .expect(500)
        .end((err, res) => {
          expect(res.body.error)
            .to.be.equal('user object');
          done(err);
        });
    });
  });

  // LOGIN
  describe('POST /login', () => {
    it('200 and token on correct password', (done) => {
      request.post(`/login`)
        .send({
          email: 'dummyUser@aura.com',
          password: 'testpw'
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body)
            .to.have.all.keys('success', 'auth_token', 'refresh_token');
          token = res.body.auth_token;
          done(err);
        });
      });

    it('400 on incorrect password', (done) => {
      request.post(`/login`)
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
      request.post('/login')
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
      request.post(`/authenticate`)
        .set({'Authorization': token})
        .expect(200)
        .end((err, res) => {
          expect(res.body.success)
            .to.be.equal(true);
          done(err);
        });
    });

    it('authenticate with empty token', (done) => {
      request.post(`/authenticate`)
        .expect(401)
        .end((err, res) => {
          expect(res.body.error)
            .to.be.equal('Unauthorized');
          done(err);
        });
    });

    it('authenticate with malformed token', (done) => {
      request.post(`/authenticate`)
        .set({'Authorization': 'Bearer invalid'})
        .expect(401)
        .end((err, res) => {
          expect(res.body.error)
            .to.be.equal('Unauthorized');
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
