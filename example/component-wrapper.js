const mediator = require('./global-mediator')

module.exports = function wrapComponent(componentConstructor) {
	return function proxyConstructor(options) {
		const component = new componentConstructor(options)
		component.mediate = mediator.call
		return component
	}
}
