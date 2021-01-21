## Topic Dispatch

A way to bind function(s) to a topic using AMQP style matching rules. Not optimized for situations with a lot of "topic churn".

It is probably not for you. Check out Jim Cowart's [`monologue`](https://github.com/ifandelse/monologue) or [`postal`](https://github.com/ifandelse/postal) instead.

## API

```js
const topics = require('topic-dispatch')

topics.on('*', (topic, event) => {}) // catch all
topics.on('#', (topic, event) => {}) // catch all
topics.on('*', (topic, event) => {}) // catch 'connected'
topics.on('account.*', (topic, event) => {}) // catch anything starting with 'account'
topics.on('*.created', (topic, event) => {}) // catch anything ending in .created'
topics.on('account.#', (topic, event) => {}) // catch any two segment topic beginning with `account`
topics.on('#.created', (topic, event) => {}) // catch any two segment topic ending with `created`

topics.dispatch('account.created', {}) // will call all but one of the functions listed above
```