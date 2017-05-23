const Component = require('./Component.html')
const mediator = require('./global-mediator')

// add providers to the mediator
require('./provider')(mediator)

// initialize app
new Component({
	target: document.querySelector('body')
})
