function shaper(spec) {
    if (Array.isArray(spec)) { 
        return arrayShaper(spec[0]);
// primitives
    } else if (spec === Date) {
        return dateShaper;
    } else if (spec === String) {
        return stringShaper;
    } else if (spec === Number) {
        return numberShaper;
    } else if (spec === Boolean) {
        return booleanShaper;
// custom
    } else if (typeof spec === 'function') { // factory method - shaper itself
        return spec;
// POJO
    } else {
        return objectShaper(spec);
    }
}

function objectShaper(spec) {
    const keys = Object.keys(spec);
    const keyShapers = {};
    for (let key of keys) {
        keyShapers[key] = shaper(spec[key]);
    }
    return function shape(object) {
        const shaped = {};
        var _object = object || {};
        for (let key of keys) {
            shaped[key] = keyShapers[key](_object[key]);
        }
        return shaped;
    }
}

function arrayShaper(elementSpec) {
    const elementShaper = shaper(elementSpec);
    return function arrayShape(array) {
        if (array == null) {
            array = [];
        } else if (!Array.isArray(array)) {
            array = new Array(array);
        }
        return array.map(elementShaper);
    }
} // => [], ['hello'], [{...}]

function dateShaper(date) {
    return date ? new Date(date) : null;
} // => null, Date (may be invalid though)

function numberShaper(number) {
    return number == null ? null : Number(number);
} // => null, NaN, 1

function stringShaper(string) {
    return String(string || '').trim();
} // => '', 'hello'

function booleanShaper(boolean) {
    return boolean == null ? null : !!boolean;
} // => null, false, true

module.exports = shaper;