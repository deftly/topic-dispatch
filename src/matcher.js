const _ = require('fauxdash')

function create(pattern) {
    const parts = pattern.split('.')
    const limit = parts.length - 1
    var segments = []
    _.map(parts, (part, i) => {
        if (i == 0) {
            segments.push('^')
        }
        switch (part) {
            case '*':
                segments.push('.+')
                break;
            case '#':
                if (i > 0) {
                    segments.push('[.]')
                }
                segments.push('[^.]+')
                break;
            default:
                if (i > 0) {
                    if (parts[i-1] == '*') {
                        segments.push('[.]?')
                    } else {
                        segments.push('[.]')
                    }
                }
                segments.push(part)
                break;
        }
        if (i == limit) {
            segments.push('$')
        }
    })
    const rgx = new RegExp(segments.join(''))
    return {
        topic: pattern,
        regex: rgx,
        test: rgx.test.bind(rgx)
    }
}

module.exports = {
    create: _.memoize(create)
}