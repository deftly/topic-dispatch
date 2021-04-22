require('./setup')
const { should } = require('chai')
const { assert } = require('console')
const { join } = require('path')
const Dispatcher = require('../src')

describe('Dispatch', function() {
    it('should dispatch to all matching', function() {
        const dispatcher = Dispatcher()
        var dispatched = []
        dispatcher.on('*', () => { dispatched.push(1) })
        dispatcher.on('*', () => { dispatched.push(2) })
        dispatcher.on('*', () => { dispatched.push(3) })
        dispatcher.on('*', () => { dispatched.push(4) })

        dispatcher.emit('one')

        dispatched.should.eql([1, 2, 3, 4])
    })

    it('should ignore exceptions in matching', function() {
        const dispatcher = Dispatcher()
        var dispatched = []
        dispatcher.on('*', (ev, t) => { dispatched.push(ev.title) })
        dispatcher.on('*', (ev, t) => { throw new Error('uh oh') })
        dispatcher.on('*', (ev, t) => { dispatched.push(ev.title + ' two') })

        dispatcher.emit('one', {title: 'test'})

        dispatched.should.eql(['test', 'test two'])
    })

    it('should only dispatch a single time on once', function () {
        const dispatcher = Dispatcher()
        var dispatched = 0
        dispatcher.once('*', (ev, t) => { dispatched ++})
        dispatcher.emit('one', {})
        dispatcher.emit('two', {})
        dispatcher.emit('three', {})
        dispatched.should.eql(1)
    })

    it('should not remove one time subscribers until after dispatch', function () {
        const dispatcher = Dispatcher()
        var dispatched = 0
        dispatcher.once('*', (ev, t) => { dispatched += 1})
        dispatcher.once('*', (ev, t) => { dispatched += 2})
        dispatcher.once('*', (ev, t) => { dispatched += 3})
        dispatcher.once('*', (ev, t) => { dispatched += 4})
        dispatcher.once('*', (ev, t) => { dispatched += 5})
        dispatcher.once('*', (ev, t) => { dispatched += 6})
        dispatcher.emit('one', {})
        dispatched.should.eql(21)
        dispatcher.isQuiet().should.eql(true)
    })

    it('should dispatch to each single subscribe at the same time', function () {
        const dispatcher = Dispatcher()
        var dispatched = 0
        var other = 0
        dispatcher.once('*', (ev, t) => { dispatched ++})
        dispatcher.once('#', (ev, t) => { dispatched ++})
        dispatcher.on('one', (ev, t) => { other = other + 3 })
        dispatcher.emit('one', {})
        dispatcher.emit('one', {})
        dispatched.should.eql(2)
        other.should.eql(6)
    })

    it('should not allow invalid callbacks', function () {
        const dispatcher = Dispatcher()
        expect(function () { dispatcher.on('#', undefined) })
            .to.throw(Error, /Cannot attach/)

        expect(function () { dispatcher.on('#', null) })
            .to.throw(Error, /Cannot attach/)

        expect(function () { dispatcher.on('#', '') })
            .to.throw(Error, /Cannot attach/)

        expect(function () { dispatcher.on('#', {}) })
            .to.throw(Error, /Cannot attach/)
        
        expect(function () { dispatcher.on('#', true) })
            .to.throw(Error, /Cannot attach/)
    })

    it('should remove all topics when none are specified', function () {
        const dispatcher = Dispatcher()
        var dispatched = 0;
        dispatcher.on('*', () => { dispatched ++ })
        dispatcher.on('#', () => { dispatched ++ })
        dispatcher.on('one', () => { dispatched ++ })
        dispatcher.removeAllListeners()
        dispatcher.emit('one', {})
        dispatched.should.eql(0)
        dispatcher.isQuiet().should.eql(true)
    })

    it('should correctly unsubscribe from subscription "off" call', function () {
        const dispatcher = Dispatcher()
        const subscription = dispatcher.on('*', () => {})
        subscription.off()
        dispatcher.isQuiet().should.eql(true)
    })

    it('should return all synchronous responses via promise', function () {
        const dispatcher = Dispatcher()
        dispatcher.on('*', () => 10)
        dispatcher.on('*', () => 5)
        dispatcher.on('*', () => 15)
        const result = dispatcher.emit('ohhi', {})
        return result
            .then(list => list.reduce((a, b) => a + b, 0))
            .should.eventually.eql(30)
    })

    it('should return all asynchronous responses via promise', function () {
        const dispatcher = Dispatcher()
        dispatcher.on('*', () => new Promise((res) => {
            setTimeout(() => res(10), 20)    
        }))
        dispatcher.on('*', () => new Promise((res) => {
            setTimeout(() => res(8), 40)    
        }))
        dispatcher.on('*', () => new Promise((res) => {
            setTimeout(() => res(12), 10)    
        }))
        const result = dispatcher.emit('ohhi', {})
        return result
            .should.eventually.eql([10, 8, 12])
    })

    it('should aggregate synchronous and asynchronous responses via promise', function () {
        const dispatcher = Dispatcher()
        dispatcher.on('*', () => new Promise((res) => {
            setTimeout(() => res('a'), 30)    
        }))
        dispatcher.on('*', () => 'b')
        dispatcher.on('*', () => new Promise((res) => {
            setTimeout(() => res('c'), 10)    
        }))
        dispatcher.on('*', () => 'd')
        const result = dispatcher.emit('ohhi', {})
        return result
            .then(list => list.reduce((a, b) => a + b, ''))
            .should.eventually.eql('abcd')     
    })

    it('should direct responses to original subscription reply handlers', function () {
        const dispatcher = Dispatcher()
        const results = []
        const sub1 = dispatcher.on('*', () => new Promise((res) => {
            setTimeout(() => res('a'), 30)    
        }))
        sub1.then(x => {results.push(x)})
        const result = dispatcher.emit('test', '')
        return result.then(() => results.should.eql(['a']))
    })

})