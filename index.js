// TODO options.naive
// TODO options.undefineEmptyString

/**
 * Convert raw input object trees to desired shape based on dead-simple schema.
 * It is like conversion but for objects.
 *
 * 
 * 
 * Think of an HTML form payload as the best use case. Shaper however goes 
 * beyond that dealing with arbitrary object tree.
 * 
 * Shaper takes a raw object tree and handle it producing shaped object tree
 * based on schema specification. It does its best to choose best candidate 
 * output value for any possible input. No magic though - clean simple set of 
 * rules described below. At worst output value is set to undefined and further
 * optimized to undecla at a given
 * path in a shaped object tree.
 * 
 * 
 * In worst case as a point of fanever throws an exception andfails trying to do its best to
 * predi
 */
// Undeclared = `undefined` means absence of intention to affect current value at 
// a given path.
// 0. Undefined & undeclared properties are wiped out.
// 1. `null` is preserved (as "unset" intention) for everything except object, array, custom
// 2. String input value is automatically trimmed.
// 3. Empty string value is translated to `null` for non-string props.
// 4. `false` value is translated to `null` (without further coercion) for non-Boolean props.





/*

function shaper(spec) {
    return (
        spec === Date               ? nullable(trimmed(date)) :
        spec === String             ? nullable(trimmed(string)) :
        spec === Number             ? nullable(trimmed(number)) :
        spec === Boolean            ? nullable(trimmed(boolean)) :

        typeof spec === 'function'  ? spec :
        Array.isArray(spec)         ? trimmed(array(spec[0])) :
        object(spec)
    )
}


function nullable(shape) {
    return function (raw) {
        return raw == null ? raw : shape(raw)
    }
}

function object(spec) {
    var keys = Object.keys(spec)
    var shapers = {}
    for (var at = 0, key; key = keys[at]; at++)
        shapers[key] = shaper(spec[key])

    return function (raw) {
        var object = Object(raw)
        var shaped = {}
        for (var at = 0, key; key = keys[at]; at++) {
            var shapedVal = shapers[key](object[key]);
            // Wipe out undefined
            if (shapedVal !== undefined) {
                shaped[key] = shapedVal;
            }
        }

*/

/**
 * Shaper simple types are: boolean, number, string, and Date.
 * 
 * `null` is always preserved for simple types as intention to nullify
 * property stored value.
 * 
 * 
/*

  
Possible input values:
    boolean: true, false
    number
    string
    null, undefined
    Date
    Array
    Object
*/

/* {},[] - structural/containment utilities

`undefined` - we are not talking about this at all.
`null` - unset value at a given path.

Object tree. Leaf type. Non-leaf type.
*/


function shaper(spec, options, at) {
    options = options || {}

    return (
        spec === String  ? nullable(trimmed(string)) :
        spec === Number  ? nullable(trimmed(number)) :
        spec === Boolean ? nullable(trimmed(boolean)) :
        spec === Date    ? nullable(trimmed(date)) :

        typeof spec === 'function' ? spec :
        Array.isArray(spec) ? trimmed(
            array(
                shaper(
                    spec[0], 
                    options, 
                    (at || '') + '[]'
                )
            )
        ) :
        object(spec)
    )

    function incompatible(val, expected, at) {
        if (options.strict)
            throw new TypeError(
                'Expected ' + String(expected) + ' type' + 
                ' at: ' + String(at) + ',' + 
                ' given: ' + String(val)
            )
        return undefined
    }

    function boolean(raw) {
        if (isNonPrimitive(raw))
            return incompatible(raw, 'boolean', at)

        return Boolean(raw)
    }

    function string(raw) {
        if (raw === false)
            return ''
        if (raw instanceof Date)
            return raw.toISOString()
        if (isNonPrimitive(raw))
            return incompatible(raw, 'string', at)

        return String(raw)
    }

    function number(raw) {
        if (raw === '')
            return undefined
        else if (typeof raw === 'string')
            return Number.parseFloat(raw)

        if (raw instanceof Date)
            return raw.getTime()
        else if (isNonPrimitive(raw))
            return incompatible(raw, 'number', at)

        return Number(raw)
    }

    function array(element) {
        return function (raw) {
            var array =
                !raw               ? [] :
                Array.isArray(raw) ? raw :
                [raw]
            return raw.map(element)
        }
    }

    function object(spec) {
        var keys = Object.keys(spec)
        var keyShapers = {}
        for (var i = 0, key; key = keys[i]; i++)
            keyShapers[key] = shaper(
                spec[key],
                options, 
                at ? (at + '.' + key) : key
            )

        return function (raw) {
            var shaped = {}
            raw = Object(raw)
            for (var i = 0, key, keyShaped; key = keys[i]; i++) {
                keyShaped = keyShapers[key](raw[key])
                if (keyShaped !== undefined)
                    shaped[key] = keyShaped
            }
            return shaped
        }
    }
}

function trimmed(shaper) {
    return function (raw) {
        return shaper(typeof raw === 'string' ? raw.trim() : raw)
    }
}

// Preserve intentional emptiness
function nullable(shaper) {
    return function (raw) {
        return raw == null ? raw : shaper(raw)
    }
}

function primitive(shaper) {
    return function shape(raw) {
        return isNonPrimitive(raw) ? undefined: shaper(raw)
    }
}


function subpath(at, append) {
    at ? (at + '.' + append) : append
}



function date(raw) {
    if (raw === '')
        return undefined
        
    return new Date(raw)
}

function isNonPrimitive(val) {
    return val === Object(val)
}

module.exports = shaper; 