
/*
  elucidata-react-coffee
  https://github.com/elucidata/react-coffee
 */

(function() {
  var Component, EventEmitter, React, events, extractAndMerge, extractInto, extractMethods, fn, getFnName, handleMixins, handlePropTypes, key, nameParser, ref, umd,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  nameParser = /function (.+?)\(/;

  React = this.React || require('react');

  EventEmitter = require('events').EventEmitter;

  Component = (function() {
    function Component() {}

    Component.keyBlacklist = '__super__ __superConstructor__ constructor keyBlacklist build'.split(' ');

    Component.build = function(componentClass, ignore) {
      if (componentClass == null) {
        componentClass = this;
      }
      if (ignore == null) {
        ignore = [];
      }
      return React.createFactory(React.createClass(extractMethods(componentClass, ignore)));
    };

    return Component;

  })();

  EventEmitter.defaultMaxListeners = 0;

  events = new EventEmitter;

  for (key in events) {
    fn = events[key];
    Component.prototype[key] = fn;
  }

  ref = React.DOM;
  for (key in ref) {
    fn = ref[key];
    Component.prototype[key] = fn;
  }

  extractMethods = function(comp, ignore) {
    var methods;
    methods = extractInto({}, new comp, ignore);
    methods.displayName = getFnName(comp);
    handleMixins(methods, comp);
    handlePropTypes(methods, comp);
    methods.statics = extractInto({}, comp, ignore.concat(['mixins', 'propTypes']));
    return methods;
  };

  extractInto = function(target, source, ignore) {
    var val;
    for (key in source) {
      val = source[key];
      if (indexOf.call(Component.keyBlacklist, key) >= 0) {
        continue;
      }
      if (indexOf.call(ignore, key) >= 0) {
        continue;
      }
      target[key] = val;
    }
    return target;
  };

  extractAndMerge = function(prop, merge) {
    return function(instance, propTypesOrMixins) {
      var result;
      result = (typeof propTypesOrMixins[prop] === "function" ? propTypesOrMixins[prop]() : void 0) || propTypesOrMixins[prop];
      if (result != null) {
        if (instance[prop] == null) {
          return instance[prop] = result;
        } else {
          return instance[prop] = merge(instance[prop], result);
        }
      }
    };
  };

  handlePropTypes = extractAndMerge('propTypes', function(target, value) {
    var val;
    for (key in value) {
      val = value[key];
      target[key] = val;
    }
    return target;
  });

  handleMixins = extractAndMerge('mixins', function(target, value) {
    return target.concat(value);
  });

  getFnName = function(fn) {
    return fn.name || fn.displayName || (fn.toString().match(nameParser) || [null, 'UnnamedComponent'])[1];
  };

  umd = function(factory) {
    if (typeof exports === 'object') {
      return module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
      return define([], factory);
    } else {
      return this.Component = factory();
    }
  };

  umd(function() {
    return Component;
  });

}).call(this);
