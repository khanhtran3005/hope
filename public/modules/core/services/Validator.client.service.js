'use strict';

angular.module('core').service('Validator', [
    function() {
        return {
            /**
             * Returns true if key is not a key in object or object[key] has
             * value undefined. If key is a dot-delimited string of key names,
             * object and its sub-objects are checked recursively.
             */
            isUndefinedKey: function(object, key) {
                var keyChain = Array.isArray(key) ? key : key.split('.'),
                    objectHasKey = keyChain[0] in object,
                    keyHasValue = typeof object[keyChain[0]] !== 'undefined';

                if (objectHasKey && keyHasValue) {
                    if (keyChain.length > 1) {
                        return this.isUndefinedKey(object[keyChain[0]], keyChain.slice(1));
                    }

                    return false;
                } else {
                    return true;
                }
            },
            isUndefined: function(value) {
                return typeof value === 'undefined';
            }
        };
    }
]);
