const supertest   = require('supertest');
const mongoose    = require('mongoose');
const chai        = require('chai');
const server      = require('../server');

const {expect} = chai;
const request = supertest(server);

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
          name: 'UserDummy1',
          email: 'dummyUser@aura.com',
          password: 'testpw',
        })
        .expect(201)
        .end((err, res) => {
          done(err);
        });
    });

    // creating a user with an invalid dummy should not be possible
    it('returns status 500 when object format wrong', (done) => {
      request.post('/register')
        .send({
          name: 'UserDummy1',
          password: 'testpw',
        })
        .expect(500)
        .end((err, res) => {
          expect(res.body.error)
            .to.be.equal('invalid name or email');
          done(err);
        });
    });
  });

  // LOGIN
  describe('POST /login', () => {
    it('returns a user by username', (done) => {
      request.post(`/login`)
        .send({
          name: 'UserDummy1',
          password: 'testpw',
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body.data)
            .to.have.all.keys('_id', 'name', 'email', 'password', '__v');
          done(err);
        });
      });

    // get user with invalid id should return 404
    it('returns status 404 when user not found', (done) => {
      request.post('/login')
        .send({
          name: 'unknown'
        })
        .expect(404)
        .end((err, res) => {
          expect(res.body.error)
            .to.be.equal(`user 'unknown' not found`);
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
