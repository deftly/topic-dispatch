global._ = require('fauxdash')
const chai = require('chai')
chai.use(require('chai-as-promised'))
global.should = chai.should()
global.expect = chai.expect
global.assert = chai.assert

function deepCompare (a, b, k) {
  let diffs = []
  if (b === undefined && a !== undefined) {
    diffs.push('expected ' + k + ' to equal ' + a + ' but was undefined ')
  } else if (_.isObject(a) || Array.isArray(a)) {
    _.each(a, function (v, c) {
      const key = k ? [k, c].join('.') : c
      diffs = diffs.concat(deepCompare(a[c], b[c], key))
    })
  } else {
    var equal = a == b // eslint-disable-line
    if (!equal) {
      diffs.push('expected ' + k + ' to equal ' + a + ' but got ' + b)
    }
  }
  return diffs
}

chai.Assertion.addMethod('partiallyEql', function (partial) {
  let obj = this._obj
  if (!obj.then) {
    obj = Promise.resolve(obj)
  }
  const self = this
  return obj.then(function (actual) {
    const diffs = deepCompare(partial, actual)
    return self.assert(
      diffs.length === 0,
      diffs.join('\n\t')
    )
  })
})
