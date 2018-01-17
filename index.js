// 0. Undefined & undeclared properties are wiped out.
// 1. `null` is preserved (as "unset" intention) for everything except object, array, custom
// 2. String input value is automatically trimmed.
// 3. Empty string value is translated to `null` for non-string props.
// 4. `false` value is translated to `null` (without further coercion) for non-Boolean props.

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

function trimmed(shape) {
    return function (raw) {
        return shape(typeof raw === 'string' ? raw.trim() : raw)
    }
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
        return shaped
    }
}

function array(spec) {
    var shape = shaper(spec)
    return function (raw) {
        var array =
            !raw               ? [] :
            Array.isArray(raw) ? raw :
            [raw]
        return array.map(shape)
    }
} // => [], ['hello'], [{...}]

function date(raw) {
    return new Date(raw)
} // => null, Date (may be invalid though)

// null-safe, autotrim
function number(raw) {
    if (raw === '') {
        return null;
    }
    return Number(raw)
} // => null, NaN, 1

// null-safe, autotrim
function string(raw) {
    return String(raw)
} // => '', 'hello'

function boolean(raw) {
    return Boolean(raw)
} // => null, false, true

module.exports = shaper; 