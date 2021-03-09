function remove (topics, pattern, fn) {
    var topic = topics[pattern]
    if (topic) {
        const indx = _.find(topic.calls, s => s.fn === fn)
        topic.calls.splice(indx, 1)
    }
}

function subscribe (topics, pattern, fn) {
    return {
        catch: (handler) => {
            this.onError = handler
            return this
        },
        then: (handler) => {
            this.onResult = handler
            return this
        },
        fn,
        onError: undefined,
        onResult: undefined,
        off: () => remove(topics, pattern, fn),
        remove: () => remove(topics, pattern, fn),
        catch: (onErr) => {
            this.onError = onErr
        },
        handle: (topic, data) => {
            var result = fn(topic, data)
            if (result) {
                if (result.then && result.catch) {
                    result
                        .then(this.onResult || ((x) => x))
                        .catch(this.onError)
                } else {
                    if (this.onResult) {
                        this.onResult(result)
                    }
                    result = Promise.resolve(result)
                }
            }
            return result
        }
    }
}

module.exports = subscribe