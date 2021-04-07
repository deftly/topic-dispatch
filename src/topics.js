const _ = require('fauxdash')
const matcher = require('../src/matcher')
const subscribe = require('./subscription')

function add (topics, pattern, fn) {
    if (typeof fn !== 'function') {
        throw new Error(`Cannot attach ${typeof fn} to '${pattern}' as a handler`)
    }
    const subcription = subscribe(topics, pattern, fn)
    const topic = getTopic(topics, pattern)
    topic.calls.push(subcription)
    return subcription
}

function createTopic (topics, pattern) {
    const match = matcher.create(pattern)
    const topic = {
        pattern,
        test: match.test,
        calls: []
    }
    topics[pattern] = topic
    return topic
}

function emit (topics, topicName, event) {
    const results = []
    const result = _.future()
    // process.nextTick(() => {
    _.each(topics, (v) => {
        if (v.test(topicName)) {
            var filtered = _.filter(v.calls).slice(0)
            _.each(filtered, c => {
                try {
                    const result = c.handle(topicName, event)
                    if (result) {
                        if (result.then && result.catch) {
                            results.push(result)
                        } else {
                            results.push(Promise.resolve(result))
                        }
                    }
                } catch (e) {
                    console.error(`exception caught emiting event to topic '${topicName}':\n  ${e.stack}`)
                }
            })
        }
    // })
    console.log(`waiting on ${results.length}`)
    Promise
        .all(results)
        .then(r => result.resolve(r))
        .catch(e => result.reject(e))
    })
    return result.promise
}

function getTopic (topics, pattern) {
    var topic = topics[pattern]
    return topic || createTopic(topics, pattern)
}

function isQuiet(topics) {
    let total = 0
    _.each(topics, (v) => {
        total += v.calls.length
    })
    return total === 0
}

function remove (topics, pattern, fn) {
    var topic = topics[pattern]
    if (topic) {
        const indx = _.find(topic.calls, s => s.fn === fn)
        topic.calls.splice(indx, 1)
    }
}

function removeAll (topics, pattern) {
    if (pattern != undefined) {
        delete topics[pattern]
    } else {
        _.each(topics, (v, k) => {
            delete topics[k]
        })
    }
}

module.exports = function() {
    const topics = {}
    return {
        add: add.bind(null, topics),
        emit: emit.bind(null, topics),
        isQuiet: isQuiet.bind(null, topics),
        remove: remove.bind(null, topics),
        removeAll: removeAll.bind(null, topics),
    }
}