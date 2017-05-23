const browserify = require('browserify')
const sveltify = require('sveltify')
const wrapper = require('../')

const b = browserify({ debug: true })
b.transform(sveltify)
b.transform(wrapper, { filename: './component-wrapper' })

b.add('./app.js')

b.bundle().pipe(process.stdout)
