# body-shaper

Put bodies in good shape. The goal is to make objects with expected structure 
safe to navigate. Useful for normalizing (shaping) raw request payload.

## Installation

```sh
npm install body-shaper
```

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