const assert = require('assert');
const shaper = require('./');

{ // Normal usage
    let shape = shaper({
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

    assert.deepEqual(
        shape({}),
        {
            experiences: []
        }
    );

    assert.deepEqual(
        shape({
            username: '    Aleks ',
            isPublic: 'no',
            dateOfBirth: '1987-12-01',
            experiences: [
                {
                    company: 'Slow Motion Software'
                }
            ]
        }),
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
    )
}

{ // Custom shaper
    const shape = shaper({
        tags: (string) => String(string || '').split(',').map(tag => tag.trim()).filter(tag => tag)
    });

    assert.deepEqual(
        shape({}),
        {
            tags: []
        }
    )

    assert.deepEqual(
        shape({
            tags: 'hello, world,     ,, ,yay'
        }),
        {
            tags: ['hello', 'world', 'yay']
        }
    );
}

console.log('All tests passed');