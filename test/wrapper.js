module.exports = function wrapComponent(componentConstructor) {
    return function proxyConstructor(options) {
        const component = new componentConstructor(options)
        component.soMagical = () => Promise.resolve(42)
        return component
    }
}
