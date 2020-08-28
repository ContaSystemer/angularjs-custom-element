describe('Service: csCustomElement', function () {
    'use strict';

    var service, $window, $compile, $compileLinkFunction, injectorSpy, $timeout;

    beforeEach(function () {
        $compileLinkFunction = jasmine.createSpy('linkFunction');
        $compile = jasmine.createSpy('$compile').and.returnValue($compileLinkFunction);

        module('conta.customElement', function ($provide) {
            $provide.value('$compile', $compile);
        });

        inject(function ($injector) {
            service = $injector.get('csCustomElement');
            $window = $injector.get('$window');
            $timeout = $injector.get('$timeout');

            injectorSpy = spyOn($injector, 'has').and.returnValue(true);
        });
    });

    it('should exist', function () {
        expect(service).toBeTruthy();
    });

    describe('create(componentName, options)', function () {
        it('should throw an error if component name is not valid', function () {
            expect(function () {
                service.create();
            }).toThrowError('Component name should be a string');
        });

        it('should throw an error if component with same name already defined', function () {
            service.create('cs-conta-component');

            expect(function () {
                service.create('cs-conta-component');
            }).toThrowError('Component with name cs-conta-component already registered');
        });

        it('should throw an error if component is not defined', function () {
            injectorSpy.and.returnValue(false);

            expect(function () {
                service.create('cs-conta-component');
            }).toThrowError('There is no component defined with name: csContaComponent');
        });

        it('should throw an error if options are not an object', function () {
            expect(function () {
                service.create('cs-conta-component', 'options');
            }).toThrowError('Options should be an object');
        });

        it('should throw an error if options directive element property is not a string', function () {
            var error =
                'Options attribute directive should be an object with required "element" and optional "attributeValue" string properties';

            ['attributeDirective', {}, { element: {} }, { element: 'element', attributeValue: {} }].forEach(function (attributeDirective) {
                expect(function () {
                    service.create('cs-conta-component', {
                        attributeDirective: attributeDirective,
                    });
                }).toThrowError(error);
            });
        });

        it('should throw an error if options attributes property is not an array of strings', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    attributes: 'attributes',
                });
            }).toThrowError('Options attributes should be an array of strings');
        });

        it('should throw an error if options interpolations property is not an array of strings', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    interpolations: 'interpolations',
                });
            }).toThrowError('Options interpolations should be an array of strings');
        });

        it('should throw an error if options scope property is not an object', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    scope: 'scope',
                });
            }).toThrowError('Options scope should be an object');
        });

        it('should throw an error if options bindings property is not an object', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    bindings: 'bindings',
                });
            }).toThrowError('Options bindings should be an object');
        });

        it('should throw an error if options custom bindings property is not an object', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    customBindings: 'customBindings',
                });
            }).toThrowError('Options custom bindings should be an object');
        });

        it('should throw an error if options events property is not an object', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    events: 'events',
                });
            }).toThrowError('Options events should be an object');
        });

        it('should throw an error if value of options events key is not an object', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    events: {
                        csEvent: 'csEvent',
                    },
                });
            }).toThrowError('Value of event should be an object with injectables');
        });

        it('should throw an error if injectable of options events is not a function or it is not a custom injectable', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    events: {
                        csEvent: {
                            injectable: {
                                encode: angular.loop,
                                argumentName: angular.noop,
                            },
                        },
                    },
                });
            }).toThrowError('Value of injectable should be either a function or an object with encode function and argument name');
        });

        it('should throw an error if scope properties are in invalid format', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    scope: {
                        csModel: 'model',
                    },
                });
            }).toThrowError('Value of scope should be a function or an object');
        });

        it('should throw an error if scope properties are not a getter or setter', function () {
            expect(function () {
                service.create('cs-conta-component-1', {
                    scope: {
                        csModel: {},
                    },
                });
            }).toThrowError('Binding "csModel" should be have either setter or getter or both');

            expect(function () {
                service.create('cs-conta-component-2', {
                    scope: {
                        /**
                         * Cs-model binding.
                         */
                        csModel: function () {
                            return 'model';
                        },
                    },
                });
            }).toThrowError('Binding "csModel" should be have either setter or getter or both');
        });

        it('should throw an error if bindings are in invalid format', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    bindings: {
                        csModel: 'model',
                    },
                });
            }).toThrowError('Value of binding should be a function or an object');
        });

        it('should throw an error if bindings are not a getter or setter', function () {
            expect(function () {
                service.create('cs-conta-component-1', {
                    bindings: {
                        csModel: {},
                    },
                });
            }).toThrowError('Binding "csModel" should be have either setter or getter or both');

            expect(function () {
                service.create('cs-conta-component-2', {
                    bindings: {
                        /**
                         * Cs-model binding.
                         */
                        csModel: function () {
                            return 'model';
                        },
                    },
                });
            }).toThrowError('Binding "csModel" should be have either setter or getter or both');
        });

        it('should throw an error if custom bindings are not objects', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    customBindings: {
                        csModel: 'model',
                    },
                });
            }).toThrowError('Value of custom binding should be an object');
        });

        it('should throw an error if custom bindings "attribute" property is not a string', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    customBindings: {
                        csModel: {
                            attribute: {},
                        },
                    },
                });
            }).toThrowError('Value of custom binding should have a string value of "attribute" property');
        });

        it('should throw an error if custom bindings "attributeValue" property is not a string', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    customBindings: {
                        csModel: {
                            attribute: 'attribute',
                            attributeValue: {},
                        },
                    },
                });
            }).toThrowError('Value of custom binding should have a string value of "attributeValue" property');
        });

        it('should throw an error if custom bindings "decode" property in invalid format', function () {
            expect(function () {
                service.create('cs-conta-component', {
                    customBindings: {
                        csModel: {
                            attribute: 'attribute',
                            attributeValue: 'attributeValue',
                            decode: 'decode',
                        },
                    },
                });
            }).toThrowError('Value of custom binding should have a "decode" method or property with object type');
        });

        it('should throw an error if custom bindings "decode" property value is not a getter or setter', function () {
            expect(function () {
                service.create('cs-conta-component-1', {
                    customBindings: {
                        csModel: {
                            attribute: 'attribute',
                            attributeValue: 'attributeValue',
                            decode: {
                                /**
                                 * Getter.
                                 */
                                get: function () {},
                                /**
                                 * Setter.
                                 */
                                set: function () {},
                                something: 'else',
                            },
                        },
                    },
                });
            }).toThrowError('Binding "csModel" should be have either setter or getter or both');

            expect(function () {
                service.create('cs-conta-component-2', {
                    customBindings: {
                        csModel: {
                            attribute: 'attribute',
                            attributeValue: 'attributeValue',
                            /**
                             * Cs-model binding.
                             */
                            decode: function () {
                                return 'model';
                            },
                        },
                    },
                });
            }).toThrowError('Binding "csModel" should be have either setter or getter or both');
        });

        it('should define custom element correctly', function () {
            service.create('cs-conta-component-0');

            expect($window.customElements.get('cs-conta-component-0-element')).toBeDefined();
        });

        it('should create a prototype', function () {
            service.create('cs-conta-component-3');

            var contaComponent = $window.customElements.get('cs-conta-component-3-element');

            expect(contaComponent.prototype.constructor).toBe(contaComponent);
            expect(typeof contaComponent.prototype.connectedCallback).toBe('function');
            expect(typeof contaComponent.prototype.disconnectedCallback).toBe('function');
        });

        it('constructor should create a scope', function () {
            service.create('cs-conta-component-2');

            var contaComponent = document.createElement('cs-conta-component-2-element');

            expect(contaComponent.$scope).toBeDefined();
            expect(contaComponent.$scope.constructor.name).toBe('Scope');
            expect(contaComponent.$scope.$parent).toBe(contaComponent.$scope.$root);
        });

        it('should create component scope correctly', function () {
            service.create('cs-conta-component-28');

            var contaComponent = document.createElement('cs-conta-component-28-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            expect(contaComponent.componentScope).toBeDefined();
            expect(contaComponent.componentScope.constructor.name).toBe('Scope');
            expect(contaComponent.componentScope.$parent).toBe(contaComponent.$scope);
        });

        it('should create component element correctly', function () {
            service.create('cs-conta-component-5');

            var contaComponent = document.createElement('cs-conta-component-5-element');
            var contaComponentWrapper = document.createElement('cs-custom-element-component');

            contaComponent.appendChild(contaComponentWrapper);
            document.body.appendChild(contaComponent);

            var componentElement = contaComponentWrapper.children[0];

            expect(contaComponent.componentElement[0]).toBe(componentElement);
            expect(componentElement.tagName).toBe('CS-CONTA-COMPONENT-5');
        });

        it('should create component element correctly for attribute directive', function () {
            service.create('cs-conta-component-26', {
                attributeDirective: {
                    element: 'some-defined-element',
                },
            });

            var contaComponent = document.createElement('cs-conta-component-26-element');
            var contaComponentWrapper = document.createElement('cs-custom-element-component');

            contaComponent.appendChild(contaComponentWrapper);
            document.body.appendChild(contaComponent);

            var componentElement = contaComponentWrapper.children[0];

            expect(contaComponent.componentElement[0]).toBe(componentElement);
            expect(componentElement.tagName).toBe('SOME-DEFINED-ELEMENT');
            expect(componentElement.hasAttribute('cs-conta-component-26')).toBe(true);
            expect(componentElement.getAttribute('cs-conta-component-26')).toBe('');
        });

        it('should create component element correctly for attribute directive with attribute value', function () {
            service.create('cs-conta-component-27', {
                attributeDirective: {
                    element: 'some-defined-element',
                    attributeValue: '{{ someValue }}',
                },
            });

            var contaComponent = document.createElement('cs-conta-component-27-element');
            var contaComponentWrapper = document.createElement('cs-custom-element-component');

            contaComponent.appendChild(contaComponentWrapper);
            document.body.appendChild(contaComponent);

            var componentElement = contaComponentWrapper.children[0];

            expect(contaComponent.componentElement[0]).toBe(componentElement);
            expect(componentElement.tagName).toBe('SOME-DEFINED-ELEMENT');
            expect(componentElement.hasAttribute('cs-conta-component-27')).toBe(true);
            expect(componentElement.getAttribute('cs-conta-component-27')).toBe('{{ someValue }}');
        });

        it('connected callback should set trancluded content correctly', function () {
            service.create('cs-conta-component-23');

            var contaComponent = document.createElement('cs-conta-component-23-element');
            var contaComponentTransclude = document.createElement('cs-custom-element-transclude');

            contaComponentTransclude.innerHTML = 'Some html';

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            contaComponent.appendChild(contaComponentTransclude);
            document.body.appendChild(contaComponent);

            expect(contaComponent.componentElement[0].innerHTML).toBe('Some html');
        });

        it('connected callback should set attributes correctly', function () {
            service.create('cs-conta-component-4', {
                attributes: ['cs-attr-1', 'cs-attr-2'],
            });

            var contaComponent = document.createElement('cs-conta-component-4-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));

            contaComponent.setAttribute('cs-attr-1', '');
            contaComponent.setAttribute('cs-attr-3', '');

            document.body.appendChild(contaComponent);

            expect(contaComponent.componentElement[0].hasAttribute('cs-attr-1')).toBe(true);
            expect(contaComponent.componentElement[0].hasAttribute('cs-attr-2')).toBe(false);
            expect(contaComponent.componentElement[0].hasAttribute('cs-attr-3')).toBe(false);
        });

        it('connected callback should set interpolations correctly', function () {
            service.create('cs-conta-component-24', {
                interpolations: ['csApiUrl', 'csAddress'],
            });

            var contaComponent = document.createElement('cs-conta-component-24-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            expect(contaComponent.componentElement.attr('cs-api-url')).toBe('{{ vm.csApiUrl }}');
            expect(contaComponent.componentElement.attr('cs-address')).toBe('{{ vm.csAddress }}');
        });

        it('string decoder should be used for interpolation', function () {
            spyOn(service.decode, 'string').and.callThrough();

            service.create('cs-conta-component-25', {
                interpolations: ['csApiUrl'],
            });

            expect(service.decode.string).toHaveBeenCalledWith('csApiUrl');
        });

        it('connected callback should set bindings correctly', function () {
            service.create('cs-conta-component-7', {
                bindings: {
                    csBoolean: service.decode.boolean,
                    csInteger: service.decode.integer,
                },
            });

            var contaComponent = document.createElement('cs-conta-component-7-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            expect(contaComponent.componentElement.attr('cs-boolean')).toBe('vm.csBoolean');
            expect(contaComponent.componentElement.attr('cs-integer')).toBe('vm.csInteger');
        });

        it('binding function should be called with binding name', function () {
            spyOn(service.decode, 'boolean').and.callThrough();

            service.create('cs-conta-component-12', {
                bindings: {
                    csModel: service.decode.boolean,
                },
            });

            expect(service.decode.boolean).toHaveBeenCalledWith('csModel');
        });

        it('connected callback should set custom bindings correctly', function () {
            service.create('cs-conta-component-8', {
                customBindings: {
                    csBoolean: {
                        attribute: 'boolean',
                        attributeValue: '{{ csBoolean }}',
                        decode: service.decode.boolean,
                    },
                    csInteger: {
                        attribute: 'custom-integer',
                        attributeValue: 'conta-custom-integer-value',
                        decode: service.decode.integer,
                    },
                },
            });

            var contaComponent = document.createElement('cs-conta-component-8-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            expect(contaComponent.componentElement.attr('boolean')).toBe('{{ csBoolean }}');
            expect(contaComponent.componentElement.attr('custom-integer')).toBe('conta-custom-integer-value');
        });

        it('custom binding function should be called with binding name', function () {
            spyOn(service.decode, 'boolean').and.callThrough();

            service.create('cs-conta-component-13', {
                customBindings: {
                    csModel: {
                        attribute: 'attribute',
                        attributeValue: 'attributeValue',
                        decode: service.decode.boolean,
                    },
                },
            });

            expect(service.decode.boolean).toHaveBeenCalledWith('csModel');
        });

        it('connected callback should set events correctly', function () {
            service.create('cs-conta-component-9', {
                events: {
                    csOnChange: {
                        model: service.encode.identity,
                        otherValue: {
                            argumentName: 'vm.otherValue',
                            encode: service.encode.identity,
                        },
                    },
                    csOnInit: {
                        init: service.encode.identity,
                    },
                },
            });

            var contaComponent = document.createElement('cs-conta-component-9-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            expect(contaComponent.componentElement.attr('cs-on-change')).toBe('vm.csOnChange(model, vm.otherValue)');
            expect(contaComponent.componentElement.attr('cs-on-init')).toBe('vm.csOnInit(init)');
            expect(typeof contaComponent.$scope.vm.csOnChange).toBe('function');
            expect(typeof contaComponent.$scope.vm.csOnInit).toBe('function');
        });

        it('events should dispatch new custom events with encoded injectables', function () {
            service.create('cs-conta-component-11', {
                events: {
                    csOnChange: {
                        model: service.encode.identity,
                        otherValue: {
                            argumentName: 'vm.otherValue',
                            encode: service.encode.identity,
                        },
                    },
                },
            });

            var contaComponent = document.createElement('cs-conta-component-11-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            contaComponent.addEventListener('csOnChange', handleChange);

            var value = '2000-01-01';
            var otherValue = { some: 'object' };

            contaComponent.$scope.vm.csOnChange(value);
            contaComponent.$scope.vm.csOnChange(value, otherValue, 'some', 'thing', 'else');
            contaComponent.removeEventListener('csOnChange', handleChange);

            /**
             * Handles change.
             */
            function handleChange(event) {
                expect(event.detail.model).toEqual('2000-01-01');

                if (event.detail.otherValue) {
                    expect(event.detail.otherValue).toBe(otherValue);
                } else {
                    expect(event.detail.otherValue).toBe(null);
                }

                expect(Object.keys(event.detail)).toEqual(['model', 'otherValue']);
            }
        });

        it('connected callback should compile component element', function () {
            service.create('cs-conta-component-10');

            var contaComponent = document.createElement('cs-conta-component-10-element');
            var componentElement = document.createElement('cs-custom-element-component');

            contaComponent.appendChild(componentElement);
            document.body.appendChild(contaComponent);

            expect($compile).toHaveBeenCalledWith(contaComponent.componentElement);
            expect($compileLinkFunction).toHaveBeenCalledWith(contaComponent.componentScope);
            expect(componentElement.style.visibility).toBe('hidden');
            $timeout.flush();
            expect(componentElement.style.visibility).toBe('visible');
        });

        it('disconnected callback should destroy a component scope', function () {
            service.create('cs-conta-component-22');

            var contaComponent = document.createElement('cs-conta-component-22-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            spyOn(contaComponent.componentScope, '$destroy');

            document.body.removeChild(contaComponent);

            expect(contaComponent.componentScope.$destroy).toHaveBeenCalled();
        });

        it('disconnected callback should destroy a component element', function () {
            service.create('cs-conta-component-29');

            var contaComponent = document.createElement('cs-conta-component-29-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            spyOn(contaComponent.componentElement, 'remove');

            document.body.removeChild(contaComponent);

            expect(contaComponent.componentElement.remove).toHaveBeenCalled();
        });
    });

    describe('helper.decode(options)', function () {
        it('should throw an error if value transformation is not a function', function () {
            expect(function () {
                service.helper.decode({
                    valueTransformation: 'valueTransformation',
                });
            }).toThrowError('Value transformation should be a function');
        });

        it('should throw an error if equality check is not a function', function () {
            expect(function () {
                service.helper.decode({
                    equalityCheck: 'equalityCheck',
                });
            }).toThrowError('Equality check should be a function');
        });

        it('should throw an error if assertion is not a function', function () {
            expect(function () {
                service.helper.decode({
                    assert: 'assert',
                });
            }).toThrowError('Assertion should be a function');
        });

        it('should throw an error if type is not a string', function () {
            expect(function () {
                service.helper.decode({
                    assert: angular.noop,
                    type: {},
                });
            }).toThrowError('Value type should be a string');
        });

        it('should return decode function', function () {
            var decode = service.helper.decode({
                assert: angular.isString,
                type: 'string',
            });

            expect(typeof decode).toBe('function');
        });

        it('should throw an error if decode function is called with not a string', function () {
            var decode = service.helper.decode({
                assert: angular.isString,
                type: 'string',
            });

            expect(function () {
                decode();
            }).toThrowError('Binding name should be a string');
        });

        it('decode function should return a setter', function () {
            var decode = service.helper.decode({
                assert: angular.isString,
                type: 'string',
            });
            var setter = decode('csModel');

            expect(Object.keys(setter)).toEqual(['set']);
            expect(typeof setter.set).toBe('function');
        });

        it('should set scope value to null value if null is decoded', function () {
            service.create('cs-conta-component-14', {
                bindings: {
                    csModel: service.helper.decode({
                        assert: angular.isString,
                        type: 'string',
                        nullValue: 'null value',
                    }),
                },
            });

            var contaComponent = document.createElement('cs-conta-component-14-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            contaComponent.csModel = null;

            expect(contaComponent.$scope.vm.csModel).toBe('null value');
        });

        it('should set scope value to undefined if null is decoded', function () {
            service.create('cs-conta-component-15', {
                bindings: {
                    csModel: service.helper.decode({
                        assert: angular.isString,
                        type: 'string',
                    }),
                },
            });

            var contaComponent = document.createElement('cs-conta-component-15-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            contaComponent.csModel = null;

            expect(contaComponent.$scope.vm.csModel).toBe(undefined);
        });

        it('should digest changes if null is decoded', function () {
            service.create('cs-conta-component-16', {
                bindings: {
                    csModel: service.helper.decode({
                        assert: angular.isString,
                        type: 'string',
                    }),
                },
            });

            var contaComponent = document.createElement('cs-conta-component-16-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            spyOn(contaComponent.$scope, '$evalAsync');

            contaComponent.csModel = null;

            expect(contaComponent.$scope.$evalAsync).toHaveBeenCalled();
        });

        it('should throw an error if assertion failed', function () {
            service.create('cs-conta-component-17', {
                bindings: {
                    csModel: service.helper.decode({
                        assert: angular.isString,
                        type: 'string',
                    }),
                },
            });

            var contaComponent = document.createElement('cs-conta-component-17-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            expect(function () {
                contaComponent.csModel = 123;
            }).toThrowError('Expected a string or null, but got number');
        });

        it('should set scope value to new one if it is different', function () {
            service.create('cs-conta-component-18', {
                bindings: {
                    csModel: service.helper.decode({
                        assert: angular.isString,
                        type: 'string',
                    }),
                },
            });

            var contaComponent = document.createElement('cs-conta-component-18-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            expect(contaComponent.$scope.vm.csModel).not.toBe('123');

            contaComponent.csModel = '123';

            expect(contaComponent.$scope.vm.csModel).toBe('123');
        });

        it('should digest scope value changes', function () {
            service.create('cs-conta-component-19', {
                bindings: {
                    csModel: service.helper.decode({
                        assert: angular.isString,
                        type: 'string',
                    }),
                },
            });

            var contaComponent = document.createElement('cs-conta-component-19-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            spyOn(contaComponent.$scope, '$evalAsync');

            contaComponent.csModel = '123';

            expect(contaComponent.$scope.$evalAsync).toHaveBeenCalled();
        });

        it('should not digest if scope value is same as old value', function () {
            service.create('cs-conta-component-20', {
                bindings: {
                    csModel: service.helper.decode({
                        assert: angular.isString,
                        type: 'string',
                    }),
                },
            });

            var contaComponent = document.createElement('cs-conta-component-20-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            contaComponent.csModel = '123';

            spyOn(contaComponent.$scope, '$evalAsync');

            contaComponent.csModel = '123';

            expect(contaComponent.$scope.$evalAsync).not.toHaveBeenCalled();
        });

        it('should apply value transformation correctly', function () {
            service.create('cs-conta-component-21', {
                bindings: {
                    csModel: service.helper.decode({
                        /**
                         * Value transformation.
                         */
                        valueTransformation: function () {
                            return '321';
                        },
                        assert: angular.isString,
                        type: 'string',
                    }),
                },
            });

            var contaComponent = document.createElement('cs-conta-component-21-element');

            contaComponent.appendChild(document.createElement('cs-custom-element-component'));
            document.body.appendChild(contaComponent);

            expect(contaComponent.$scope.vm.csModel).not.toBe('321');

            contaComponent.csModel = '123';

            expect(contaComponent.$scope.vm.csModel).toBe('321');
        });
    });

    describe('encode.identity(value)', function () {
        it('should encode value as is', function () {
            expect(service.encode.identity('value')).toBe('value');
            expect(service.encode.identity(123)).toBe(123);
            expect(service.encode.identity(undefined)).toBe(undefined);
            expect(service.encode.identity(null)).toBe(null);
        });
    });
});