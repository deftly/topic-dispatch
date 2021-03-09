const _ = require('fauxdash')
const Topics = require('./topics')

var indx = 0

function on (topics, pattern, fn) {
    if (typeof fn !== 'function') {
        throw new Error(`Cannot attach ${typeof fn} to '${pattern}' as a handler`)
    }
    return topics.add(pattern, fn)
}

function once (topics, pattern, fn) {
    if (typeof fn !== 'function') {
        throw new Error(`Cannot attach ${typeof fn} to '${pattern}' as a handler`)
    }
    var subscription
    function callOnce(t, e) {
        subscription.off()
        return fn(t, e)
    }
    subscription = topics.add(pattern, callOnce)
}

function removeListener (topics, pattern, fn) {
    topics.remove(pattern, fn)
}

function removeAllListeners (topics, pattern) {
    topics.removeAll(pattern)
}

module.exports = function() {
    const topics = Topics()
    return {
        emit: topics.emit,
        isQuiet: topics.isQuiet,
        on: on.bind(null, topics),
        once: once.bind(null, topics),
        removeListener: removeListener.bind(null, topics),
        removeAllListeners: removeAllListeners.bind(null, topics)
    }
}