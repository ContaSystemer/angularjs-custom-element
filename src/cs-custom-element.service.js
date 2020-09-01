(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name conta.customElement
     */
    angular.module('conta.customElement', ['conta.assert']);

    /**
     * @ngdoc service
     * @module conta.customElement
     * @name csCustomElement
     * @subtitle A service to wrap AngularJS directives/components with custom elements.
     *
     * @description
     * Makes it possible to reuse existing AngularJS directives/components in Elm.
     */
    angular.module('conta.customElement').factory('csCustomElement', ['$injector', function ($injector) {

        // INJECTED DEPENDENCIES

        var csAssert = $injector.get('csAssert');
        var $rootScope = $injector.get('$rootScope');
        var $compile = $injector.get('$compile');
        var $window = $injector.get('$window');
        var $timeout = $injector.get('$timeout');

        // PRIVATE

        var customElements = {};

        // PUBLIC

        var service = {
            create: create,
            extendVm: extendVm,
            helper: {
                decode: decode,
            },
            decode: {
                /**
                 * @ngdoc method
                 * @name csCustomElement#decode.identity
                 *
                 * @description
                 * Creates a setter to decode any value.
                 *
                 * @param {*} value Any value to decode.
                 */
                identity: decode({
                    assert: _.constant(true),
                    type: 'any',
                }),
                /**
                 * @ngdoc method
                 * @name csCustomElement#decode.boolean
                 *
                 * @description
                 * Creates a setter to decode a boolean value.
                 *
                 * @param {boolean} value Boolean value.
                 */
                boolean: decode({
                    assert: _.isBoolean,
                    type: 'boolean',
                }),
                /**
                 * @ngdoc method
                 * @name csCustomElement#decode.integer
                 *
                 * @description
                 * Creates a setter to decode an integer value.
                 *
                 * @param {number} value Integer value.
                 */
                integer: decode({
                    assert: _.isInteger,
                    type: 'integer',
                }),
                /**
                 * @ngdoc method
                 * @name csCustomElement#decode.string
                 *
                 * @description
                 * Creates a setter to decode a string value.
                 *
                 * @param {string} value String value.
                 */
                string: decode({
                    assert: _.isString,
                    type: 'string',
                }),
                /**
                 * @ngdoc method
                 * @name csCustomElement#decode.object
                 *
                 * @description
                 * Creates a setter to decode an object value.
                 *
                 * @param {Object} value Object value.
                 */
                object: decode({
                    assert: _.isPlainObject,
                    type: 'object',
                }),
                /**
                 * @ngdoc method
                 * @name csCustomElement#decode.array
                 *
                 * @description
                 * Creates a setter to decode an array value.
                 *
                 * @param {Array} value Array value.
                 */
                array: decode({
                    assert: _.isArray,
                    type: 'array',
                }),
            },
            encode: {
                /**
                 * @ngdoc method
                 * @name csCustomElement#encode.identity
                 *
                 * @description
                 * Encodes value as is.
                 *
                 * @param {*} value Any value to encode.
                 * @returns {*} Same value as given. If value is undefined `null` will be returned.
                 */
                identity: _.identity,
            },
        };

        return service;

        /**
         * @ngdoc type
         * @module conta.customElement
         * @name CsCustomElementCreateOptions
         * @subtitle Represents create options for custom element wrapper.
         *
         * @description
         * This type is used for {@link csCustomElement} service `create` method.
         *
         * @property {Object} [attributeDirective] Specifies if directive should be used as attribute.
         * If provided should have one required "element" property which specifies the element to add attribute directive to.
         * Optionally "attributeValue" property can be defined which will be used as value for attribute directive.
         *
         * Example usage:
         * ```
         * attributeDirective: {
         *     element: 'select',
         * }
         * // or
         * attributeDirective: {
         *     element: 'span',
         *     attributeValue: '{{ vm.someValue }}',
         * }
         * ```
         * @property {Array} [attributes] An array of attribute strings. If attributes from the list will be found in custom element
         * they will be replicated to AngularJS component. This is useful when in AngularJS component one uses `$attrs[csAttr]` directly.
         *
         * Example usage:
         * ```
         * attributes: ['cs-attr-1', 'cs-attr-2',...]
         * ```
         *
         * On Elm side to specify an attribute one can do following
         * ```
         * [ Attrs.attribute "cs-attr-1" "attr-value"
         * , Attrs.attribute "cs-attr-2" ""
         * , ...
         * ]
         * ```
         * @property {Array} [interpolations] An array of interpolation strings.
         * An interpolation is a `@` binding in AngularJS component.
         * String decoder always will be used for interpolations.
         *
         * Example usage:
         * ```
         * interpolations: ['csInterpolationAttr1', 'csInterpolationAttr2',...]
         * ```
         *
         * On Elm side to specify an interpolation one can do following
         * ```
         * [ Attrs.property "csInterpolationAttr1" (Encode.string "interpolated value 1")
         * , Attrs.property "csInterpolationAttr2" (Encode.string "interpolated value 2")
         * , ...
         * ]
         * ```
         * @property {Object} [scope] An object of scope values. Scope values will be added to scope only and no attribute will be added.
         * Key of scope value will be used as name for scope property.
         * A value of scope property is either a getter/setter or function which returns a getter setter.
         * Most of the time we care about setter only. Because this is what will be called when value changes of Elm side.
         * On this stage we have to decode a value received from Elm to value for AngularJS component.
         * This is useful e.g. when a binding needs some extra data.
         *
         * Example usage:
         * ```
         * scope: {
         *     csExtraData: csCustomElement.decode.string,
         * }
         * ```
         *
         * On Elm side to specify a property one can do following
         * ```
         * [ Attrs.property "csExtraData" (Encode.int "Some extra data")
         * , ...
         * ]
         * ```
         * @property {Object} [bindings] An object of bindings. Key of binding will be used as a name for scope property.
         * A value of binding is either a getter/setter or function which returns a getter setter.
         * Most of the time we care about setter only. Because this is what will be called when value changes of Elm side.
         * On this stage we have to decode a value received from Elm to value for AngularJS component.
         * This is useful when in AngularJS component one specifies a binding.
         *
         * Example usage:
         * ```
         * bindings: {
         *     csIntegerBinding: csCustomElement.decode.integer,
         *     csBooleanBinding: csCustomElement.decode.boolean,
         * }
         * ```
         *
         * On Elm side to specify a property one can do following
         * ```
         * [ Attrs.property "csIntegerBinding" (Encode.int 123)
         * , Attrs.property "csBooleanBinding" (Encode.bool True)
         * , ...
         * ]
         * ```
         * @property {Object} [customBindings] An object of custom bindings.
         * A custom binding is a binding with custom attribute name and attribute value.
         * Key of binding will be used as a name for scope property.
         * A value of binding should be an object with three properties.
         * - `attribute` - name of attribute which will be added to AngularJS component.
         * - `attributeValue` - a value of attributed
         * - `decode` - either a getter/setter or function which returns a getter setter.
         * Most of the time we care about setter only. Because this is what will be called when value changes of Elm side.
         * On this stage we have to decode a value received from Elm to value for AngularJS component.
         * This is useful when in AngularJS component one specifies a binding.
         *
         * Example usage:
         * ```
         * customBindings: {
         *     csCustomBinding: {
         *         attribute: 'custom-attribute',
         *         attributeValue: '{{ vm.someCustomValue }}',
         *         decode: {
         *             set: function (value) {
         *                 this.$scope.vm.someCustomValue = value;
         *             }
         *         }
         *     }
         * }
         * ```
         *
         * On Elm side to specify a property one can do following
         * ```
         * [ Attrs.property "csCustomBinding" (Encode.string "some custom value")
         * , ...
         * ]
         * ```
         * @property {Object} [events] An object of events.
         * When AngularJS calls a callback function a new custom event will be dispatched with injectable details.
         * Let's say AngularJS component has a `csOnChange` callback with three injectables, `model`, `data` and init`.
         * We can describe it in following way
         * ```
         * events: {
         *     csOnChange: {
         *         // Custom encode function. Useful when we want to modify a value before sending to Elm.
         *         model: function (value) {
         *             return value === 'my string' : 'Yes, I have got what I wanted' : 'Oops, failed';
         *         },
         *         // Custom injectable. Useful when injectable argument name is not the same as injectable property.
         *         // E.g. injectable value is a parent scope value and not injected by the AngularJS component.
         *         data: {
         *             argumentName: 'vm.someScopeValue',
         *             encode: csCustomElement.encode.identity,
         *         },
         *         init: csCustomElement.encode.identity
         *     }
         * }
         * ```
         *
         * On Elm side to specify an event one can do following
         * ```
         * type Msg = MyMessage String Int Bool
         *
         * [ Decode.decode MyMessage
         *     |> Decode.requiredAt [ "detail", "model" ] Decode.string
         *     |> Decode.requiredAt [ "detail", "data" ] Decode.int
         *     |> Decode.requiredAt [ "detail", "init" ] Decode.bool
         *     |> Events.on "csOnChange"
         * , ...
         * ]
         * ```
         */

        /**
         * @ngdoc method
         * @name csCustomElement#create
         *
         * @description
         * Creates a custom element wrapper for AngularJS component.
         *
         * Basic usage from JS:
         * ```
         * csCustomElement.create('cs-component', {
         *     // Can be used to specify special element for AngularJS directive which will be used as attribute.
         *     attributeDirective: {
         *         element: 'div',
         *         attributeValue: '{{ vm.csExtraData }}',
         *     },
         *     attributes: ['cs-required', 'cs-change-year'],
         *     interpolations: ['csApiUrl', 'csMainAddressLabel'],
         *     scope: {
         *         csExtraData: csCustomElement.decode.string,
         *     },
         *     bindings: {
         *         csIntegerBinding: csCustomElement.decode.integer,
         *         csBooleanBinding: csCustomElement.decode.boolean,
         *     },
         *     customBindings: {
         *         csCustomBinding: {
         *             attribute: 'custom-attribute',
         *             attributeValue: '{{ vm.someCustomValue }}',
         *             decode: {
         *                 set: function (value) {
         *                     this.$scope.vm.someCustomValue = value;
         *                 }
         *             }
         *         }
         *     },
         *     events: {
         *         csOnChange: {
         *             model: function (value) {
         *                 return value === 'my string' : 'Yes, I have got what I wanted' : 'Oops, failed';
         *             },
         *             data: {
         *                 argumentName: 'vm.someScopeValue',
         *                 encode: csCustomElement.encode.identity,
         *             },
         *             init: csCustomElement.encode.identity
         *         }
         *     }
         * });
         * ```
         *
         * Basic usage from Elm:
         * ```
         * viewContaComponent : Html Msg
         * viewContaComponent =
         *     AngularCustomElement.viewWithTransclusion
         *         { componentName = "cs-component-element"
         *         , attributes =
         *             [ Attrs.attribute "cs-required" ""
         *             , Attrs.attribute "cs-change-year" ""
         *             , Attrs.property "csApiUrl" (Encode.string "some/url")
         *             , Attrs.property "csMainAddressLabel" (Encode.string "My address in Oslo")
         *             , Attrs.property "csExtraData" (Encode.string "Some extra data")
         *             , Attrs.property "csIntegerBinding" (Encode.int 42)
         *             , Attrs.property "csBooleanBinding" (Encode.bool True)
         *             , Attrs.property "csCustomBinding" (Encode.string "My custom string")
         *             , Decode.decode MyMessage
         *                 |> Decode.requiredAt [ "detail", "model" ] Decode.string
         *                 |> Decode.requiredAt [ "detail", "data" ] Decode.int
         *                 |> Decode.requiredAt [ "detail", "init" ] Decode.bool
         *                 |> Events.on "csOnChange"
         *             ]
         *         -- `transclude` takes one parameter with type `List (Html Never)`.
         *         -- Which means any content which does not produce any messages.
         *         , transclude = [ Html.text "Add some extra content here." ]
         *         }
         * ```
         *
         * From `cs-component` a custom element will be created with name `cs-component-element`.
         *
         * @param {string} componentName AngularJS component name.
         * @param {CsCustomElementCreateOptions} options Custom element options.
         * Find out more {@link CsCustomElementCreateOptions here}.
         */
        function create(componentName, options) {
            var angularComponentName = _.camelCase(componentName);

            options = options || {};

            // ASSERT CHECKS

            csAssert.ok(_.isString(componentName), 'Component name should be a string');
            csAssert.ok(
                customElements.hasOwnProperty(componentName) === false,
                'Component with name ' + componentName + ' already registered'
            );
            csAssert.ok(
                $injector.has(angularComponentName + 'Directive'),
                'There is no component defined with name: ' + angularComponentName
            );
            csAssert.ok(_.isPlainObject(options), 'Options should be an object');

            var attributeDirective = options.attributeDirective;
            var attributes = options.attributes;
            var interpolations = options.interpolations;
            var scopeProperties = options.scope;
            var bindings = options.bindings;
            var customBindings = options.customBindings;
            var events = options.events;

            csAssert.ok(
                _.isPlainObject(attributeDirective) && _.isString(attributeDirective.element) &&
                    (_.isString(attributeDirective.attributeValue) || angular.isUndefined(attributeDirective.attributeValue)) ||
                    angular.isUndefined(attributeDirective),
                'Options attribute directive should be an object with required "element" and optional "attributeValue" string properties'
            );
            csAssert.ok(
                Array.isArray(attributes) && attributes.every(_.isString) || angular.isUndefined(attributes),
                'Options attributes should be an array of strings'
            );
            csAssert.ok(
                Array.isArray(interpolations) && interpolations.every(_.isString) || angular.isUndefined(interpolations),
                'Options interpolations should be an array of strings'
            );
            csAssert.ok(
                _.isPlainObject(scopeProperties) || angular.isUndefined(scopeProperties),
                'Options scope should be an object'
            );
            csAssert.ok(
                _.isPlainObject(bindings) || angular.isUndefined(bindings),
                'Options bindings should be an object'
            );
            csAssert.ok(
                _.isPlainObject(customBindings) || angular.isUndefined(customBindings),
                'Options custom bindings should be an object'
            );
            csAssert.ok(
                _.isPlainObject(events) || angular.isUndefined(events),
                'Options events should be an object'
            );

            // CUSTOM ELEMENT CONSTRUCTOR

            customElements[componentName] = function () {
                // Super call
                var self = HTMLElement.call(this) || this;

                // Create custom element scope which is used as a store of data and as a parent for component scope.
                self.$scope = $rootScope.$new();
                self.$scope.vm = service.extendVm(self, {});

                return self;
            };

            // CUSTOM ELEMENT PROTOTYPE

            var prototype = {
                constructor: {
                    value: customElements[componentName],
                },
                connectedCallback: {
                    /**
                     * Connected callback.
                     */
                    value: function () {
                        var self = this;

                        // Create component scope which is used only while the custom element is in DOM.
                        self.componentScope = self.$scope.$new();

                        // ANGULAR COMPONENT ELEMENT

                        var componentElementWrapper = self.querySelector('cs-custom-element-component');
                        var componentElementTransclude = self.querySelector('cs-custom-element-transclude');

                        csAssert.ok(componentElementWrapper !== null, '`cs-custom-element-component` element should be defined');

                        if (attributeDirective) {
                            self.componentElement = angular.element(document.createElement(attributeDirective.element));
                            self.componentElement.attr(componentName, attributeDirective.attributeValue || '');
                        } else {
                            self.componentElement = angular.element(document.createElement(componentName));
                        }

                        // TRANSCLUDE

                        if (componentElementTransclude !== null) {
                            // Copy content for transclusion
                            self.componentElement[0].innerHTML = componentElementTransclude.innerHTML;
                        }

                        // ATTRIBUTES

                        if (attributes) {
                            attributes.forEach(function (attribute) {
                                // If attribute exist on custom element then replicate it to AngularJS component
                                if (self.hasAttribute(attribute)) {
                                    self.componentElement.attr(attribute, self.getAttribute(attribute) || '');
                                }
                            });
                        }

                        // INTERPOLATIONS

                        if (interpolations) {
                            // Adds each interpolation to AngularJS component in following way `cs-attr-name="{{ vm.csAttrName }}"`
                            interpolations.forEach(function (interpolation) {
                                self.componentElement.attr(_.kebabCase(interpolation), '{{ vm.' + interpolation + ' }}');
                            });
                        }

                        // BINDINGS

                        if (bindings) {
                            // Adds each binding to AngularJS component in following way `cs-attr-name="vm.csAttrName"`
                            Object.keys(bindings).forEach(function (binding) {
                                self.componentElement.attr(_.kebabCase(binding), 'vm.' + binding);
                            });
                        }

                        // CUSTOM BINDINGS

                        if (customBindings) {
                            // Adds each custom binding to AngularJS component in following way
                            // `{{ binding.attr }}="{{ binding.attrValue }}"`
                            _.forEach(customBindings, function (binding) {
                                self.componentElement.attr(binding.attribute, binding.attributeValue);
                            });
                        }

                        // EVENTS

                        if (events) {
                            // Adds each event to AngularJS component in following way
                            // `cs-event-name="csEventName(injectable1, injectable2, ...)"`
                            // Custom event will be dispatched with encoded injectables as detail for each AngularJS component event
                            _.forEach(events, function (event, eventName) {
                                var injectables = Object.keys(event);
                                var injectableArguments = injectables
                                    .reduce(function (accumulator, injectable) {
                                        var argumentName = _.isPlainObject(event[injectable]) ? event[injectable].argumentName : injectable;

                                        accumulator.push(argumentName);

                                        return accumulator;
                                    }, [])
                                    .join(', ');

                                self.$scope.vm[eventName] = function () {
                                    var args = arguments;

                                    self.dispatchEvent(new CustomEvent(eventName, {
                                        detail: injectables.reduce(function (detail, injectable, index) {
                                            var injectableValue = event[injectable];
                                            var encode = _.isPlainObject(injectableValue) ? injectableValue.encode : injectableValue;

                                            // Encode each injectable
                                            detail[injectable] = encode(args[index]);

                                            // Elm understands only null and not undefined
                                            if (angular.isUndefined(detail[injectable])) {
                                                detail[injectable] = null;
                                            }

                                            return detail;
                                        }, {}),
                                    }));
                                };

                                self.componentElement.attr(_.kebabCase(eventName), 'vm.' + eventName + '(' + injectableArguments + ')');
                            });
                        }

                        // APPEND AND COMPILE

                        // Make wrapper temporary invisible
                        componentElementWrapper.style.visibility = 'hidden';
                        angular.element(componentElementWrapper).append(self.componentElement);
                        $compile(self.componentElement)(self.componentScope);
                        // Wait for compile to finish and make wrapper visible again
                        // This hides uncompiled interpolations, etc. before they compile.
                        $timeout(function () {
                            componentElementWrapper.style.visibility = 'visible';
                        });
                    },
                },
                disconnectedCallback: {
                    /**
                     * Disconnected callback.
                     */
                    value: function () {
                        // Remove the component scope and element when custom element is removed from the DOM.
                        // The component scope and element is created each time custom element is added to the DOM.
                        this.componentScope.$destroy();
                        this.componentElement.remove();
                    },
                },
            };

            if (interpolations) {
                // Extends prototype with getter/setter for each interpolation
                interpolations.forEach(function (interpolation) {
                    prototype[interpolation] = service.decode.string(interpolation);
                });
            }

            if (scopeProperties) {
                // Extends prototype with getter/setter for each binding
                Object.keys(scopeProperties).forEach(function (property) {
                    var error = 'Value of scope should be a function or an object';

                    extendPrototype(scopeProperties[property], property, prototype, error);
                });
            }

            if (bindings) {
                // Extends prototype with getter/setter for each binding
                Object.keys(bindings).forEach(function (binding) {
                    var error = 'Value of binding should be a function or an object';

                    extendPrototype(bindings[binding], binding, prototype, error);
                });
            }

            if (customBindings) {
                // Extends prototype with getter/setter for each custom binding
                Object.keys(customBindings).forEach(function (binding) {
                    csAssert.ok(_.isPlainObject(customBindings[binding]), 'Value of custom binding should be an object');
                    csAssert.ok(
                        _.isString(customBindings[binding].attribute),
                        'Value of custom binding should have a string value of "attribute" property'
                    );
                    csAssert.ok(
                        _.isString(customBindings[binding].attributeValue),
                        'Value of custom binding should have a string value of "attributeValue" property'
                    );

                    var error = 'Value of custom binding should have a "decode" method or property with object type';

                    extendPrototype(customBindings[binding].decode, binding, prototype, error);
                });
            }

            if (events) {
                _.forEach(events, function (event) {
                    csAssert.ok(_.isPlainObject(event), 'Value of event should be an object with injectables');
                    csAssert.ok(
                        _.reduce(event, function (accumulator, injectable) {
                            var isCustomInjectable =
                                _.isPlainObject(injectable) &&
                                _.isFunction(injectable.encode) &&
                                _.isString(injectable.argumentName);

                            return accumulator && (_.isFunction(injectable) || isCustomInjectable);
                        }, true),
                        'Value of injectable should be either a function or an object with encode function and argument name'
                    );
                });
            }

            customElements[componentName].prototype = Object.create(HTMLElement.prototype, prototype);

            // REGISTER CUSTOM ELEMENT

            $window.customElements.define(componentName + '-element', customElements[componentName]);
        }

        // CREATE HELPERS

        /**
         * Extends custom element prototype with getter or setter or both.
         *
         * @param {Function|Object} bindingFunction Either a function which returns getter/setter or getter/setter itself.
         * @param {string} binding Binding name.
         * @param {Object} prototype Custom element prototype.
         * @param {string} error Error message.
         */
        function extendPrototype(bindingFunction, binding, prototype, error) {
            var isBindingFunction = _.isFunction(bindingFunction);

            csAssert.ok(isBindingFunction || _.isPlainObject(bindingFunction), error);

            if (isBindingFunction) {
                prototype[binding] = bindingFunction(binding);
            } else {
                prototype[binding] = bindingFunction;
            }

            hasGetterOrSetter(prototype[binding], binding);
        }

        /**
         * Checks if property has getter or setter or both.
         *
         * @param {Object} property Property to check.
         * @param {string} bindingName Binding name.
         */
        function hasGetterOrSetter(property, bindingName) {
            var getSetKeys = Object.keys(property);
            var hasGetSetProperties = _.isEqual(getSetKeys, ['set', 'get']) ||
                _.isEqual(getSetKeys, ['get', 'set']) ||
                _.isEqual(getSetKeys, ['get']) ||
                _.isEqual(getSetKeys, ['set']);

            csAssert.ok(
                _.isPlainObject(property) && hasGetSetProperties,
                'Binding "' + bindingName + '" should be have either setter or getter or both'
            );
        }

        // VM

        /**
         * @ngdoc method
         * @name csCustomElement#extendVm
         *
         * @description
         * Extends custom element scope's `vm`.
         *
         * @param {HTMLElement} self Reference to the custom element.
         * @param {Object} vm Current `vm`.
         * @returns {Object} Extended `vm`.
         */
        function extendVm(self, scope) {
            return scope;
        }

        // DECODERS

        /**
         * @ngdoc type
         * @module conta.customElement
         * @name CsCustomElementDecodeOptions
         * @subtitle Represents decode options
         *
         * @description
         * This type is used for {@link csCustomElement} service `helper.decode` method.
         *
         * @property {Function} [valueTransformation] A function to transform a value before equality check.
         * @property {Function} [equalityCheck=_.isEqual] A function to perform equality check for.
         * @property {Function} assert An assertion function to check that incoming value has correct type.
         * @property {string} type A type of incoming value. Used for error message.
         * @property {*} [nullValue=undefined] A null value which is used when incoming value is `null`.
         */

        /**
         * @ngdoc method
         * @name csCustomElement#helper.decode
         *
         * @description
         * Helper function to decode value from Elm to values for AngularJS.
         *
         * @param {CsCustomElementDecodeOptions} options Decode options.
         * Find out more {@link CsCustomElementDecodeOptions here}.
         * @returns {Function} Function to decode incoming value.
         */
        function decode(options) {
            var isValueTransformationFunction = _.isFunction(options.valueTransformation);
            var equalityCheck = options.equalityCheck || _.isEqual;

            csAssert.ok(
                isValueTransformationFunction || angular.isUndefined(options.valueTransformation),
                'Value transformation should be a function'
            );
            csAssert.ok(_.isFunction(equalityCheck), 'Equality check should be a function');
            csAssert.ok(_.isFunction(options.assert), 'Assertion should be a function');
            csAssert.ok(_.isString(options.type), 'Value type should be a string');

            var nullValue;

            if (options.hasOwnProperty('nullValue')) {
                nullValue = options.nullValue;
            }

            return function (bindingName) {
                csAssert.ok(_.isString(bindingName), 'Binding name should be a string');

                return {
                    /**
                     * Setter.
                     */
                    set: function (value) {
                        var shouldDigestChanges = false;

                        if (value === null) {
                            this.$scope.vm[bindingName] = nullValue;
                            shouldDigestChanges = true;
                        } else {
                            if (options.assert(value)) {
                                var newValue = isValueTransformationFunction ? options.valueTransformation(value) : value;

                                if (equalityCheck(newValue, this.$scope.vm[bindingName]) === false) {
                                    this.$scope.vm[bindingName] = newValue;
                                    shouldDigestChanges = true;
                                }
                            } else {
                                // Means something went wrong in the code when sending value from ELm,
                                // because actual type of a value does not equal to expected one.
                                // So we notify ourselves about it. Self compiler ;)
                                throw new Error('Expected a ' + options.type + ' or null, but got ' + typeof value);
                            }
                        }

                        if (shouldDigestChanges) {
                            // Let Angular digest changes
                            this.$scope.$evalAsync();
                        }
                    },
                };
            };
        }
    }]);
}());