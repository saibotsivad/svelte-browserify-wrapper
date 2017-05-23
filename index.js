const { extname } = require('path')
const through = require('through2')
const MagicString = require('magic-string')

const defaultExtensions = [ '.html', '.svelte' ]
const regex = /^module\.exports = ([^;]+);$/gm
const preRegex = 'module.exports = '
const postRegex = ';'

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
		const { start, end, name } = replacementParts(data)
		const line = `module.exports = require('${options.filename}')(${name});`
		const magic = new MagicString(data)
		magic.overwrite(start, end, line)
		this.push(magic.toString())
		cb()
	}

	if (extensionsArray.includes(extname(file).toLowerCase())) {
		return through(write, end)
	} else {
		return through()
	}
}

function replacementParts(string) {
	const moduleName = regex.exec(string)[1]
	const lineToReplace = preRegex + moduleName + postRegex
	const indexOfDeclaration = string.search(lineToReplace)
	return {
		start: indexOfDeclaration,
		end: indexOfDeclaration + lineToReplace.length,
		name: moduleName
	}
}
