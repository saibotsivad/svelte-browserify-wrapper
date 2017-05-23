# svelte-browserify-wrapper

Wrap every bundled Svelte component in a single function.

## install

The usual way:

```
npm install svelte-browserify-wrapper
```

## what it does

Normally, with [sveltify](https://github.com/TehShrike/sveltify) at least,
as part of the browserify build each Svelte component is compiled into
something that looks like this:

```js
function MyComponent() {
	// ... code
}
// ... more code
module.exports = MyComponent;
```

This module is a browserify transform which, given a filename
of `./component-wrapper.js`, will change all those
`module.exports` lines into this:

```js
module.exports = require('./component-wrapper.js')(MyComponent);
```

## what's the point?

In your web app you want to use something cool like the
[mediator](https://github.com/TehShrike/mannish) pattern
to decouple your components from your services, but in
order for that pattern to be really useful you need to
have a singleton property available to all your components

You know that importing a global into your component is a
bad idea, but what are you supposed to do?!

Use this browserify transform as part of your build!

* Components are written as though there is a mediator method available.
* Tests mock that mediator, so they are testable without accessing singletons.
* The browserify bundle creates a singleton mediator, which the components use.

## bigger example

Write your components assuming there will be a method available:

```html
<!-- MyComponent.html-->
<button on:click="load()">Load Data</button>
<p>{{data}}</p>
<script>
export default {
	methods: {
		load() {
			return this.mediatorCall('load').then(data => this.set({ data }))
		}
	}
}
</script>
```

In your tests, you would simply mock out the `mediatorCall`:

```js
const MyComponent = require('./MyComponent.html')
const component = new MyComponent()
// create mock
component.mediatorCall = (key, ...args) => {
	assert(key === 'load') // => true
	return Promise.resolve('yolo')
}
// run test
component.load().then(() => {
	assert(component.get('data') === 'yolo') // => true
})
```

But in your build you would create a wrapper file:

```js
// ./wrap-component.js
const mediator = require('./singleton-mediator.js')

module.exports = function wrapComponent(componentConstructor) {
	return function proxyConstructor(options) {
		const component = new componentConstructor(options)
		component.mediatorCall = mediator.call
		return component
	}
}
```

And the singleton mediator:

```js
// ./singleton-mediator.js
const createMediator = require('mannish')
const mediator = createMediator()
module.exports = mediator
```

## setup in browserify

It's a browserify transform, so either in your `package.json`:

```json
"browserify": {
  "transform": [
	[ "sveltify" ],
	[
	  "svelte-browserify-wrapper",
	  {
		"filename": "./wrap-component.js"
	  }
	]
  ]
}
```

Or in your build file:

```js
const browserify = require('browserify')
const sveltify = require('sveltify')
const wrapper = require('svelte-browserify-wrapper')

const b = browserify()

b.transform(sveltify)
b.transform(wrapper, { filename: './wrap-component.js' })
```

## run the included example

In this repo the folder `/example` contains an example so you
can see how it all works together.

Open a terminal in the `/example` directory and run `npm run build`,
after which `npm run start`, and then open your browser to

http://localhost:3000

When you click the button, it will use the mediator to load
data within the Svelte component!

## license

Published and released under the [VOL](http://veryopenlicense.com).
