var self = {}
/*
   This function enables module bulk configuring like:
   module.config({
    labels: true,
    size: [100,100],
  });

  Usage inside module:
  module.config = Vis.Core.Config.configFn.bind(module);
*/
self.configFn = function (args) {
  var module = this
  if (args) {
    _.each(args, function (value, setAccessor) {
      //Check if module has setAccessor
      if (typeof module[setAccessor] === 'function') {
        module[setAccessor](value)
      }
    })
  }
  return this
}
/*
   Add a particular accessor from an accessors object onto module
   Options exposed on a module are a getter/setter function that returns module itself
   in order to comply with d3 reusable interface: accessor chaining,
   e.g. module.accessor('a').accessor('b');

   Accessor objects should be generated via Object.create() to provide
   the accessor of manipulating data via get/set functions.
*/
self.setModuleAccessor = function (module, name) {
  module[name] = function (value) {
    if (!arguments.length) return module._accessors[name]
    module._accessors[name] = value
    return module
  }
}
/*
   Add all accessors to the module
*/
self.setModuleAccessors = function (module) {
  var ops = Object.getOwnPropertyNames(module._accessors || {})
  for (var i in ops) {
    self.setModuleAccessor(module, ops[i])
  }
}

export default self