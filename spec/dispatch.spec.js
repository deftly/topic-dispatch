require('./setup')
const { should } = require('chai')
const { assert } = require('console')
const Dispatcher = require('../src')

describe('Dispatch', function() {
    it('should dispatch to all matching', function() {
        const dispatcher = Dispatcher()
        var dispatched = []
        dispatcher.on('*', () => { dispatched.push(1) })
        dispatcher.on('*', () => { dispatched.push(2) })
        dispatcher.on('*', () => { dispatched.push(3) })
        dispatcher.on('*', () => { dispatched.push(4) })

        dispatcher.dispatch('one')

        dispatched.should.eql([1, 2, 3, 4])
    })

    it('should ignore exceptions in matching', function() {
        const dispatcher = Dispatcher()
        var dispatched = []
        dispatcher.on('*', (t, ev) => { dispatched.push(ev.title) })
        dispatcher.on('*', (t, ev) => { dispatched.push(ev.title) })
        dispatcher.on('*', (t, ev) => { throw new Error('uh oh') })
        dispatcher.on('*', (t, ev) => { dispatched.push(ev.title) })

        dispatcher.dispatch('one', {title: 'test'})

        dispatched.should.eql(['test', 'test', 'test'])
    })

    it('should only dispatch a single time on once', function () {
        const dispatcher = Dispatcher()
        var dispatched = 0
        dispatcher.once('*', (t, ev) => { dispatched ++})
        dispatcher.dispatch('one', {})
        dispatcher.dispatch('two', {})
        dispatcher.dispatch('three', {})
        dispatched.should.eql(1)
    })

    it('should dispatch to each single subscribe at the same time', function () {
        const dispatcher = Dispatcher()
        var dispatched = 0
        var other = 0
        dispatcher.once('*', (t, ev) => { dispatched ++})
        dispatcher.once('#', (t, ev) => { dispatched ++})
        dispatcher.on('one', (t, ev) => { other = other + 3 })
        dispatcher.dispatch('one', {})
        dispatcher.dispatch('one', {})
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
        dispatcher.removeAll()
        dispatcher.dispatch('one', {})
        dispatched.should.eql(0)
    })
})