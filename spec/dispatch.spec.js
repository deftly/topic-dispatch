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
})