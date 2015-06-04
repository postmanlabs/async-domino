var async = require('async'),

    chai = require('chai'),
    expect = chai.expect,

    domino = require('../index');

chai.use(require('chai-spies'));

describe('async-domino module', function () {
    it('must export a function', function () {
        expect(domino).to.be.a('function');
    });

    it('must accept an array and return a new one', function () {
        var src = [];

        expect(domino(src)).to.be.an('array');
        expect(domino(src) === src).to.not.be.ok;
    });

    it('must return same number of wrapped functions in array', function () {
        var fn1 = function () { },
            fn2 = function () { },
            src = [fn1, fn2],
            domy = domino(src);

        expect(domy).to.have.length(2);
        expect(domy[0] === fn1).to.not.be.ok;
        expect(domy[1] === fn2).to.not.be.ok;
    });

    it('must allow normal async', function (done) {
        var spy = chai.spy(function (callback) {
            callback();
        });

        async.waterfall(domino([spy]), function (error) {
            expect(error).to.not.be.ok;
            expect(spy).to.have.been.called();
            done();
        });
    });

    it('must forward error of callbacks', function (done) {
        var spy = chai.spy(function (callback) {
            callback(true);
        });

        async.waterfall(domino([spy]), function (error) {
            expect(error).to.be.ok;
            expect(spy).to.have.been.called.once;
            done();
        });
    });

    it('must break series upon error', function (done) {
        var spy1 = chai.spy(function (callback) {
                callback(true);
            }),

            spy2 = chai.spy(function (callback) {
                callback();
            });

        async.waterfall(domino([spy1, spy2]), function (error) {
            expect(error).to.be.ok;
            expect(spy1).to.have.been.called.once;
            expect(spy2).to.not.have.been.called.once;
            done();
        });
    });

    it('must forward arguments', function (done) {
        var spy1 = chai.spy(function (callback) {
                callback(null, 'one');
            }),

            spy2 = chai.spy(function (arg1, callback) {
                callback(null, arg1, 'two');
            });

        async.waterfall(domino([spy1, spy2]), function (error, arg1, arg2) {
            expect(error).to.not.be.ok;

            expect(spy1).to.have.been.called.once;
            expect(spy2).to.have.been.called.once;

            expect(arg1).to.equal('one');
            expect(arg2).to.equal('two');

            done();
        });
    });

    it('must continue callback after timeout', function (done) {
        var spy1 = chai.spy(function (callback) {
                // no callback
            }),

            spy2 = chai.spy(function (arg1, callback) {
                // no callback
            });

        async.waterfall(domino([spy1, spy2], { timeout: 10 }), function (error, arg1, arg2) {
            expect(error).to.be.ok;

            expect(spy1).to.have.been.called.once;
            expect(spy2).to.not.have.been.called.once;

            expect(arg1).to.be.undefined;
            expect(arg2).to.be.undefined;

            done();
        });
    });

    it('must not stop on error within functions in protected (default) mode', function (done) {
        var spy1 = chai.spy(function (callback) {
                throw new Error();
            }),

            spy2 = chai.spy(function (arg1, callback) {
                // no callback
            });

        async.waterfall(domino([spy1, spy2], { timeout: 10 }), function (error, arg1, arg2) {
            expect(error).to.be.ok;

            expect(spy1).to.have.been.called.once;
            expect(spy2).to.not.have.been.called.once;

            expect(arg1).to.be.undefined;
            expect(arg2).to.be.undefined;

            done();
        });
    });

    it('must fail normally when executed in unprotected mode', function (done) {
        var spy = chai.spy(function () {
            throw new Error('callback execution not expected');
        });

        try {
            async.waterfall(domino([
                function (callback) {
                    throw new Error();
                }
            ], { timeout: 10, protect: false }), spy)
        }
        catch (e) {
            expect(spy).to.not.have.been.called;
            done();
        }
    });
});
