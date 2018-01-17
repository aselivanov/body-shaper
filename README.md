# body-shaper

Put bodies in good shape. The goal is to make request body object
safe to navigate avoiding redundant type checks. Type checks are converted into

## Shaping

Here is how primitive shapers work.

### Primitives

There are 4 primitive shapers: Number, String, Boolean, and Date. All of them
preserve `undefined` and `null` values.

#### Number

Empty string and empty array are shaped as `null`. In the rest it falls back 
to `Number` function.

#### String



## How It Works

`null` means intentional emptiness. Useful for unsetting value for example.

`undefined` and undeclared are equally mean absense of value with no interest 
in that value.

Both `null` and `undefined` (undeclared) are preserved by primitive shapers.

### Array

If the value passed to Array shaper is not an array it first converted to array
using the following rules:

* falsy value becomes an empty array,
* truthy value is wrapped into array becoming its single element.

### Object

First of all value is wrapped with `Object` function call to make sure we can 
safely access its properties. Then property shapers are applied one by one. 
If shaped property value is `undefined` (i.e. appropriate property shaper 
returned `undefined`) the property won't go into resulting shaped object.
This way we won't pollute resulting object tree and it's still safe to access
those properties.


### Primitives

`Number`, `String`, `Boolean`, and `Date`.
Primitive shapers does almost what appropriate functions (`Number`, `String`, etc.)
do with some exceptions though:

* `null` and `undefined` values are preserved
* empty string is shaped as `null` for `Number` shaper

## Convertion

### Array

So when you expected an array at some place and value _is not_ an array it
shaped as follows:

* falsy value becomes an empty array,
* otherwise value is wrapped into array and becomes its single value.

```js
let shape = shaper([String]) // expecting array of strings

shape([]) // []
shape(['hello']) // ['hello']
shape('hello') // ['hello']
shape(false) // []
shape(0) // []
```

### Object



Type checks are now shape definition:

```js

let Profile = shaper({
    firstName: String,
    lastName: String,
    emails: [{
        address: String,
        isPrimary: Boolean
    }],
    employments: [{
        company: String,
        dates: {
            since: Date,
            till: Date
        }
    }]
})

Profile({}) =>
{
    emails: [],
    employments: []
}

```


```js
let payload = req.body;
if (payload.items && Array.isArray(payload.items)) {

}
```

let shape = shaper({
    items: [{
        id: String,
        quantity: Number
    }]
})
let payload = shape(req.payload)
if (payload.items.length === 0){}


The goal is to make payload objects with expected structure
safe to navigate. Useful for normalizing (shaping) raw request payload.

## Installation

```sh
npm install body-shaper
```

## Shaping

### Coercion, type casting,
### Undeclared nodes

Shaper translates undeclared properties to `undefined` for primitives.

```js
assert.deepEqual(
    shaper({ val: String })({}),
    { val: undefined }
)
```

`undefined` and `null` stay untouched.

The library does coercion based on some language best practices.

## Examples

```js
const shaper = require('body-shaper');

const shape = shaper({
    username: String,
    dateOfBirth: Date,
    isPublic: Boolean,
    experiences: [
        {
            company: String,
            years: {
                from: Number,
                to: Number
            }
        }
    ]
});


> shape({})
{
    username: '',
    dateOfBirth: null,
    idPublic: null,
    experiences: []
}


> shape({
>     username: '    Aleks ',
>     isPublic: 'yes',
>     dateOfBirth: '1987-12-01',
>     experiences: [
>         {
>             company: 'Slow Motion Software'
>         }
>     ]
> }
{
    username: 'Aleks',
    isPublic: true,
    dateOfBirth: new Date('1987-12-01'),
    experiences: [
        {
            company: 'Slow Motion Software',
            years: {
                from: null,
                to: null
            }
        }
    ]
}
```

## Extending

Feel free to use your own shapers.

```js
const shape = shaper({
    tags: (string) =>
        String(string || '').split(',')
            .map(tag => tag.trim())
            .filter(tag => tag)
})

> shape({
>     tags: 'hello, world,     ,, ,yay',
> })
{
    tags: ['hello', 'world', 'yay']
}
```