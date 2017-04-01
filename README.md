# body-shaper

Put request bodies in good shape. Useful for normalizing (shaping) raw form input.

## Installation

    npm install body-shaper

## Examples

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
                years: {}
            }
        ]
    }

## Extending

Feel free to use your own shapers.

    const shape = shaper({
        tags: (string) => String(string || '').split(',').map(tag => tag.trim()).filter(tag => tag)
    })

    > shape({
    >     tags: 'hello, world,     ,, ,yay',
    > })
    {
        tags: ['hello', 'world', 'yay']
    }