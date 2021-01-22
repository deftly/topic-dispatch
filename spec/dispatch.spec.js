require('./setup')
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