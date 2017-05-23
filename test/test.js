const browserify = require('browserify')
const sveltify = require('sveltify')
const test = require('tape')
const wrapper = require('../')

test('it creates the bundle with the expected code', t => {
	const b = browserify()
	b.transform(sveltify)
	b.transform(wrapper, { filename: './wrapper.js' })
	b.add('./test/Module.html')
	b.bundle((err, src) => {
		const expected = "\nmodule.exports = require('./wrapper.js')(Module);"
		t.notOk(err)
		t.ok(src.toString().indexOf(expected) >= 0)
		t.end()
	})
})
