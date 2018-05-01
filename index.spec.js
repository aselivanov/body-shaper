let assert = require('assert')
let shaper = require('./')

{ 
    let string = shaper(String)

    assert.equal(string(123), '123')
    assert.equal(string(0), '0')
    assert.equal(string(Infinity), 'Infinity')
    assert.equal(string(-Infinity), '-Infinity')
    assert.equal(string('    '), '')
    assert.equal(string('  hello   '), 'hello')
    assert.equal(string(true), 'true')
    assert.equal(string(false), '')
    assert.equal(string(null), '')
    assert.equal(string(undefined), undefined)

    let now = new Date
    assert.equal(string(now), now.toISOString())

    assert.throws(() => string({}), TypeError)
    assert.throws(() => string([]), TypeError)
    
    let number = shaper(Number)
    assert.equal(number(''), null)
    assert.equal(number('   '), null)
    

    let boolean = shaper(Boolean)
    assert.equal(boolean(true), true)
    assert.equal(boolean(false), false)
    assert.equal(boolean(0), false)
    assert.equal(boolean(1), true)
    assert.equal(boolean(''), false)
    assert.equal(boolean('   '), false)
    assert.equal(boolean('hello'), true)

    let date = shaper(Date)
    assert.equal(date('   '), null)
    assert.equal(date(0).getTime(), 0)
}

// Normal usage
{ 
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