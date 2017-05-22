# svelte-browserify-wrapper

Wrap every bundled Svelte component in a single function.

## install

The usual way:

```
npm install svelte-browserify-wrapper
```

## what it does

As part of the browserify build, each Svelte component is compiled into
something that looks like this:

```js
function MyComponent() {
    // ... code
}
// ... more code
module.exports = MyComponent;
```

Given a filename of `./component-wrapper.js`, this transform will change
all the `module.exports` lines into this:

```js
module.exports = require('./component-wrapper.js')(MyComponent);
```

## what's the point?

In your web app you want to use something cool like the
[mediator](https://github.com/TehShrike/mannish) pattern
to decouple your components from your services.

But importing a global into your component means that testing
suddenly becomes more difficult, since you can't mock those
services very easily.

Instead, use this browserify transform as part of your build.

* Components are written as though there is a mediator method available.
* Tests mock that mediator, so they are testable without modifying globals.
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

In your tests, simply mock out the `mediatorCall`:

```js
const MyComponent = require('./MyComponent.html')
const component = new MyComponent()
component.mediatorCall = (key, ...args) => {
    assert(key === 'load') // => true
    return Promise.resolve('yolo')
}
component.load().then(() => {
    assert(component.get('data') === 'yolo') // => true
})
```

In your build, create a wrapper file like:

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

And a singleton mediator like:

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

## license

Published and released under the [VOL](http://veryopenlicense.com).
