const matcher = require('../src/matcher')
const _ = require('fauxdash')

function emit (topics, topic, event) {
    const results = []
    _.each(topics, (v) => {
        if (v.test(topic)) {
            var filtered = _.filter(v.calls).slice(0)
            _.each(filtered, c => {
                try {
                    const result = c.call(null, topic, event)
                    if (result) {
                        if (result.then && result.catch) {
                            results.push(result)
                        } else {
                            results.push(Promise.resolve(result))
                        }
                    }
                } catch (e) {
                    console.error(`exception caught emiting event to topic '${topic}':\n  ${e.stack}`)
                }
            })
        }
    })
    return Promise.all(results)
}

function isQuiet(topics) {
    let total = 0
    _.each(topics, (v) => {
        total += v.calls.length()
    })
    return total === 0
}

function on (topics, topic, fn) {
    if (typeof fn !== 'function') {
        throw new Error(`Cannot attach ${typeof fn} to '${topic}' as a handler`)
    }
    var m = matcher.create(topic)
    var subscription = subscribe(topics, topic, fn)
    if (!topics[topic]) {
        var obj = {
            test: m.test,
            calls: [fn]
        }
        topics[topic] = obj
    } else {
        topics[topic].calls.push(fn)
    }
    return subscription
}

function once (topics, topic, fn) {
    if (typeof fn !== 'function') {
        throw new Error(`Cannot attach ${typeof fn} to '${topic}' as a handler`)
    }
    var callOnce = function callOnce(t, e) {
        fn(t, e)
        removeListener(topics, topic, callOnce)
    }
    return on(topics, topic, callOnce)
}

function removeListener (topics, topic, fn) {
    var m = matcher.create(topic)
    var bindings = topics[m.topic]
    if (bindings) {
        let list = bindings.calls
        list.splice(list.indexOf(fn), 1)
        if (list.length == 0) {
            delete topics[m.topic]
        }
    }
}

function removeAllListeners (topics, topic) {
    if (topic != undefined) {
        var m = matcher.create(topic)
        delete topics[m.topic]
    } else {
        _.each(topics, (v, k) => {
            delete topics[k]
        })
    }
}

function subscribe(topics, topic, fn) {
    return {
        onError: undefined,
        onResult: undefined,
        off: () => removeListener(topics, topic, fn),
        catch: (onErr) => {
            this.onError = onErr
        },
        handle: (topic, data) => {
            var result = fn(topic, data)
            if (result) {
                if (result.then && result.catch) {
                    result
                        .then(this.onResult)
                        .catch(this.onError)
                } else {
                    this.onResult(result)
                }
            }
        },

    }
}

module.exports = function() {
    const topics = {}
    return {
        emit: emit.bind(null, topics),
        isQuiet: isQuiet.bind(null, topics),
        on: on.bind(null, topics),
        once: once.bind(null, topics),
        removeListener: removeListener.bind(null, topics),
        removeAllListeners: removeAllListeners.bind(null, topics)
    }
}