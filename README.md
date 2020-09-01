# Description

AngularJS custom element module provides functionality to wrap directive/component with custom element.
Internally in Conta we use the service to reuse existing AngularJS directives/components in Elm.

The service has accompany [Elm module](https://package.elm-lang.org/packages/ContaSystemer/elm-angularjs-custom-element/latest/).

# Dependencies

The service uses ES5 syntax to create custom elements.
You'll need to include two pollyfils before you include a code with your custom elements:

- **@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js** - this is for new browsers in order to understand ES5 syntax.
- **@webcomponents/custom-elements/custom-elements.min.js** - this is for old browsers without `customElements` support.

You can add them to your `index.html` file in the following way. Make sure to add it before adding you app scripts.

```html
<div id="custom-elements-adapter">
    <!-- Trick to include custom elements es5 adapter only if custom elements are supported -->
    <script type="text/javascript">
        if ('customElements' in window === false) {
            var adapter = document.getElementById('custom-elements-adapter');

            adapter.parentNode.removeChild(adapter);
            adapter = undefined;
        }
    </script>
    <script type="text/javascript" src="vendor/custom-elements-es5-adapter.js"></script>
</div>

<div id="custom-elements-polyfill">
    <!-- Trick to include custom elements polyfill only if custom elements are not supported -->
    <script type="text/javascript">
        if ('customElements' in window) {
            var polyfill = document.getElementById('custom-elements-polyfill');

            polyfill.parentNode.removeChild(polyfill);
            polyfill = undefined;
        }
    </script>
    <script type="text/javascript" src="vendor/custom-elements.min.js"></script>
</div>
```

# Install

Include the file in HTML

```html
<script src="/node_modules/lodash/lodash.js"></script>
<script src="/node_modules/@contasystemer/angularjs-assert/src/angularjs-assert.js"></script>
<script src="/node_modules/@contasystemer/angularjs-custom-element/src/angularjs-custom-element.js"></script>
```

or require the file

```js
require('@contasystemer/angularjs-custom-element');
```

# Use

In JavaScript

```javascript
csCustomElement.create('cs-component', {
    // Can be used to specify special element for AngularJS directive which will be used as attribute.
    attributeDirective: {
        element: 'div',
        attributeValue: '{{ vm.csExtraData }}',
    },
    attributes: ['cs-required', 'cs-change-year'],
    interpolations: ['csApiUrl', 'csMainAddressLabel'],
    scope: {
        csExtraData: csCustomElement.decode.string,
    },
    bindings: {
        csIntegerBinding: csCustomElement.decode.integer,
        csBooleanBinding: csCustomElement.decode.boolean,
    },
    customBindings: {
        csCustomBinding: {
            attribute: 'custom-attribute',
            attributeValue: '{{ vm.someCustomValue }}',
            decode: {
                set: function (value) {
                    this.$scope.vm.someCustomValue = value;
                }
            }
        }
    },
    events: {
        csOnChange: {
            model: function (value) {
                return value === 'my string' : 'Yes, I have got what I wanted' : 'Oops, failed';
            },
            data: {
                argumentName: 'vm.someScopeValue',
                encode: csCustomElement.encode.identity,
            },
            init: csCustomElement.encode.identity
        }
    }
});
```

In Elm:

```elm
viewContaComponent : Html Msg
viewContaComponent =
    AngularCustomElement.viewWithTransclusion
        { componentName = "cs-component-element"
        , attributes =
            [ Attrs.attribute "cs-required" ""
            , Attrs.attribute "cs-change-year" ""
            , Attrs.property "csApiUrl" (Encode.string "some/url")
            , Attrs.property "csMainAddressLabel" (Encode.string "My address in Oslo")
            , Attrs.property "csExtraData" (Encode.string "Some extra data")
            , Attrs.property "csIntegerBinding" (Encode.int 42)
            , Attrs.property "csBooleanBinding" (Encode.bool True)
            , Attrs.property "csCustomBinding" (Encode.string "My custom string")
            , Decode.decode MyMessage
                |> Decode.requiredAt [ "detail", "model" ] Decode.string
                |> Decode.requiredAt [ "detail", "data" ] Decoder.int
                |> Decode.requiredAt [ "detail", "init" ] Decode.bool
                |> Events.on "csOnChange"
            ]
        -- `transclude` takes one parameter with type `List (Html Never)`.
        -- Which means any content which does not produce any messages.
        , transclude = [ Html.text "Add some extra content here." ]
        }
```

From `cs-component` a custom element will be created with name `cs-component-element`.

For more details/examples please read the source code.

# Extend

The service exposes helper functions for decoding and encoding common types.
The service exposes `helper.decode` function to construct custom decoding functions.
Use [module.decorator](https://docs.angularjs.org/guide/decorators) to augment decoders and encoders.
E.g. at Conta we have decoders for `moment` values, etc..

To augment scope's `vm` for each custom element use [module.decorator](https://docs.angularjs.org/guide/decorators) to override `extendVm` method.
E.g. at Conta we use `extendVm` method to augment each custom element scope's `vm` with `sendToElm` method.
`sendToElm` method allows us to send messages from AngularJS to Elm directly (depends on internal implementation).