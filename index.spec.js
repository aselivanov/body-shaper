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
            username: '',
            dateOfBirth: null,
            isPublic: null,
            experiences: []
        }
    );

    assert.deepEqual(
        shape({
            username: '    Aleks ',
            isPublic: 'yes',
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
                    years: {
                        from: null,
                        to: null
                    }
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