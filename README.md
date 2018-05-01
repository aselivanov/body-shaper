# body-shaper

Put bodies in good shape.

The goal is to make incoming data with expected structure safe to navigate
avoiding redundant structure and type checks. 

```js
let shaper = require('body-shaper')

let Profile = shaper({
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    employment: [{
        company: String,
        years: {
            since: Number,
            till: Number
        }
    }]
})

app.post('/profile', (req, res) => {
    let profile = Profile(req.body)
    // `profile` matches `Profile` shape now!
    profile.employment.forEach((e) => {
        if (e.years.since > e.years.till) {
            [e.years.since, e.years.till] = [e.years.till, e.years.since]
        }
    })
})
```

You don't have to worry about all possible inputs coming from `req.body` (or anywhere else).
Shaper absorbs generic structure checking and type conversion logic.
Like this.

```js
app.post('/profile', (req, res) => {
    let data = req.body
    let clean = {}
    if (data.firstName)
        clean.firstName = String(data.firstName).trim()
    if (data.lastName)
        clean.lastName = String(data.lastName).trim()
    if (data.dateOfBirth)
        clean.dateOfBirth = new Date(data.dateOfBirth)
    if (Array.isArray(data.employment)) {
        clean.employment = data.employment.map(record => {
            let cleanRecord = {
                years: {}
            }
            if (record) {
                if (record.company) {
                    cleanRecord.company = String(record.company).trim()
                    if (record.years) {
                        if (record.years.since)
                            cleanRecord.years.since = Number(record.years.since)
                        if (record.years.till)
                            cleanRecord.years.till = Number(record.years.till)
                    }
                }
            }
        })
    }
    ...
});
```

## Shaping

Array shaper works as follows:

* falsy value goes as an empty array
* if it's `Array.isArray` then it's mapped with the element shaper
* otherwise it's being shaped as element and wrapped as array 

Object shaper wraps input with `Object()` call and applies property shapers optimizing `undefined` resulting values as undeclared properties.

```js
let Profile = shaper({
    name: { first: String, last: String },
    emails: [String]
})

profile(null) // { name: {}, emails: [] }
```

Type constructor functions (e.g. `Number()`) is a backbone of simple shapers.

`undefined` and `null` goes untouched through simple shapers.

```js
shaper(Boolean)(undefined) // undefined
shaper(Boolean)(null) // null
```

String input value is trimmed by default for simple and container shapers.

```js
shaper(String)('  hello ') // 'hello' 
```

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
Put request bodies in good shape.

Shaper extends notion of coercion to object level and make it explicit. 
The goal is to make objects with expected structure safe to navigate. Useful 
for normalizing (shaping) raw request body.

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


# Phylosophy

`undefined` is (unintentional) absence of any meaningful value. `null` at the
other hand represents intention to unset (nullify) value.

Consider we pass the following to `PUT /api/profile`:

```
{
    dateOfBirth: null
}
```

This is a way to unset date of birth in the user profile. While the following
payload would not affect `dateOfBirth` property:

```
{
    firstName: 'Aleks',
    lastName: 'Selivanov',
    dateOfBirth: undefined,
    email: undefined
}
```

and would be treated like the following payload:

```
{
    firstName: 'Aleks',
    lastName: 'Selivanov'
}
```

`undefined` and `null` _input_ values are being kept for primitives:

```
shaper(String)(undefined) // undefined
shaper(String)(null) // null
```

## Special case for `undefined`

There's one notable case for `undefined` value produced by shaper. It is when
"incompatible" _input_ value was passed. Let's get it by example.

Consider the following simplified user profile shaper:

```
let shape = shaper({
    name: String // full name (e.g. 'Aleks Selivanov')
})
```

And somehow client application relies on a different scheme and passes full name
as an object with two props:

```
let payload = {
    name: {
        first: 'Aleks',
        last: 'Selivanov'
    }
}
```

So shaper would produce an empty object (setting `name` to `undefined` 
implicitly):

```
shape(payload) // {}
```

The reason is that there was not meaningful _input_ value passed at a given path.

Let's summarize. `undefined` represents unintentional absence of any meaningful 
value. It's one of two cases:

* absence of property in an object
* there's no meaningful value candidate.


### String

* Boolean input value becomes either `'true'` or `'false'` string.
* Number value zero is being converted to string `'0'` replacing original 
coercion.

Object input values is shaped to `undefined` (even an empty object).

Arrays handling is a bit more complex. If it contains primitives it's being 
concatenated as usual. Otherwise it's `undefined`.





In the most general sense any JavaScript _value_ is an _object tree_. Even
so called primitive types are real objects with properties. Our goal is to
"adjust" raw input value came from somewhere to expected structure. This is not
to be confused with a validation task. Shaper eliminates inter-environmental 
differences.

Consider the following data structure:

let shapeProfile = shaper({
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    education: [
        {
            school: String,
            years: {
                since: Number,
                till: Number
            }
        }
    ],

})

let body = req.body

if (body.dateOfBirth) {
    dateOfBirth = new Date(body.dateOfBirth)
}
if (body.firstName) {
    body.firstName = String(body.firstName).trim() 
}

if (Array.isArray(body.education)) {
    body.education.forEach((educationRecord) => {
        if ('years' in educationRecord) {

        }
    })
}


## Shapers 

There are two group of variable types.

Simple types are: boolean, number, string, and Date.

`null` and `undefined` are always preserved for simple types.

`undefined` is optimized to undeclared object property for simple type.

### String

Zero `0` goes `'0'`, any other falsy value goes empty string `''`.

`Date` input is shaped using `.toISOString()` method.

Other non-primitive input value is incompatible.

### Number


