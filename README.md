## Topic Dispatch

A way to bind function(s) to a topic using AMQP style matching rules. Not optimized for situations with a lot of "topic churn".

It is probably not for you. Check out Jim Cowart's [`monologue`](https://github.com/ifandelse/monologue) or [`postal`](https://github.com/ifandelse/postal) instead.

## API

```js
const topics = require('topic-dispatch')

topics.on('*', (event, topic) => {}) // catch all
topics.on('#', (event, topic) => {}) // catch all
topics.on('*', (event, topic) => {}) // catch 'connected'
topics.on('account.*', (event, topic) => {}) // catch anything starting with 'account'
topics.on('*.created', (event, topic) => {}) // catch anything ending in .created'
topics.on('account.#', (event, topic) => {}) // catch any two segment topic beginning with `account`
topics.on('#.created', (event, topic) => {}) // catch any two segment topic ending with `created`
topics.once('ready', (event, topic) => {}) // removes itself after one even is received

function handler = () => {}
topics.on('added', handler)
topics.removeListener('added', handler) // removes specific handler from a topic

topics.on('added', () => {})
topics.on('added', () => {})
topics.on('added', () => {})
topics.removeAllListeners('added') // removes all handlers from topic

topics.emit('account.created', {}) // will call all but one of the functions listed above

topics.cleanup() // erase all bindings
```