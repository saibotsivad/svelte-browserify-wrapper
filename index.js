const { basename, extname } = require('path')
const through = require('through2')

const defaultExtensions = [ '.html', '.svelte' ]
const regex = /^module\.exports = ([^;]+);$/gm

module.exports = function svelteMediator(file, options = {}) {
    if (!options.filename) {
        throw new Error('you must specify the wrapper filename')
    }

    const extensionsArray = options.extensions || defaultExtensions

    let data = ''

    function write(chunk, enc, cb) {
        data += chunk
        cb()
    }

    function end(cb) {
        this.push(data.replace(regex, (a, b) => `module.exports = require('${options.filename}')(${b});`))
    }

    if (extensionsArray.includes(extension.toLowerCase())) {
        return through(write, end)
    } else {
        return through()
    }
}
