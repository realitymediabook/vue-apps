export const vueComponents = (function (exports, three) {
    'use strict';

    /**
     * Make a map and return a function for checking if a key
     * is in that map.
     * IMPORTANT: all calls of this function must be prefixed with
     * \/\*#\_\_PURE\_\_\*\/
     * So that rollup can tree-shake them if necessary.
     */
    function makeMap(str, expectsLowerCase) {
        const map = Object.create(null);
        const list = str.split(',');
        for (let i = 0; i < list.length; i++) {
            map[list[i]] = true;
        }
        return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val];
    }

    /**
     * On the client we only need to offer special cases for boolean attributes that
     * have different names from their corresponding dom properties:
     * - itemscope -> N/A
     * - allowfullscreen -> allowFullscreen
     * - formnovalidate -> formNoValidate
     * - ismap -> isMap
     * - nomodule -> noModule
     * - novalidate -> noValidate
     * - readonly -> readOnly
     */
    const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
    const isSpecialBooleanAttr = /*#__PURE__*/ makeMap(specialBooleanAttrs);
    /**
     * Boolean attributes should be included if the value is truthy or ''.
     * e.g. `<select multiple>` compiles to `{ multiple: '' }`
     */
    function includeBooleanAttr(value) {
        return !!value || value === '';
    }

    function normalizeStyle(value) {
        if (isArray$1(value)) {
            const res = {};
            for (let i = 0; i < value.length; i++) {
                const item = value[i];
                const normalized = isString(item)
                    ? parseStringStyle(item)
                    : normalizeStyle(item);
                if (normalized) {
                    for (const key in normalized) {
                        res[key] = normalized[key];
                    }
                }
            }
            return res;
        }
        else if (isString(value)) {
            return value;
        }
        else if (isObject(value)) {
            return value;
        }
    }
    const listDelimiterRE = /;(?![^(]*\))/g;
    const propertyDelimiterRE = /:(.+)/;
    function parseStringStyle(cssText) {
        const ret = {};
        cssText.split(listDelimiterRE).forEach(item => {
            if (item) {
                const tmp = item.split(propertyDelimiterRE);
                tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
            }
        });
        return ret;
    }
    function normalizeClass(value) {
        let res = '';
        if (isString(value)) {
            res = value;
        }
        else if (isArray$1(value)) {
            for (let i = 0; i < value.length; i++) {
                const normalized = normalizeClass(value[i]);
                if (normalized) {
                    res += normalized + ' ';
                }
            }
        }
        else if (isObject(value)) {
            for (const name in value) {
                if (value[name]) {
                    res += name + ' ';
                }
            }
        }
        return res.trim();
    }

    /**
     * For converting {{ interpolation }} values to displayed strings.
     * @private
     */
    const toDisplayString = (val) => {
        return isString(val)
            ? val
            : val == null
                ? ''
                : isArray$1(val) ||
                    (isObject(val) &&
                        (val.toString === objectToString || !isFunction(val.toString)))
                    ? JSON.stringify(val, replacer, 2)
                    : String(val);
    };
    const replacer = (_key, val) => {
        // can't use isRef here since @vue/shared has no deps
        if (val && val.__v_isRef) {
            return replacer(_key, val.value);
        }
        else if (isMap(val)) {
            return {
                [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val]) => {
                    entries[`${key} =>`] = val;
                    return entries;
                }, {})
            };
        }
        else if (isSet(val)) {
            return {
                [`Set(${val.size})`]: [...val.values()]
            };
        }
        else if (isObject(val) && !isArray$1(val) && !isPlainObject(val)) {
            return String(val);
        }
        return val;
    };

    const EMPTY_OBJ = {};
    const EMPTY_ARR = [];
    const NOOP = () => { };
    /**
     * Always return false.
     */
    const NO = () => false;
    const onRE = /^on[^a-z]/;
    const isOn = (key) => onRE.test(key);
    const isModelListener = (key) => key.startsWith('onUpdate:');
    const extend$1 = Object.assign;
    const remove = (arr, el) => {
        const i = arr.indexOf(el);
        if (i > -1) {
            arr.splice(i, 1);
        }
    };
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const hasOwn$1 = (val, key) => hasOwnProperty.call(val, key);
    const isArray$1 = Array.isArray;
    const isMap = (val) => toTypeString(val) === '[object Map]';
    const isSet = (val) => toTypeString(val) === '[object Set]';
    const isFunction = (val) => typeof val === 'function';
    const isString = (val) => typeof val === 'string';
    const isSymbol = (val) => typeof val === 'symbol';
    const isObject = (val) => val !== null && typeof val === 'object';
    const isPromise = (val) => {
        return isObject(val) && isFunction(val.then) && isFunction(val.catch);
    };
    const objectToString = Object.prototype.toString;
    const toTypeString = (value) => objectToString.call(value);
    const toRawType = (value) => {
        // extract "RawType" from strings like "[object RawType]"
        return toTypeString(value).slice(8, -1);
    };
    const isPlainObject = (val) => toTypeString(val) === '[object Object]';
    const isIntegerKey = (key) => isString(key) &&
        key !== 'NaN' &&
        key[0] !== '-' &&
        '' + parseInt(key, 10) === key;
    const isReservedProp = /*#__PURE__*/ makeMap(
    // the leading comma is intentional so empty string "" is also included
    ',key,ref,ref_for,ref_key,' +
        'onVnodeBeforeMount,onVnodeMounted,' +
        'onVnodeBeforeUpdate,onVnodeUpdated,' +
        'onVnodeBeforeUnmount,onVnodeUnmounted');
    const cacheStringFunction = (fn) => {
        const cache = Object.create(null);
        return ((str) => {
            const hit = cache[str];
            return hit || (cache[str] = fn(str));
        });
    };
    const camelizeRE = /-(\w)/g;
    /**
     * @private
     */
    const camelize = cacheStringFunction((str) => {
        return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
    });
    const hyphenateRE = /\B([A-Z])/g;
    /**
     * @private
     */
    const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, '-$1').toLowerCase());
    /**
     * @private
     */
    const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
    /**
     * @private
     */
    const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
    // compare whether a value has changed, accounting for NaN.
    const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
    const invokeArrayFns = (fns, arg) => {
        for (let i = 0; i < fns.length; i++) {
            fns[i](arg);
        }
    };
    const def = (obj, key, value) => {
        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: false,
            value
        });
    };
    const toNumber = (val) => {
        const n = parseFloat(val);
        return isNaN(n) ? val : n;
    };
    let _globalThis;
    const getGlobalThis = () => {
        return (_globalThis ||
            (_globalThis =
                typeof globalThis !== 'undefined'
                    ? globalThis
                    : typeof self !== 'undefined'
                        ? self
                        : typeof window !== 'undefined'
                            ? window
                            : typeof global !== 'undefined'
                                ? global
                                : {}));
    };

    let activeEffectScope;
    class EffectScope {
        constructor(detached = false) {
            this.active = true;
            this.effects = [];
            this.cleanups = [];
            if (!detached && activeEffectScope) {
                this.parent = activeEffectScope;
                this.index =
                    (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
            }
        }
        run(fn) {
            if (this.active) {
                try {
                    activeEffectScope = this;
                    return fn();
                }
                finally {
                    activeEffectScope = this.parent;
                }
            }
        }
        on() {
            activeEffectScope = this;
        }
        off() {
            activeEffectScope = this.parent;
        }
        stop(fromParent) {
            if (this.active) {
                let i, l;
                for (i = 0, l = this.effects.length; i < l; i++) {
                    this.effects[i].stop();
                }
                for (i = 0, l = this.cleanups.length; i < l; i++) {
                    this.cleanups[i]();
                }
                if (this.scopes) {
                    for (i = 0, l = this.scopes.length; i < l; i++) {
                        this.scopes[i].stop(true);
                    }
                }
                // nested scope, dereference from parent to avoid memory leaks
                if (this.parent && !fromParent) {
                    // optimized O(1) removal
                    const last = this.parent.scopes.pop();
                    if (last && last !== this) {
                        this.parent.scopes[this.index] = last;
                        last.index = this.index;
                    }
                }
                this.active = false;
            }
        }
    }
    function recordEffectScope(effect, scope = activeEffectScope) {
        if (scope && scope.active) {
            scope.effects.push(effect);
        }
    }

    const createDep = (effects) => {
        const dep = new Set(effects);
        dep.w = 0;
        dep.n = 0;
        return dep;
    };
    const wasTracked = (dep) => (dep.w & trackOpBit) > 0;
    const newTracked = (dep) => (dep.n & trackOpBit) > 0;
    const initDepMarkers = ({ deps }) => {
        if (deps.length) {
            for (let i = 0; i < deps.length; i++) {
                deps[i].w |= trackOpBit; // set was tracked
            }
        }
    };
    const finalizeDepMarkers = (effect) => {
        const { deps } = effect;
        if (deps.length) {
            let ptr = 0;
            for (let i = 0; i < deps.length; i++) {
                const dep = deps[i];
                if (wasTracked(dep) && !newTracked(dep)) {
                    dep.delete(effect);
                }
                else {
                    deps[ptr++] = dep;
                }
                // clear bits
                dep.w &= ~trackOpBit;
                dep.n &= ~trackOpBit;
            }
            deps.length = ptr;
        }
    };

    const targetMap = new WeakMap();
    // The number of effects currently being tracked recursively.
    let effectTrackDepth = 0;
    let trackOpBit = 1;
    /**
     * The bitwise track markers support at most 30 levels of recursion.
     * This value is chosen to enable modern JS engines to use a SMI on all platforms.
     * When recursion depth is greater, fall back to using a full cleanup.
     */
    const maxMarkerBits = 30;
    let activeEffect;
    const ITERATE_KEY = Symbol('');
    const MAP_KEY_ITERATE_KEY = Symbol('');
    class ReactiveEffect {
        constructor(fn, scheduler = null, scope) {
            this.fn = fn;
            this.scheduler = scheduler;
            this.active = true;
            this.deps = [];
            this.parent = undefined;
            recordEffectScope(this, scope);
        }
        run() {
            if (!this.active) {
                return this.fn();
            }
            let parent = activeEffect;
            let lastShouldTrack = shouldTrack;
            while (parent) {
                if (parent === this) {
                    return;
                }
                parent = parent.parent;
            }
            try {
                this.parent = activeEffect;
                activeEffect = this;
                shouldTrack = true;
                trackOpBit = 1 << ++effectTrackDepth;
                if (effectTrackDepth <= maxMarkerBits) {
                    initDepMarkers(this);
                }
                else {
                    cleanupEffect(this);
                }
                return this.fn();
            }
            finally {
                if (effectTrackDepth <= maxMarkerBits) {
                    finalizeDepMarkers(this);
                }
                trackOpBit = 1 << --effectTrackDepth;
                activeEffect = this.parent;
                shouldTrack = lastShouldTrack;
                this.parent = undefined;
            }
        }
        stop() {
            if (this.active) {
                cleanupEffect(this);
                if (this.onStop) {
                    this.onStop();
                }
                this.active = false;
            }
        }
    }
    function cleanupEffect(effect) {
        const { deps } = effect;
        if (deps.length) {
            for (let i = 0; i < deps.length; i++) {
                deps[i].delete(effect);
            }
            deps.length = 0;
        }
    }
    let shouldTrack = true;
    const trackStack = [];
    function pauseTracking() {
        trackStack.push(shouldTrack);
        shouldTrack = false;
    }
    function resetTracking() {
        const last = trackStack.pop();
        shouldTrack = last === undefined ? true : last;
    }
    function track(target, type, key) {
        if (shouldTrack && activeEffect) {
            let depsMap = targetMap.get(target);
            if (!depsMap) {
                targetMap.set(target, (depsMap = new Map()));
            }
            let dep = depsMap.get(key);
            if (!dep) {
                depsMap.set(key, (dep = createDep()));
            }
            trackEffects(dep);
        }
    }
    function trackEffects(dep, debuggerEventExtraInfo) {
        let shouldTrack = false;
        if (effectTrackDepth <= maxMarkerBits) {
            if (!newTracked(dep)) {
                dep.n |= trackOpBit; // set newly tracked
                shouldTrack = !wasTracked(dep);
            }
        }
        else {
            // Full cleanup mode.
            shouldTrack = !dep.has(activeEffect);
        }
        if (shouldTrack) {
            dep.add(activeEffect);
            activeEffect.deps.push(dep);
        }
    }
    function trigger$1(target, type, key, newValue, oldValue, oldTarget) {
        const depsMap = targetMap.get(target);
        if (!depsMap) {
            // never been tracked
            return;
        }
        let deps = [];
        if (type === "clear" /* CLEAR */) {
            // collection being cleared
            // trigger all effects for target
            deps = [...depsMap.values()];
        }
        else if (key === 'length' && isArray$1(target)) {
            depsMap.forEach((dep, key) => {
                if (key === 'length' || key >= newValue) {
                    deps.push(dep);
                }
            });
        }
        else {
            // schedule runs for SET | ADD | DELETE
            if (key !== void 0) {
                deps.push(depsMap.get(key));
            }
            // also run for iteration key on ADD | DELETE | Map.SET
            switch (type) {
                case "add" /* ADD */:
                    if (!isArray$1(target)) {
                        deps.push(depsMap.get(ITERATE_KEY));
                        if (isMap(target)) {
                            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                        }
                    }
                    else if (isIntegerKey(key)) {
                        // new index added to array -> length changes
                        deps.push(depsMap.get('length'));
                    }
                    break;
                case "delete" /* DELETE */:
                    if (!isArray$1(target)) {
                        deps.push(depsMap.get(ITERATE_KEY));
                        if (isMap(target)) {
                            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                        }
                    }
                    break;
                case "set" /* SET */:
                    if (isMap(target)) {
                        deps.push(depsMap.get(ITERATE_KEY));
                    }
                    break;
            }
        }
        if (deps.length === 1) {
            if (deps[0]) {
                {
                    triggerEffects(deps[0]);
                }
            }
        }
        else {
            const effects = [];
            for (const dep of deps) {
                if (dep) {
                    effects.push(...dep);
                }
            }
            {
                triggerEffects(createDep(effects));
            }
        }
    }
    function triggerEffects(dep, debuggerEventExtraInfo) {
        // spread into array for stabilization
        for (const effect of isArray$1(dep) ? dep : [...dep]) {
            if (effect !== activeEffect || effect.allowRecurse) {
                if (effect.scheduler) {
                    effect.scheduler();
                }
                else {
                    effect.run();
                }
            }
        }
    }

    const isNonTrackableKeys = /*#__PURE__*/ makeMap(`__proto__,__v_isRef,__isVue`);
    const builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol)
        .map(key => Symbol[key])
        .filter(isSymbol));
    const get = /*#__PURE__*/ createGetter();
    const shallowGet = /*#__PURE__*/ createGetter(false, true);
    const readonlyGet = /*#__PURE__*/ createGetter(true);
    const arrayInstrumentations = /*#__PURE__*/ createArrayInstrumentations();
    function createArrayInstrumentations() {
        const instrumentations = {};
        ['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
            instrumentations[key] = function (...args) {
                const arr = toRaw(this);
                for (let i = 0, l = this.length; i < l; i++) {
                    track(arr, "get" /* GET */, i + '');
                }
                // we run the method using the original args first (which may be reactive)
                const res = arr[key](...args);
                if (res === -1 || res === false) {
                    // if that didn't work, run it again using raw values.
                    return arr[key](...args.map(toRaw));
                }
                else {
                    return res;
                }
            };
        });
        ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(key => {
            instrumentations[key] = function (...args) {
                pauseTracking();
                const res = toRaw(this)[key].apply(this, args);
                resetTracking();
                return res;
            };
        });
        return instrumentations;
    }
    function createGetter(isReadonly = false, shallow = false) {
        return function get(target, key, receiver) {
            if (key === "__v_isReactive" /* IS_REACTIVE */) {
                return !isReadonly;
            }
            else if (key === "__v_isReadonly" /* IS_READONLY */) {
                return isReadonly;
            }
            else if (key === "__v_isShallow" /* IS_SHALLOW */) {
                return shallow;
            }
            else if (key === "__v_raw" /* RAW */ &&
                receiver ===
                    (isReadonly
                        ? shallow
                            ? shallowReadonlyMap
                            : readonlyMap
                        : shallow
                            ? shallowReactiveMap
                            : reactiveMap).get(target)) {
                return target;
            }
            const targetIsArray = isArray$1(target);
            if (!isReadonly && targetIsArray && hasOwn$1(arrayInstrumentations, key)) {
                return Reflect.get(arrayInstrumentations, key, receiver);
            }
            const res = Reflect.get(target, key, receiver);
            if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
                return res;
            }
            if (!isReadonly) {
                track(target, "get" /* GET */, key);
            }
            if (shallow) {
                return res;
            }
            if (isRef(res)) {
                // ref unwrapping - does not apply for Array + integer key.
                const shouldUnwrap = !targetIsArray || !isIntegerKey(key);
                return shouldUnwrap ? res.value : res;
            }
            if (isObject(res)) {
                // Convert returned value into a proxy as well. we do the isObject check
                // here to avoid invalid value warning. Also need to lazy access readonly
                // and reactive here to avoid circular dependency.
                return isReadonly ? readonly(res) : reactive(res);
            }
            return res;
        };
    }
    const set = /*#__PURE__*/ createSetter();
    const shallowSet = /*#__PURE__*/ createSetter(true);
    function createSetter(shallow = false) {
        return function set(target, key, value, receiver) {
            let oldValue = target[key];
            if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
                return false;
            }
            if (!shallow && !isReadonly(value)) {
                if (!isShallow(value)) {
                    value = toRaw(value);
                    oldValue = toRaw(oldValue);
                }
                if (!isArray$1(target) && isRef(oldValue) && !isRef(value)) {
                    oldValue.value = value;
                    return true;
                }
            }
            const hadKey = isArray$1(target) && isIntegerKey(key)
                ? Number(key) < target.length
                : hasOwn$1(target, key);
            const result = Reflect.set(target, key, value, receiver);
            // don't trigger if target is something up in the prototype chain of original
            if (target === toRaw(receiver)) {
                if (!hadKey) {
                    trigger$1(target, "add" /* ADD */, key, value);
                }
                else if (hasChanged(value, oldValue)) {
                    trigger$1(target, "set" /* SET */, key, value);
                }
            }
            return result;
        };
    }
    function deleteProperty(target, key) {
        const hadKey = hasOwn$1(target, key);
        target[key];
        const result = Reflect.deleteProperty(target, key);
        if (result && hadKey) {
            trigger$1(target, "delete" /* DELETE */, key, undefined);
        }
        return result;
    }
    function has(target, key) {
        const result = Reflect.has(target, key);
        if (!isSymbol(key) || !builtInSymbols.has(key)) {
            track(target, "has" /* HAS */, key);
        }
        return result;
    }
    function ownKeys(target) {
        track(target, "iterate" /* ITERATE */, isArray$1(target) ? 'length' : ITERATE_KEY);
        return Reflect.ownKeys(target);
    }
    const mutableHandlers = {
        get,
        set,
        deleteProperty,
        has,
        ownKeys
    };
    const readonlyHandlers = {
        get: readonlyGet,
        set(target, key) {
            return true;
        },
        deleteProperty(target, key) {
            return true;
        }
    };
    const shallowReactiveHandlers = /*#__PURE__*/ extend$1({}, mutableHandlers, {
        get: shallowGet,
        set: shallowSet
    });

    const toShallow = (value) => value;
    const getProto$1 = (v) => Reflect.getPrototypeOf(v);
    function get$1(target, key, isReadonly = false, isShallow = false) {
        // #1772: readonly(reactive(Map)) should return readonly + reactive version
        // of the value
        target = target["__v_raw" /* RAW */];
        const rawTarget = toRaw(target);
        const rawKey = toRaw(key);
        if (key !== rawKey) {
            !isReadonly && track(rawTarget, "get" /* GET */, key);
        }
        !isReadonly && track(rawTarget, "get" /* GET */, rawKey);
        const { has } = getProto$1(rawTarget);
        const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
        if (has.call(rawTarget, key)) {
            return wrap(target.get(key));
        }
        else if (has.call(rawTarget, rawKey)) {
            return wrap(target.get(rawKey));
        }
        else if (target !== rawTarget) {
            // #3602 readonly(reactive(Map))
            // ensure that the nested reactive `Map` can do tracking for itself
            target.get(key);
        }
    }
    function has$1(key, isReadonly = false) {
        const target = this["__v_raw" /* RAW */];
        const rawTarget = toRaw(target);
        const rawKey = toRaw(key);
        if (key !== rawKey) {
            !isReadonly && track(rawTarget, "has" /* HAS */, key);
        }
        !isReadonly && track(rawTarget, "has" /* HAS */, rawKey);
        return key === rawKey
            ? target.has(key)
            : target.has(key) || target.has(rawKey);
    }
    function size$1(target, isReadonly = false) {
        target = target["__v_raw" /* RAW */];
        !isReadonly && track(toRaw(target), "iterate" /* ITERATE */, ITERATE_KEY);
        return Reflect.get(target, 'size', target);
    }
    function add(value) {
        value = toRaw(value);
        const target = toRaw(this);
        const proto = getProto$1(target);
        const hadKey = proto.has.call(target, value);
        if (!hadKey) {
            target.add(value);
            trigger$1(target, "add" /* ADD */, value, value);
        }
        return this;
    }
    function set$1(key, value) {
        value = toRaw(value);
        const target = toRaw(this);
        const { has, get } = getProto$1(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
            key = toRaw(key);
            hadKey = has.call(target, key);
        }
        const oldValue = get.call(target, key);
        target.set(key, value);
        if (!hadKey) {
            trigger$1(target, "add" /* ADD */, key, value);
        }
        else if (hasChanged(value, oldValue)) {
            trigger$1(target, "set" /* SET */, key, value);
        }
        return this;
    }
    function deleteEntry(key) {
        const target = toRaw(this);
        const { has, get } = getProto$1(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
            key = toRaw(key);
            hadKey = has.call(target, key);
        }
        get ? get.call(target, key) : undefined;
        // forward the operation before queueing reactions
        const result = target.delete(key);
        if (hadKey) {
            trigger$1(target, "delete" /* DELETE */, key, undefined);
        }
        return result;
    }
    function clear() {
        const target = toRaw(this);
        const hadItems = target.size !== 0;
        // forward the operation before queueing reactions
        const result = target.clear();
        if (hadItems) {
            trigger$1(target, "clear" /* CLEAR */, undefined, undefined);
        }
        return result;
    }
    function createForEach(isReadonly, isShallow) {
        return function forEach(callback, thisArg) {
            const observed = this;
            const target = observed["__v_raw" /* RAW */];
            const rawTarget = toRaw(target);
            const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
            !isReadonly && track(rawTarget, "iterate" /* ITERATE */, ITERATE_KEY);
            return target.forEach((value, key) => {
                // important: make sure the callback is
                // 1. invoked with the reactive map as `this` and 3rd arg
                // 2. the value received should be a corresponding reactive/readonly.
                return callback.call(thisArg, wrap(value), wrap(key), observed);
            });
        };
    }
    function createIterableMethod(method, isReadonly, isShallow) {
        return function (...args) {
            const target = this["__v_raw" /* RAW */];
            const rawTarget = toRaw(target);
            const targetIsMap = isMap(rawTarget);
            const isPair = method === 'entries' || (method === Symbol.iterator && targetIsMap);
            const isKeyOnly = method === 'keys' && targetIsMap;
            const innerIterator = target[method](...args);
            const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
            !isReadonly &&
                track(rawTarget, "iterate" /* ITERATE */, isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
            // return a wrapped iterator which returns observed versions of the
            // values emitted from the real iterator
            return {
                // iterator protocol
                next() {
                    const { value, done } = innerIterator.next();
                    return done
                        ? { value, done }
                        : {
                            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
                            done
                        };
                },
                // iterable protocol
                [Symbol.iterator]() {
                    return this;
                }
            };
        };
    }
    function createReadonlyMethod(type) {
        return function (...args) {
            return type === "delete" /* DELETE */ ? false : this;
        };
    }
    function createInstrumentations() {
        const mutableInstrumentations = {
            get(key) {
                return get$1(this, key);
            },
            get size() {
                return size$1(this);
            },
            has: has$1,
            add,
            set: set$1,
            delete: deleteEntry,
            clear,
            forEach: createForEach(false, false)
        };
        const shallowInstrumentations = {
            get(key) {
                return get$1(this, key, false, true);
            },
            get size() {
                return size$1(this);
            },
            has: has$1,
            add,
            set: set$1,
            delete: deleteEntry,
            clear,
            forEach: createForEach(false, true)
        };
        const readonlyInstrumentations = {
            get(key) {
                return get$1(this, key, true);
            },
            get size() {
                return size$1(this, true);
            },
            has(key) {
                return has$1.call(this, key, true);
            },
            add: createReadonlyMethod("add" /* ADD */),
            set: createReadonlyMethod("set" /* SET */),
            delete: createReadonlyMethod("delete" /* DELETE */),
            clear: createReadonlyMethod("clear" /* CLEAR */),
            forEach: createForEach(true, false)
        };
        const shallowReadonlyInstrumentations = {
            get(key) {
                return get$1(this, key, true, true);
            },
            get size() {
                return size$1(this, true);
            },
            has(key) {
                return has$1.call(this, key, true);
            },
            add: createReadonlyMethod("add" /* ADD */),
            set: createReadonlyMethod("set" /* SET */),
            delete: createReadonlyMethod("delete" /* DELETE */),
            clear: createReadonlyMethod("clear" /* CLEAR */),
            forEach: createForEach(true, true)
        };
        const iteratorMethods = ['keys', 'values', 'entries', Symbol.iterator];
        iteratorMethods.forEach(method => {
            mutableInstrumentations[method] = createIterableMethod(method, false, false);
            readonlyInstrumentations[method] = createIterableMethod(method, true, false);
            shallowInstrumentations[method] = createIterableMethod(method, false, true);
            shallowReadonlyInstrumentations[method] = createIterableMethod(method, true, true);
        });
        return [
            mutableInstrumentations,
            readonlyInstrumentations,
            shallowInstrumentations,
            shallowReadonlyInstrumentations
        ];
    }
    const [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* #__PURE__*/ createInstrumentations();
    function createInstrumentationGetter(isReadonly, shallow) {
        const instrumentations = shallow
            ? isReadonly
                ? shallowReadonlyInstrumentations
                : shallowInstrumentations
            : isReadonly
                ? readonlyInstrumentations
                : mutableInstrumentations;
        return (target, key, receiver) => {
            if (key === "__v_isReactive" /* IS_REACTIVE */) {
                return !isReadonly;
            }
            else if (key === "__v_isReadonly" /* IS_READONLY */) {
                return isReadonly;
            }
            else if (key === "__v_raw" /* RAW */) {
                return target;
            }
            return Reflect.get(hasOwn$1(instrumentations, key) && key in target
                ? instrumentations
                : target, key, receiver);
        };
    }
    const mutableCollectionHandlers = {
        get: /*#__PURE__*/ createInstrumentationGetter(false, false)
    };
    const shallowCollectionHandlers = {
        get: /*#__PURE__*/ createInstrumentationGetter(false, true)
    };
    const readonlyCollectionHandlers = {
        get: /*#__PURE__*/ createInstrumentationGetter(true, false)
    };

    const reactiveMap = new WeakMap();
    const shallowReactiveMap = new WeakMap();
    const readonlyMap = new WeakMap();
    const shallowReadonlyMap = new WeakMap();
    function targetTypeMap(rawType) {
        switch (rawType) {
            case 'Object':
            case 'Array':
                return 1 /* COMMON */;
            case 'Map':
            case 'Set':
            case 'WeakMap':
            case 'WeakSet':
                return 2 /* COLLECTION */;
            default:
                return 0 /* INVALID */;
        }
    }
    function getTargetType(value) {
        return value["__v_skip" /* SKIP */] || !Object.isExtensible(value)
            ? 0 /* INVALID */
            : targetTypeMap(toRawType(value));
    }
    function reactive(target) {
        // if trying to observe a readonly proxy, return the readonly version.
        if (isReadonly(target)) {
            return target;
        }
        return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
    }
    /**
     * Return a shallowly-reactive copy of the original object, where only the root
     * level properties are reactive. It also does not auto-unwrap refs (even at the
     * root level).
     */
    function shallowReactive(target) {
        return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
    }
    /**
     * Creates a readonly copy of the original object. Note the returned copy is not
     * made reactive, but `readonly` can be called on an already reactive object.
     */
    function readonly(target) {
        return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
    }
    function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
        if (!isObject(target)) {
            return target;
        }
        // target is already a Proxy, return it.
        // exception: calling readonly() on a reactive object
        if (target["__v_raw" /* RAW */] &&
            !(isReadonly && target["__v_isReactive" /* IS_REACTIVE */])) {
            return target;
        }
        // target already has corresponding Proxy
        const existingProxy = proxyMap.get(target);
        if (existingProxy) {
            return existingProxy;
        }
        // only a whitelist of value types can be observed.
        const targetType = getTargetType(target);
        if (targetType === 0 /* INVALID */) {
            return target;
        }
        const proxy = new Proxy(target, targetType === 2 /* COLLECTION */ ? collectionHandlers : baseHandlers);
        proxyMap.set(target, proxy);
        return proxy;
    }
    function isReactive(value) {
        if (isReadonly(value)) {
            return isReactive(value["__v_raw" /* RAW */]);
        }
        return !!(value && value["__v_isReactive" /* IS_REACTIVE */]);
    }
    function isReadonly(value) {
        return !!(value && value["__v_isReadonly" /* IS_READONLY */]);
    }
    function isShallow(value) {
        return !!(value && value["__v_isShallow" /* IS_SHALLOW */]);
    }
    function isProxy(value) {
        return isReactive(value) || isReadonly(value);
    }
    function toRaw(observed) {
        const raw = observed && observed["__v_raw" /* RAW */];
        return raw ? toRaw(raw) : observed;
    }
    function markRaw(value) {
        def(value, "__v_skip" /* SKIP */, true);
        return value;
    }
    const toReactive = (value) => isObject(value) ? reactive(value) : value;
    const toReadonly = (value) => isObject(value) ? readonly(value) : value;

    function trackRefValue(ref) {
        if (shouldTrack && activeEffect) {
            ref = toRaw(ref);
            {
                trackEffects(ref.dep || (ref.dep = createDep()));
            }
        }
    }
    function triggerRefValue(ref, newVal) {
        ref = toRaw(ref);
        if (ref.dep) {
            {
                triggerEffects(ref.dep);
            }
        }
    }
    function isRef(r) {
        return !!(r && r.__v_isRef === true);
    }
    function unref(ref) {
        return isRef(ref) ? ref.value : ref;
    }
    const shallowUnwrapHandlers = {
        get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
        set: (target, key, value, receiver) => {
            const oldValue = target[key];
            if (isRef(oldValue) && !isRef(value)) {
                oldValue.value = value;
                return true;
            }
            else {
                return Reflect.set(target, key, value, receiver);
            }
        }
    };
    function proxyRefs(objectWithRefs) {
        return isReactive(objectWithRefs)
            ? objectWithRefs
            : new Proxy(objectWithRefs, shallowUnwrapHandlers);
    }

    class ComputedRefImpl {
        constructor(getter, _setter, isReadonly, isSSR) {
            this._setter = _setter;
            this.dep = undefined;
            this.__v_isRef = true;
            this._dirty = true;
            this.effect = new ReactiveEffect(getter, () => {
                if (!this._dirty) {
                    this._dirty = true;
                    triggerRefValue(this);
                }
            });
            this.effect.computed = this;
            this.effect.active = this._cacheable = !isSSR;
            this["__v_isReadonly" /* IS_READONLY */] = isReadonly;
        }
        get value() {
            // the computed ref may get wrapped by other proxies e.g. readonly() #3376
            const self = toRaw(this);
            trackRefValue(self);
            if (self._dirty || !self._cacheable) {
                self._dirty = false;
                self._value = self.effect.run();
            }
            return self._value;
        }
        set value(newValue) {
            this._setter(newValue);
        }
    }
    function computed$1(getterOrOptions, debugOptions, isSSR = false) {
        let getter;
        let setter;
        const onlyGetter = isFunction(getterOrOptions);
        if (onlyGetter) {
            getter = getterOrOptions;
            setter = NOOP;
        }
        else {
            getter = getterOrOptions.get;
            setter = getterOrOptions.set;
        }
        const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
        return cRef;
    }
    Promise.resolve();

    function callWithErrorHandling(fn, instance, type, args) {
        let res;
        try {
            res = args ? fn(...args) : fn();
        }
        catch (err) {
            handleError(err, instance, type);
        }
        return res;
    }
    function callWithAsyncErrorHandling(fn, instance, type, args) {
        if (isFunction(fn)) {
            const res = callWithErrorHandling(fn, instance, type, args);
            if (res && isPromise(res)) {
                res.catch(err => {
                    handleError(err, instance, type);
                });
            }
            return res;
        }
        const values = [];
        for (let i = 0; i < fn.length; i++) {
            values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
        }
        return values;
    }
    function handleError(err, instance, type, throwInDev = true) {
        const contextVNode = instance ? instance.vnode : null;
        if (instance) {
            let cur = instance.parent;
            // the exposed instance is the render proxy to keep it consistent with 2.x
            const exposedInstance = instance.proxy;
            // in production the hook receives only the error code
            const errorInfo = type;
            while (cur) {
                const errorCapturedHooks = cur.ec;
                if (errorCapturedHooks) {
                    for (let i = 0; i < errorCapturedHooks.length; i++) {
                        if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
                            return;
                        }
                    }
                }
                cur = cur.parent;
            }
            // app-level handling
            const appErrorHandler = instance.appContext.config.errorHandler;
            if (appErrorHandler) {
                callWithErrorHandling(appErrorHandler, null, 10 /* APP_ERROR_HANDLER */, [err, exposedInstance, errorInfo]);
                return;
            }
        }
        logError(err, type, contextVNode, throwInDev);
    }
    function logError(err, type, contextVNode, throwInDev = true) {
        {
            // recover in prod to reduce the impact on end-user
            console.error(err);
        }
    }

    let isFlushing = false;
    let isFlushPending = false;
    const queue = [];
    let flushIndex = 0;
    const pendingPreFlushCbs = [];
    let activePreFlushCbs = null;
    let preFlushIndex = 0;
    const pendingPostFlushCbs = [];
    let activePostFlushCbs = null;
    let postFlushIndex = 0;
    const resolvedPromise = Promise.resolve();
    let currentFlushPromise = null;
    let currentPreFlushParentJob = null;
    function nextTick(fn) {
        const p = currentFlushPromise || resolvedPromise;
        return fn ? p.then(this ? fn.bind(this) : fn) : p;
    }
    // #2768
    // Use binary-search to find a suitable position in the queue,
    // so that the queue maintains the increasing order of job's id,
    // which can prevent the job from being skipped and also can avoid repeated patching.
    function findInsertionIndex(id) {
        // the start index should be `flushIndex + 1`
        let start = flushIndex + 1;
        let end = queue.length;
        while (start < end) {
            const middle = (start + end) >>> 1;
            const middleJobId = getId(queue[middle]);
            middleJobId < id ? (start = middle + 1) : (end = middle);
        }
        return start;
    }
    function queueJob(job) {
        // the dedupe search uses the startIndex argument of Array.includes()
        // by default the search index includes the current job that is being run
        // so it cannot recursively trigger itself again.
        // if the job is a watch() callback, the search will start with a +1 index to
        // allow it recursively trigger itself - it is the user's responsibility to
        // ensure it doesn't end up in an infinite loop.
        if ((!queue.length ||
            !queue.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) &&
            job !== currentPreFlushParentJob) {
            if (job.id == null) {
                queue.push(job);
            }
            else {
                queue.splice(findInsertionIndex(job.id), 0, job);
            }
            queueFlush();
        }
    }
    function queueFlush() {
        if (!isFlushing && !isFlushPending) {
            isFlushPending = true;
            currentFlushPromise = resolvedPromise.then(flushJobs);
        }
    }
    function invalidateJob(job) {
        const i = queue.indexOf(job);
        if (i > flushIndex) {
            queue.splice(i, 1);
        }
    }
    function queueCb(cb, activeQueue, pendingQueue, index) {
        if (!isArray$1(cb)) {
            if (!activeQueue ||
                !activeQueue.includes(cb, cb.allowRecurse ? index + 1 : index)) {
                pendingQueue.push(cb);
            }
        }
        else {
            // if cb is an array, it is a component lifecycle hook which can only be
            // triggered by a job, which is already deduped in the main queue, so
            // we can skip duplicate check here to improve perf
            pendingQueue.push(...cb);
        }
        queueFlush();
    }
    function queuePreFlushCb(cb) {
        queueCb(cb, activePreFlushCbs, pendingPreFlushCbs, preFlushIndex);
    }
    function queuePostFlushCb(cb) {
        queueCb(cb, activePostFlushCbs, pendingPostFlushCbs, postFlushIndex);
    }
    function flushPreFlushCbs(seen, parentJob = null) {
        if (pendingPreFlushCbs.length) {
            currentPreFlushParentJob = parentJob;
            activePreFlushCbs = [...new Set(pendingPreFlushCbs)];
            pendingPreFlushCbs.length = 0;
            for (preFlushIndex = 0; preFlushIndex < activePreFlushCbs.length; preFlushIndex++) {
                activePreFlushCbs[preFlushIndex]();
            }
            activePreFlushCbs = null;
            preFlushIndex = 0;
            currentPreFlushParentJob = null;
            // recursively flush until it drains
            flushPreFlushCbs(seen, parentJob);
        }
    }
    function flushPostFlushCbs(seen) {
        if (pendingPostFlushCbs.length) {
            const deduped = [...new Set(pendingPostFlushCbs)];
            pendingPostFlushCbs.length = 0;
            // #1947 already has active queue, nested flushPostFlushCbs call
            if (activePostFlushCbs) {
                activePostFlushCbs.push(...deduped);
                return;
            }
            activePostFlushCbs = deduped;
            activePostFlushCbs.sort((a, b) => getId(a) - getId(b));
            for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
                activePostFlushCbs[postFlushIndex]();
            }
            activePostFlushCbs = null;
            postFlushIndex = 0;
        }
    }
    const getId = (job) => job.id == null ? Infinity : job.id;
    function flushJobs(seen) {
        isFlushPending = false;
        isFlushing = true;
        flushPreFlushCbs(seen);
        // Sort queue before flush.
        // This ensures that:
        // 1. Components are updated from parent to child. (because parent is always
        //    created before the child so its render effect will have smaller
        //    priority number)
        // 2. If a component is unmounted during a parent component's update,
        //    its update can be skipped.
        queue.sort((a, b) => getId(a) - getId(b));
        // conditional usage of checkRecursiveUpdate must be determined out of
        // try ... catch block since Rollup by default de-optimizes treeshaking
        // inside try-catch. This can leave all warning code unshaked. Although
        // they would get eventually shaken by a minifier like terser, some minifiers
        // would fail to do that (e.g. https://github.com/evanw/esbuild/issues/1610)
        const check = NOOP;
        try {
            for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
                const job = queue[flushIndex];
                if (job && job.active !== false) {
                    if (("production" !== 'production') && check(job)) ;
                    // console.log(`running:`, job.id)
                    callWithErrorHandling(job, null, 14 /* SCHEDULER */);
                }
            }
        }
        finally {
            flushIndex = 0;
            queue.length = 0;
            flushPostFlushCbs();
            isFlushing = false;
            currentFlushPromise = null;
            // some postFlushCb queued jobs!
            // keep flushing until it drains.
            if (queue.length ||
                pendingPreFlushCbs.length ||
                pendingPostFlushCbs.length) {
                flushJobs(seen);
            }
        }
    }

    let devtools;
    let buffer = [];
    let devtoolsNotInstalled = false;
    function emit(event, ...args) {
        if (devtools) {
            devtools.emit(event, ...args);
        }
        else if (!devtoolsNotInstalled) {
            buffer.push({ event, args });
        }
    }
    function setDevtoolsHook(hook, target) {
        var _a, _b;
        devtools = hook;
        if (devtools) {
            devtools.enabled = true;
            buffer.forEach(({ event, args }) => devtools.emit(event, ...args));
            buffer = [];
        }
        else if (
        // handle late devtools injection - only do this if we are in an actual
        // browser environment to avoid the timer handle stalling test runner exit
        // (#4815)
        // eslint-disable-next-line no-restricted-globals
        typeof window !== 'undefined' &&
            // some envs mock window but not fully
            window.HTMLElement &&
            // also exclude jsdom
            !((_b = (_a = window.navigator) === null || _a === void 0 ? void 0 : _a.userAgent) === null || _b === void 0 ? void 0 : _b.includes('jsdom'))) {
            const replay = (target.__VUE_DEVTOOLS_HOOK_REPLAY__ =
                target.__VUE_DEVTOOLS_HOOK_REPLAY__ || []);
            replay.push((newHook) => {
                setDevtoolsHook(newHook, target);
            });
            // clear buffer after 3s - the user probably doesn't have devtools installed
            // at all, and keeping the buffer will cause memory leaks (#4738)
            setTimeout(() => {
                if (!devtools) {
                    target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
                    devtoolsNotInstalled = true;
                    buffer = [];
                }
            }, 3000);
        }
        else {
            // non-browser env, assume not installed
            devtoolsNotInstalled = true;
            buffer = [];
        }
    }
    function devtoolsInitApp(app, version) {
        emit("app:init" /* APP_INIT */, app, version, {
            Fragment,
            Text,
            Comment,
            Static
        });
    }
    function devtoolsUnmountApp(app) {
        emit("app:unmount" /* APP_UNMOUNT */, app);
    }
    const devtoolsComponentAdded = /*#__PURE__*/ createDevtoolsComponentHook("component:added" /* COMPONENT_ADDED */);
    const devtoolsComponentUpdated = 
    /*#__PURE__*/ createDevtoolsComponentHook("component:updated" /* COMPONENT_UPDATED */);
    const devtoolsComponentRemoved = 
    /*#__PURE__*/ createDevtoolsComponentHook("component:removed" /* COMPONENT_REMOVED */);
    function createDevtoolsComponentHook(hook) {
        return (component) => {
            emit(hook, component.appContext.app, component.uid, component.parent ? component.parent.uid : undefined, component);
        };
    }
    function devtoolsComponentEmit(component, event, params) {
        emit("component:emit" /* COMPONENT_EMIT */, component.appContext.app, component, event, params);
    }

    function emit$1(instance, event, ...rawArgs) {
        const props = instance.vnode.props || EMPTY_OBJ;
        let args = rawArgs;
        const isModelListener = event.startsWith('update:');
        // for v-model update:xxx events, apply modifiers on args
        const modelArg = isModelListener && event.slice(7);
        if (modelArg && modelArg in props) {
            const modifiersKey = `${modelArg === 'modelValue' ? 'model' : modelArg}Modifiers`;
            const { number, trim } = props[modifiersKey] || EMPTY_OBJ;
            if (trim) {
                args = rawArgs.map(a => a.trim());
            }
            else if (number) {
                args = rawArgs.map(toNumber);
            }
        }
        if (__VUE_PROD_DEVTOOLS__) {
            devtoolsComponentEmit(instance, event, args);
        }
        let handlerName;
        let handler = props[(handlerName = toHandlerKey(event))] ||
            // also try camelCase event handler (#2249)
            props[(handlerName = toHandlerKey(camelize(event)))];
        // for v-model update:xxx events, also trigger kebab-case equivalent
        // for props passed via kebab-case
        if (!handler && isModelListener) {
            handler = props[(handlerName = toHandlerKey(hyphenate(event)))];
        }
        if (handler) {
            callWithAsyncErrorHandling(handler, instance, 6 /* COMPONENT_EVENT_HANDLER */, args);
        }
        const onceHandler = props[handlerName + `Once`];
        if (onceHandler) {
            if (!instance.emitted) {
                instance.emitted = {};
            }
            else if (instance.emitted[handlerName]) {
                return;
            }
            instance.emitted[handlerName] = true;
            callWithAsyncErrorHandling(onceHandler, instance, 6 /* COMPONENT_EVENT_HANDLER */, args);
        }
    }
    function normalizeEmitsOptions(comp, appContext, asMixin = false) {
        const cache = appContext.emitsCache;
        const cached = cache.get(comp);
        if (cached !== undefined) {
            return cached;
        }
        const raw = comp.emits;
        let normalized = {};
        // apply mixin/extends props
        let hasExtends = false;
        if (__VUE_OPTIONS_API__ && !isFunction(comp)) {
            const extendEmits = (raw) => {
                const normalizedFromExtend = normalizeEmitsOptions(raw, appContext, true);
                if (normalizedFromExtend) {
                    hasExtends = true;
                    extend$1(normalized, normalizedFromExtend);
                }
            };
            if (!asMixin && appContext.mixins.length) {
                appContext.mixins.forEach(extendEmits);
            }
            if (comp.extends) {
                extendEmits(comp.extends);
            }
            if (comp.mixins) {
                comp.mixins.forEach(extendEmits);
            }
        }
        if (!raw && !hasExtends) {
            cache.set(comp, null);
            return null;
        }
        if (isArray$1(raw)) {
            raw.forEach(key => (normalized[key] = null));
        }
        else {
            extend$1(normalized, raw);
        }
        cache.set(comp, normalized);
        return normalized;
    }
    // Check if an incoming prop key is a declared emit event listener.
    // e.g. With `emits: { click: null }`, props named `onClick` and `onclick` are
    // both considered matched listeners.
    function isEmitListener(options, key) {
        if (!options || !isOn(key)) {
            return false;
        }
        key = key.slice(2).replace(/Once$/, '');
        return (hasOwn$1(options, key[0].toLowerCase() + key.slice(1)) ||
            hasOwn$1(options, hyphenate(key)) ||
            hasOwn$1(options, key));
    }

    /**
     * mark the current rendering instance for asset resolution (e.g.
     * resolveComponent, resolveDirective) during render
     */
    let currentRenderingInstance = null;
    let currentScopeId = null;
    /**
     * Note: rendering calls maybe nested. The function returns the parent rendering
     * instance if present, which should be restored after the render is done:
     *
     * ```js
     * const prev = setCurrentRenderingInstance(i)
     * // ...render
     * setCurrentRenderingInstance(prev)
     * ```
     */
    function setCurrentRenderingInstance(instance) {
        const prev = currentRenderingInstance;
        currentRenderingInstance = instance;
        currentScopeId = (instance && instance.type.__scopeId) || null;
        return prev;
    }
    /**
     * Set scope id when creating hoisted vnodes.
     * @private compiler helper
     */
    function pushScopeId(id) {
        currentScopeId = id;
    }
    /**
     * Technically we no longer need this after 3.0.8 but we need to keep the same
     * API for backwards compat w/ code generated by compilers.
     * @private
     */
    function popScopeId() {
        currentScopeId = null;
    }
    /**
     * Wrap a slot function to memoize current rendering instance
     * @private compiler helper
     */
    function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot // false only
    ) {
        if (!ctx)
            return fn;
        // already normalized
        if (fn._n) {
            return fn;
        }
        const renderFnWithContext = (...args) => {
            // If a user calls a compiled slot inside a template expression (#1745), it
            // can mess up block tracking, so by default we disable block tracking and
            // force bail out when invoking a compiled slot (indicated by the ._d flag).
            // This isn't necessary if rendering a compiled `<slot>`, so we flip the
            // ._d flag off when invoking the wrapped fn inside `renderSlot`.
            if (renderFnWithContext._d) {
                setBlockTracking(-1);
            }
            const prevInstance = setCurrentRenderingInstance(ctx);
            const res = fn(...args);
            setCurrentRenderingInstance(prevInstance);
            if (renderFnWithContext._d) {
                setBlockTracking(1);
            }
            if (__VUE_PROD_DEVTOOLS__) {
                devtoolsComponentUpdated(ctx);
            }
            return res;
        };
        // mark normalized to avoid duplicated wrapping
        renderFnWithContext._n = true;
        // mark this as compiled by default
        // this is used in vnode.ts -> normalizeChildren() to set the slot
        // rendering flag.
        renderFnWithContext._c = true;
        // disable block tracking by default
        renderFnWithContext._d = true;
        return renderFnWithContext;
    }
    function markAttrsAccessed() {
    }
    function renderComponentRoot(instance) {
        const { type: Component, vnode, proxy, withProxy, props, propsOptions: [propsOptions], slots, attrs, emit, render, renderCache, data, setupState, ctx, inheritAttrs } = instance;
        let result;
        let fallthroughAttrs;
        const prev = setCurrentRenderingInstance(instance);
        try {
            if (vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */) {
                // withProxy is a proxy with a different `has` trap only for
                // runtime-compiled render functions using `with` block.
                const proxyToUse = withProxy || proxy;
                result = normalizeVNode(render.call(proxyToUse, proxyToUse, renderCache, props, setupState, data, ctx));
                fallthroughAttrs = attrs;
            }
            else {
                // functional
                const render = Component;
                // in dev, mark attrs accessed if optional props (attrs === props)
                if (("production" !== 'production') && attrs === props) ;
                result = normalizeVNode(render.length > 1
                    ? render(props, ("production" !== 'production')
                        ? {
                            get attrs() {
                                markAttrsAccessed();
                                return attrs;
                            },
                            slots,
                            emit
                        }
                        : { attrs, slots, emit })
                    : render(props, null /* we know it doesn't need it */));
                fallthroughAttrs = Component.props
                    ? attrs
                    : getFunctionalFallthrough(attrs);
            }
        }
        catch (err) {
            blockStack.length = 0;
            handleError(err, instance, 1 /* RENDER_FUNCTION */);
            result = createVNode(Comment);
        }
        // attr merging
        // in dev mode, comments are preserved, and it's possible for a template
        // to have comments along side the root element which makes it a fragment
        let root = result;
        if (fallthroughAttrs && inheritAttrs !== false) {
            const keys = Object.keys(fallthroughAttrs);
            const { shapeFlag } = root;
            if (keys.length) {
                if (shapeFlag & (1 /* ELEMENT */ | 6 /* COMPONENT */)) {
                    if (propsOptions && keys.some(isModelListener)) {
                        // If a v-model listener (onUpdate:xxx) has a corresponding declared
                        // prop, it indicates this component expects to handle v-model and
                        // it should not fallthrough.
                        // related: #1543, #1643, #1989
                        fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
                    }
                    root = cloneVNode(root, fallthroughAttrs);
                }
            }
        }
        // inherit directives
        if (vnode.dirs) {
            root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
        }
        // inherit transition data
        if (vnode.transition) {
            root.transition = vnode.transition;
        }
        {
            result = root;
        }
        setCurrentRenderingInstance(prev);
        return result;
    }
    const getFunctionalFallthrough = (attrs) => {
        let res;
        for (const key in attrs) {
            if (key === 'class' || key === 'style' || isOn(key)) {
                (res || (res = {}))[key] = attrs[key];
            }
        }
        return res;
    };
    const filterModelListeners = (attrs, props) => {
        const res = {};
        for (const key in attrs) {
            if (!isModelListener(key) || !(key.slice(9) in props)) {
                res[key] = attrs[key];
            }
        }
        return res;
    };
    function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
        const { props: prevProps, children: prevChildren, component } = prevVNode;
        const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
        const emits = component.emitsOptions;
        // force child update for runtime directive or transition on component vnode.
        if (nextVNode.dirs || nextVNode.transition) {
            return true;
        }
        if (optimized && patchFlag >= 0) {
            if (patchFlag & 1024 /* DYNAMIC_SLOTS */) {
                // slot content that references values that might have changed,
                // e.g. in a v-for
                return true;
            }
            if (patchFlag & 16 /* FULL_PROPS */) {
                if (!prevProps) {
                    return !!nextProps;
                }
                // presence of this flag indicates props are always non-null
                return hasPropsChanged(prevProps, nextProps, emits);
            }
            else if (patchFlag & 8 /* PROPS */) {
                const dynamicProps = nextVNode.dynamicProps;
                for (let i = 0; i < dynamicProps.length; i++) {
                    const key = dynamicProps[i];
                    if (nextProps[key] !== prevProps[key] &&
                        !isEmitListener(emits, key)) {
                        return true;
                    }
                }
            }
        }
        else {
            // this path is only taken by manually written render functions
            // so presence of any children leads to a forced update
            if (prevChildren || nextChildren) {
                if (!nextChildren || !nextChildren.$stable) {
                    return true;
                }
            }
            if (prevProps === nextProps) {
                return false;
            }
            if (!prevProps) {
                return !!nextProps;
            }
            if (!nextProps) {
                return true;
            }
            return hasPropsChanged(prevProps, nextProps, emits);
        }
        return false;
    }
    function hasPropsChanged(prevProps, nextProps, emitsOptions) {
        const nextKeys = Object.keys(nextProps);
        if (nextKeys.length !== Object.keys(prevProps).length) {
            return true;
        }
        for (let i = 0; i < nextKeys.length; i++) {
            const key = nextKeys[i];
            if (nextProps[key] !== prevProps[key] &&
                !isEmitListener(emitsOptions, key)) {
                return true;
            }
        }
        return false;
    }
    function updateHOCHostEl({ vnode, parent }, el // HostNode
    ) {
        while (parent && parent.subTree === vnode) {
            (vnode = parent.vnode).el = el;
            parent = parent.parent;
        }
    }

    const isSuspense = (type) => type.__isSuspense;
    function queueEffectWithSuspense(fn, suspense) {
        if (suspense && suspense.pendingBranch) {
            if (isArray$1(fn)) {
                suspense.effects.push(...fn);
            }
            else {
                suspense.effects.push(fn);
            }
        }
        else {
            queuePostFlushCb(fn);
        }
    }

    function provide(key, value) {
        if (!currentInstance) ;
        else {
            let provides = currentInstance.provides;
            // by default an instance inherits its parent's provides object
            // but when it needs to provide values of its own, it creates its
            // own provides object using parent provides object as prototype.
            // this way in `inject` we can simply look up injections from direct
            // parent and let the prototype chain do the work.
            const parentProvides = currentInstance.parent && currentInstance.parent.provides;
            if (parentProvides === provides) {
                provides = currentInstance.provides = Object.create(parentProvides);
            }
            // TS doesn't allow symbol as index type
            provides[key] = value;
        }
    }
    function inject(key, defaultValue, treatDefaultAsFactory = false) {
        // fallback to `currentRenderingInstance` so that this can be called in
        // a functional component
        const instance = currentInstance || currentRenderingInstance;
        if (instance) {
            // #2400
            // to support `app.use` plugins,
            // fallback to appContext's `provides` if the instance is at root
            const provides = instance.parent == null
                ? instance.vnode.appContext && instance.vnode.appContext.provides
                : instance.parent.provides;
            if (provides && key in provides) {
                // TS doesn't allow symbol as index type
                return provides[key];
            }
            else if (arguments.length > 1) {
                return treatDefaultAsFactory && isFunction(defaultValue)
                    ? defaultValue.call(instance.proxy)
                    : defaultValue;
            }
            else ;
        }
    }
    // initial value for watchers to trigger on undefined initial values
    const INITIAL_WATCHER_VALUE = {};
    // implementation
    function watch(source, cb, options) {
        return doWatch(source, cb, options);
    }
    function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ) {
        const instance = currentInstance;
        let getter;
        let forceTrigger = false;
        let isMultiSource = false;
        if (isRef(source)) {
            getter = () => source.value;
            forceTrigger = isShallow(source);
        }
        else if (isReactive(source)) {
            getter = () => source;
            deep = true;
        }
        else if (isArray$1(source)) {
            isMultiSource = true;
            forceTrigger = source.some(isReactive);
            getter = () => source.map(s => {
                if (isRef(s)) {
                    return s.value;
                }
                else if (isReactive(s)) {
                    return traverse(s);
                }
                else if (isFunction(s)) {
                    return callWithErrorHandling(s, instance, 2 /* WATCH_GETTER */);
                }
                else ;
            });
        }
        else if (isFunction(source)) {
            if (cb) {
                // getter with cb
                getter = () => callWithErrorHandling(source, instance, 2 /* WATCH_GETTER */);
            }
            else {
                // no cb -> simple effect
                getter = () => {
                    if (instance && instance.isUnmounted) {
                        return;
                    }
                    if (cleanup) {
                        cleanup();
                    }
                    return callWithAsyncErrorHandling(source, instance, 3 /* WATCH_CALLBACK */, [onCleanup]);
                };
            }
        }
        else {
            getter = NOOP;
        }
        if (cb && deep) {
            const baseGetter = getter;
            getter = () => traverse(baseGetter());
        }
        let cleanup;
        let onCleanup = (fn) => {
            cleanup = effect.onStop = () => {
                callWithErrorHandling(fn, instance, 4 /* WATCH_CLEANUP */);
            };
        };
        // in SSR there is no need to setup an actual effect, and it should be noop
        // unless it's eager
        if (isInSSRComponentSetup) {
            // we will also not call the invalidate callback (+ runner is not set up)
            onCleanup = NOOP;
            if (!cb) {
                getter();
            }
            else if (immediate) {
                callWithAsyncErrorHandling(cb, instance, 3 /* WATCH_CALLBACK */, [
                    getter(),
                    isMultiSource ? [] : undefined,
                    onCleanup
                ]);
            }
            return NOOP;
        }
        let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE;
        const job = () => {
            if (!effect.active) {
                return;
            }
            if (cb) {
                // watch(source, cb)
                const newValue = effect.run();
                if (deep ||
                    forceTrigger ||
                    (isMultiSource
                        ? newValue.some((v, i) => hasChanged(v, oldValue[i]))
                        : hasChanged(newValue, oldValue)) ||
                    (false  )) {
                    // cleanup before running cb again
                    if (cleanup) {
                        cleanup();
                    }
                    callWithAsyncErrorHandling(cb, instance, 3 /* WATCH_CALLBACK */, [
                        newValue,
                        // pass undefined as the old value when it's changed for the first time
                        oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
                        onCleanup
                    ]);
                    oldValue = newValue;
                }
            }
            else {
                // watchEffect
                effect.run();
            }
        };
        // important: mark the job as a watcher callback so that scheduler knows
        // it is allowed to self-trigger (#1727)
        job.allowRecurse = !!cb;
        let scheduler;
        if (flush === 'sync') {
            scheduler = job; // the scheduler function gets called directly
        }
        else if (flush === 'post') {
            scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
        }
        else {
            // default: 'pre'
            scheduler = () => {
                if (!instance || instance.isMounted) {
                    queuePreFlushCb(job);
                }
                else {
                    // with 'pre' option, the first call must happen before
                    // the component is mounted so it is called synchronously.
                    job();
                }
            };
        }
        const effect = new ReactiveEffect(getter, scheduler);
        // initial run
        if (cb) {
            if (immediate) {
                job();
            }
            else {
                oldValue = effect.run();
            }
        }
        else if (flush === 'post') {
            queuePostRenderEffect(effect.run.bind(effect), instance && instance.suspense);
        }
        else {
            effect.run();
        }
        return () => {
            effect.stop();
            if (instance && instance.scope) {
                remove(instance.scope.effects, effect);
            }
        };
    }
    // this.$watch
    function instanceWatch(source, value, options) {
        const publicThis = this.proxy;
        const getter = isString(source)
            ? source.includes('.')
                ? createPathGetter(publicThis, source)
                : () => publicThis[source]
            : source.bind(publicThis, publicThis);
        let cb;
        if (isFunction(value)) {
            cb = value;
        }
        else {
            cb = value.handler;
            options = value;
        }
        const cur = currentInstance;
        setCurrentInstance(this);
        const res = doWatch(getter, cb.bind(publicThis), options);
        if (cur) {
            setCurrentInstance(cur);
        }
        else {
            unsetCurrentInstance();
        }
        return res;
    }
    function createPathGetter(ctx, path) {
        const segments = path.split('.');
        return () => {
            let cur = ctx;
            for (let i = 0; i < segments.length && cur; i++) {
                cur = cur[segments[i]];
            }
            return cur;
        };
    }
    function traverse(value, seen) {
        if (!isObject(value) || value["__v_skip" /* SKIP */]) {
            return value;
        }
        seen = seen || new Set();
        if (seen.has(value)) {
            return value;
        }
        seen.add(value);
        if (isRef(value)) {
            traverse(value.value, seen);
        }
        else if (isArray$1(value)) {
            for (let i = 0; i < value.length; i++) {
                traverse(value[i], seen);
            }
        }
        else if (isSet(value) || isMap(value)) {
            value.forEach((v) => {
                traverse(v, seen);
            });
        }
        else if (isPlainObject(value)) {
            for (const key in value) {
                traverse(value[key], seen);
            }
        }
        return value;
    }

    function useTransitionState() {
        const state = {
            isMounted: false,
            isLeaving: false,
            isUnmounting: false,
            leavingVNodes: new Map()
        };
        onMounted(() => {
            state.isMounted = true;
        });
        onBeforeUnmount(() => {
            state.isUnmounting = true;
        });
        return state;
    }
    const TransitionHookValidator = [Function, Array];
    const BaseTransitionImpl = {
        name: `BaseTransition`,
        props: {
            mode: String,
            appear: Boolean,
            persisted: Boolean,
            // enter
            onBeforeEnter: TransitionHookValidator,
            onEnter: TransitionHookValidator,
            onAfterEnter: TransitionHookValidator,
            onEnterCancelled: TransitionHookValidator,
            // leave
            onBeforeLeave: TransitionHookValidator,
            onLeave: TransitionHookValidator,
            onAfterLeave: TransitionHookValidator,
            onLeaveCancelled: TransitionHookValidator,
            // appear
            onBeforeAppear: TransitionHookValidator,
            onAppear: TransitionHookValidator,
            onAfterAppear: TransitionHookValidator,
            onAppearCancelled: TransitionHookValidator
        },
        setup(props, { slots }) {
            const instance = getCurrentInstance();
            const state = useTransitionState();
            let prevTransitionKey;
            return () => {
                const children = slots.default && getTransitionRawChildren(slots.default(), true);
                if (!children || !children.length) {
                    return;
                }
                // there's no need to track reactivity for these props so use the raw
                // props for a bit better perf
                const rawProps = toRaw(props);
                const { mode } = rawProps;
                // at this point children has a guaranteed length of 1.
                const child = children[0];
                if (state.isLeaving) {
                    return emptyPlaceholder(child);
                }
                // in the case of <transition><keep-alive/></transition>, we need to
                // compare the type of the kept-alive children.
                const innerChild = getKeepAliveChild(child);
                if (!innerChild) {
                    return emptyPlaceholder(child);
                }
                const enterHooks = resolveTransitionHooks(innerChild, rawProps, state, instance);
                setTransitionHooks(innerChild, enterHooks);
                const oldChild = instance.subTree;
                const oldInnerChild = oldChild && getKeepAliveChild(oldChild);
                let transitionKeyChanged = false;
                const { getTransitionKey } = innerChild.type;
                if (getTransitionKey) {
                    const key = getTransitionKey();
                    if (prevTransitionKey === undefined) {
                        prevTransitionKey = key;
                    }
                    else if (key !== prevTransitionKey) {
                        prevTransitionKey = key;
                        transitionKeyChanged = true;
                    }
                }
                // handle mode
                if (oldInnerChild &&
                    oldInnerChild.type !== Comment &&
                    (!isSameVNodeType(innerChild, oldInnerChild) || transitionKeyChanged)) {
                    const leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance);
                    // update old tree's hooks in case of dynamic transition
                    setTransitionHooks(oldInnerChild, leavingHooks);
                    // switching between different views
                    if (mode === 'out-in') {
                        state.isLeaving = true;
                        // return placeholder node and queue update when leave finishes
                        leavingHooks.afterLeave = () => {
                            state.isLeaving = false;
                            instance.update();
                        };
                        return emptyPlaceholder(child);
                    }
                    else if (mode === 'in-out' && innerChild.type !== Comment) {
                        leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
                            const leavingVNodesCache = getLeavingNodesForType(state, oldInnerChild);
                            leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
                            // early removal callback
                            el._leaveCb = () => {
                                earlyRemove();
                                el._leaveCb = undefined;
                                delete enterHooks.delayedLeave;
                            };
                            enterHooks.delayedLeave = delayedLeave;
                        };
                    }
                }
                return child;
            };
        }
    };
    // export the public type for h/tsx inference
    // also to avoid inline import() in generated d.ts files
    const BaseTransition = BaseTransitionImpl;
    function getLeavingNodesForType(state, vnode) {
        const { leavingVNodes } = state;
        let leavingVNodesCache = leavingVNodes.get(vnode.type);
        if (!leavingVNodesCache) {
            leavingVNodesCache = Object.create(null);
            leavingVNodes.set(vnode.type, leavingVNodesCache);
        }
        return leavingVNodesCache;
    }
    // The transition hooks are attached to the vnode as vnode.transition
    // and will be called at appropriate timing in the renderer.
    function resolveTransitionHooks(vnode, props, state, instance) {
        const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
        const key = String(vnode.key);
        const leavingVNodesCache = getLeavingNodesForType(state, vnode);
        const callHook = (hook, args) => {
            hook &&
                callWithAsyncErrorHandling(hook, instance, 9 /* TRANSITION_HOOK */, args);
        };
        const hooks = {
            mode,
            persisted,
            beforeEnter(el) {
                let hook = onBeforeEnter;
                if (!state.isMounted) {
                    if (appear) {
                        hook = onBeforeAppear || onBeforeEnter;
                    }
                    else {
                        return;
                    }
                }
                // for same element (v-show)
                if (el._leaveCb) {
                    el._leaveCb(true /* cancelled */);
                }
                // for toggled element with same key (v-if)
                const leavingVNode = leavingVNodesCache[key];
                if (leavingVNode &&
                    isSameVNodeType(vnode, leavingVNode) &&
                    leavingVNode.el._leaveCb) {
                    // force early removal (not cancelled)
                    leavingVNode.el._leaveCb();
                }
                callHook(hook, [el]);
            },
            enter(el) {
                let hook = onEnter;
                let afterHook = onAfterEnter;
                let cancelHook = onEnterCancelled;
                if (!state.isMounted) {
                    if (appear) {
                        hook = onAppear || onEnter;
                        afterHook = onAfterAppear || onAfterEnter;
                        cancelHook = onAppearCancelled || onEnterCancelled;
                    }
                    else {
                        return;
                    }
                }
                let called = false;
                const done = (el._enterCb = (cancelled) => {
                    if (called)
                        return;
                    called = true;
                    if (cancelled) {
                        callHook(cancelHook, [el]);
                    }
                    else {
                        callHook(afterHook, [el]);
                    }
                    if (hooks.delayedLeave) {
                        hooks.delayedLeave();
                    }
                    el._enterCb = undefined;
                });
                if (hook) {
                    hook(el, done);
                    if (hook.length <= 1) {
                        done();
                    }
                }
                else {
                    done();
                }
            },
            leave(el, remove) {
                const key = String(vnode.key);
                if (el._enterCb) {
                    el._enterCb(true /* cancelled */);
                }
                if (state.isUnmounting) {
                    return remove();
                }
                callHook(onBeforeLeave, [el]);
                let called = false;
                const done = (el._leaveCb = (cancelled) => {
                    if (called)
                        return;
                    called = true;
                    remove();
                    if (cancelled) {
                        callHook(onLeaveCancelled, [el]);
                    }
                    else {
                        callHook(onAfterLeave, [el]);
                    }
                    el._leaveCb = undefined;
                    if (leavingVNodesCache[key] === vnode) {
                        delete leavingVNodesCache[key];
                    }
                });
                leavingVNodesCache[key] = vnode;
                if (onLeave) {
                    onLeave(el, done);
                    if (onLeave.length <= 1) {
                        done();
                    }
                }
                else {
                    done();
                }
            },
            clone(vnode) {
                return resolveTransitionHooks(vnode, props, state, instance);
            }
        };
        return hooks;
    }
    // the placeholder really only handles one special case: KeepAlive
    // in the case of a KeepAlive in a leave phase we need to return a KeepAlive
    // placeholder with empty content to avoid the KeepAlive instance from being
    // unmounted.
    function emptyPlaceholder(vnode) {
        if (isKeepAlive(vnode)) {
            vnode = cloneVNode(vnode);
            vnode.children = null;
            return vnode;
        }
    }
    function getKeepAliveChild(vnode) {
        return isKeepAlive(vnode)
            ? vnode.children
                ? vnode.children[0]
                : undefined
            : vnode;
    }
    function setTransitionHooks(vnode, hooks) {
        if (vnode.shapeFlag & 6 /* COMPONENT */ && vnode.component) {
            setTransitionHooks(vnode.component.subTree, hooks);
        }
        else if (vnode.shapeFlag & 128 /* SUSPENSE */) {
            vnode.ssContent.transition = hooks.clone(vnode.ssContent);
            vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
        }
        else {
            vnode.transition = hooks;
        }
    }
    function getTransitionRawChildren(children, keepComment = false) {
        let ret = [];
        let keyedFragmentCount = 0;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            // handle fragment children case, e.g. v-for
            if (child.type === Fragment) {
                if (child.patchFlag & 128 /* KEYED_FRAGMENT */)
                    keyedFragmentCount++;
                ret = ret.concat(getTransitionRawChildren(child.children, keepComment));
            }
            // comment placeholders should be skipped, e.g. v-if
            else if (keepComment || child.type !== Comment) {
                ret.push(child);
            }
        }
        // #1126 if a transition children list contains multiple sub fragments, these
        // fragments will be merged into a flat children array. Since each v-for
        // fragment may contain different static bindings inside, we need to de-op
        // these children to force full diffs to ensure correct behavior.
        if (keyedFragmentCount > 1) {
            for (let i = 0; i < ret.length; i++) {
                ret[i].patchFlag = -2 /* BAIL */;
            }
        }
        return ret;
    }

    const isAsyncWrapper = (i) => !!i.type.__asyncLoader;

    const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
    function onActivated(hook, target) {
        registerKeepAliveHook(hook, "a" /* ACTIVATED */, target);
    }
    function onDeactivated(hook, target) {
        registerKeepAliveHook(hook, "da" /* DEACTIVATED */, target);
    }
    function registerKeepAliveHook(hook, type, target = currentInstance) {
        // cache the deactivate branch check wrapper for injected hooks so the same
        // hook can be properly deduped by the scheduler. "__wdc" stands for "with
        // deactivation check".
        const wrappedHook = hook.__wdc ||
            (hook.__wdc = () => {
                // only fire the hook if the target instance is NOT in a deactivated branch.
                let current = target;
                while (current) {
                    if (current.isDeactivated) {
                        return;
                    }
                    current = current.parent;
                }
                return hook();
            });
        injectHook(type, wrappedHook, target);
        // In addition to registering it on the target instance, we walk up the parent
        // chain and register it on all ancestor instances that are keep-alive roots.
        // This avoids the need to walk the entire component tree when invoking these
        // hooks, and more importantly, avoids the need to track child components in
        // arrays.
        if (target) {
            let current = target.parent;
            while (current && current.parent) {
                if (isKeepAlive(current.parent.vnode)) {
                    injectToKeepAliveRoot(wrappedHook, type, target, current);
                }
                current = current.parent;
            }
        }
    }
    function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
        // injectHook wraps the original for error handling, so make sure to remove
        // the wrapped version.
        const injected = injectHook(type, hook, keepAliveRoot, true /* prepend */);
        onUnmounted(() => {
            remove(keepAliveRoot[type], injected);
        }, target);
    }

    function injectHook(type, hook, target = currentInstance, prepend = false) {
        if (target) {
            const hooks = target[type] || (target[type] = []);
            // cache the error handling wrapper for injected hooks so the same hook
            // can be properly deduped by the scheduler. "__weh" stands for "with error
            // handling".
            const wrappedHook = hook.__weh ||
                (hook.__weh = (...args) => {
                    if (target.isUnmounted) {
                        return;
                    }
                    // disable tracking inside all lifecycle hooks
                    // since they can potentially be called inside effects.
                    pauseTracking();
                    // Set currentInstance during hook invocation.
                    // This assumes the hook does not synchronously trigger other hooks, which
                    // can only be false when the user does something really funky.
                    setCurrentInstance(target);
                    const res = callWithAsyncErrorHandling(hook, target, type, args);
                    unsetCurrentInstance();
                    resetTracking();
                    return res;
                });
            if (prepend) {
                hooks.unshift(wrappedHook);
            }
            else {
                hooks.push(wrappedHook);
            }
            return wrappedHook;
        }
    }
    const createHook = (lifecycle) => (hook, target = currentInstance) => 
    // post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
    (!isInSSRComponentSetup || lifecycle === "sp" /* SERVER_PREFETCH */) &&
        injectHook(lifecycle, hook, target);
    const onBeforeMount = createHook("bm" /* BEFORE_MOUNT */);
    const onMounted = createHook("m" /* MOUNTED */);
    const onBeforeUpdate = createHook("bu" /* BEFORE_UPDATE */);
    const onUpdated = createHook("u" /* UPDATED */);
    const onBeforeUnmount = createHook("bum" /* BEFORE_UNMOUNT */);
    const onUnmounted = createHook("um" /* UNMOUNTED */);
    const onServerPrefetch = createHook("sp" /* SERVER_PREFETCH */);
    const onRenderTriggered = createHook("rtg" /* RENDER_TRIGGERED */);
    const onRenderTracked = createHook("rtc" /* RENDER_TRACKED */);
    function onErrorCaptured(hook, target = currentInstance) {
        injectHook("ec" /* ERROR_CAPTURED */, hook, target);
    }
    let shouldCacheAccess = true;
    function applyOptions(instance) {
        const options = resolveMergedOptions(instance);
        const publicThis = instance.proxy;
        const ctx = instance.ctx;
        // do not cache property access on public proxy during state initialization
        shouldCacheAccess = false;
        // call beforeCreate first before accessing other options since
        // the hook may mutate resolved options (#2791)
        if (options.beforeCreate) {
            callHook(options.beforeCreate, instance, "bc" /* BEFORE_CREATE */);
        }
        const { 
        // state
        data: dataOptions, computed: computedOptions, methods, watch: watchOptions, provide: provideOptions, inject: injectOptions, 
        // lifecycle
        created, beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeDestroy, beforeUnmount, destroyed, unmounted, render, renderTracked, renderTriggered, errorCaptured, serverPrefetch, 
        // public API
        expose, inheritAttrs, 
        // assets
        components, directives, filters } = options;
        const checkDuplicateProperties = null;
        // options initialization order (to be consistent with Vue 2):
        // - props (already done outside of this function)
        // - inject
        // - methods
        // - data (deferred since it relies on `this` access)
        // - computed
        // - watch (deferred since it relies on `this` access)
        if (injectOptions) {
            resolveInjections(injectOptions, ctx, checkDuplicateProperties, instance.appContext.config.unwrapInjectedRef);
        }
        if (methods) {
            for (const key in methods) {
                const methodHandler = methods[key];
                if (isFunction(methodHandler)) {
                    // In dev mode, we use the `createRenderContext` function to define
                    // methods to the proxy target, and those are read-only but
                    // reconfigurable, so it needs to be redefined here
                    {
                        ctx[key] = methodHandler.bind(publicThis);
                    }
                }
            }
        }
        if (dataOptions) {
            const data = dataOptions.call(publicThis, publicThis);
            if (!isObject(data)) ;
            else {
                instance.data = reactive(data);
            }
        }
        // state initialization complete at this point - start caching access
        shouldCacheAccess = true;
        if (computedOptions) {
            for (const key in computedOptions) {
                const opt = computedOptions[key];
                const get = isFunction(opt)
                    ? opt.bind(publicThis, publicThis)
                    : isFunction(opt.get)
                        ? opt.get.bind(publicThis, publicThis)
                        : NOOP;
                const set = !isFunction(opt) && isFunction(opt.set)
                    ? opt.set.bind(publicThis)
                    : NOOP;
                const c = computed({
                    get,
                    set
                });
                Object.defineProperty(ctx, key, {
                    enumerable: true,
                    configurable: true,
                    get: () => c.value,
                    set: v => (c.value = v)
                });
            }
        }
        if (watchOptions) {
            for (const key in watchOptions) {
                createWatcher(watchOptions[key], ctx, publicThis, key);
            }
        }
        if (provideOptions) {
            const provides = isFunction(provideOptions)
                ? provideOptions.call(publicThis)
                : provideOptions;
            Reflect.ownKeys(provides).forEach(key => {
                provide(key, provides[key]);
            });
        }
        if (created) {
            callHook(created, instance, "c" /* CREATED */);
        }
        function registerLifecycleHook(register, hook) {
            if (isArray$1(hook)) {
                hook.forEach(_hook => register(_hook.bind(publicThis)));
            }
            else if (hook) {
                register(hook.bind(publicThis));
            }
        }
        registerLifecycleHook(onBeforeMount, beforeMount);
        registerLifecycleHook(onMounted, mounted);
        registerLifecycleHook(onBeforeUpdate, beforeUpdate);
        registerLifecycleHook(onUpdated, updated);
        registerLifecycleHook(onActivated, activated);
        registerLifecycleHook(onDeactivated, deactivated);
        registerLifecycleHook(onErrorCaptured, errorCaptured);
        registerLifecycleHook(onRenderTracked, renderTracked);
        registerLifecycleHook(onRenderTriggered, renderTriggered);
        registerLifecycleHook(onBeforeUnmount, beforeUnmount);
        registerLifecycleHook(onUnmounted, unmounted);
        registerLifecycleHook(onServerPrefetch, serverPrefetch);
        if (isArray$1(expose)) {
            if (expose.length) {
                const exposed = instance.exposed || (instance.exposed = {});
                expose.forEach(key => {
                    Object.defineProperty(exposed, key, {
                        get: () => publicThis[key],
                        set: val => (publicThis[key] = val)
                    });
                });
            }
            else if (!instance.exposed) {
                instance.exposed = {};
            }
        }
        // options that are handled when creating the instance but also need to be
        // applied from mixins
        if (render && instance.render === NOOP) {
            instance.render = render;
        }
        if (inheritAttrs != null) {
            instance.inheritAttrs = inheritAttrs;
        }
        // asset options.
        if (components)
            instance.components = components;
        if (directives)
            instance.directives = directives;
    }
    function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP, unwrapRef = false) {
        if (isArray$1(injectOptions)) {
            injectOptions = normalizeInject(injectOptions);
        }
        for (const key in injectOptions) {
            const opt = injectOptions[key];
            let injected;
            if (isObject(opt)) {
                if ('default' in opt) {
                    injected = inject(opt.from || key, opt.default, true /* treat default function as factory */);
                }
                else {
                    injected = inject(opt.from || key);
                }
            }
            else {
                injected = inject(opt);
            }
            if (isRef(injected)) {
                // TODO remove the check in 3.3
                if (unwrapRef) {
                    Object.defineProperty(ctx, key, {
                        enumerable: true,
                        configurable: true,
                        get: () => injected.value,
                        set: v => (injected.value = v)
                    });
                }
                else {
                    ctx[key] = injected;
                }
            }
            else {
                ctx[key] = injected;
            }
        }
    }
    function callHook(hook, instance, type) {
        callWithAsyncErrorHandling(isArray$1(hook)
            ? hook.map(h => h.bind(instance.proxy))
            : hook.bind(instance.proxy), instance, type);
    }
    function createWatcher(raw, ctx, publicThis, key) {
        const getter = key.includes('.')
            ? createPathGetter(publicThis, key)
            : () => publicThis[key];
        if (isString(raw)) {
            const handler = ctx[raw];
            if (isFunction(handler)) {
                watch(getter, handler);
            }
        }
        else if (isFunction(raw)) {
            watch(getter, raw.bind(publicThis));
        }
        else if (isObject(raw)) {
            if (isArray$1(raw)) {
                raw.forEach(r => createWatcher(r, ctx, publicThis, key));
            }
            else {
                const handler = isFunction(raw.handler)
                    ? raw.handler.bind(publicThis)
                    : ctx[raw.handler];
                if (isFunction(handler)) {
                    watch(getter, handler, raw);
                }
            }
        }
        else ;
    }
    /**
     * Resolve merged options and cache it on the component.
     * This is done only once per-component since the merging does not involve
     * instances.
     */
    function resolveMergedOptions(instance) {
        const base = instance.type;
        const { mixins, extends: extendsOptions } = base;
        const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
        const cached = cache.get(base);
        let resolved;
        if (cached) {
            resolved = cached;
        }
        else if (!globalMixins.length && !mixins && !extendsOptions) {
            {
                resolved = base;
            }
        }
        else {
            resolved = {};
            if (globalMixins.length) {
                globalMixins.forEach(m => mergeOptions(resolved, m, optionMergeStrategies, true));
            }
            mergeOptions(resolved, base, optionMergeStrategies);
        }
        cache.set(base, resolved);
        return resolved;
    }
    function mergeOptions(to, from, strats, asMixin = false) {
        const { mixins, extends: extendsOptions } = from;
        if (extendsOptions) {
            mergeOptions(to, extendsOptions, strats, true);
        }
        if (mixins) {
            mixins.forEach((m) => mergeOptions(to, m, strats, true));
        }
        for (const key in from) {
            if (asMixin && key === 'expose') ;
            else {
                const strat = internalOptionMergeStrats[key] || (strats && strats[key]);
                to[key] = strat ? strat(to[key], from[key]) : from[key];
            }
        }
        return to;
    }
    const internalOptionMergeStrats = {
        data: mergeDataFn,
        props: mergeObjectOptions,
        emits: mergeObjectOptions,
        // objects
        methods: mergeObjectOptions,
        computed: mergeObjectOptions,
        // lifecycle
        beforeCreate: mergeAsArray,
        created: mergeAsArray,
        beforeMount: mergeAsArray,
        mounted: mergeAsArray,
        beforeUpdate: mergeAsArray,
        updated: mergeAsArray,
        beforeDestroy: mergeAsArray,
        beforeUnmount: mergeAsArray,
        destroyed: mergeAsArray,
        unmounted: mergeAsArray,
        activated: mergeAsArray,
        deactivated: mergeAsArray,
        errorCaptured: mergeAsArray,
        serverPrefetch: mergeAsArray,
        // assets
        components: mergeObjectOptions,
        directives: mergeObjectOptions,
        // watch
        watch: mergeWatchOptions,
        // provide / inject
        provide: mergeDataFn,
        inject: mergeInject
    };
    function mergeDataFn(to, from) {
        if (!from) {
            return to;
        }
        if (!to) {
            return from;
        }
        return function mergedDataFn() {
            return (extend$1)(isFunction(to) ? to.call(this, this) : to, isFunction(from) ? from.call(this, this) : from);
        };
    }
    function mergeInject(to, from) {
        return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
    }
    function normalizeInject(raw) {
        if (isArray$1(raw)) {
            const res = {};
            for (let i = 0; i < raw.length; i++) {
                res[raw[i]] = raw[i];
            }
            return res;
        }
        return raw;
    }
    function mergeAsArray(to, from) {
        return to ? [...new Set([].concat(to, from))] : from;
    }
    function mergeObjectOptions(to, from) {
        return to ? extend$1(extend$1(Object.create(null), to), from) : from;
    }
    function mergeWatchOptions(to, from) {
        if (!to)
            return from;
        if (!from)
            return to;
        const merged = extend$1(Object.create(null), to);
        for (const key in from) {
            merged[key] = mergeAsArray(to[key], from[key]);
        }
        return merged;
    }

    function initProps(instance, rawProps, isStateful, // result of bitwise flag comparison
    isSSR = false) {
        const props = {};
        const attrs = {};
        def(attrs, InternalObjectKey, 1);
        instance.propsDefaults = Object.create(null);
        setFullProps(instance, rawProps, props, attrs);
        // ensure all declared prop keys are present
        for (const key in instance.propsOptions[0]) {
            if (!(key in props)) {
                props[key] = undefined;
            }
        }
        if (isStateful) {
            // stateful
            instance.props = isSSR ? props : shallowReactive(props);
        }
        else {
            if (!instance.type.props) {
                // functional w/ optional props, props === attrs
                instance.props = attrs;
            }
            else {
                // functional w/ declared props
                instance.props = props;
            }
        }
        instance.attrs = attrs;
    }
    function updateProps(instance, rawProps, rawPrevProps, optimized) {
        const { props, attrs, vnode: { patchFlag } } = instance;
        const rawCurrentProps = toRaw(props);
        const [options] = instance.propsOptions;
        let hasAttrsChanged = false;
        if (
        // always force full diff in dev
        // - #1942 if hmr is enabled with sfc component
        // - vite#872 non-sfc component used by sfc component
        (optimized || patchFlag > 0) &&
            !(patchFlag & 16 /* FULL_PROPS */)) {
            if (patchFlag & 8 /* PROPS */) {
                // Compiler-generated props & no keys change, just set the updated
                // the props.
                const propsToUpdate = instance.vnode.dynamicProps;
                for (let i = 0; i < propsToUpdate.length; i++) {
                    let key = propsToUpdate[i];
                    // PROPS flag guarantees rawProps to be non-null
                    const value = rawProps[key];
                    if (options) {
                        // attr / props separation was done on init and will be consistent
                        // in this code path, so just check if attrs have it.
                        if (hasOwn$1(attrs, key)) {
                            if (value !== attrs[key]) {
                                attrs[key] = value;
                                hasAttrsChanged = true;
                            }
                        }
                        else {
                            const camelizedKey = camelize(key);
                            props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false /* isAbsent */);
                        }
                    }
                    else {
                        if (value !== attrs[key]) {
                            attrs[key] = value;
                            hasAttrsChanged = true;
                        }
                    }
                }
            }
        }
        else {
            // full props update.
            if (setFullProps(instance, rawProps, props, attrs)) {
                hasAttrsChanged = true;
            }
            // in case of dynamic props, check if we need to delete keys from
            // the props object
            let kebabKey;
            for (const key in rawCurrentProps) {
                if (!rawProps ||
                    // for camelCase
                    (!hasOwn$1(rawProps, key) &&
                        // it's possible the original props was passed in as kebab-case
                        // and converted to camelCase (#955)
                        ((kebabKey = hyphenate(key)) === key || !hasOwn$1(rawProps, kebabKey)))) {
                    if (options) {
                        if (rawPrevProps &&
                            // for camelCase
                            (rawPrevProps[key] !== undefined ||
                                // for kebab-case
                                rawPrevProps[kebabKey] !== undefined)) {
                            props[key] = resolvePropValue(options, rawCurrentProps, key, undefined, instance, true /* isAbsent */);
                        }
                    }
                    else {
                        delete props[key];
                    }
                }
            }
            // in the case of functional component w/o props declaration, props and
            // attrs point to the same object so it should already have been updated.
            if (attrs !== rawCurrentProps) {
                for (const key in attrs) {
                    if (!rawProps ||
                        (!hasOwn$1(rawProps, key) &&
                            (!false ))) {
                        delete attrs[key];
                        hasAttrsChanged = true;
                    }
                }
            }
        }
        // trigger updates for $attrs in case it's used in component slots
        if (hasAttrsChanged) {
            trigger$1(instance, "set" /* SET */, '$attrs');
        }
    }
    function setFullProps(instance, rawProps, props, attrs) {
        const [options, needCastKeys] = instance.propsOptions;
        let hasAttrsChanged = false;
        let rawCastValues;
        if (rawProps) {
            for (let key in rawProps) {
                // key, ref are reserved and never passed down
                if (isReservedProp(key)) {
                    continue;
                }
                const value = rawProps[key];
                // prop option names are camelized during normalization, so to support
                // kebab -> camel conversion here we need to camelize the key.
                let camelKey;
                if (options && hasOwn$1(options, (camelKey = camelize(key)))) {
                    if (!needCastKeys || !needCastKeys.includes(camelKey)) {
                        props[camelKey] = value;
                    }
                    else {
                        (rawCastValues || (rawCastValues = {}))[camelKey] = value;
                    }
                }
                else if (!isEmitListener(instance.emitsOptions, key)) {
                    if (!(key in attrs) || value !== attrs[key]) {
                        attrs[key] = value;
                        hasAttrsChanged = true;
                    }
                }
            }
        }
        if (needCastKeys) {
            const rawCurrentProps = toRaw(props);
            const castValues = rawCastValues || EMPTY_OBJ;
            for (let i = 0; i < needCastKeys.length; i++) {
                const key = needCastKeys[i];
                props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn$1(castValues, key));
            }
        }
        return hasAttrsChanged;
    }
    function resolvePropValue(options, props, key, value, instance, isAbsent) {
        const opt = options[key];
        if (opt != null) {
            const hasDefault = hasOwn$1(opt, 'default');
            // default values
            if (hasDefault && value === undefined) {
                const defaultValue = opt.default;
                if (opt.type !== Function && isFunction(defaultValue)) {
                    const { propsDefaults } = instance;
                    if (key in propsDefaults) {
                        value = propsDefaults[key];
                    }
                    else {
                        setCurrentInstance(instance);
                        value = propsDefaults[key] = defaultValue.call(null, props);
                        unsetCurrentInstance();
                    }
                }
                else {
                    value = defaultValue;
                }
            }
            // boolean casting
            if (opt[0 /* shouldCast */]) {
                if (isAbsent && !hasDefault) {
                    value = false;
                }
                else if (opt[1 /* shouldCastTrue */] &&
                    (value === '' || value === hyphenate(key))) {
                    value = true;
                }
            }
        }
        return value;
    }
    function normalizePropsOptions(comp, appContext, asMixin = false) {
        const cache = appContext.propsCache;
        const cached = cache.get(comp);
        if (cached) {
            return cached;
        }
        const raw = comp.props;
        const normalized = {};
        const needCastKeys = [];
        // apply mixin/extends props
        let hasExtends = false;
        if (__VUE_OPTIONS_API__ && !isFunction(comp)) {
            const extendProps = (raw) => {
                hasExtends = true;
                const [props, keys] = normalizePropsOptions(raw, appContext, true);
                extend$1(normalized, props);
                if (keys)
                    needCastKeys.push(...keys);
            };
            if (!asMixin && appContext.mixins.length) {
                appContext.mixins.forEach(extendProps);
            }
            if (comp.extends) {
                extendProps(comp.extends);
            }
            if (comp.mixins) {
                comp.mixins.forEach(extendProps);
            }
        }
        if (!raw && !hasExtends) {
            cache.set(comp, EMPTY_ARR);
            return EMPTY_ARR;
        }
        if (isArray$1(raw)) {
            for (let i = 0; i < raw.length; i++) {
                const normalizedKey = camelize(raw[i]);
                if (validatePropName(normalizedKey)) {
                    normalized[normalizedKey] = EMPTY_OBJ;
                }
            }
        }
        else if (raw) {
            for (const key in raw) {
                const normalizedKey = camelize(key);
                if (validatePropName(normalizedKey)) {
                    const opt = raw[key];
                    const prop = (normalized[normalizedKey] =
                        isArray$1(opt) || isFunction(opt) ? { type: opt } : opt);
                    if (prop) {
                        const booleanIndex = getTypeIndex(Boolean, prop.type);
                        const stringIndex = getTypeIndex(String, prop.type);
                        prop[0 /* shouldCast */] = booleanIndex > -1;
                        prop[1 /* shouldCastTrue */] =
                            stringIndex < 0 || booleanIndex < stringIndex;
                        // if the prop needs boolean casting or default value
                        if (booleanIndex > -1 || hasOwn$1(prop, 'default')) {
                            needCastKeys.push(normalizedKey);
                        }
                    }
                }
            }
        }
        const res = [normalized, needCastKeys];
        cache.set(comp, res);
        return res;
    }
    function validatePropName(key) {
        if (key[0] !== '$') {
            return true;
        }
        return false;
    }
    // use function string name to check type constructors
    // so that it works across vms / iframes.
    function getType(ctor) {
        const match = ctor && ctor.toString().match(/^\s*function (\w+)/);
        return match ? match[1] : ctor === null ? 'null' : '';
    }
    function isSameType(a, b) {
        return getType(a) === getType(b);
    }
    function getTypeIndex(type, expectedTypes) {
        if (isArray$1(expectedTypes)) {
            return expectedTypes.findIndex(t => isSameType(t, type));
        }
        else if (isFunction(expectedTypes)) {
            return isSameType(expectedTypes, type) ? 0 : -1;
        }
        return -1;
    }

    const isInternalKey = (key) => key[0] === '_' || key === '$stable';
    const normalizeSlotValue = (value) => isArray$1(value)
        ? value.map(normalizeVNode)
        : [normalizeVNode(value)];
    const normalizeSlot = (key, rawSlot, ctx) => {
        const normalized = withCtx((...args) => {
            return normalizeSlotValue(rawSlot(...args));
        }, ctx);
        normalized._c = false;
        return normalized;
    };
    const normalizeObjectSlots = (rawSlots, slots, instance) => {
        const ctx = rawSlots._ctx;
        for (const key in rawSlots) {
            if (isInternalKey(key))
                continue;
            const value = rawSlots[key];
            if (isFunction(value)) {
                slots[key] = normalizeSlot(key, value, ctx);
            }
            else if (value != null) {
                const normalized = normalizeSlotValue(value);
                slots[key] = () => normalized;
            }
        }
    };
    const normalizeVNodeSlots = (instance, children) => {
        const normalized = normalizeSlotValue(children);
        instance.slots.default = () => normalized;
    };
    const initSlots = (instance, children) => {
        if (instance.vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
            const type = children._;
            if (type) {
                // users can get the shallow readonly version of the slots object through `this.$slots`,
                // we should avoid the proxy object polluting the slots of the internal instance
                instance.slots = toRaw(children);
                // make compiler marker non-enumerable
                def(children, '_', type);
            }
            else {
                normalizeObjectSlots(children, (instance.slots = {}));
            }
        }
        else {
            instance.slots = {};
            if (children) {
                normalizeVNodeSlots(instance, children);
            }
        }
        def(instance.slots, InternalObjectKey, 1);
    };
    const updateSlots = (instance, children, optimized) => {
        const { vnode, slots } = instance;
        let needDeletionCheck = true;
        let deletionComparisonTarget = EMPTY_OBJ;
        if (vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
            const type = children._;
            if (type) {
                // compiled slots.
                if (optimized && type === 1 /* STABLE */) {
                    // compiled AND stable.
                    // no need to update, and skip stale slots removal.
                    needDeletionCheck = false;
                }
                else {
                    // compiled but dynamic (v-if/v-for on slots) - update slots, but skip
                    // normalization.
                    extend$1(slots, children);
                    // #2893
                    // when rendering the optimized slots by manually written render function,
                    // we need to delete the `slots._` flag if necessary to make subsequent updates reliable,
                    // i.e. let the `renderSlot` create the bailed Fragment
                    if (!optimized && type === 1 /* STABLE */) {
                        delete slots._;
                    }
                }
            }
            else {
                needDeletionCheck = !children.$stable;
                normalizeObjectSlots(children, slots);
            }
            deletionComparisonTarget = children;
        }
        else if (children) {
            // non slot object children (direct value) passed to a component
            normalizeVNodeSlots(instance, children);
            deletionComparisonTarget = { default: 1 };
        }
        // delete stale slots
        if (needDeletionCheck) {
            for (const key in slots) {
                if (!isInternalKey(key) && !(key in deletionComparisonTarget)) {
                    delete slots[key];
                }
            }
        }
    };
    function invokeDirectiveHook(vnode, prevVNode, instance, name) {
        const bindings = vnode.dirs;
        const oldBindings = prevVNode && prevVNode.dirs;
        for (let i = 0; i < bindings.length; i++) {
            const binding = bindings[i];
            if (oldBindings) {
                binding.oldValue = oldBindings[i].value;
            }
            let hook = binding.dir[name];
            if (hook) {
                // disable tracking inside all lifecycle hooks
                // since they can potentially be called inside effects.
                pauseTracking();
                callWithAsyncErrorHandling(hook, instance, 8 /* DIRECTIVE_HOOK */, [
                    vnode.el,
                    binding,
                    vnode,
                    prevVNode
                ]);
                resetTracking();
            }
        }
    }

    function createAppContext() {
        return {
            app: null,
            config: {
                isNativeTag: NO,
                performance: false,
                globalProperties: {},
                optionMergeStrategies: {},
                errorHandler: undefined,
                warnHandler: undefined,
                compilerOptions: {}
            },
            mixins: [],
            components: {},
            directives: {},
            provides: Object.create(null),
            optionsCache: new WeakMap(),
            propsCache: new WeakMap(),
            emitsCache: new WeakMap()
        };
    }
    let uid = 0;
    function createAppAPI(render, hydrate) {
        return function createApp(rootComponent, rootProps = null) {
            if (rootProps != null && !isObject(rootProps)) {
                rootProps = null;
            }
            const context = createAppContext();
            const installedPlugins = new Set();
            let isMounted = false;
            const app = (context.app = {
                _uid: uid++,
                _component: rootComponent,
                _props: rootProps,
                _container: null,
                _context: context,
                _instance: null,
                version,
                get config() {
                    return context.config;
                },
                set config(v) {
                },
                use(plugin, ...options) {
                    if (installedPlugins.has(plugin)) ;
                    else if (plugin && isFunction(plugin.install)) {
                        installedPlugins.add(plugin);
                        plugin.install(app, ...options);
                    }
                    else if (isFunction(plugin)) {
                        installedPlugins.add(plugin);
                        plugin(app, ...options);
                    }
                    else ;
                    return app;
                },
                mixin(mixin) {
                    if (__VUE_OPTIONS_API__) {
                        if (!context.mixins.includes(mixin)) {
                            context.mixins.push(mixin);
                        }
                    }
                    return app;
                },
                component(name, component) {
                    if (!component) {
                        return context.components[name];
                    }
                    context.components[name] = component;
                    return app;
                },
                directive(name, directive) {
                    if (!directive) {
                        return context.directives[name];
                    }
                    context.directives[name] = directive;
                    return app;
                },
                mount(rootContainer, isHydrate, isSVG) {
                    if (!isMounted) {
                        const vnode = createVNode(rootComponent, rootProps);
                        // store app context on the root VNode.
                        // this will be set on the root instance on initial mount.
                        vnode.appContext = context;
                        if (isHydrate && hydrate) {
                            hydrate(vnode, rootContainer);
                        }
                        else {
                            render(vnode, rootContainer, isSVG);
                        }
                        isMounted = true;
                        app._container = rootContainer;
                        rootContainer.__vue_app__ = app;
                        if (__VUE_PROD_DEVTOOLS__) {
                            app._instance = vnode.component;
                            devtoolsInitApp(app, version);
                        }
                        return getExposeProxy(vnode.component) || vnode.component.proxy;
                    }
                },
                unmount() {
                    if (isMounted) {
                        render(null, app._container);
                        if (__VUE_PROD_DEVTOOLS__) {
                            app._instance = null;
                            devtoolsUnmountApp(app);
                        }
                        delete app._container.__vue_app__;
                    }
                },
                provide(key, value) {
                    // TypeScript doesn't allow symbols as index type
                    // https://github.com/Microsoft/TypeScript/issues/24587
                    context.provides[key] = value;
                    return app;
                }
            });
            return app;
        };
    }

    /**
     * Function for handling a template ref
     */
    function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
        if (isArray$1(rawRef)) {
            rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray$1(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
            return;
        }
        if (isAsyncWrapper(vnode) && !isUnmount) {
            // when mounting async components, nothing needs to be done,
            // because the template ref is forwarded to inner component
            return;
        }
        const refValue = vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */
            ? getExposeProxy(vnode.component) || vnode.component.proxy
            : vnode.el;
        const value = isUnmount ? null : refValue;
        const { i: owner, r: ref } = rawRef;
        const oldRef = oldRawRef && oldRawRef.r;
        const refs = owner.refs === EMPTY_OBJ ? (owner.refs = {}) : owner.refs;
        const setupState = owner.setupState;
        // dynamic ref changed. unset old ref
        if (oldRef != null && oldRef !== ref) {
            if (isString(oldRef)) {
                refs[oldRef] = null;
                if (hasOwn$1(setupState, oldRef)) {
                    setupState[oldRef] = null;
                }
            }
            else if (isRef(oldRef)) {
                oldRef.value = null;
            }
        }
        if (isFunction(ref)) {
            callWithErrorHandling(ref, owner, 12 /* FUNCTION_REF */, [value, refs]);
        }
        else {
            const _isString = isString(ref);
            const _isRef = isRef(ref);
            if (_isString || _isRef) {
                const doSet = () => {
                    if (rawRef.f) {
                        const existing = _isString ? refs[ref] : ref.value;
                        if (isUnmount) {
                            isArray$1(existing) && remove(existing, refValue);
                        }
                        else {
                            if (!isArray$1(existing)) {
                                if (_isString) {
                                    refs[ref] = [refValue];
                                }
                                else {
                                    ref.value = [refValue];
                                    if (rawRef.k)
                                        refs[rawRef.k] = ref.value;
                                }
                            }
                            else if (!existing.includes(refValue)) {
                                existing.push(refValue);
                            }
                        }
                    }
                    else if (_isString) {
                        refs[ref] = value;
                        if (hasOwn$1(setupState, ref)) {
                            setupState[ref] = value;
                        }
                    }
                    else if (isRef(ref)) {
                        ref.value = value;
                        if (rawRef.k)
                            refs[rawRef.k] = value;
                    }
                    else ;
                };
                if (value) {
                    doSet.id = -1;
                    queuePostRenderEffect(doSet, parentSuspense);
                }
                else {
                    doSet();
                }
            }
        }
    }

    /**
     * This is only called in esm-bundler builds.
     * It is called when a renderer is created, in `baseCreateRenderer` so that
     * importing runtime-core is side-effects free.
     *
     * istanbul-ignore-next
     */
    function initFeatureFlags() {
        if (typeof __VUE_OPTIONS_API__ !== 'boolean') {
            getGlobalThis().__VUE_OPTIONS_API__ = true;
        }
        if (typeof __VUE_PROD_DEVTOOLS__ !== 'boolean') {
            getGlobalThis().__VUE_PROD_DEVTOOLS__ = false;
        }
    }

    const queuePostRenderEffect = queueEffectWithSuspense
        ;
    /**
     * The createRenderer function accepts two generic arguments:
     * HostNode and HostElement, corresponding to Node and Element types in the
     * host environment. For example, for runtime-dom, HostNode would be the DOM
     * `Node` interface and HostElement would be the DOM `Element` interface.
     *
     * Custom renderers can pass in the platform specific types like this:
     *
     * ``` js
     * const { render, createApp } = createRenderer<Node, Element>({
     *   patchProp,
     *   ...nodeOps
     * })
     * ```
     */
    function createRenderer(options) {
        return baseCreateRenderer(options);
    }
    // implementation
    function baseCreateRenderer(options, createHydrationFns) {
        // compile-time feature flags check
        {
            initFeatureFlags();
        }
        const target = getGlobalThis();
        target.__VUE__ = true;
        if (__VUE_PROD_DEVTOOLS__) {
            setDevtoolsHook(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
        }
        const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, cloneNode: hostCloneNode, insertStaticContent: hostInsertStaticContent } = options;
        // Note: functions inside this closure should use `const xxx = () => {}`
        // style in order to prevent being inlined by minifiers.
        const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
            if (n1 === n2) {
                return;
            }
            // patching & not same type, unmount old tree
            if (n1 && !isSameVNodeType(n1, n2)) {
                anchor = getNextHostNode(n1);
                unmount(n1, parentComponent, parentSuspense, true);
                n1 = null;
            }
            if (n2.patchFlag === -2 /* BAIL */) {
                optimized = false;
                n2.dynamicChildren = null;
            }
            const { type, ref, shapeFlag } = n2;
            switch (type) {
                case Text:
                    processText(n1, n2, container, anchor);
                    break;
                case Comment:
                    processCommentNode(n1, n2, container, anchor);
                    break;
                case Static:
                    if (n1 == null) {
                        mountStaticNode(n2, container, anchor, isSVG);
                    }
                    break;
                case Fragment:
                    processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    break;
                default:
                    if (shapeFlag & 1 /* ELEMENT */) {
                        processElement(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    }
                    else if (shapeFlag & 6 /* COMPONENT */) {
                        processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    }
                    else if (shapeFlag & 64 /* TELEPORT */) {
                        type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
                    }
                    else if (shapeFlag & 128 /* SUSPENSE */) {
                        type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
                    }
                    else ;
            }
            // set ref
            if (ref != null && parentComponent) {
                setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
            }
        };
        const processText = (n1, n2, container, anchor) => {
            if (n1 == null) {
                hostInsert((n2.el = hostCreateText(n2.children)), container, anchor);
            }
            else {
                const el = (n2.el = n1.el);
                if (n2.children !== n1.children) {
                    hostSetText(el, n2.children);
                }
            }
        };
        const processCommentNode = (n1, n2, container, anchor) => {
            if (n1 == null) {
                hostInsert((n2.el = hostCreateComment(n2.children || '')), container, anchor);
            }
            else {
                // there's no support for dynamic comments
                n2.el = n1.el;
            }
        };
        const mountStaticNode = (n2, container, anchor, isSVG) => {
            [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, isSVG, n2.el, n2.anchor);
        };
        const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
            let next;
            while (el && el !== anchor) {
                next = hostNextSibling(el);
                hostInsert(el, container, nextSibling);
                el = next;
            }
            hostInsert(anchor, container, nextSibling);
        };
        const removeStaticNode = ({ el, anchor }) => {
            let next;
            while (el && el !== anchor) {
                next = hostNextSibling(el);
                hostRemove(el);
                el = next;
            }
            hostRemove(anchor);
        };
        const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
            isSVG = isSVG || n2.type === 'svg';
            if (n1 == null) {
                mountElement(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
            else {
                patchElement(n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
        };
        const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
            let el;
            let vnodeHook;
            const { type, props, shapeFlag, transition, patchFlag, dirs } = vnode;
            if (vnode.el &&
                hostCloneNode !== undefined &&
                patchFlag === -1 /* HOISTED */) {
                // If a vnode has non-null el, it means it's being reused.
                // Only static vnodes can be reused, so its mounted DOM nodes should be
                // exactly the same, and we can simply do a clone here.
                // only do this in production since cloned trees cannot be HMR updated.
                el = vnode.el = hostCloneNode(vnode.el);
            }
            else {
                el = vnode.el = hostCreateElement(vnode.type, isSVG, props && props.is, props);
                // mount children first, since some props may rely on child content
                // being already rendered, e.g. `<select value>`
                if (shapeFlag & 8 /* TEXT_CHILDREN */) {
                    hostSetElementText(el, vnode.children);
                }
                else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
                    mountChildren(vnode.children, el, null, parentComponent, parentSuspense, isSVG && type !== 'foreignObject', slotScopeIds, optimized);
                }
                if (dirs) {
                    invokeDirectiveHook(vnode, null, parentComponent, 'created');
                }
                // props
                if (props) {
                    for (const key in props) {
                        if (key !== 'value' && !isReservedProp(key)) {
                            hostPatchProp(el, key, null, props[key], isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                        }
                    }
                    /**
                     * Special case for setting value on DOM elements:
                     * - it can be order-sensitive (e.g. should be set *after* min/max, #2325, #4024)
                     * - it needs to be forced (#1471)
                     * #2353 proposes adding another renderer option to configure this, but
                     * the properties affects are so finite it is worth special casing it
                     * here to reduce the complexity. (Special casing it also should not
                     * affect non-DOM renderers)
                     */
                    if ('value' in props) {
                        hostPatchProp(el, 'value', null, props.value);
                    }
                    if ((vnodeHook = props.onVnodeBeforeMount)) {
                        invokeVNodeHook(vnodeHook, parentComponent, vnode);
                    }
                }
                // scopeId
                setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
            }
            if (__VUE_PROD_DEVTOOLS__) {
                Object.defineProperty(el, '__vnode', {
                    value: vnode,
                    enumerable: false
                });
                Object.defineProperty(el, '__vueParentComponent', {
                    value: parentComponent,
                    enumerable: false
                });
            }
            if (dirs) {
                invokeDirectiveHook(vnode, null, parentComponent, 'beforeMount');
            }
            // #1583 For inside suspense + suspense not resolved case, enter hook should call when suspense resolved
            // #1689 For inside suspense + suspense resolved case, just call it
            const needCallTransitionHooks = (!parentSuspense || (parentSuspense && !parentSuspense.pendingBranch)) &&
                transition &&
                !transition.persisted;
            if (needCallTransitionHooks) {
                transition.beforeEnter(el);
            }
            hostInsert(el, container, anchor);
            if ((vnodeHook = props && props.onVnodeMounted) ||
                needCallTransitionHooks ||
                dirs) {
                queuePostRenderEffect(() => {
                    vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
                    needCallTransitionHooks && transition.enter(el);
                    dirs && invokeDirectiveHook(vnode, null, parentComponent, 'mounted');
                }, parentSuspense);
            }
        };
        const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
            if (scopeId) {
                hostSetScopeId(el, scopeId);
            }
            if (slotScopeIds) {
                for (let i = 0; i < slotScopeIds.length; i++) {
                    hostSetScopeId(el, slotScopeIds[i]);
                }
            }
            if (parentComponent) {
                let subTree = parentComponent.subTree;
                if (vnode === subTree) {
                    const parentVNode = parentComponent.vnode;
                    setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
                }
            }
        };
        const mountChildren = (children, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, start = 0) => {
            for (let i = start; i < children.length; i++) {
                const child = (children[i] = optimized
                    ? cloneIfMounted(children[i])
                    : normalizeVNode(children[i]));
                patch(null, child, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
        };
        const patchElement = (n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
            const el = (n2.el = n1.el);
            let { patchFlag, dynamicChildren, dirs } = n2;
            // #1426 take the old vnode's patch flag into account since user may clone a
            // compiler-generated vnode, which de-opts to FULL_PROPS
            patchFlag |= n1.patchFlag & 16 /* FULL_PROPS */;
            const oldProps = n1.props || EMPTY_OBJ;
            const newProps = n2.props || EMPTY_OBJ;
            let vnodeHook;
            // disable recurse in beforeUpdate hooks
            parentComponent && toggleRecurse(parentComponent, false);
            if ((vnodeHook = newProps.onVnodeBeforeUpdate)) {
                invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
            }
            if (dirs) {
                invokeDirectiveHook(n2, n1, parentComponent, 'beforeUpdate');
            }
            parentComponent && toggleRecurse(parentComponent, true);
            const areChildrenSVG = isSVG && n2.type !== 'foreignObject';
            if (dynamicChildren) {
                patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds);
            }
            else if (!optimized) {
                // full diff
                patchChildren(n1, n2, el, null, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds, false);
            }
            if (patchFlag > 0) {
                // the presence of a patchFlag means this element's render code was
                // generated by the compiler and can take the fast path.
                // in this path old node and new node are guaranteed to have the same shape
                // (i.e. at the exact same position in the source template)
                if (patchFlag & 16 /* FULL_PROPS */) {
                    // element props contain dynamic keys, full diff needed
                    patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
                }
                else {
                    // class
                    // this flag is matched when the element has dynamic class bindings.
                    if (patchFlag & 2 /* CLASS */) {
                        if (oldProps.class !== newProps.class) {
                            hostPatchProp(el, 'class', null, newProps.class, isSVG);
                        }
                    }
                    // style
                    // this flag is matched when the element has dynamic style bindings
                    if (patchFlag & 4 /* STYLE */) {
                        hostPatchProp(el, 'style', oldProps.style, newProps.style, isSVG);
                    }
                    // props
                    // This flag is matched when the element has dynamic prop/attr bindings
                    // other than class and style. The keys of dynamic prop/attrs are saved for
                    // faster iteration.
                    // Note dynamic keys like :[foo]="bar" will cause this optimization to
                    // bail out and go through a full diff because we need to unset the old key
                    if (patchFlag & 8 /* PROPS */) {
                        // if the flag is present then dynamicProps must be non-null
                        const propsToUpdate = n2.dynamicProps;
                        for (let i = 0; i < propsToUpdate.length; i++) {
                            const key = propsToUpdate[i];
                            const prev = oldProps[key];
                            const next = newProps[key];
                            // #1471 force patch value
                            if (next !== prev || key === 'value') {
                                hostPatchProp(el, key, prev, next, isSVG, n1.children, parentComponent, parentSuspense, unmountChildren);
                            }
                        }
                    }
                }
                // text
                // This flag is matched when the element has only dynamic text children.
                if (patchFlag & 1 /* TEXT */) {
                    if (n1.children !== n2.children) {
                        hostSetElementText(el, n2.children);
                    }
                }
            }
            else if (!optimized && dynamicChildren == null) {
                // unoptimized, full diff
                patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
            }
            if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
                queuePostRenderEffect(() => {
                    vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
                    dirs && invokeDirectiveHook(n2, n1, parentComponent, 'updated');
                }, parentSuspense);
            }
        };
        // The fast path for blocks.
        const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, isSVG, slotScopeIds) => {
            for (let i = 0; i < newChildren.length; i++) {
                const oldVNode = oldChildren[i];
                const newVNode = newChildren[i];
                // Determine the container (parent element) for the patch.
                const container = 
                // oldVNode may be an errored async setup() component inside Suspense
                // which will not have a mounted element
                oldVNode.el &&
                    // - In the case of a Fragment, we need to provide the actual parent
                    // of the Fragment itself so it can move its children.
                    (oldVNode.type === Fragment ||
                        // - In the case of different nodes, there is going to be a replacement
                        // which also requires the correct parent container
                        !isSameVNodeType(oldVNode, newVNode) ||
                        // - In the case of a component, it could contain anything.
                        oldVNode.shapeFlag & (6 /* COMPONENT */ | 64 /* TELEPORT */))
                    ? hostParentNode(oldVNode.el)
                    : // In other cases, the parent container is not actually used so we
                        // just pass the block element here to avoid a DOM parentNode call.
                        fallbackContainer;
                patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, true);
            }
        };
        const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, isSVG) => {
            if (oldProps !== newProps) {
                for (const key in newProps) {
                    // empty string is not valid prop
                    if (isReservedProp(key))
                        continue;
                    const next = newProps[key];
                    const prev = oldProps[key];
                    // defer patching value
                    if (next !== prev && key !== 'value') {
                        hostPatchProp(el, key, prev, next, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                    }
                }
                if (oldProps !== EMPTY_OBJ) {
                    for (const key in oldProps) {
                        if (!isReservedProp(key) && !(key in newProps)) {
                            hostPatchProp(el, key, oldProps[key], null, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                        }
                    }
                }
                if ('value' in newProps) {
                    hostPatchProp(el, 'value', oldProps.value, newProps.value);
                }
            }
        };
        const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
            const fragmentStartAnchor = (n2.el = n1 ? n1.el : hostCreateText(''));
            const fragmentEndAnchor = (n2.anchor = n1 ? n1.anchor : hostCreateText(''));
            let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
            // check if this is a slot fragment with :slotted scope ids
            if (fragmentSlotScopeIds) {
                slotScopeIds = slotScopeIds
                    ? slotScopeIds.concat(fragmentSlotScopeIds)
                    : fragmentSlotScopeIds;
            }
            if (n1 == null) {
                hostInsert(fragmentStartAnchor, container, anchor);
                hostInsert(fragmentEndAnchor, container, anchor);
                // a fragment can only have array children
                // since they are either generated by the compiler, or implicitly created
                // from arrays.
                mountChildren(n2.children, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
            else {
                if (patchFlag > 0 &&
                    patchFlag & 64 /* STABLE_FRAGMENT */ &&
                    dynamicChildren &&
                    // #2715 the previous fragment could've been a BAILed one as a result
                    // of renderSlot() with no valid children
                    n1.dynamicChildren) {
                    // a stable fragment (template root or <template v-for>) doesn't need to
                    // patch children order, but it may contain dynamicChildren.
                    patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, isSVG, slotScopeIds);
                    if (
                    // #2080 if the stable fragment has a key, it's a <template v-for> that may
                    //  get moved around. Make sure all root level vnodes inherit el.
                    // #2134 or if it's a component root, it may also get moved around
                    // as the component is being moved.
                    n2.key != null ||
                        (parentComponent && n2 === parentComponent.subTree)) {
                        traverseStaticChildren(n1, n2, true /* shallow */);
                    }
                }
                else {
                    // keyed / unkeyed, or manual fragments.
                    // for keyed & unkeyed, since they are compiler generated from v-for,
                    // each child is guaranteed to be a block so the fragment will never
                    // have dynamicChildren.
                    patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
            }
        };
        const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
            n2.slotScopeIds = slotScopeIds;
            if (n1 == null) {
                if (n2.shapeFlag & 512 /* COMPONENT_KEPT_ALIVE */) {
                    parentComponent.ctx.activate(n2, container, anchor, isSVG, optimized);
                }
                else {
                    mountComponent(n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
                }
            }
            else {
                updateComponent(n1, n2, optimized);
            }
        };
        const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
            const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense));
            // inject renderer internals for keepAlive
            if (isKeepAlive(initialVNode)) {
                instance.ctx.renderer = internals;
            }
            // resolve props and slots for setup context
            {
                setupComponent(instance);
            }
            // setup() is async. This component relies on async logic to be resolved
            // before proceeding
            if (instance.asyncDep) {
                parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect);
                // Give it a placeholder if this is not hydration
                // TODO handle self-defined fallback
                if (!initialVNode.el) {
                    const placeholder = (instance.subTree = createVNode(Comment));
                    processCommentNode(null, placeholder, container, anchor);
                }
                return;
            }
            setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized);
        };
        const updateComponent = (n1, n2, optimized) => {
            const instance = (n2.component = n1.component);
            if (shouldUpdateComponent(n1, n2, optimized)) {
                if (instance.asyncDep &&
                    !instance.asyncResolved) {
                    updateComponentPreRender(instance, n2, optimized);
                    return;
                }
                else {
                    // normal update
                    instance.next = n2;
                    // in case the child component is also queued, remove it to avoid
                    // double updating the same child component in the same flush.
                    invalidateJob(instance.update);
                    // instance.update is the reactive effect.
                    instance.update();
                }
            }
            else {
                // no update needed. just copy over properties
                n2.component = n1.component;
                n2.el = n1.el;
                instance.vnode = n2;
            }
        };
        const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized) => {
            const componentUpdateFn = () => {
                if (!instance.isMounted) {
                    let vnodeHook;
                    const { el, props } = initialVNode;
                    const { bm, m, parent } = instance;
                    const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
                    toggleRecurse(instance, false);
                    // beforeMount hook
                    if (bm) {
                        invokeArrayFns(bm);
                    }
                    // onVnodeBeforeMount
                    if (!isAsyncWrapperVNode &&
                        (vnodeHook = props && props.onVnodeBeforeMount)) {
                        invokeVNodeHook(vnodeHook, parent, initialVNode);
                    }
                    toggleRecurse(instance, true);
                    if (el && hydrateNode) {
                        // vnode has adopted host node - perform hydration instead of mount.
                        const hydrateSubTree = () => {
                            instance.subTree = renderComponentRoot(instance);
                            hydrateNode(el, instance.subTree, instance, parentSuspense, null);
                        };
                        if (isAsyncWrapperVNode) {
                            initialVNode.type.__asyncLoader().then(
                            // note: we are moving the render call into an async callback,
                            // which means it won't track dependencies - but it's ok because
                            // a server-rendered async wrapper is already in resolved state
                            // and it will never need to change.
                            () => !instance.isUnmounted && hydrateSubTree());
                        }
                        else {
                            hydrateSubTree();
                        }
                    }
                    else {
                        const subTree = (instance.subTree = renderComponentRoot(instance));
                        patch(null, subTree, container, anchor, instance, parentSuspense, isSVG);
                        initialVNode.el = subTree.el;
                    }
                    // mounted hook
                    if (m) {
                        queuePostRenderEffect(m, parentSuspense);
                    }
                    // onVnodeMounted
                    if (!isAsyncWrapperVNode &&
                        (vnodeHook = props && props.onVnodeMounted)) {
                        const scopedInitialVNode = initialVNode;
                        queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
                    }
                    // activated hook for keep-alive roots.
                    // #1742 activated hook must be accessed after first render
                    // since the hook may be injected by a child keep-alive
                    if (initialVNode.shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
                        instance.a && queuePostRenderEffect(instance.a, parentSuspense);
                    }
                    instance.isMounted = true;
                    if (__VUE_PROD_DEVTOOLS__) {
                        devtoolsComponentAdded(instance);
                    }
                    // #2458: deference mount-only object parameters to prevent memleaks
                    initialVNode = container = anchor = null;
                }
                else {
                    // updateComponent
                    // This is triggered by mutation of component's own state (next: null)
                    // OR parent calling processComponent (next: VNode)
                    let { next, bu, u, parent, vnode } = instance;
                    let originNext = next;
                    let vnodeHook;
                    // Disallow component effect recursion during pre-lifecycle hooks.
                    toggleRecurse(instance, false);
                    if (next) {
                        next.el = vnode.el;
                        updateComponentPreRender(instance, next, optimized);
                    }
                    else {
                        next = vnode;
                    }
                    // beforeUpdate hook
                    if (bu) {
                        invokeArrayFns(bu);
                    }
                    // onVnodeBeforeUpdate
                    if ((vnodeHook = next.props && next.props.onVnodeBeforeUpdate)) {
                        invokeVNodeHook(vnodeHook, parent, next, vnode);
                    }
                    toggleRecurse(instance, true);
                    const nextTree = renderComponentRoot(instance);
                    const prevTree = instance.subTree;
                    instance.subTree = nextTree;
                    patch(prevTree, nextTree, 
                    // parent may have changed if it's in a teleport
                    hostParentNode(prevTree.el), 
                    // anchor may have changed if it's in a fragment
                    getNextHostNode(prevTree), instance, parentSuspense, isSVG);
                    next.el = nextTree.el;
                    if (originNext === null) {
                        // self-triggered update. In case of HOC, update parent component
                        // vnode el. HOC is indicated by parent instance's subTree pointing
                        // to child component's vnode
                        updateHOCHostEl(instance, nextTree.el);
                    }
                    // updated hook
                    if (u) {
                        queuePostRenderEffect(u, parentSuspense);
                    }
                    // onVnodeUpdated
                    if ((vnodeHook = next.props && next.props.onVnodeUpdated)) {
                        queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
                    }
                    if (__VUE_PROD_DEVTOOLS__) {
                        devtoolsComponentUpdated(instance);
                    }
                }
            };
            // create reactive effect for rendering
            const effect = (instance.effect = new ReactiveEffect(componentUpdateFn, () => queueJob(instance.update), instance.scope // track it in component's effect scope
            ));
            const update = (instance.update = effect.run.bind(effect));
            update.id = instance.uid;
            // allowRecurse
            // #1801, #2043 component render effects should allow recursive updates
            toggleRecurse(instance, true);
            update();
        };
        const updateComponentPreRender = (instance, nextVNode, optimized) => {
            nextVNode.component = instance;
            const prevProps = instance.vnode.props;
            instance.vnode = nextVNode;
            instance.next = null;
            updateProps(instance, nextVNode.props, prevProps, optimized);
            updateSlots(instance, nextVNode.children, optimized);
            pauseTracking();
            // props update may have triggered pre-flush watchers.
            // flush them before the render update.
            flushPreFlushCbs(undefined, instance.update);
            resetTracking();
        };
        const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized = false) => {
            const c1 = n1 && n1.children;
            const prevShapeFlag = n1 ? n1.shapeFlag : 0;
            const c2 = n2.children;
            const { patchFlag, shapeFlag } = n2;
            // fast path
            if (patchFlag > 0) {
                if (patchFlag & 128 /* KEYED_FRAGMENT */) {
                    // this could be either fully-keyed or mixed (some keyed some not)
                    // presence of patchFlag means children are guaranteed to be arrays
                    patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    return;
                }
                else if (patchFlag & 256 /* UNKEYED_FRAGMENT */) {
                    // unkeyed
                    patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    return;
                }
            }
            // children has 3 possibilities: text, array or no children.
            if (shapeFlag & 8 /* TEXT_CHILDREN */) {
                // text children fast path
                if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
                    unmountChildren(c1, parentComponent, parentSuspense);
                }
                if (c2 !== c1) {
                    hostSetElementText(container, c2);
                }
            }
            else {
                if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
                    // prev children was array
                    if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
                        // two arrays, cannot assume anything, do full diff
                        patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    }
                    else {
                        // no new children, just unmount old
                        unmountChildren(c1, parentComponent, parentSuspense, true);
                    }
                }
                else {
                    // prev children was text OR null
                    // new children is array OR null
                    if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
                        hostSetElementText(container, '');
                    }
                    // mount new if array
                    if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
                        mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    }
                }
            }
        };
        const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
            c1 = c1 || EMPTY_ARR;
            c2 = c2 || EMPTY_ARR;
            const oldLength = c1.length;
            const newLength = c2.length;
            const commonLength = Math.min(oldLength, newLength);
            let i;
            for (i = 0; i < commonLength; i++) {
                const nextChild = (c2[i] = optimized
                    ? cloneIfMounted(c2[i])
                    : normalizeVNode(c2[i]));
                patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
            if (oldLength > newLength) {
                // remove old
                unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
            }
            else {
                // mount new
                mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, commonLength);
            }
        };
        // can be all-keyed or mixed
        const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
            let i = 0;
            const l2 = c2.length;
            let e1 = c1.length - 1; // prev ending index
            let e2 = l2 - 1; // next ending index
            // 1. sync from start
            // (a b) c
            // (a b) d e
            while (i <= e1 && i <= e2) {
                const n1 = c1[i];
                const n2 = (c2[i] = optimized
                    ? cloneIfMounted(c2[i])
                    : normalizeVNode(c2[i]));
                if (isSameVNodeType(n1, n2)) {
                    patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else {
                    break;
                }
                i++;
            }
            // 2. sync from end
            // a (b c)
            // d e (b c)
            while (i <= e1 && i <= e2) {
                const n1 = c1[e1];
                const n2 = (c2[e2] = optimized
                    ? cloneIfMounted(c2[e2])
                    : normalizeVNode(c2[e2]));
                if (isSameVNodeType(n1, n2)) {
                    patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else {
                    break;
                }
                e1--;
                e2--;
            }
            // 3. common sequence + mount
            // (a b)
            // (a b) c
            // i = 2, e1 = 1, e2 = 2
            // (a b)
            // c (a b)
            // i = 0, e1 = -1, e2 = 0
            if (i > e1) {
                if (i <= e2) {
                    const nextPos = e2 + 1;
                    const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
                    while (i <= e2) {
                        patch(null, (c2[i] = optimized
                            ? cloneIfMounted(c2[i])
                            : normalizeVNode(c2[i])), container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                        i++;
                    }
                }
            }
            // 4. common sequence + unmount
            // (a b) c
            // (a b)
            // i = 2, e1 = 2, e2 = 1
            // a (b c)
            // (b c)
            // i = 0, e1 = 0, e2 = -1
            else if (i > e2) {
                while (i <= e1) {
                    unmount(c1[i], parentComponent, parentSuspense, true);
                    i++;
                }
            }
            // 5. unknown sequence
            // [i ... e1 + 1]: a b [c d e] f g
            // [i ... e2 + 1]: a b [e d c h] f g
            // i = 2, e1 = 4, e2 = 5
            else {
                const s1 = i; // prev starting index
                const s2 = i; // next starting index
                // 5.1 build key:index map for newChildren
                const keyToNewIndexMap = new Map();
                for (i = s2; i <= e2; i++) {
                    const nextChild = (c2[i] = optimized
                        ? cloneIfMounted(c2[i])
                        : normalizeVNode(c2[i]));
                    if (nextChild.key != null) {
                        keyToNewIndexMap.set(nextChild.key, i);
                    }
                }
                // 5.2 loop through old children left to be patched and try to patch
                // matching nodes & remove nodes that are no longer present
                let j;
                let patched = 0;
                const toBePatched = e2 - s2 + 1;
                let moved = false;
                // used to track whether any node has moved
                let maxNewIndexSoFar = 0;
                // works as Map<newIndex, oldIndex>
                // Note that oldIndex is offset by +1
                // and oldIndex = 0 is a special value indicating the new node has
                // no corresponding old node.
                // used for determining longest stable subsequence
                const newIndexToOldIndexMap = new Array(toBePatched);
                for (i = 0; i < toBePatched; i++)
                    newIndexToOldIndexMap[i] = 0;
                for (i = s1; i <= e1; i++) {
                    const prevChild = c1[i];
                    if (patched >= toBePatched) {
                        // all new children have been patched so this can only be a removal
                        unmount(prevChild, parentComponent, parentSuspense, true);
                        continue;
                    }
                    let newIndex;
                    if (prevChild.key != null) {
                        newIndex = keyToNewIndexMap.get(prevChild.key);
                    }
                    else {
                        // key-less node, try to locate a key-less node of the same type
                        for (j = s2; j <= e2; j++) {
                            if (newIndexToOldIndexMap[j - s2] === 0 &&
                                isSameVNodeType(prevChild, c2[j])) {
                                newIndex = j;
                                break;
                            }
                        }
                    }
                    if (newIndex === undefined) {
                        unmount(prevChild, parentComponent, parentSuspense, true);
                    }
                    else {
                        newIndexToOldIndexMap[newIndex - s2] = i + 1;
                        if (newIndex >= maxNewIndexSoFar) {
                            maxNewIndexSoFar = newIndex;
                        }
                        else {
                            moved = true;
                        }
                        patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                        patched++;
                    }
                }
                // 5.3 move and mount
                // generate longest stable subsequence only when nodes have moved
                const increasingNewIndexSequence = moved
                    ? getSequence(newIndexToOldIndexMap)
                    : EMPTY_ARR;
                j = increasingNewIndexSequence.length - 1;
                // looping backwards so that we can use last patched node as anchor
                for (i = toBePatched - 1; i >= 0; i--) {
                    const nextIndex = s2 + i;
                    const nextChild = c2[nextIndex];
                    const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
                    if (newIndexToOldIndexMap[i] === 0) {
                        // mount new
                        patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    }
                    else if (moved) {
                        // move if:
                        // There is no stable subsequence (e.g. a reverse)
                        // OR current node is not among the stable sequence
                        if (j < 0 || i !== increasingNewIndexSequence[j]) {
                            move(nextChild, container, anchor, 2 /* REORDER */);
                        }
                        else {
                            j--;
                        }
                    }
                }
            }
        };
        const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
            const { el, type, transition, children, shapeFlag } = vnode;
            if (shapeFlag & 6 /* COMPONENT */) {
                move(vnode.component.subTree, container, anchor, moveType);
                return;
            }
            if (shapeFlag & 128 /* SUSPENSE */) {
                vnode.suspense.move(container, anchor, moveType);
                return;
            }
            if (shapeFlag & 64 /* TELEPORT */) {
                type.move(vnode, container, anchor, internals);
                return;
            }
            if (type === Fragment) {
                hostInsert(el, container, anchor);
                for (let i = 0; i < children.length; i++) {
                    move(children[i], container, anchor, moveType);
                }
                hostInsert(vnode.anchor, container, anchor);
                return;
            }
            if (type === Static) {
                moveStaticNode(vnode, container, anchor);
                return;
            }
            // single nodes
            const needTransition = moveType !== 2 /* REORDER */ &&
                shapeFlag & 1 /* ELEMENT */ &&
                transition;
            if (needTransition) {
                if (moveType === 0 /* ENTER */) {
                    transition.beforeEnter(el);
                    hostInsert(el, container, anchor);
                    queuePostRenderEffect(() => transition.enter(el), parentSuspense);
                }
                else {
                    const { leave, delayLeave, afterLeave } = transition;
                    const remove = () => hostInsert(el, container, anchor);
                    const performLeave = () => {
                        leave(el, () => {
                            remove();
                            afterLeave && afterLeave();
                        });
                    };
                    if (delayLeave) {
                        delayLeave(el, remove, performLeave);
                    }
                    else {
                        performLeave();
                    }
                }
            }
            else {
                hostInsert(el, container, anchor);
            }
        };
        const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
            const { type, props, ref, children, dynamicChildren, shapeFlag, patchFlag, dirs } = vnode;
            // unset ref
            if (ref != null) {
                setRef(ref, null, parentSuspense, vnode, true);
            }
            if (shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
                parentComponent.ctx.deactivate(vnode);
                return;
            }
            const shouldInvokeDirs = shapeFlag & 1 /* ELEMENT */ && dirs;
            const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
            let vnodeHook;
            if (shouldInvokeVnodeHook &&
                (vnodeHook = props && props.onVnodeBeforeUnmount)) {
                invokeVNodeHook(vnodeHook, parentComponent, vnode);
            }
            if (shapeFlag & 6 /* COMPONENT */) {
                unmountComponent(vnode.component, parentSuspense, doRemove);
            }
            else {
                if (shapeFlag & 128 /* SUSPENSE */) {
                    vnode.suspense.unmount(parentSuspense, doRemove);
                    return;
                }
                if (shouldInvokeDirs) {
                    invokeDirectiveHook(vnode, null, parentComponent, 'beforeUnmount');
                }
                if (shapeFlag & 64 /* TELEPORT */) {
                    vnode.type.remove(vnode, parentComponent, parentSuspense, optimized, internals, doRemove);
                }
                else if (dynamicChildren &&
                    // #1153: fast path should not be taken for non-stable (v-for) fragments
                    (type !== Fragment ||
                        (patchFlag > 0 && patchFlag & 64 /* STABLE_FRAGMENT */))) {
                    // fast path for block nodes: only need to unmount dynamic children.
                    unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
                }
                else if ((type === Fragment &&
                    patchFlag &
                        (128 /* KEYED_FRAGMENT */ | 256 /* UNKEYED_FRAGMENT */)) ||
                    (!optimized && shapeFlag & 16 /* ARRAY_CHILDREN */)) {
                    unmountChildren(children, parentComponent, parentSuspense);
                }
                if (doRemove) {
                    remove(vnode);
                }
            }
            if ((shouldInvokeVnodeHook &&
                (vnodeHook = props && props.onVnodeUnmounted)) ||
                shouldInvokeDirs) {
                queuePostRenderEffect(() => {
                    vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
                    shouldInvokeDirs &&
                        invokeDirectiveHook(vnode, null, parentComponent, 'unmounted');
                }, parentSuspense);
            }
        };
        const remove = vnode => {
            const { type, el, anchor, transition } = vnode;
            if (type === Fragment) {
                removeFragment(el, anchor);
                return;
            }
            if (type === Static) {
                removeStaticNode(vnode);
                return;
            }
            const performRemove = () => {
                hostRemove(el);
                if (transition && !transition.persisted && transition.afterLeave) {
                    transition.afterLeave();
                }
            };
            if (vnode.shapeFlag & 1 /* ELEMENT */ &&
                transition &&
                !transition.persisted) {
                const { leave, delayLeave } = transition;
                const performLeave = () => leave(el, performRemove);
                if (delayLeave) {
                    delayLeave(vnode.el, performRemove, performLeave);
                }
                else {
                    performLeave();
                }
            }
            else {
                performRemove();
            }
        };
        const removeFragment = (cur, end) => {
            // For fragments, directly remove all contained DOM nodes.
            // (fragment child nodes cannot have transition)
            let next;
            while (cur !== end) {
                next = hostNextSibling(cur);
                hostRemove(cur);
                cur = next;
            }
            hostRemove(end);
        };
        const unmountComponent = (instance, parentSuspense, doRemove) => {
            const { bum, scope, update, subTree, um } = instance;
            // beforeUnmount hook
            if (bum) {
                invokeArrayFns(bum);
            }
            // stop effects in component scope
            scope.stop();
            // update may be null if a component is unmounted before its async
            // setup has resolved.
            if (update) {
                // so that scheduler will no longer invoke it
                update.active = false;
                unmount(subTree, instance, parentSuspense, doRemove);
            }
            // unmounted hook
            if (um) {
                queuePostRenderEffect(um, parentSuspense);
            }
            queuePostRenderEffect(() => {
                instance.isUnmounted = true;
            }, parentSuspense);
            // A component with async dep inside a pending suspense is unmounted before
            // its async dep resolves. This should remove the dep from the suspense, and
            // cause the suspense to resolve immediately if that was the last dep.
            if (parentSuspense &&
                parentSuspense.pendingBranch &&
                !parentSuspense.isUnmounted &&
                instance.asyncDep &&
                !instance.asyncResolved &&
                instance.suspenseId === parentSuspense.pendingId) {
                parentSuspense.deps--;
                if (parentSuspense.deps === 0) {
                    parentSuspense.resolve();
                }
            }
            if (__VUE_PROD_DEVTOOLS__) {
                devtoolsComponentRemoved(instance);
            }
        };
        const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
            for (let i = start; i < children.length; i++) {
                unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
            }
        };
        const getNextHostNode = vnode => {
            if (vnode.shapeFlag & 6 /* COMPONENT */) {
                return getNextHostNode(vnode.component.subTree);
            }
            if (vnode.shapeFlag & 128 /* SUSPENSE */) {
                return vnode.suspense.next();
            }
            return hostNextSibling((vnode.anchor || vnode.el));
        };
        const render = (vnode, container, isSVG) => {
            if (vnode == null) {
                if (container._vnode) {
                    unmount(container._vnode, null, null, true);
                }
            }
            else {
                patch(container._vnode || null, vnode, container, null, null, null, isSVG);
            }
            flushPostFlushCbs();
            container._vnode = vnode;
        };
        const internals = {
            p: patch,
            um: unmount,
            m: move,
            r: remove,
            mt: mountComponent,
            mc: mountChildren,
            pc: patchChildren,
            pbc: patchBlockChildren,
            n: getNextHostNode,
            o: options
        };
        let hydrate;
        let hydrateNode;
        if (createHydrationFns) {
            [hydrate, hydrateNode] = createHydrationFns(internals);
        }
        return {
            render,
            hydrate,
            createApp: createAppAPI(render, hydrate)
        };
    }
    function toggleRecurse({ effect, update }, allowed) {
        effect.allowRecurse = update.allowRecurse = allowed;
    }
    /**
     * #1156
     * When a component is HMR-enabled, we need to make sure that all static nodes
     * inside a block also inherit the DOM element from the previous tree so that
     * HMR updates (which are full updates) can retrieve the element for patching.
     *
     * #2080
     * Inside keyed `template` fragment static children, if a fragment is moved,
     * the children will always be moved. Therefore, in order to ensure correct move
     * position, el should be inherited from previous nodes.
     */
    function traverseStaticChildren(n1, n2, shallow = false) {
        const ch1 = n1.children;
        const ch2 = n2.children;
        if (isArray$1(ch1) && isArray$1(ch2)) {
            for (let i = 0; i < ch1.length; i++) {
                // this is only called in the optimized path so array children are
                // guaranteed to be vnodes
                const c1 = ch1[i];
                let c2 = ch2[i];
                if (c2.shapeFlag & 1 /* ELEMENT */ && !c2.dynamicChildren) {
                    if (c2.patchFlag <= 0 || c2.patchFlag === 32 /* HYDRATE_EVENTS */) {
                        c2 = ch2[i] = cloneIfMounted(ch2[i]);
                        c2.el = c1.el;
                    }
                    if (!shallow)
                        traverseStaticChildren(c1, c2);
                }
            }
        }
    }
    // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
    function getSequence(arr) {
        const p = arr.slice();
        const result = [0];
        let i, j, u, v, c;
        const len = arr.length;
        for (i = 0; i < len; i++) {
            const arrI = arr[i];
            if (arrI !== 0) {
                j = result[result.length - 1];
                if (arr[j] < arrI) {
                    p[i] = j;
                    result.push(i);
                    continue;
                }
                u = 0;
                v = result.length - 1;
                while (u < v) {
                    c = (u + v) >> 1;
                    if (arr[result[c]] < arrI) {
                        u = c + 1;
                    }
                    else {
                        v = c;
                    }
                }
                if (arrI < arr[result[u]]) {
                    if (u > 0) {
                        p[i] = result[u - 1];
                    }
                    result[u] = i;
                }
            }
        }
        u = result.length;
        v = result[u - 1];
        while (u-- > 0) {
            result[u] = v;
            v = p[v];
        }
        return result;
    }

    const isTeleport = (type) => type.__isTeleport;
    const NULL_DYNAMIC_COMPONENT = Symbol();

    const Fragment = Symbol(undefined);
    const Text = Symbol(undefined);
    const Comment = Symbol(undefined);
    const Static = Symbol(undefined);
    // Since v-if and v-for are the two possible ways node structure can dynamically
    // change, once we consider v-if branches and each v-for fragment a block, we
    // can divide a template into nested blocks, and within each block the node
    // structure would be stable. This allows us to skip most children diffing
    // and only worry about the dynamic nodes (indicated by patch flags).
    const blockStack = [];
    let currentBlock = null;
    /**
     * Open a block.
     * This must be called before `createBlock`. It cannot be part of `createBlock`
     * because the children of the block are evaluated before `createBlock` itself
     * is called. The generated code typically looks like this:
     *
     * ```js
     * function render() {
     *   return (openBlock(),createBlock('div', null, [...]))
     * }
     * ```
     * disableTracking is true when creating a v-for fragment block, since a v-for
     * fragment always diffs its children.
     *
     * @private
     */
    function openBlock(disableTracking = false) {
        blockStack.push((currentBlock = disableTracking ? null : []));
    }
    function closeBlock() {
        blockStack.pop();
        currentBlock = blockStack[blockStack.length - 1] || null;
    }
    // Whether we should be tracking dynamic child nodes inside a block.
    // Only tracks when this value is > 0
    // We are not using a simple boolean because this value may need to be
    // incremented/decremented by nested usage of v-once (see below)
    let isBlockTreeEnabled = 1;
    /**
     * Block tracking sometimes needs to be disabled, for example during the
     * creation of a tree that needs to be cached by v-once. The compiler generates
     * code like this:
     *
     * ``` js
     * _cache[1] || (
     *   setBlockTracking(-1),
     *   _cache[1] = createVNode(...),
     *   setBlockTracking(1),
     *   _cache[1]
     * )
     * ```
     *
     * @private
     */
    function setBlockTracking(value) {
        isBlockTreeEnabled += value;
    }
    function setupBlock(vnode) {
        // save current block children on the block vnode
        vnode.dynamicChildren =
            isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
        // close block
        closeBlock();
        // a block is always going to be patched, so track it as a child of its
        // parent block
        if (isBlockTreeEnabled > 0 && currentBlock) {
            currentBlock.push(vnode);
        }
        return vnode;
    }
    /**
     * @private
     */
    function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
        return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true /* isBlock */));
    }
    /**
     * Create a block root vnode. Takes the same exact arguments as `createVNode`.
     * A block root keeps track of dynamic nodes within the block in the
     * `dynamicChildren` array.
     *
     * @private
     */
    function createBlock(type, props, children, patchFlag, dynamicProps) {
        return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true /* isBlock: prevent a block from tracking itself */));
    }
    function isVNode(value) {
        return value ? value.__v_isVNode === true : false;
    }
    function isSameVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    const InternalObjectKey = `__vInternal`;
    const normalizeKey = ({ key }) => key != null ? key : null;
    const normalizeRef = ({ ref, ref_key, ref_for }) => {
        return (ref != null
            ? isString(ref) || isRef(ref) || isFunction(ref)
                ? { i: currentRenderingInstance, r: ref, k: ref_key, f: !!ref_for }
                : ref
            : null);
    };
    function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1 /* ELEMENT */, isBlockNode = false, needFullChildrenNormalization = false) {
        const vnode = {
            __v_isVNode: true,
            __v_skip: true,
            type,
            props,
            key: props && normalizeKey(props),
            ref: props && normalizeRef(props),
            scopeId: currentScopeId,
            slotScopeIds: null,
            children,
            component: null,
            suspense: null,
            ssContent: null,
            ssFallback: null,
            dirs: null,
            transition: null,
            el: null,
            anchor: null,
            target: null,
            targetAnchor: null,
            staticCount: 0,
            shapeFlag,
            patchFlag,
            dynamicProps,
            dynamicChildren: null,
            appContext: null
        };
        if (needFullChildrenNormalization) {
            normalizeChildren(vnode, children);
            // normalize suspense children
            if (shapeFlag & 128 /* SUSPENSE */) {
                type.normalize(vnode);
            }
        }
        else if (children) {
            // compiled element vnode - if children is passed, only possible types are
            // string or Array.
            vnode.shapeFlag |= isString(children)
                ? 8 /* TEXT_CHILDREN */
                : 16 /* ARRAY_CHILDREN */;
        }
        // track vnode for block tree
        if (isBlockTreeEnabled > 0 &&
            // avoid a block node from tracking itself
            !isBlockNode &&
            // has current parent block
            currentBlock &&
            // presence of a patch flag indicates this node needs patching on updates.
            // component nodes also should always be patched, because even if the
            // component doesn't need to update, it needs to persist the instance on to
            // the next vnode so that it can be properly unmounted later.
            (vnode.patchFlag > 0 || shapeFlag & 6 /* COMPONENT */) &&
            // the EVENTS flag is only for hydration and if it is the only flag, the
            // vnode should not be considered dynamic due to handler caching.
            vnode.patchFlag !== 32 /* HYDRATE_EVENTS */) {
            currentBlock.push(vnode);
        }
        return vnode;
    }
    const createVNode = (_createVNode);
    function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
        if (!type || type === NULL_DYNAMIC_COMPONENT) {
            type = Comment;
        }
        if (isVNode(type)) {
            // createVNode receiving an existing vnode. This happens in cases like
            // <component :is="vnode"/>
            // #2078 make sure to merge refs during the clone instead of overwriting it
            const cloned = cloneVNode(type, props, true /* mergeRef: true */);
            if (children) {
                normalizeChildren(cloned, children);
            }
            return cloned;
        }
        // class component normalization.
        if (isClassComponent(type)) {
            type = type.__vccOpts;
        }
        // class & style normalization.
        if (props) {
            // for reactive or proxy objects, we need to clone it to enable mutation.
            props = guardReactiveProps(props);
            let { class: klass, style } = props;
            if (klass && !isString(klass)) {
                props.class = normalizeClass(klass);
            }
            if (isObject(style)) {
                // reactive state objects need to be cloned since they are likely to be
                // mutated
                if (isProxy(style) && !isArray$1(style)) {
                    style = extend$1({}, style);
                }
                props.style = normalizeStyle(style);
            }
        }
        // encode the vnode type information into a bitmap
        const shapeFlag = isString(type)
            ? 1 /* ELEMENT */
            : isSuspense(type)
                ? 128 /* SUSPENSE */
                : isTeleport(type)
                    ? 64 /* TELEPORT */
                    : isObject(type)
                        ? 4 /* STATEFUL_COMPONENT */
                        : isFunction(type)
                            ? 2 /* FUNCTIONAL_COMPONENT */
                            : 0;
        return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
    }
    function guardReactiveProps(props) {
        if (!props)
            return null;
        return isProxy(props) || InternalObjectKey in props
            ? extend$1({}, props)
            : props;
    }
    function cloneVNode(vnode, extraProps, mergeRef = false) {
        // This is intentionally NOT using spread or extend to avoid the runtime
        // key enumeration cost.
        const { props, ref, patchFlag, children } = vnode;
        const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
        const cloned = {
            __v_isVNode: true,
            __v_skip: true,
            type: vnode.type,
            props: mergedProps,
            key: mergedProps && normalizeKey(mergedProps),
            ref: extraProps && extraProps.ref
                ? // #2078 in the case of <component :is="vnode" ref="extra"/>
                    // if the vnode itself already has a ref, cloneVNode will need to merge
                    // the refs so the single vnode can be set on multiple refs
                    mergeRef && ref
                        ? isArray$1(ref)
                            ? ref.concat(normalizeRef(extraProps))
                            : [ref, normalizeRef(extraProps)]
                        : normalizeRef(extraProps)
                : ref,
            scopeId: vnode.scopeId,
            slotScopeIds: vnode.slotScopeIds,
            children: children,
            target: vnode.target,
            targetAnchor: vnode.targetAnchor,
            staticCount: vnode.staticCount,
            shapeFlag: vnode.shapeFlag,
            // if the vnode is cloned with extra props, we can no longer assume its
            // existing patch flag to be reliable and need to add the FULL_PROPS flag.
            // note: preserve flag for fragments since they use the flag for children
            // fast paths only.
            patchFlag: extraProps && vnode.type !== Fragment
                ? patchFlag === -1 // hoisted node
                    ? 16 /* FULL_PROPS */
                    : patchFlag | 16 /* FULL_PROPS */
                : patchFlag,
            dynamicProps: vnode.dynamicProps,
            dynamicChildren: vnode.dynamicChildren,
            appContext: vnode.appContext,
            dirs: vnode.dirs,
            transition: vnode.transition,
            // These should technically only be non-null on mounted VNodes. However,
            // they *should* be copied for kept-alive vnodes. So we just always copy
            // them since them being non-null during a mount doesn't affect the logic as
            // they will simply be overwritten.
            component: vnode.component,
            suspense: vnode.suspense,
            ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
            ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
            el: vnode.el,
            anchor: vnode.anchor
        };
        return cloned;
    }
    /**
     * @private
     */
    function createTextVNode(text = ' ', flag = 0) {
        return createVNode(Text, null, text, flag);
    }
    /**
     * @private
     */
    function createStaticVNode(content, numberOfNodes) {
        // A static vnode can contain multiple stringified elements, and the number
        // of elements is necessary for hydration.
        const vnode = createVNode(Static, null, content);
        vnode.staticCount = numberOfNodes;
        return vnode;
    }
    /**
     * @private
     */
    function createCommentVNode(text = '', 
    // when used as the v-else branch, the comment node must be created as a
    // block to ensure correct updates.
    asBlock = false) {
        return asBlock
            ? (openBlock(), createBlock(Comment, null, text))
            : createVNode(Comment, null, text);
    }
    function normalizeVNode(child) {
        if (child == null || typeof child === 'boolean') {
            // empty placeholder
            return createVNode(Comment);
        }
        else if (isArray$1(child)) {
            // fragment
            return createVNode(Fragment, null, 
            // #3666, avoid reference pollution when reusing vnode
            child.slice());
        }
        else if (typeof child === 'object') {
            // already vnode, this should be the most common since compiled templates
            // always produce all-vnode children arrays
            return cloneIfMounted(child);
        }
        else {
            // strings and numbers
            return createVNode(Text, null, String(child));
        }
    }
    // optimized normalization for template-compiled render fns
    function cloneIfMounted(child) {
        return child.el === null || child.memo ? child : cloneVNode(child);
    }
    function normalizeChildren(vnode, children) {
        let type = 0;
        const { shapeFlag } = vnode;
        if (children == null) {
            children = null;
        }
        else if (isArray$1(children)) {
            type = 16 /* ARRAY_CHILDREN */;
        }
        else if (typeof children === 'object') {
            if (shapeFlag & (1 /* ELEMENT */ | 64 /* TELEPORT */)) {
                // Normalize slot to plain children for plain element and Teleport
                const slot = children.default;
                if (slot) {
                    // _c marker is added by withCtx() indicating this is a compiled slot
                    slot._c && (slot._d = false);
                    normalizeChildren(vnode, slot());
                    slot._c && (slot._d = true);
                }
                return;
            }
            else {
                type = 32 /* SLOTS_CHILDREN */;
                const slotFlag = children._;
                if (!slotFlag && !(InternalObjectKey in children)) {
                    children._ctx = currentRenderingInstance;
                }
                else if (slotFlag === 3 /* FORWARDED */ && currentRenderingInstance) {
                    // a child component receives forwarded slots from the parent.
                    // its slot type is determined by its parent's slot type.
                    if (currentRenderingInstance.slots._ === 1 /* STABLE */) {
                        children._ = 1 /* STABLE */;
                    }
                    else {
                        children._ = 2 /* DYNAMIC */;
                        vnode.patchFlag |= 1024 /* DYNAMIC_SLOTS */;
                    }
                }
            }
        }
        else if (isFunction(children)) {
            children = { default: children, _ctx: currentRenderingInstance };
            type = 32 /* SLOTS_CHILDREN */;
        }
        else {
            children = String(children);
            // force teleport children to array so it can be moved around
            if (shapeFlag & 64 /* TELEPORT */) {
                type = 16 /* ARRAY_CHILDREN */;
                children = [createTextVNode(children)];
            }
            else {
                type = 8 /* TEXT_CHILDREN */;
            }
        }
        vnode.children = children;
        vnode.shapeFlag |= type;
    }
    function mergeProps(...args) {
        const ret = {};
        for (let i = 0; i < args.length; i++) {
            const toMerge = args[i];
            for (const key in toMerge) {
                if (key === 'class') {
                    if (ret.class !== toMerge.class) {
                        ret.class = normalizeClass([ret.class, toMerge.class]);
                    }
                }
                else if (key === 'style') {
                    ret.style = normalizeStyle([ret.style, toMerge.style]);
                }
                else if (isOn(key)) {
                    const existing = ret[key];
                    const incoming = toMerge[key];
                    if (incoming &&
                        existing !== incoming &&
                        !(isArray$1(existing) && existing.includes(incoming))) {
                        ret[key] = existing
                            ? [].concat(existing, incoming)
                            : incoming;
                    }
                }
                else if (key !== '') {
                    ret[key] = toMerge[key];
                }
            }
        }
        return ret;
    }
    function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
        callWithAsyncErrorHandling(hook, instance, 7 /* VNODE_HOOK */, [
            vnode,
            prevVNode
        ]);
    }

    /**
     * #2437 In Vue 3, functional components do not have a public instance proxy but
     * they exist in the internal parent chain. For code that relies on traversing
     * public $parent chains, skip functional ones and go to the parent instead.
     */
    const getPublicInstance = (i) => {
        if (!i)
            return null;
        if (isStatefulComponent(i))
            return getExposeProxy(i) || i.proxy;
        return getPublicInstance(i.parent);
    };
    const publicPropertiesMap = extend$1(Object.create(null), {
        $: i => i,
        $el: i => i.vnode.el,
        $data: i => i.data,
        $props: i => (i.props),
        $attrs: i => (i.attrs),
        $slots: i => (i.slots),
        $refs: i => (i.refs),
        $parent: i => getPublicInstance(i.parent),
        $root: i => getPublicInstance(i.root),
        $emit: i => i.emit,
        $options: i => (__VUE_OPTIONS_API__ ? resolveMergedOptions(i) : i.type),
        $forceUpdate: i => () => queueJob(i.update),
        $nextTick: i => nextTick.bind(i.proxy),
        $watch: i => (__VUE_OPTIONS_API__ ? instanceWatch.bind(i) : NOOP)
    });
    const PublicInstanceProxyHandlers = {
        get({ _: instance }, key) {
            const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
            // data / props / ctx
            // This getter gets called for every property access on the render context
            // during render and is a major hotspot. The most expensive part of this
            // is the multiple hasOwn() calls. It's much faster to do a simple property
            // access on a plain object, so we use an accessCache object (with null
            // prototype) to memoize what access type a key corresponds to.
            let normalizedProps;
            if (key[0] !== '$') {
                const n = accessCache[key];
                if (n !== undefined) {
                    switch (n) {
                        case 1 /* SETUP */:
                            return setupState[key];
                        case 2 /* DATA */:
                            return data[key];
                        case 4 /* CONTEXT */:
                            return ctx[key];
                        case 3 /* PROPS */:
                            return props[key];
                        // default: just fallthrough
                    }
                }
                else if (setupState !== EMPTY_OBJ && hasOwn$1(setupState, key)) {
                    accessCache[key] = 1 /* SETUP */;
                    return setupState[key];
                }
                else if (data !== EMPTY_OBJ && hasOwn$1(data, key)) {
                    accessCache[key] = 2 /* DATA */;
                    return data[key];
                }
                else if (
                // only cache other properties when instance has declared (thus stable)
                // props
                (normalizedProps = instance.propsOptions[0]) &&
                    hasOwn$1(normalizedProps, key)) {
                    accessCache[key] = 3 /* PROPS */;
                    return props[key];
                }
                else if (ctx !== EMPTY_OBJ && hasOwn$1(ctx, key)) {
                    accessCache[key] = 4 /* CONTEXT */;
                    return ctx[key];
                }
                else if (!__VUE_OPTIONS_API__ || shouldCacheAccess) {
                    accessCache[key] = 0 /* OTHER */;
                }
            }
            const publicGetter = publicPropertiesMap[key];
            let cssModule, globalProperties;
            // public $xxx properties
            if (publicGetter) {
                if (key === '$attrs') {
                    track(instance, "get" /* GET */, key);
                }
                return publicGetter(instance);
            }
            else if (
            // css module (injected by vue-loader)
            (cssModule = type.__cssModules) &&
                (cssModule = cssModule[key])) {
                return cssModule;
            }
            else if (ctx !== EMPTY_OBJ && hasOwn$1(ctx, key)) {
                // user may set custom properties to `this` that start with `$`
                accessCache[key] = 4 /* CONTEXT */;
                return ctx[key];
            }
            else if (
            // global properties
            ((globalProperties = appContext.config.globalProperties),
                hasOwn$1(globalProperties, key))) {
                {
                    return globalProperties[key];
                }
            }
            else ;
        },
        set({ _: instance }, key, value) {
            const { data, setupState, ctx } = instance;
            if (setupState !== EMPTY_OBJ && hasOwn$1(setupState, key)) {
                setupState[key] = value;
                return true;
            }
            else if (data !== EMPTY_OBJ && hasOwn$1(data, key)) {
                data[key] = value;
                return true;
            }
            else if (hasOwn$1(instance.props, key)) {
                return false;
            }
            if (key[0] === '$' && key.slice(1) in instance) {
                return false;
            }
            else {
                {
                    ctx[key] = value;
                }
            }
            return true;
        },
        has({ _: { data, setupState, accessCache, ctx, appContext, propsOptions } }, key) {
            let normalizedProps;
            return (!!accessCache[key] ||
                (data !== EMPTY_OBJ && hasOwn$1(data, key)) ||
                (setupState !== EMPTY_OBJ && hasOwn$1(setupState, key)) ||
                ((normalizedProps = propsOptions[0]) && hasOwn$1(normalizedProps, key)) ||
                hasOwn$1(ctx, key) ||
                hasOwn$1(publicPropertiesMap, key) ||
                hasOwn$1(appContext.config.globalProperties, key));
        },
        defineProperty(target, key, descriptor) {
            if (descriptor.get != null) {
                this.set(target, key, descriptor.get(), null);
            }
            else if (descriptor.value != null) {
                this.set(target, key, descriptor.value, null);
            }
            return Reflect.defineProperty(target, key, descriptor);
        }
    };

    const emptyAppContext = createAppContext();
    let uid$1 = 0;
    function createComponentInstance(vnode, parent, suspense) {
        const type = vnode.type;
        // inherit parent app context - or - if root, adopt from root vnode
        const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
        const instance = {
            uid: uid$1++,
            vnode,
            type,
            parent,
            appContext,
            root: null,
            next: null,
            subTree: null,
            effect: null,
            update: null,
            scope: new EffectScope(true /* detached */),
            render: null,
            proxy: null,
            exposed: null,
            exposeProxy: null,
            withProxy: null,
            provides: parent ? parent.provides : Object.create(appContext.provides),
            accessCache: null,
            renderCache: [],
            // local resovled assets
            components: null,
            directives: null,
            // resolved props and emits options
            propsOptions: normalizePropsOptions(type, appContext),
            emitsOptions: normalizeEmitsOptions(type, appContext),
            // emit
            emit: null,
            emitted: null,
            // props default value
            propsDefaults: EMPTY_OBJ,
            // inheritAttrs
            inheritAttrs: type.inheritAttrs,
            // state
            ctx: EMPTY_OBJ,
            data: EMPTY_OBJ,
            props: EMPTY_OBJ,
            attrs: EMPTY_OBJ,
            slots: EMPTY_OBJ,
            refs: EMPTY_OBJ,
            setupState: EMPTY_OBJ,
            setupContext: null,
            // suspense related
            suspense,
            suspenseId: suspense ? suspense.pendingId : 0,
            asyncDep: null,
            asyncResolved: false,
            // lifecycle hooks
            // not using enums here because it results in computed properties
            isMounted: false,
            isUnmounted: false,
            isDeactivated: false,
            bc: null,
            c: null,
            bm: null,
            m: null,
            bu: null,
            u: null,
            um: null,
            bum: null,
            da: null,
            a: null,
            rtg: null,
            rtc: null,
            ec: null,
            sp: null
        };
        {
            instance.ctx = { _: instance };
        }
        instance.root = parent ? parent.root : instance;
        instance.emit = emit$1.bind(null, instance);
        // apply custom element special handling
        if (vnode.ce) {
            vnode.ce(instance);
        }
        return instance;
    }
    let currentInstance = null;
    const getCurrentInstance = () => currentInstance || currentRenderingInstance;
    const setCurrentInstance = (instance) => {
        currentInstance = instance;
        instance.scope.on();
    };
    const unsetCurrentInstance = () => {
        currentInstance && currentInstance.scope.off();
        currentInstance = null;
    };
    function isStatefulComponent(instance) {
        return instance.vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */;
    }
    let isInSSRComponentSetup = false;
    function setupComponent(instance, isSSR = false) {
        isInSSRComponentSetup = isSSR;
        const { props, children } = instance.vnode;
        const isStateful = isStatefulComponent(instance);
        initProps(instance, props, isStateful, isSSR);
        initSlots(instance, children);
        const setupResult = isStateful
            ? setupStatefulComponent(instance, isSSR)
            : undefined;
        isInSSRComponentSetup = false;
        return setupResult;
    }
    function setupStatefulComponent(instance, isSSR) {
        const Component = instance.type;
        // 0. create render proxy property access cache
        instance.accessCache = Object.create(null);
        // 1. create public instance / render proxy
        // also mark it raw so it's never observed
        instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers));
        // 2. call setup()
        const { setup } = Component;
        if (setup) {
            const setupContext = (instance.setupContext =
                setup.length > 1 ? createSetupContext(instance) : null);
            setCurrentInstance(instance);
            pauseTracking();
            const setupResult = callWithErrorHandling(setup, instance, 0 /* SETUP_FUNCTION */, [instance.props, setupContext]);
            resetTracking();
            unsetCurrentInstance();
            if (isPromise(setupResult)) {
                setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
                if (isSSR) {
                    // return the promise so server-renderer can wait on it
                    return setupResult
                        .then((resolvedResult) => {
                        handleSetupResult(instance, resolvedResult, isSSR);
                    })
                        .catch(e => {
                        handleError(e, instance, 0 /* SETUP_FUNCTION */);
                    });
                }
                else {
                    // async setup returned Promise.
                    // bail here and wait for re-entry.
                    instance.asyncDep = setupResult;
                }
            }
            else {
                handleSetupResult(instance, setupResult, isSSR);
            }
        }
        else {
            finishComponentSetup(instance, isSSR);
        }
    }
    function handleSetupResult(instance, setupResult, isSSR) {
        if (isFunction(setupResult)) {
            // setup returned an inline render function
            if (instance.type.__ssrInlineRender) {
                // when the function's name is `ssrRender` (compiled by SFC inline mode),
                // set it as ssrRender instead.
                instance.ssrRender = setupResult;
            }
            else {
                instance.render = setupResult;
            }
        }
        else if (isObject(setupResult)) {
            // setup returned bindings.
            // assuming a render function compiled from template is present.
            if (__VUE_PROD_DEVTOOLS__) {
                instance.devtoolsRawSetupState = setupResult;
            }
            instance.setupState = proxyRefs(setupResult);
        }
        else ;
        finishComponentSetup(instance, isSSR);
    }
    let compile;
    function finishComponentSetup(instance, isSSR, skipOptions) {
        const Component = instance.type;
        // template / render function normalization
        // could be already set when returned from setup()
        if (!instance.render) {
            // only do on-the-fly compile if not in SSR - SSR on-the-fly compilation
            // is done by server-renderer
            if (!isSSR && compile && !Component.render) {
                const template = Component.template;
                if (template) {
                    const { isCustomElement, compilerOptions } = instance.appContext.config;
                    const { delimiters, compilerOptions: componentCompilerOptions } = Component;
                    const finalCompilerOptions = extend$1(extend$1({
                        isCustomElement,
                        delimiters
                    }, compilerOptions), componentCompilerOptions);
                    Component.render = compile(template, finalCompilerOptions);
                }
            }
            instance.render = (Component.render || NOOP);
        }
        // support for 2.x options
        if (__VUE_OPTIONS_API__ && !(false )) {
            setCurrentInstance(instance);
            pauseTracking();
            applyOptions(instance);
            resetTracking();
            unsetCurrentInstance();
        }
    }
    function createAttrsProxy(instance) {
        return new Proxy(instance.attrs, {
                get(target, key) {
                    track(instance, "get" /* GET */, '$attrs');
                    return target[key];
                }
            });
    }
    function createSetupContext(instance) {
        const expose = exposed => {
            instance.exposed = exposed || {};
        };
        let attrs;
        {
            return {
                get attrs() {
                    return attrs || (attrs = createAttrsProxy(instance));
                },
                slots: instance.slots,
                emit: instance.emit,
                expose
            };
        }
    }
    function getExposeProxy(instance) {
        if (instance.exposed) {
            return (instance.exposeProxy ||
                (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
                    get(target, key) {
                        if (key in target) {
                            return target[key];
                        }
                        else if (key in publicPropertiesMap) {
                            return publicPropertiesMap[key](instance);
                        }
                    }
                })));
        }
    }
    function isClassComponent(value) {
        return isFunction(value) && '__vccOpts' in value;
    }

    const computed = ((getterOrOptions, debugOptions) => {
        // @ts-ignore
        return computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
    });

    // Core API ------------------------------------------------------------------
    const version = "3.2.31";

    const svgNS = 'http://www.w3.org/2000/svg';
    const doc = (typeof document !== 'undefined' ? document : null);
    const templateContainer = doc && doc.createElement('template');
    const nodeOps = {
        insert: (child, parent, anchor) => {
            parent.insertBefore(child, anchor || null);
        },
        remove: child => {
            const parent = child.parentNode;
            if (parent) {
                parent.removeChild(child);
            }
        },
        createElement: (tag, isSVG, is, props) => {
            const el = isSVG
                ? doc.createElementNS(svgNS, tag)
                : doc.createElement(tag, is ? { is } : undefined);
            if (tag === 'select' && props && props.multiple != null) {
                el.setAttribute('multiple', props.multiple);
            }
            return el;
        },
        createText: text => doc.createTextNode(text),
        createComment: text => doc.createComment(text),
        setText: (node, text) => {
            node.nodeValue = text;
        },
        setElementText: (el, text) => {
            el.textContent = text;
        },
        parentNode: node => node.parentNode,
        nextSibling: node => node.nextSibling,
        querySelector: selector => doc.querySelector(selector),
        setScopeId(el, id) {
            el.setAttribute(id, '');
        },
        cloneNode(el) {
            const cloned = el.cloneNode(true);
            // #3072
            // - in `patchDOMProp`, we store the actual value in the `el._value` property.
            // - normally, elements using `:value` bindings will not be hoisted, but if
            //   the bound value is a constant, e.g. `:value="true"` - they do get
            //   hoisted.
            // - in production, hoisted nodes are cloned when subsequent inserts, but
            //   cloneNode() does not copy the custom property we attached.
            // - This may need to account for other custom DOM properties we attach to
            //   elements in addition to `_value` in the future.
            if (`_value` in el) {
                cloned._value = el._value;
            }
            return cloned;
        },
        // __UNSAFE__
        // Reason: innerHTML.
        // Static content here can only come from compiled templates.
        // As long as the user only uses trusted templates, this is safe.
        insertStaticContent(content, parent, anchor, isSVG, start, end) {
            // <parent> before | first ... last | anchor </parent>
            const before = anchor ? anchor.previousSibling : parent.lastChild;
            // #5308 can only take cached path if:
            // - has a single root node
            // - nextSibling info is still available
            if (start && (start === end || start.nextSibling)) {
                // cached
                while (true) {
                    parent.insertBefore(start.cloneNode(true), anchor);
                    if (start === end || !(start = start.nextSibling))
                        break;
                }
            }
            else {
                // fresh insert
                templateContainer.innerHTML = isSVG ? `<svg>${content}</svg>` : content;
                const template = templateContainer.content;
                if (isSVG) {
                    // remove outer svg wrapper
                    const wrapper = template.firstChild;
                    while (wrapper.firstChild) {
                        template.appendChild(wrapper.firstChild);
                    }
                    template.removeChild(wrapper);
                }
                parent.insertBefore(template, anchor);
            }
            return [
                // first
                before ? before.nextSibling : parent.firstChild,
                // last
                anchor ? anchor.previousSibling : parent.lastChild
            ];
        }
    };

    // compiler should normalize class + :class bindings on the same element
    // into a single binding ['staticClass', dynamic]
    function patchClass(el, value, isSVG) {
        // directly setting className should be faster than setAttribute in theory
        // if this is an element during a transition, take the temporary transition
        // classes into account.
        const transitionClasses = el._vtc;
        if (transitionClasses) {
            value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(' ');
        }
        if (value == null) {
            el.removeAttribute('class');
        }
        else if (isSVG) {
            el.setAttribute('class', value);
        }
        else {
            el.className = value;
        }
    }

    function patchStyle(el, prev, next) {
        const style = el.style;
        const isCssString = isString(next);
        if (next && !isCssString) {
            for (const key in next) {
                setStyle(style, key, next[key]);
            }
            if (prev && !isString(prev)) {
                for (const key in prev) {
                    if (next[key] == null) {
                        setStyle(style, key, '');
                    }
                }
            }
        }
        else {
            const currentDisplay = style.display;
            if (isCssString) {
                if (prev !== next) {
                    style.cssText = next;
                }
            }
            else if (prev) {
                el.removeAttribute('style');
            }
            // indicates that the `display` of the element is controlled by `v-show`,
            // so we always keep the current `display` value regardless of the `style`
            // value, thus handing over control to `v-show`.
            if ('_vod' in el) {
                style.display = currentDisplay;
            }
        }
    }
    const importantRE = /\s*!important$/;
    function setStyle(style, name, val) {
        if (isArray$1(val)) {
            val.forEach(v => setStyle(style, name, v));
        }
        else {
            if (name.startsWith('--')) {
                // custom property definition
                style.setProperty(name, val);
            }
            else {
                const prefixed = autoPrefix(style, name);
                if (importantRE.test(val)) {
                    // !important
                    style.setProperty(hyphenate(prefixed), val.replace(importantRE, ''), 'important');
                }
                else {
                    style[prefixed] = val;
                }
            }
        }
    }
    const prefixes = ['Webkit', 'Moz', 'ms'];
    const prefixCache = {};
    function autoPrefix(style, rawName) {
        const cached = prefixCache[rawName];
        if (cached) {
            return cached;
        }
        let name = camelize(rawName);
        if (name !== 'filter' && name in style) {
            return (prefixCache[rawName] = name);
        }
        name = capitalize(name);
        for (let i = 0; i < prefixes.length; i++) {
            const prefixed = prefixes[i] + name;
            if (prefixed in style) {
                return (prefixCache[rawName] = prefixed);
            }
        }
        return rawName;
    }

    const xlinkNS = 'http://www.w3.org/1999/xlink';
    function patchAttr(el, key, value, isSVG, instance) {
        if (isSVG && key.startsWith('xlink:')) {
            if (value == null) {
                el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
            }
            else {
                el.setAttributeNS(xlinkNS, key, value);
            }
        }
        else {
            // note we are only checking boolean attributes that don't have a
            // corresponding dom prop of the same name here.
            const isBoolean = isSpecialBooleanAttr(key);
            if (value == null || (isBoolean && !includeBooleanAttr(value))) {
                el.removeAttribute(key);
            }
            else {
                el.setAttribute(key, isBoolean ? '' : value);
            }
        }
    }

    // __UNSAFE__
    // functions. The user is responsible for using them with only trusted content.
    function patchDOMProp(el, key, value, 
    // the following args are passed only due to potential innerHTML/textContent
    // overriding existing VNodes, in which case the old tree must be properly
    // unmounted.
    prevChildren, parentComponent, parentSuspense, unmountChildren) {
        if (key === 'innerHTML' || key === 'textContent') {
            if (prevChildren) {
                unmountChildren(prevChildren, parentComponent, parentSuspense);
            }
            el[key] = value == null ? '' : value;
            return;
        }
        if (key === 'value' &&
            el.tagName !== 'PROGRESS' &&
            // custom elements may use _value internally
            !el.tagName.includes('-')) {
            // store value as _value as well since
            // non-string values will be stringified.
            el._value = value;
            const newValue = value == null ? '' : value;
            if (el.value !== newValue ||
                // #4956: always set for OPTION elements because its value falls back to
                // textContent if no value attribute is present. And setting .value for
                // OPTION has no side effect
                el.tagName === 'OPTION') {
                el.value = newValue;
            }
            if (value == null) {
                el.removeAttribute(key);
            }
            return;
        }
        if (value === '' || value == null) {
            const type = typeof el[key];
            if (type === 'boolean') {
                // e.g. <select multiple> compiles to { multiple: '' }
                el[key] = includeBooleanAttr(value);
                return;
            }
            else if (value == null && type === 'string') {
                // e.g. <div :id="null">
                el[key] = '';
                el.removeAttribute(key);
                return;
            }
            else if (type === 'number') {
                // e.g. <img :width="null">
                // the value of some IDL attr must be greater than 0, e.g. input.size = 0 -> error
                try {
                    el[key] = 0;
                }
                catch (_a) { }
                el.removeAttribute(key);
                return;
            }
        }
        // some properties perform value validation and throw
        try {
            el[key] = value;
        }
        catch (e) {
        }
    }

    // Async edge case fix requires storing an event listener's attach timestamp.
    let _getNow = Date.now;
    let skipTimestampCheck = false;
    if (typeof window !== 'undefined') {
        // Determine what event timestamp the browser is using. Annoyingly, the
        // timestamp can either be hi-res (relative to page load) or low-res
        // (relative to UNIX epoch), so in order to compare time we have to use the
        // same timestamp type when saving the flush timestamp.
        if (_getNow() > document.createEvent('Event').timeStamp) {
            // if the low-res timestamp which is bigger than the event timestamp
            // (which is evaluated AFTER) it means the event is using a hi-res timestamp,
            // and we need to use the hi-res version for event listeners as well.
            _getNow = () => performance.now();
        }
        // #3485: Firefox <= 53 has incorrect Event.timeStamp implementation
        // and does not fire microtasks in between event propagation, so safe to exclude.
        const ffMatch = navigator.userAgent.match(/firefox\/(\d+)/i);
        skipTimestampCheck = !!(ffMatch && Number(ffMatch[1]) <= 53);
    }
    // To avoid the overhead of repeatedly calling performance.now(), we cache
    // and use the same timestamp for all event listeners attached in the same tick.
    let cachedNow = 0;
    const p = Promise.resolve();
    const reset = () => {
        cachedNow = 0;
    };
    const getNow = () => cachedNow || (p.then(reset), (cachedNow = _getNow()));
    function addEventListener$1(el, event, handler, options) {
        el.addEventListener(event, handler, options);
    }
    function removeEventListener(el, event, handler, options) {
        el.removeEventListener(event, handler, options);
    }
    function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
        // vei = vue event invokers
        const invokers = el._vei || (el._vei = {});
        const existingInvoker = invokers[rawName];
        if (nextValue && existingInvoker) {
            // patch
            existingInvoker.value = nextValue;
        }
        else {
            const [name, options] = parseName(rawName);
            if (nextValue) {
                // add
                const invoker = (invokers[rawName] = createInvoker(nextValue, instance));
                addEventListener$1(el, name, invoker, options);
            }
            else if (existingInvoker) {
                // remove
                removeEventListener(el, name, existingInvoker, options);
                invokers[rawName] = undefined;
            }
        }
    }
    const optionsModifierRE = /(?:Once|Passive|Capture)$/;
    function parseName(name) {
        let options;
        if (optionsModifierRE.test(name)) {
            options = {};
            let m;
            while ((m = name.match(optionsModifierRE))) {
                name = name.slice(0, name.length - m[0].length);
                options[m[0].toLowerCase()] = true;
            }
        }
        return [hyphenate(name.slice(2)), options];
    }
    function createInvoker(initialValue, instance) {
        const invoker = (e) => {
            // async edge case #6566: inner click event triggers patch, event handler
            // attached to outer element during patch, and triggered again. This
            // happens because browsers fire microtask ticks between event propagation.
            // the solution is simple: we save the timestamp when a handler is attached,
            // and the handler would only fire if the event passed to it was fired
            // AFTER it was attached.
            const timeStamp = e.timeStamp || _getNow();
            if (skipTimestampCheck || timeStamp >= invoker.attached - 1) {
                callWithAsyncErrorHandling(patchStopImmediatePropagation(e, invoker.value), instance, 5 /* NATIVE_EVENT_HANDLER */, [e]);
            }
        };
        invoker.value = initialValue;
        invoker.attached = getNow();
        return invoker;
    }
    function patchStopImmediatePropagation(e, value) {
        if (isArray$1(value)) {
            const originalStop = e.stopImmediatePropagation;
            e.stopImmediatePropagation = () => {
                originalStop.call(e);
                e._stopped = true;
            };
            return value.map(fn => (e) => !e._stopped && fn && fn(e));
        }
        else {
            return value;
        }
    }

    const nativeOnRE = /^on[a-z]/;
    const patchProp = (el, key, prevValue, nextValue, isSVG = false, prevChildren, parentComponent, parentSuspense, unmountChildren) => {
        if (key === 'class') {
            patchClass(el, nextValue, isSVG);
        }
        else if (key === 'style') {
            patchStyle(el, prevValue, nextValue);
        }
        else if (isOn(key)) {
            // ignore v-model listeners
            if (!isModelListener(key)) {
                patchEvent(el, key, prevValue, nextValue, parentComponent);
            }
        }
        else if (key[0] === '.'
            ? ((key = key.slice(1)), true)
            : key[0] === '^'
                ? ((key = key.slice(1)), false)
                : shouldSetAsProp(el, key, nextValue, isSVG)) {
            patchDOMProp(el, key, nextValue, prevChildren, parentComponent, parentSuspense, unmountChildren);
        }
        else {
            // special case for <input v-model type="checkbox"> with
            // :true-value & :false-value
            // store value as dom properties since non-string values will be
            // stringified.
            if (key === 'true-value') {
                el._trueValue = nextValue;
            }
            else if (key === 'false-value') {
                el._falseValue = nextValue;
            }
            patchAttr(el, key, nextValue, isSVG);
        }
    };
    function shouldSetAsProp(el, key, value, isSVG) {
        if (isSVG) {
            // most keys must be set as attribute on svg elements to work
            // ...except innerHTML & textContent
            if (key === 'innerHTML' || key === 'textContent') {
                return true;
            }
            // or native onclick with function values
            if (key in el && nativeOnRE.test(key) && isFunction(value)) {
                return true;
            }
            return false;
        }
        // spellcheck and draggable are numerated attrs, however their
        // corresponding DOM properties are actually booleans - this leads to
        // setting it with a string "false" value leading it to be coerced to
        // `true`, so we need to always treat them as attributes.
        // Note that `contentEditable` doesn't have this problem: its DOM
        // property is also enumerated string values.
        if (key === 'spellcheck' || key === 'draggable') {
            return false;
        }
        // #1787, #2840 form property on form elements is readonly and must be set as
        // attribute.
        if (key === 'form') {
            return false;
        }
        // #1526 <input list> must be set as attribute
        if (key === 'list' && el.tagName === 'INPUT') {
            return false;
        }
        // #2766 <textarea type> must be set as attribute
        if (key === 'type' && el.tagName === 'TEXTAREA') {
            return false;
        }
        // native onclick with string value, must be set as attribute
        if (nativeOnRE.test(key) && isString(value)) {
            return false;
        }
        return key in el;
    }
    const DOMTransitionPropsValidators = {
        name: String,
        type: String,
        css: {
            type: Boolean,
            default: true
        },
        duration: [String, Number, Object],
        enterFromClass: String,
        enterActiveClass: String,
        enterToClass: String,
        appearFromClass: String,
        appearActiveClass: String,
        appearToClass: String,
        leaveFromClass: String,
        leaveActiveClass: String,
        leaveToClass: String
    };
    (/*#__PURE__*/ extend$1({}, BaseTransition.props, DOMTransitionPropsValidators));

    const rendererOptions = extend$1({ patchProp }, nodeOps);
    // lazy create the renderer - this makes core renderer logic tree-shakable
    // in case the user only imports reactivity utilities from Vue.
    let renderer;
    function ensureRenderer() {
        return (renderer ||
            (renderer = createRenderer(rendererOptions)));
    }
    const createApp = ((...args) => {
        const app = ensureRenderer().createApp(...args);
        const { mount } = app;
        app.mount = (containerOrSelector) => {
            const container = normalizeContainer(containerOrSelector);
            if (!container)
                return;
            const component = app._component;
            if (!isFunction(component) && !component.render && !component.template) {
                // __UNSAFE__
                // Reason: potential execution of JS expressions in in-DOM template.
                // The user must make sure the in-DOM template is trusted. If it's
                // rendered by the server, the template should not contain any user data.
                component.template = container.innerHTML;
            }
            // clear content before mounting
            container.innerHTML = '';
            const proxy = mount(container, false, container instanceof SVGElement);
            if (container instanceof Element) {
                container.removeAttribute('v-cloak');
                container.setAttribute('data-v-app', '');
            }
            return proxy;
        };
        return app;
    });
    function normalizeContainer(container) {
        if (isString(container)) {
            const res = document.querySelector(container);
            return res;
        }
        return container;
    }

    var _imports_0$E = "https://resources.realitymedia.digital/vue-apps/dist/1a6ace377133f14a.png";

    const _withScopeId$3 = n => (pushScopeId("data-v-06a9f319"),n=n(),popScopeId(),n);
    const _hoisted_1$1v = {
      "xr-layer": "",
      class: "fade"
    };
    const _hoisted_2$1s = /*#__PURE__*/ _withScopeId$3(() => /*#__PURE__*/createBaseVNode("p", null, " Here's some more text just to make things not blank. ", -1 /* HOISTED */));


    var script$1x = {
      props: {
      msg: String
    },
      setup(__props) {



    const shared = inject('shared');

    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock(Fragment, null, [
        createBaseVNode("h1", _hoisted_1$1v, toDisplayString(__props.msg), 1 /* TEXT */),
        _hoisted_2$1s,
        createBaseVNode("button", {
          "xr-layer": "",
          onClick: _cache[0] || (_cache[0] = (...args) => (unref(shared).increment && unref(shared).increment(...args)))
        }, "count is: " + toDisplayString(unref(shared).state.count), 1 /* TEXT */)
      ], 64 /* STABLE_FRAGMENT */))
    }
    }

    };

    script$1x.__scopeId = "data-v-06a9f319";

    const _hoisted_1$1u = { id: "room" };
    const _hoisted_2$1r = /*#__PURE__*/createBaseVNode("img", {
      "xr-layer": "",
      alt: "Vue logo",
      src: _imports_0$E
    }, null, -1 /* HOISTED */);


    var script$1w = {
      setup(__props) {

    let params = inject("params");
    var mesg = params && params.mesg ? params.mesg : "Networked Vue Component with Shared Button Count";

    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1u, [
        _hoisted_2$1r,
        createVNode(script$1x, { msg: unref(mesg) }, null, 8 /* PROPS */, ["msg"]),
        createCommentVNode(" <SomeText msg=\"Networked Vue Component with Shared Button Count\" /> ")
      ]))
    }
    }

    };

    function traverseChildElements(element, each, bind, level = 0) {
        level++;
        element = (element.shadowRoot || element);
        for (let child = element.firstElementChild; child; child = child.nextElementSibling) {
            if (child.assignedSlot)
                continue;
            const assignedElements = child.assignedElements?.({ flatten: true });
            if (assignedElements)
                for (const assigned of assignedElements) {
                    if (each.call(bind, assigned, level)) {
                        traverseChildElements(child, each, bind, level);
                    }
                }
            if (each.call(bind, child, level)) {
                traverseChildElements(child, each, bind, level);
            }
        }
    }
    class Bounds {
        left = 0;
        top = 0;
        width = 0;
        height = 0;
        copy(rect) {
            this.top = rect.top;
            this.left = rect.left;
            this.width = rect.width;
            this.height = rect.height;
            return this;
        }
    }
    class Edges {
        left = 0;
        top = 0;
        right = 0;
        bottom = 0;
        copy(rect) {
            this.top = rect.top;
            this.left = rect.left;
            this.right = rect.right;
            this.bottom = rect.bottom;
            return this;
        }
    }
    function getBounds(element, bounds = new Bounds(), referenceElement) {
        const doc = element.ownerDocument;
        const docEl = doc.documentElement;
        const body = doc.body;
        if (element === docEl) {
            return getDocumentBounds(doc, bounds);
        }
        if (referenceElement === element) {
            bounds.left = 0;
            bounds.top = 0;
            bounds.width = element.offsetWidth;
            bounds.height = element.offsetHeight;
            return;
        }
        const defaultView = element.ownerDocument.defaultView;
        let el = element;
        let computedStyle;
        let offsetParent = el.offsetParent;
        let prevComputedStyle = defaultView.getComputedStyle(el, null);
        let top = el.offsetTop;
        let left = el.offsetLeft;
        if (offsetParent &&
            referenceElement &&
            (offsetParent.contains(referenceElement) ||
                offsetParent.contains(referenceElement.getRootNode().host)) &&
            offsetParent !== referenceElement) {
            getBounds(referenceElement, bounds, offsetParent);
            left -= bounds.left;
            top -= bounds.top;
        }
        while ((el = el.parentElement) &&
            el !== body &&
            el !== docEl &&
            el !== referenceElement) {
            if (prevComputedStyle.position === 'fixed') {
                break;
            }
            computedStyle = defaultView.getComputedStyle(el, null);
            top -= el.scrollTop;
            left -= el.scrollLeft;
            if (el === offsetParent) {
                top += el.offsetTop;
                left += el.offsetLeft;
                top += parseFloat(computedStyle.borderTopWidth) || 0;
                left += parseFloat(computedStyle.borderLeftWidth) || 0;
                offsetParent = el.offsetParent;
            }
            prevComputedStyle = computedStyle;
        }
        // if (prevComputedStyle.position === 'relative' || prevComputedStyle.position === 'static') {
        //   getDocumentBounds(doc, bounds)
        //   top += bounds.top
        //   left += bounds.left
        // }
        if (prevComputedStyle.position === 'fixed') {
            top += Math.max(docEl.scrollTop, body.scrollTop);
            left += Math.max(docEl.scrollLeft, body.scrollLeft);
        }
        // let el = element
        // let left = el.offsetLeft
        // let top = el.offsetTop
        // let offsetParent = el.offsetParent
        // while (el && el.nodeType !== Node.DOCUMENT_NODE) {
        //   left -= el.scrollLeft
        //   top -= el.scrollTop
        //   if (el === offsetParent) {
        //     const style = window.getComputedStyle(el)
        //     left += el.offsetLeft + parseFloat(style.borderLeftWidth!) || 0
        //     top += el.offsetTop + parseFloat(style.borderTopWidth!) || 0
        //     offsetParent = el.offsetParent
        //   }
        //   el = el.offsetParent as any
        // }
        bounds.left = left;
        bounds.top = top;
        bounds.width = element.offsetWidth;
        bounds.height = element.offsetHeight;
        return bounds;
    }
    function getMargin(element, margin) {
        if (element.offsetParent === null) {
            margin.left = margin.right = margin.top = margin.bottom = 0;
            return;
        }
        let style = getComputedStyle(element);
        margin.left = parseFloat(style.marginLeft) || 0;
        margin.right = parseFloat(style.marginRight) || 0;
        margin.top = parseFloat(style.marginTop) || 0;
        margin.bottom = parseFloat(style.marginBottom) || 0;
    }
    function getBorder(element, border) {
        let style = getComputedStyle(element);
        border.left = parseFloat(style.borderLeftWidth) || 0;
        border.right = parseFloat(style.borderRightWidth) || 0;
        border.top = parseFloat(style.borderTopWidth) || 0;
        border.bottom = parseFloat(style.borderBottomWidth) || 0;
    }
    function getPadding(element, padding) {
        let style = getComputedStyle(element);
        padding.left = parseFloat(style.paddingLeft) || 0;
        padding.right = parseFloat(style.paddingRight) || 0;
        padding.top = parseFloat(style.paddingTop) || 0;
        padding.bottom = parseFloat(style.paddingBottom) || 0;
    }
    const viewportTester = document.createElement('div');
    viewportTester.id = 'VIEWPORT';
    viewportTester.style.position = 'fixed';
    viewportTester.style.width = '100vw';
    viewportTester.style.height = '100vh';
    viewportTester.style.visibility = 'hidden';
    viewportTester.style.pointerEvents = 'none';
    function getDocumentBounds(document, bounds) {
        const documentElement = document.documentElement;
        const body = document.body;
        const documentElementStyle = getComputedStyle(documentElement);
        const bodyStyle = getComputedStyle(body);
        bounds.top =
            body.offsetTop + parseFloat(documentElementStyle.marginTop) ||
                0 + parseFloat(bodyStyle.marginTop) ||
                0;
        bounds.left =
            body.offsetLeft + parseFloat(documentElementStyle.marginLeft) ||
                0 + parseFloat(bodyStyle.marginLeft) ||
                0;
        bounds.width = Math.max(Math.max(body.scrollWidth, documentElement.scrollWidth), Math.max(body.offsetWidth, documentElement.offsetWidth), Math.max(body.clientWidth, documentElement.clientWidth));
        bounds.height = Math.max(Math.max(body.scrollHeight, documentElement.scrollHeight), Math.max(body.offsetHeight, documentElement.offsetHeight), Math.max(body.clientHeight, documentElement.clientHeight));
        return bounds;
    }
    function toDOM(html) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        const el = wrapper.firstElementChild;
        wrapper.removeChild(el);
        return el;
    }
    const downloadBlob = function (blob, filename) {
        const a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['application/octet-stream', a.download, a.href].join(':');
        a.click();
    };

    class WebLayer {
        manager;
        element;
        eventCallback;
        isMediaElement = false;
        isVideoElement = false;
        isCanvasElement = false;
        constructor(manager, element, eventCallback) {
            this.manager = manager;
            this.element = element;
            this.eventCallback = eventCallback;
            if (!manager)
                throw new Error("WebLayerManager must be initialized");
            WebRenderer.layers.set(element, this);
            element.setAttribute(WebRenderer.LAYER_ATTRIBUTE, '');
            this.parentLayer = WebRenderer.getClosestLayer(this.element, false);
            this.isVideoElement = element.nodeName === 'VIDEO';
            this.isMediaElement = this.isVideoElement || element.nodeName === 'IMG' || element.nodeName === 'CANVAS';
            this.eventCallback('layercreated', { target: element });
        }
        desiredPseudoState = {
            hover: false,
            active: false,
            focus: false,
            target: false
        };
        needsRefresh = true;
        setNeedsRefresh(recurse = false) {
            this.needsRefresh = true;
            if (recurse)
                for (const c of this.childLayers)
                    c.setNeedsRefresh(recurse);
        }
        needsRemoval = false;
        parentLayer;
        childLayers = [];
        pixelRatio;
        allStateHashes = new Set();
        previousDOMStateKey;
        desiredDOMStateKey;
        currentDOMStateKey;
        get previousDOMState() {
            return this.previousDOMStateKey ? this.manager.getLayerState(this.previousDOMStateKey) : undefined;
        }
        get desiredDOMState() {
            return this.desiredDOMStateKey ? this.manager.getLayerState(this.desiredDOMStateKey) : undefined;
        }
        get currentDOMState() {
            return this.currentDOMStateKey ? this.manager.getLayerState(this.currentDOMStateKey) : undefined;
        }
        domMetrics = {
            bounds: new Bounds(),
            padding: new Edges(),
            margin: new Edges(),
            border: new Edges()
        };
        get depth() {
            let depth = 0;
            let layer = this;
            while (layer.parentLayer) {
                layer = layer.parentLayer;
                depth++;
            }
            return depth;
        }
        get rootLayer() {
            let rootLayer = this;
            while (rootLayer.parentLayer)
                rootLayer = rootLayer.parentLayer;
            return rootLayer;
        }
        traverseParentLayers(each) {
            const parentLayer = this.parentLayer;
            if (parentLayer) {
                parentLayer.traverseParentLayers(each);
                each(parentLayer);
            }
        }
        traverseLayers(each) {
            each(this);
            this.traverseChildLayers(each);
        }
        traverseChildLayers(each) {
            for (const child of this.childLayers) {
                child.traverseLayers(each);
            }
        }
        update() {
            if (this.desiredDOMStateKey !== this.currentDOMStateKey) {
                const desired = this.desiredDOMState;
                if (desired && (this.isMediaElement || desired.texture?.ktx2Url || desired.texture?.canvas || desired.fullWidth * desired.fullHeight === 0)) {
                    this.currentDOMStateKey = this.desiredDOMStateKey;
                }
            }
            const prev = this.previousDOMState?.texture?.ktx2Url ?? this.previousDOMState?.texture?.canvas;
            const current = this.currentDOMState?.texture?.ktx2Url ?? this.previousDOMState?.texture?.canvas;
            if (current && prev !== current) {
                this.eventCallback('layerpainted', { target: this.element });
            }
            this.previousDOMStateKey = this.currentDOMStateKey;
        }
        async refresh() {
            this.needsRefresh = false;
            this._updateParentAndChildLayers();
            const result = await this.manager.addToSerializeQueue(this);
            if (result.needsRasterize && typeof result.stateKey === 'string' && result.svgUrl)
                await this.manager.addToRasterizeQueue(result.stateKey, result.svgUrl);
        }
        _updateParentAndChildLayers() {
            const element = this.element;
            const childLayers = this.childLayers;
            const oldChildLayers = childLayers.slice();
            const previousParentLayer = this.parentLayer;
            this.parentLayer = WebRenderer.getClosestLayer(this.element, false);
            if (previousParentLayer !== this.parentLayer) {
                this.parentLayer && this.parentLayer.childLayers.push(this);
                this.eventCallback('layermoved', { target: element });
            }
            childLayers.length = 0;
            traverseChildElements(element, this._tryConvertElementToWebLayer, this);
            for (const child of oldChildLayers) {
                const parentLayer = WebRenderer.getClosestLayer(child.element, false);
                if (!parentLayer) {
                    child.needsRemoval = true;
                    childLayers.push(child);
                }
            }
        }
        _tryConvertElementToWebLayer(n) {
            if (this.needsRemoval)
                return false;
            const el = n;
            const styles = getComputedStyle(el);
            const isLayer = el.hasAttribute(WebRenderer.LAYER_ATTRIBUTE);
            if (isLayer || el.nodeName === 'VIDEO' || styles.transform !== 'none') {
                let child = WebRenderer.layers.get(el);
                if (!child) {
                    child = new WebLayer(this.manager, el, this.eventCallback);
                }
                this.childLayers.push(child);
                return false; // stop traversing this subtree
            }
            return true;
        }
    }

    var resizeObservers = [];

    var hasActiveObservations = function () {
        return resizeObservers.some(function (ro) { return ro.activeTargets.length > 0; });
    };

    var hasSkippedObservations = function () {
        return resizeObservers.some(function (ro) { return ro.skippedTargets.length > 0; });
    };

    var msg = 'ResizeObserver loop completed with undelivered notifications.';
    var deliverResizeLoopError = function () {
        var event;
        if (typeof ErrorEvent === 'function') {
            event = new ErrorEvent('error', {
                message: msg
            });
        }
        else {
            event = document.createEvent('Event');
            event.initEvent('error', false, false);
            event.message = msg;
        }
        window.dispatchEvent(event);
    };

    var ResizeObserverBoxOptions;
    (function (ResizeObserverBoxOptions) {
        ResizeObserverBoxOptions["BORDER_BOX"] = "border-box";
        ResizeObserverBoxOptions["CONTENT_BOX"] = "content-box";
        ResizeObserverBoxOptions["DEVICE_PIXEL_CONTENT_BOX"] = "device-pixel-content-box";
    })(ResizeObserverBoxOptions || (ResizeObserverBoxOptions = {}));

    var freeze = function (obj) { return Object.freeze(obj); };

    var ResizeObserverSize = (function () {
        function ResizeObserverSize(inlineSize, blockSize) {
            this.inlineSize = inlineSize;
            this.blockSize = blockSize;
            freeze(this);
        }
        return ResizeObserverSize;
    }());

    var DOMRectReadOnly = (function () {
        function DOMRectReadOnly(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.top = this.y;
            this.left = this.x;
            this.bottom = this.top + this.height;
            this.right = this.left + this.width;
            return freeze(this);
        }
        DOMRectReadOnly.prototype.toJSON = function () {
            var _a = this, x = _a.x, y = _a.y, top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left, width = _a.width, height = _a.height;
            return { x: x, y: y, top: top, right: right, bottom: bottom, left: left, width: width, height: height };
        };
        DOMRectReadOnly.fromRect = function (rectangle) {
            return new DOMRectReadOnly(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        };
        return DOMRectReadOnly;
    }());

    var isSVG = function (target) { return target instanceof SVGElement && 'getBBox' in target; };
    var isHidden = function (target) {
        if (isSVG(target)) {
            var _a = target.getBBox(), width = _a.width, height = _a.height;
            return !width && !height;
        }
        var _b = target, offsetWidth = _b.offsetWidth, offsetHeight = _b.offsetHeight;
        return !(offsetWidth || offsetHeight || target.getClientRects().length);
    };
    var isElement = function (obj) {
        var _a, _b;
        if (obj instanceof Element) {
            return true;
        }
        var scope = (_b = (_a = obj) === null || _a === void 0 ? void 0 : _a.ownerDocument) === null || _b === void 0 ? void 0 : _b.defaultView;
        return !!(scope && obj instanceof scope.Element);
    };
    var isReplacedElement = function (target) {
        switch (target.tagName) {
            case 'INPUT':
                if (target.type !== 'image') {
                    break;
                }
            case 'VIDEO':
            case 'AUDIO':
            case 'EMBED':
            case 'OBJECT':
            case 'CANVAS':
            case 'IFRAME':
            case 'IMG':
                return true;
        }
        return false;
    };

    var global$1 = typeof window !== 'undefined' ? window : {};

    var cache = new WeakMap();
    var scrollRegexp = /auto|scroll/;
    var verticalRegexp = /^tb|vertical/;
    var IE = (/msie|trident/i).test(global$1.navigator && global$1.navigator.userAgent);
    var parseDimension = function (pixel) { return parseFloat(pixel || '0'); };
    var size = function (inlineSize, blockSize, switchSizes) {
        if (inlineSize === void 0) { inlineSize = 0; }
        if (blockSize === void 0) { blockSize = 0; }
        if (switchSizes === void 0) { switchSizes = false; }
        return new ResizeObserverSize((switchSizes ? blockSize : inlineSize) || 0, (switchSizes ? inlineSize : blockSize) || 0);
    };
    var zeroBoxes = freeze({
        devicePixelContentBoxSize: size(),
        borderBoxSize: size(),
        contentBoxSize: size(),
        contentRect: new DOMRectReadOnly(0, 0, 0, 0)
    });
    var calculateBoxSizes = function (target, forceRecalculation) {
        if (forceRecalculation === void 0) { forceRecalculation = false; }
        if (cache.has(target) && !forceRecalculation) {
            return cache.get(target);
        }
        if (isHidden(target)) {
            cache.set(target, zeroBoxes);
            return zeroBoxes;
        }
        var cs = getComputedStyle(target);
        var svg = isSVG(target) && target.ownerSVGElement && target.getBBox();
        var removePadding = !IE && cs.boxSizing === 'border-box';
        var switchSizes = verticalRegexp.test(cs.writingMode || '');
        var canScrollVertically = !svg && scrollRegexp.test(cs.overflowY || '');
        var canScrollHorizontally = !svg && scrollRegexp.test(cs.overflowX || '');
        var paddingTop = svg ? 0 : parseDimension(cs.paddingTop);
        var paddingRight = svg ? 0 : parseDimension(cs.paddingRight);
        var paddingBottom = svg ? 0 : parseDimension(cs.paddingBottom);
        var paddingLeft = svg ? 0 : parseDimension(cs.paddingLeft);
        var borderTop = svg ? 0 : parseDimension(cs.borderTopWidth);
        var borderRight = svg ? 0 : parseDimension(cs.borderRightWidth);
        var borderBottom = svg ? 0 : parseDimension(cs.borderBottomWidth);
        var borderLeft = svg ? 0 : parseDimension(cs.borderLeftWidth);
        var horizontalPadding = paddingLeft + paddingRight;
        var verticalPadding = paddingTop + paddingBottom;
        var horizontalBorderArea = borderLeft + borderRight;
        var verticalBorderArea = borderTop + borderBottom;
        var horizontalScrollbarThickness = !canScrollHorizontally ? 0 : target.offsetHeight - verticalBorderArea - target.clientHeight;
        var verticalScrollbarThickness = !canScrollVertically ? 0 : target.offsetWidth - horizontalBorderArea - target.clientWidth;
        var widthReduction = removePadding ? horizontalPadding + horizontalBorderArea : 0;
        var heightReduction = removePadding ? verticalPadding + verticalBorderArea : 0;
        var contentWidth = svg ? svg.width : parseDimension(cs.width) - widthReduction - verticalScrollbarThickness;
        var contentHeight = svg ? svg.height : parseDimension(cs.height) - heightReduction - horizontalScrollbarThickness;
        var borderBoxWidth = contentWidth + horizontalPadding + verticalScrollbarThickness + horizontalBorderArea;
        var borderBoxHeight = contentHeight + verticalPadding + horizontalScrollbarThickness + verticalBorderArea;
        var boxes = freeze({
            devicePixelContentBoxSize: size(Math.round(contentWidth * devicePixelRatio), Math.round(contentHeight * devicePixelRatio), switchSizes),
            borderBoxSize: size(borderBoxWidth, borderBoxHeight, switchSizes),
            contentBoxSize: size(contentWidth, contentHeight, switchSizes),
            contentRect: new DOMRectReadOnly(paddingLeft, paddingTop, contentWidth, contentHeight)
        });
        cache.set(target, boxes);
        return boxes;
    };
    var calculateBoxSize = function (target, observedBox, forceRecalculation) {
        var _a = calculateBoxSizes(target, forceRecalculation), borderBoxSize = _a.borderBoxSize, contentBoxSize = _a.contentBoxSize, devicePixelContentBoxSize = _a.devicePixelContentBoxSize;
        switch (observedBox) {
            case ResizeObserverBoxOptions.DEVICE_PIXEL_CONTENT_BOX:
                return devicePixelContentBoxSize;
            case ResizeObserverBoxOptions.BORDER_BOX:
                return borderBoxSize;
            default:
                return contentBoxSize;
        }
    };

    var ResizeObserverEntry = (function () {
        function ResizeObserverEntry(target) {
            var boxes = calculateBoxSizes(target);
            this.target = target;
            this.contentRect = boxes.contentRect;
            this.borderBoxSize = freeze([boxes.borderBoxSize]);
            this.contentBoxSize = freeze([boxes.contentBoxSize]);
            this.devicePixelContentBoxSize = freeze([boxes.devicePixelContentBoxSize]);
        }
        return ResizeObserverEntry;
    }());

    var calculateDepthForNode = function (node) {
        if (isHidden(node)) {
            return Infinity;
        }
        var depth = 0;
        var parent = node.parentNode;
        while (parent) {
            depth += 1;
            parent = parent.parentNode;
        }
        return depth;
    };

    var broadcastActiveObservations = function () {
        var shallowestDepth = Infinity;
        var callbacks = [];
        resizeObservers.forEach(function processObserver(ro) {
            if (ro.activeTargets.length === 0) {
                return;
            }
            var entries = [];
            ro.activeTargets.forEach(function processTarget(ot) {
                var entry = new ResizeObserverEntry(ot.target);
                var targetDepth = calculateDepthForNode(ot.target);
                entries.push(entry);
                ot.lastReportedSize = calculateBoxSize(ot.target, ot.observedBox);
                if (targetDepth < shallowestDepth) {
                    shallowestDepth = targetDepth;
                }
            });
            callbacks.push(function resizeObserverCallback() {
                ro.callback.call(ro.observer, entries, ro.observer);
            });
            ro.activeTargets.splice(0, ro.activeTargets.length);
        });
        for (var _i = 0, callbacks_1 = callbacks; _i < callbacks_1.length; _i++) {
            var callback = callbacks_1[_i];
            callback();
        }
        return shallowestDepth;
    };

    var gatherActiveObservationsAtDepth = function (depth) {
        resizeObservers.forEach(function processObserver(ro) {
            ro.activeTargets.splice(0, ro.activeTargets.length);
            ro.skippedTargets.splice(0, ro.skippedTargets.length);
            ro.observationTargets.forEach(function processTarget(ot) {
                if (ot.isActive()) {
                    if (calculateDepthForNode(ot.target) > depth) {
                        ro.activeTargets.push(ot);
                    }
                    else {
                        ro.skippedTargets.push(ot);
                    }
                }
            });
        });
    };

    var process = function () {
        var depth = 0;
        gatherActiveObservationsAtDepth(depth);
        while (hasActiveObservations()) {
            depth = broadcastActiveObservations();
            gatherActiveObservationsAtDepth(depth);
        }
        if (hasSkippedObservations()) {
            deliverResizeLoopError();
        }
        return depth > 0;
    };

    var trigger;
    var callbacks = [];
    var notify = function () { return callbacks.splice(0).forEach(function (cb) { return cb(); }); };
    var queueMicroTask = function (callback) {
        if (!trigger) {
            var toggle_1 = 0;
            var el_1 = document.createTextNode('');
            var config = { characterData: true };
            new MutationObserver(function () { return notify(); }).observe(el_1, config);
            trigger = function () { el_1.textContent = "" + (toggle_1 ? toggle_1-- : toggle_1++); };
        }
        callbacks.push(callback);
        trigger();
    };

    var queueResizeObserver = function (cb) {
        queueMicroTask(function ResizeObserver() {
            requestAnimationFrame(cb);
        });
    };

    var watching = 0;
    var isWatching = function () { return !!watching; };
    var CATCH_PERIOD = 250;
    var observerConfig = { attributes: true, characterData: true, childList: true, subtree: true };
    var events = [
        'resize',
        'load',
        'transitionend',
        'animationend',
        'animationstart',
        'animationiteration',
        'keyup',
        'keydown',
        'mouseup',
        'mousedown',
        'mouseover',
        'mouseout',
        'blur',
        'focus'
    ];
    var time = function (timeout) {
        if (timeout === void 0) { timeout = 0; }
        return Date.now() + timeout;
    };
    var scheduled = false;
    var Scheduler = (function () {
        function Scheduler() {
            var _this = this;
            this.stopped = true;
            this.listener = function () { return _this.schedule(); };
        }
        Scheduler.prototype.run = function (timeout) {
            var _this = this;
            if (timeout === void 0) { timeout = CATCH_PERIOD; }
            if (scheduled) {
                return;
            }
            scheduled = true;
            var until = time(timeout);
            queueResizeObserver(function () {
                var elementsHaveResized = false;
                try {
                    elementsHaveResized = process();
                }
                finally {
                    scheduled = false;
                    timeout = until - time();
                    if (!isWatching()) {
                        return;
                    }
                    if (elementsHaveResized) {
                        _this.run(1000);
                    }
                    else if (timeout > 0) {
                        _this.run(timeout);
                    }
                    else {
                        _this.start();
                    }
                }
            });
        };
        Scheduler.prototype.schedule = function () {
            this.stop();
            this.run();
        };
        Scheduler.prototype.observe = function () {
            var _this = this;
            var cb = function () { return _this.observer && _this.observer.observe(document.body, observerConfig); };
            document.body ? cb() : global$1.addEventListener('DOMContentLoaded', cb);
        };
        Scheduler.prototype.start = function () {
            var _this = this;
            if (this.stopped) {
                this.stopped = false;
                this.observer = new MutationObserver(this.listener);
                this.observe();
                events.forEach(function (name) { return global$1.addEventListener(name, _this.listener, true); });
            }
        };
        Scheduler.prototype.stop = function () {
            var _this = this;
            if (!this.stopped) {
                this.observer && this.observer.disconnect();
                events.forEach(function (name) { return global$1.removeEventListener(name, _this.listener, true); });
                this.stopped = true;
            }
        };
        return Scheduler;
    }());
    var scheduler = new Scheduler();
    var updateCount = function (n) {
        !watching && n > 0 && scheduler.start();
        watching += n;
        !watching && scheduler.stop();
    };

    var skipNotifyOnElement = function (target) {
        return !isSVG(target)
            && !isReplacedElement(target)
            && getComputedStyle(target).display === 'inline';
    };
    var ResizeObservation = (function () {
        function ResizeObservation(target, observedBox) {
            this.target = target;
            this.observedBox = observedBox || ResizeObserverBoxOptions.CONTENT_BOX;
            this.lastReportedSize = {
                inlineSize: 0,
                blockSize: 0
            };
        }
        ResizeObservation.prototype.isActive = function () {
            var size = calculateBoxSize(this.target, this.observedBox, true);
            if (skipNotifyOnElement(this.target)) {
                this.lastReportedSize = size;
            }
            if (this.lastReportedSize.inlineSize !== size.inlineSize
                || this.lastReportedSize.blockSize !== size.blockSize) {
                return true;
            }
            return false;
        };
        return ResizeObservation;
    }());

    var ResizeObserverDetail = (function () {
        function ResizeObserverDetail(resizeObserver, callback) {
            this.activeTargets = [];
            this.skippedTargets = [];
            this.observationTargets = [];
            this.observer = resizeObserver;
            this.callback = callback;
        }
        return ResizeObserverDetail;
    }());

    var observerMap = new WeakMap();
    var getObservationIndex = function (observationTargets, target) {
        for (var i = 0; i < observationTargets.length; i += 1) {
            if (observationTargets[i].target === target) {
                return i;
            }
        }
        return -1;
    };
    var ResizeObserverController = (function () {
        function ResizeObserverController() {
        }
        ResizeObserverController.connect = function (resizeObserver, callback) {
            var detail = new ResizeObserverDetail(resizeObserver, callback);
            observerMap.set(resizeObserver, detail);
        };
        ResizeObserverController.observe = function (resizeObserver, target, options) {
            var detail = observerMap.get(resizeObserver);
            var firstObservation = detail.observationTargets.length === 0;
            if (getObservationIndex(detail.observationTargets, target) < 0) {
                firstObservation && resizeObservers.push(detail);
                detail.observationTargets.push(new ResizeObservation(target, options && options.box));
                updateCount(1);
                scheduler.schedule();
            }
        };
        ResizeObserverController.unobserve = function (resizeObserver, target) {
            var detail = observerMap.get(resizeObserver);
            var index = getObservationIndex(detail.observationTargets, target);
            var lastObservation = detail.observationTargets.length === 1;
            if (index >= 0) {
                lastObservation && resizeObservers.splice(resizeObservers.indexOf(detail), 1);
                detail.observationTargets.splice(index, 1);
                updateCount(-1);
            }
        };
        ResizeObserverController.disconnect = function (resizeObserver) {
            var _this = this;
            var detail = observerMap.get(resizeObserver);
            detail.observationTargets.slice().forEach(function (ot) { return _this.unobserve(resizeObserver, ot.target); });
            detail.activeTargets.splice(0, detail.activeTargets.length);
        };
        return ResizeObserverController;
    }());

    var ResizeObserver$1 = (function () {
        function ResizeObserver(callback) {
            if (arguments.length === 0) {
                throw new TypeError("Failed to construct 'ResizeObserver': 1 argument required, but only 0 present.");
            }
            if (typeof callback !== 'function') {
                throw new TypeError("Failed to construct 'ResizeObserver': The callback provided as parameter 1 is not a function.");
            }
            ResizeObserverController.connect(this, callback);
        }
        ResizeObserver.prototype.observe = function (target, options) {
            if (arguments.length === 0) {
                throw new TypeError("Failed to execute 'observe' on 'ResizeObserver': 1 argument required, but only 0 present.");
            }
            if (!isElement(target)) {
                throw new TypeError("Failed to execute 'observe' on 'ResizeObserver': parameter 1 is not of type 'Element");
            }
            ResizeObserverController.observe(this, target, options);
        };
        ResizeObserver.prototype.unobserve = function (target) {
            if (arguments.length === 0) {
                throw new TypeError("Failed to execute 'unobserve' on 'ResizeObserver': 1 argument required, but only 0 present.");
            }
            if (!isElement(target)) {
                throw new TypeError("Failed to execute 'unobserve' on 'ResizeObserver': parameter 1 is not of type 'Element");
            }
            ResizeObserverController.unobserve(this, target);
        };
        ResizeObserver.prototype.disconnect = function () {
            ResizeObserverController.disconnect(this);
        };
        ResizeObserver.toString = function () {
            return 'function ResizeObserver () { [polyfill code] }';
        };
        return ResizeObserver;
    }());

    const ResizeObserver = self.ResizeObserver || ResizeObserver$1;
    function ensureElementIsInDocument(element, options) {
        if (document.contains(element)) {
            return element;
        }
        const container = document.createElement('div');
        container.id = element.id ? 'container-' + element.id : 'container';
        container.setAttribute(WebRenderer.RENDERING_CONTAINER_ATTRIBUTE, '');
        container.style.visibility = 'hidden';
        container.style.pointerEvents = 'none';
        container.style.touchAction = 'none';
        const containerShadow = container.attachShadow({ mode: 'open' });
        containerShadow.appendChild(element);
        document.documentElement.appendChild(container);
        return container;
    }
    const scratchMat1 = new three.Matrix4();
    const scratchMat2 = new three.Matrix4();
    class WebRenderer {
        static ATTRIBUTE_PREFIX = 'xr';
        static get HOVER_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-hover'; }
        static get ACTIVE_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-active'; }
        static get FOCUS_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-focus'; }
        static get TARGET_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-target'; }
        static get LAYER_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-layer'; }
        static get PIXEL_RATIO_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-pixel-ratio'; }
        static get RENDERING_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering'; }
        static get RENDERING_PARENT_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering-parent'; }
        static get RENDERING_CONTAINER_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering-container'; }
        static get RENDERING_INLINE_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering-inline'; }
        static get RENDERING_DOCUMENT_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering-document'; }
        static serializer = new XMLSerializer();
        // static containsHover(element: Element) {
        //   for (const t of this.virtualHoverElements) {
        //     if (element.contains(t)) return true
        //   }
        //   return false
        // }
        static getPsuedoAttributes(states) {
            return (`${states.hover ? `${this.HOVER_ATTRIBUTE}="" ` : ' '}` +
                `${states.focus ? `${this.FOCUS_ATTRIBUTE}="" ` : ' '}` +
                `${states.active ? `${this.ACTIVE_ATTRIBUTE}="" ` : ' '}` +
                `${states.target ? `${this.TARGET_ATTRIBUTE}="" ` : ' '}`);
        }
        static rootLayers = new Map();
        static layers = new Map();
        static focusElement = null; // i.e., element is ready to receive input
        static activeElement = null; // i.e., button element is being "pressed down"
        static targetElement = null; // i.e., the element whose ID matches the url #hash
        static mutationObservers = new Map();
        static resizeObservers = new Map();
        // static readonly virtualHoverElements = new Set<Element>()
        static rootNodeObservers = new Map();
        static containerStyleElement;
        static initRootNodeObservation(element) {
            const document = element.ownerDocument;
            const rootNode = element.getRootNode();
            const styleRoot = 'head' in rootNode ? rootNode.head : rootNode;
            if (this.rootNodeObservers.get(rootNode))
                return;
            if (!this.containerStyleElement) {
                const containerStyle = this.containerStyleElement = document.createElement('style');
                document.head.appendChild(containerStyle);
                containerStyle.innerHTML = `
        [${WebRenderer.RENDERING_CONTAINER_ATTRIBUTE}] {
          all: initial;
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0px;
        }
      `;
            }
            const renderingStyles = `
    :host [${WebRenderer.LAYER_ATTRIBUTE}] {
      display: flow-root;
    }

    [${WebRenderer.RENDERING_DOCUMENT_ATTRIBUTE}] * {
      transform: none !important;
    }

    [${WebRenderer.RENDERING_ATTRIBUTE}], [${WebRenderer.RENDERING_ATTRIBUTE}] * {
      visibility: visible !important;
      /* the following is a hack for Safari; 
      without some kind of css filter active, 
      any box-shadow effect will fail to rasterize properly */
      filter: opacity(1);
    }
    
    [${WebRenderer.RENDERING_ATTRIBUTE}] [${WebRenderer.LAYER_ATTRIBUTE}], [${WebRenderer.RENDERING_ATTRIBUTE}] [${WebRenderer.LAYER_ATTRIBUTE}] * {
      visibility: hidden !important;
    }

    [${WebRenderer.RENDERING_ATTRIBUTE}] {
      position: relative !important;
      top: 0 !important;
      left: 0 !important;
      float: left !important; /* prevent margin-collapse in SVG foreign-element for Webkit */
      box-sizing:border-box;
      min-width:var(--x-width);
      min-height:var(--x-height);
    }
    
    [${WebRenderer.RENDERING_INLINE_ATTRIBUTE}] {
      top: var(--x-inline-top) !important;
      width:auto !important;
    }

    [${WebRenderer.RENDERING_PARENT_ATTRIBUTE}] {
      transform: none !important;
      left: 0 !important;
      top: 0 !important;
      margin: 0 !important;
      border:0 !important;
      border-radius:0 !important;
      width: 100% !important;
      height:100% !important;
      padding:0 !important;
      visibility:hidden !important;
      filter:none !important;
    }
    
    [${WebRenderer.RENDERING_PARENT_ATTRIBUTE}]::before, [${WebRenderer.RENDERING_PARENT_ATTRIBUTE}]::after {
      content:none !important;
      box-shadow:none !important;
    }
    `;
            const style = document.createElement('style');
            style.textContent = renderingStyles;
            styleRoot.append(style); // otherwise stylesheet is not created
            if (rootNode === document) {
                let previousHash = '';
                const onHashChange = () => {
                    if (previousHash != window.location.hash) {
                        if (window.location.hash) {
                            try {
                                // @ts-ignore()
                                this.targetElement = rootNode.querySelector(window.location.hash);
                            }
                            catch { }
                        }
                    }
                    previousHash = window.location.hash;
                };
                window.addEventListener('hashchange', onHashChange, false);
                onHashChange();
                window.addEventListener('focusin', (evt) => {
                    // @ts-ignore
                    this.focusElement = evt.target;
                }, false);
                window.addEventListener('focusout', (evt) => {
                    // @ts-ignore
                    this.focusElement = null;
                }, false);
                window.addEventListener('load', (event) => {
                    setNeedsRefreshOnAllLayers();
                });
            }
            const setNeedsRefreshOnAllLayers = () => {
                for (const [e, l] of this.layers)
                    l.needsRefresh = true;
            };
            const setNeedsRefreshOnStyleLoad = (node) => {
                var nodeName = node.nodeName.toUpperCase();
                if (STYLE_NODES.indexOf(nodeName) !== -1)
                    node.addEventListener("load", setNeedsRefreshOnAllLayers);
            };
            const STYLE_NODES = ["STYLE", "LINK"];
            const observer = new MutationObserver((mutations) => {
                for (const m of mutations) {
                    if (STYLE_NODES.indexOf(m.target.nodeName.toUpperCase()) !== -1) {
                        setNeedsRefreshOnAllLayers();
                        // this.embeddedCSS.get(document)?.delete(m.target as Element)
                    }
                    for (const node of m.addedNodes)
                        setNeedsRefreshOnStyleLoad(node);
                }
            });
            observer.observe(document, {
                childList: true,
                attributes: true,
                characterData: true,
                subtree: true,
                attributeOldValue: true,
                characterDataOldValue: true
            });
            this.rootNodeObservers.set(rootNode, observer);
        }
        static setLayerNeedsRefresh(layer) {
            layer.needsRefresh = true;
        }
        static createLayerTree(element, options, eventCallback) {
            if (WebRenderer.getClosestLayer(element))
                throw new Error('A root WebLayer for the given element already exists');
            const containerElement = ensureElementIsInDocument(element);
            WebRenderer.initRootNodeObservation(element);
            const observer = new MutationObserver(WebRenderer._handleMutations);
            this.mutationObservers.set(element, observer);
            this.startMutationObserver(element);
            const resizeObserver = new ResizeObserver(records => {
                for (const record of records) {
                    const layer = this.getClosestLayer(record.target);
                    layer.traverseLayers(WebRenderer.setLayerNeedsRefresh);
                    layer.traverseParentLayers(WebRenderer.setLayerNeedsRefresh);
                }
            });
            resizeObserver.observe(element);
            this.resizeObservers.set(element, resizeObserver);
            element.addEventListener('input', this._triggerRefresh, { capture: true });
            element.addEventListener('keydown', this._triggerRefresh, { capture: true });
            element.addEventListener('submit', this._triggerRefresh, { capture: true });
            element.addEventListener('change', this._triggerRefresh, { capture: true });
            element.addEventListener('focus', this._triggerRefresh, { capture: true });
            element.addEventListener('blur', this._triggerRefresh, { capture: true });
            element.addEventListener('transitionend', this._triggerRefresh, { capture: true });
            const layer = new WebLayer(options.manager, element, eventCallback);
            this.rootLayers.set(element, layer);
            return containerElement;
        }
        static disposeLayer(layer) {
            if (this.rootLayers.has(layer.element)) {
                this.rootLayers.delete(layer.element);
                const observer = this.mutationObservers.get(layer.element);
                observer.disconnect();
                this.mutationObservers.delete(layer.element);
                const resizeObserver = this.resizeObservers.get(layer.element);
                resizeObserver.disconnect();
                this.resizeObservers.delete(layer.element);
                layer.element.removeEventListener('input', this._triggerRefresh, { capture: true });
                layer.element.removeEventListener('keydown', this._triggerRefresh, { capture: true });
                layer.element.removeEventListener('submit', this._triggerRefresh, { capture: true });
                layer.element.removeEventListener('change', this._triggerRefresh, { capture: true });
                layer.element.removeEventListener('focus', this._triggerRefresh, { capture: true });
                layer.element.removeEventListener('blur', this._triggerRefresh, { capture: true });
                layer.element.removeEventListener('transitionend', this._triggerRefresh, { capture: true });
            }
        }
        static getClosestLayer(element, inclusive = true) {
            let targetElement = inclusive ? element : element.parentElement;
            const closestLayerElement = targetElement?.closest(`[${WebRenderer.LAYER_ATTRIBUTE}]`);
            if (!closestLayerElement) {
                const host = element?.getRootNode().host;
                if (host) {
                    return this.getClosestLayer(host, inclusive);
                }
            }
            return this.layers.get(closestLayerElement);
        }
        static parseCSSTransform(computedStyle, width, height, pixelSize, out = new three.Matrix4()) {
            const transform = computedStyle.transform;
            const transformOrigin = computedStyle.transformOrigin;
            if (transform.indexOf('matrix(') == 0) {
                out.identity();
                var mat = transform
                    .substring(7, transform.length - 1)
                    .split(', ')
                    .map(parseFloat);
                out.elements[0] = mat[0];
                out.elements[1] = mat[1];
                out.elements[4] = mat[2];
                out.elements[5] = mat[3];
                out.elements[12] = mat[4];
                out.elements[13] = mat[5];
            }
            else if (transform.indexOf('matrix3d(') == 0) {
                var mat = transform
                    .substring(9, transform.length - 1)
                    .split(', ')
                    .map(parseFloat);
                out.fromArray(mat);
            }
            else {
                return null;
            }
            if (out.elements[0] === 0)
                out.elements[0] = 1e-15;
            if (out.elements[5] === 0)
                out.elements[5] = 1e-15;
            if (out.elements[10] === 0)
                out.elements[10] = 1e-15;
            out.elements[12] *= pixelSize;
            out.elements[13] *= pixelSize * -1;
            var origin = transformOrigin.split(' ').map(parseFloat);
            var ox = (origin[0] - width / 2) * pixelSize;
            var oy = (origin[1] - height / 2) * pixelSize * -1;
            var oz = origin[2] || 0;
            var T1 = scratchMat1.identity().makeTranslation(-ox, -oy, -oz);
            var T2 = scratchMat2.identity().makeTranslation(ox, oy, oz);
            for (const e of out.elements) {
                if (isNaN(e))
                    return null;
            }
            return out.premultiply(T2).multiply(T1);
        }
        static pauseMutationObservers() {
            const mutationObservers = WebRenderer.mutationObservers.values();
            for (const m of mutationObservers) {
                WebRenderer._handleMutations(m.takeRecords());
                m.disconnect();
            }
        }
        static resumeMutationObservers() {
            for (const [e] of WebRenderer.mutationObservers) {
                this.startMutationObserver(e);
            }
        }
        static startMutationObserver(element) {
            const observer = WebRenderer.mutationObservers.get(element);
            observer.observe(element, {
                attributes: true,
                childList: true,
                subtree: true,
                characterData: true,
                characterDataOldValue: true,
                attributeOldValue: true
            });
        }
        static _handleMutations = (records) => {
            for (const record of records) {
                if (record.type === 'attributes') {
                    const target = record.target;
                    if (target.getAttribute(record.attributeName) === record.oldValue) {
                        continue;
                    }
                }
                if (record.type === 'characterData') {
                    const target = record.target;
                    if (target.data === record.oldValue) {
                        continue;
                    }
                    if (target.parentElement?.tagName.toLowerCase() === 'style') {
                        // if the style tag has changed, we need to remove it from the embedded styles cache
                        // to reprocess later
                        const style = target.parentElement;
                        const rootNode = style.getRootNode();
                        this.embeddedStyles.get(rootNode)?.delete(style);
                    }
                }
                const target = record.target.nodeType === Node.ELEMENT_NODE
                    ? record.target
                    : record.target.parentElement;
                if (!target)
                    continue;
                const layer = WebRenderer.getClosestLayer(target);
                if (!layer)
                    continue;
                if (record.type === 'attributes' && record.attributeName === 'class') {
                    const oldClasses = record.oldValue ? record.oldValue : '';
                    const currentClasses = record.target.className;
                    if (oldClasses === currentClasses)
                        continue;
                }
                // layer.traverseParentLayers(WebRenderer.setLayerNeedsRefresh) // may be needed to support :focus-within() and future :has() selector support
                layer.parentLayer
                    ? layer.parentLayer.traverseChildLayers(WebRenderer.setLayerNeedsRefresh)
                    : layer.traverseLayers(WebRenderer.setLayerNeedsRefresh);
            }
        };
        static _triggerRefresh = async (e) => {
            const layer = WebRenderer.getClosestLayer(e.target);
            // WebRenderer.updateInputAttributes(e.target as any)
            if (layer) {
                // layer.traverseParentLayers(WebRenderer.setLayerNeedsRefresh) // may be needed to support :focus-within() and future :has() selector support
                layer.parentLayer
                    ? layer.parentLayer.traverseChildLayers(WebRenderer.setLayerNeedsRefresh)
                    : layer.traverseLayers(WebRenderer.setLayerNeedsRefresh);
            }
        };
        // private static _addDynamicPseudoClassRules(doc:Document|ShadowRoot) {
        //   const sheets = doc.styleSheets
        //   for (let i = 0; i < sheets.length; i++) {
        //     try {
        //       const sheet = sheets[i] as CSSStyleSheet
        //       const rules = sheet.cssRules
        //       if (!rules) continue
        //       const newRules = []
        //       for (var j = 0; j < rules.length; j++) {
        //         if (rules[j].cssText.indexOf(':hover') > -1) {
        //           newRules.push(rules[j].cssText.replace(new RegExp(':hover', 'g'), `[${WebRenderer.HOVER_ATTRIBUTE}]`))
        //         }
        //         if (rules[j].cssText.indexOf(':active') > -1) {
        //           newRules.push(
        //             rules[j].cssText.replace(new RegExp(':active', 'g'), `[${WebRenderer.ACTIVE_ATTRIBUTE}]`)
        //           )
        //         }
        //         if (rules[j].cssText.indexOf(':focus') > -1) {
        //           newRules.push(rules[j].cssText.replace(new RegExp(':focus', 'g'), `[${WebRenderer.FOCUS_ATTRIBUTE}]`))
        //         }
        //         if (rules[j].cssText.indexOf(':target') > -1) {
        //           newRules.push(
        //             rules[j].cssText.replace(new RegExp(':target', 'g'), `[${WebRenderer.TARGET_ATTRIBUTE}]`)
        //           )
        //         }
        //         var idx = newRules.indexOf(rules[j].cssText)
        //         if (idx > -1) {
        //           newRules.splice(idx, 1)
        //         }
        //       }
        //       for (var j = 0; j < newRules.length; j++) {
        //         sheet.insertRule(newRules[j])
        //       }
        //     } catch (e) {}
        //   }
        // }
        static arrayBufferToBase64(bytes) {
            var binary = '';
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }
        static attributeCSS(name, value) {
            return value ? `[${name}]=${value}` : `[${name}]`;
        }
        static attributeHTML(name, value) {
            return value ? `${name}="${value}"` : `${name}=""`;
        }
        static async generateEmbeddedCSS(url, css) {
            let found;
            const promises = [];
            // Add classes for psuedo-classes
            css = css.replace(new RegExp(':hover', 'g'), this.attributeCSS(this.HOVER_ATTRIBUTE));
            css = css.replace(new RegExp(':active', 'g'), this.attributeCSS(this.ACTIVE_ATTRIBUTE));
            css = css.replace(new RegExp(':focus', 'g'), this.attributeCSS(this.FOCUS_ATTRIBUTE));
            css = css.replace(new RegExp(':target', 'g'), this.attributeCSS(this.TARGET_ATTRIBUTE));
            // Replace all urls in the css
            const regEx = RegExp(/(@import.*?["']([^"']+)["'].*?|url\((?!['"]?(?:data):)['"]?([^'"\)]*)['"]?\))/gi);
            while ((found = regEx.exec(css))) {
                const isCSSImport = !!found[2];
                const accept = isCSSImport ? 'type/css' : undefined;
                const resourceURL = found[2] || found[3];
                promises.push(this.getDataURL(new URL(resourceURL, url).href, accept).then(dataURL => {
                    css = css.replace(resourceURL, dataURL);
                }));
            }
            await Promise.all(promises);
            return css;
        }
        static embeddedStyles = new Map();
        static fontStyles = new Map();
        static async getAllEmbeddedStyles(el) {
            const rootNode = el.getRootNode();
            const embedded = this.embeddedStyles.get(rootNode) || new Map();
            this.embeddedStyles.set(rootNode, embedded);
            const styleElements = Array.from(rootNode.querySelectorAll("style, link[type='text/css'], link[rel='stylesheet']"));
            const inShadow = el.getRootNode() instanceof ShadowRoot;
            // let foundNewStyles = false
            for (const element of styleElements) {
                if (!embedded.has(element)) {
                    // foundNewStyles = true
                    embedded.set(element, new Promise(resolve => {
                        if (element.tagName.toLowerCase() === 'style') {
                            resolve(element.textContent || '');
                        }
                        else {
                            const link = element;
                            resolve(this.getEmbeddedCSS(link.href));
                        }
                    }).then((cssText) => {
                        const regEx = RegExp(/@font-face[^{]*{([^{}]|{[^{}]*})*}/gi);
                        const fontRules = cssText.match(regEx);
                        // if we are inside shadow dom, we have to clone the fonts
                        // into the light dom to load fonts in Chrome/Firefox
                        if (inShadow && fontRules) {
                            for (const rule of fontRules) {
                                if (this.fontStyles.has(rule))
                                    continue;
                                const fontStyle = document.createElement('style');
                                fontStyle.innerHTML = fontRules.reduce((r, s) => s + '\n\n' + r, '');
                                document.head.appendChild(fontStyle);
                                this.fontStyles.set(rule, fontStyle);
                                embedded.set(fontStyle, Promise.resolve(''));
                            }
                        }
                        return this.generateEmbeddedCSS(window.location.href, cssText);
                    }));
                }
            }
            // if (foundNewStyles) this._addDynamicPseudoClassRules(rootNode)
            return Promise.all(embedded.values());
        }
        static deleteEmbeddedStyle(style) {
            const rootNode = style.getRootNode();
            const embedded = this.embeddedStyles.get(rootNode);
            embedded?.delete(style);
        }
        // Generate and returns a dataurl for the given url
        static dataURLMap = new Map();
        static async getDataURL(url, accept) {
            if (url.startsWith('data'))
                return url;
            if (this.dataURLMap.has(url))
                return this.dataURLMap.get(url);
            const dataURLPromise = new Promise(async (resolveDataURL) => {
                const res = await fetch(url, accept ? { headers: { accept } } : undefined);
                const contentType = res.headers.get('content-type');
                if (contentType == 'text/css') {
                    const css = await this.generateEmbeddedCSS(url, await res.text());
                    this.embeddedCSSMap.set(url, css);
                    resolveDataURL('data:' + contentType + ';base64,' + window.btoa(css));
                }
                else {
                    const buffer = new Uint8Array(await res.arrayBuffer());
                    resolveDataURL('data:' + contentType + ';base64,' + this.arrayBufferToBase64(buffer));
                }
            });
            this.dataURLMap.set(url, dataURLPromise);
            return dataURLPromise;
        }
        static embeddedCSSMap = new Map();
        static async getEmbeddedCSS(url) {
            if (this.embeddedCSSMap.has(url))
                return this.embeddedCSSMap.get(url);
            const res = await fetch(url, { headers: { 'accept': 'text/css' } });
            const css = await this.generateEmbeddedCSS(url, await res.text());
            this.embeddedCSSMap.set(url, css);
            return this.embeddedCSSMap.get(url);
        }
        static updateInputAttributes(element) {
            if (element.matches('input'))
                this._updateInputAttribute(element);
            for (const e of element.getElementsByTagName('input'))
                this._updateInputAttribute(e);
        }
        static _updateInputAttribute(inputElement) {
            if (inputElement.hasAttribute('checked')) {
                if (!inputElement.checked)
                    inputElement.removeAttribute('checked');
            }
            else {
                if (inputElement.checked)
                    inputElement.setAttribute('checked', '');
            }
            if (inputElement.getAttribute('value') !== inputElement.value) {
                inputElement.setAttribute('value', inputElement.value);
            }
        }
        static isBlankImage(imageData) {
            const pixelBuffer = new Uint32Array(imageData.buffer);
            return !pixelBuffer.some(color => color !== 0);
        }
    }

    const ON_BEFORE_UPDATE = Symbol('ON_BEFORE_UPDATE');
    const scratchVector$1 = new three.Vector3();
    const scratchMatrix = new three.Matrix4;
    /** Correct UVs to be compatible with `flipY=false` textures. */
    function flipY(geometry) {
        const uv = geometry.attributes.uv;
        for (let i = 0; i < uv.count; i++) {
            uv.setY(i, 1 - uv.getY(i));
        }
        return geometry;
    }
    class WebLayer3D extends three.Object3D {
        element;
        container;
        static GEOMETRY = new three.PlaneGeometry(1, 1, 2, 2);
        static FLIPPED_GEOMETRY = flipY(new three.PlaneGeometry(1, 1, 2, 2));
        static shouldApplyDOMLayout(layer) {
            const should = layer.shouldApplyDOMLayout;
            if (should === 'always' || should === true)
                return true;
            if (should === 'never' || should === false)
                return false;
            if (should === 'auto' && layer.parentWebLayer && layer.parent === layer.parentWebLayer)
                return true;
            return false;
        }
        _camera;
        constructor(element, container) {
            super();
            this.element = element;
            this.container = container;
            this.name = element.id;
            this._webLayer = WebRenderer.getClosestLayer(element);
            element.layer = this;
            // compressed textures need flipped geometry]
            const geometry = this._webLayer.isMediaElement ? WebLayer3D.GEOMETRY : WebLayer3D.FLIPPED_GEOMETRY;
            this.contentMesh = new three.Mesh(geometry, new three.MeshBasicMaterial({
                side: three.DoubleSide,
                depthWrite: false,
                transparent: true,
                alphaTest: 0.001,
                opacity: 1,
                toneMapped: false
            }));
            this._boundsMesh = new three.Mesh(geometry, new three.MeshBasicMaterial({
                visible: false
            }));
            this.add(this.contentMesh);
            this.add(this._boundsMesh);
            this.cursor.visible = false;
            this.matrixAutoUpdate = true;
            this.contentMesh.matrixAutoUpdate = true;
            this.contentMesh.visible = false;
            this.contentMesh['customDepthMaterial'] = this.depthMaterial;
            this.contentMesh.onBeforeRender = (renderer, scene, camera) => {
                this._camera = camera;
            };
            this._boundsMesh.matrixAutoUpdate = true;
            this.container.options.manager.layersByElement.set(this.element, this);
            this.container.options.manager.layersByMesh.set(this.contentMesh, this);
        }
        _webLayer;
        _localZ = 0;
        _viewZ = 0;
        _renderZ = 0;
        _mediaSrc;
        _mediaTexture;
        textures = new Set();
        _previousTexture;
        _textureMap = new Map();
        get allStateHashes() {
            return this._webLayer.allStateHashes;
        }
        get domState() {
            return this._webLayer.currentDOMState;
        }
        get texture() {
            const manager = this.container.manager;
            const _layer = this._webLayer;
            if (_layer.isMediaElement) {
                const media = this.element;
                let t = this._mediaTexture;
                if (!t || t.image && media.src !== t.image.src) {
                    if (t)
                        t.dispose();
                    t = _layer.isVideoElement ? new three.VideoTexture(media) :
                        _layer.isCanvasElement ? new three.CanvasTexture(media) :
                            new three.TextureLoader().load(media.src);
                    t.wrapS = three.ClampToEdgeWrapping;
                    t.wrapT = three.ClampToEdgeWrapping;
                    t.minFilter = three.LinearFilter;
                    if (manager.textureEncoding)
                        t.encoding = manager.textureEncoding;
                    this._mediaTexture = t;
                }
                return t;
            }
            const textureHash = this._webLayer.currentDOMState?.texture?.hash;
            if (textureHash) {
                if (!this._textureMap.has(textureHash))
                    this._textureMap.set(textureHash, {});
                const textures = manager.getTexture(textureHash);
                const clonedTextures = this._textureMap.get(textureHash);
                if (textures.compressedTexture && !clonedTextures.compressedTexture) {
                    clonedTextures.canvasTexture?.dispose();
                    clonedTextures.canvasTexture = undefined;
                    clonedTextures.compressedTexture = textures.compressedTexture.clone();
                    clonedTextures.compressedTexture.needsUpdate = true;
                }
                if (textures.canvasTexture && !clonedTextures.canvasTexture) {
                    clonedTextures.canvasTexture = textures.canvasTexture.clone();
                    clonedTextures.canvasTexture.needsUpdate = true;
                }
                return clonedTextures.compressedTexture ?? clonedTextures.canvasTexture;
            }
            return undefined;
        }
        contentMesh;
        /**
         * This non-visible mesh ensures that an adapted layer retains
         * its innerBounds, even if the content mesh is
         * independently adapted.
         */
        _boundsMesh;
        cursor = new three.Object3D();
        /**
         * Allows correct shadow maps
         */
        depthMaterial = new three.MeshDepthMaterial({
            depthPacking: three.RGBADepthPacking,
            alphaTest: 0.001
        });
        domLayout = new three.Object3D();
        domSize = new three.Vector3(1, 1, 1);
        /**
         * The desired pseudo state (changing this will set needsRefresh to true)
         */
        get desiredPseudoStates() {
            return this._webLayer.desiredPseudoState;
        }
        /**
         * Get the hover state
         */
        get pseudoStates() {
            return this._webLayer.currentDOMState?.pseudo;
        }
        /**
         * Get the layer depth (distance from this layer's element and the parent layer's element)
         */
        get depth() {
            return this._webLayer.depth;
        }
        /**
         *
         */
        get index() {
            return this.parentWebLayer ? this.parentWebLayer.childWebLayers.indexOf(this) : 0;
        }
        get needsRefresh() {
            return this._webLayer.needsRefresh;
        }
        setNeedsRefresh(recurse = true) {
            this._webLayer.setNeedsRefresh(recurse);
        }
        /** If true, this layer needs to be removed from the scene */
        get needsRemoval() {
            return this._webLayer.needsRemoval;
        }
        bounds = new Bounds();
        margin = new Edges();
        get parentWebLayer() {
            return (this._webLayer.parentLayer &&
                this.container.manager.layersByElement.get(this._webLayer.parentLayer.element));
        }
        childWebLayers = [];
        /**
         * Specifies whether or not the DOM layout should be applied.
         *
         * When set to `true`, the dom layout should always be applied.
         * When set to `false`, the dom layout should never be applied.
         * When set to `'auto'`, the dom layout should only be applied
         * when the `parentLayer` is the same as the `parent` object.
         *
         * It is the responsibiltiy of the update callback
         * to follow these rules.
         *
         * Defaults to `auto`
         */
        shouldApplyDOMLayout = 'auto';
        /**
         * Refresh from DOM (potentially slow, call only when needed)
         */
        async refresh(recurse = false) {
            const refreshing = [];
            refreshing.push(this._webLayer.refresh());
            this.childWebLayers.length = 0;
            for (const c of this._webLayer.childLayers) {
                const child = this.container.manager.layersByElement
                    .get(WebRenderer.getClosestLayer(c.element)?.element);
                if (!child)
                    continue;
                this.childWebLayers.push(child);
                if (recurse)
                    refreshing.push(child.refresh(recurse));
            }
            return Promise.all(refreshing).then(() => { });
        }
        updateLayout() {
            this._updateDOMLayout();
            if (this._camera) {
                this._localZ = Math.abs(scratchVector$1.setFromMatrixPosition(this.matrix).z +
                    scratchVector$1.setFromMatrixPosition(this.contentMesh.matrix).z);
                this._viewZ = Math.abs(this.contentMesh.getWorldPosition(scratchVector$1).applyMatrix4(this._camera.matrixWorldInverse).z);
                let parentRenderZ = this.parentWebLayer ? this.parentWebLayer._renderZ : this._viewZ;
                if (this._localZ < 1e-3) { // coplanar? use parent renderZ
                    this._renderZ = parentRenderZ;
                }
                else {
                    this._renderZ = this._viewZ;
                }
                this.contentMesh.renderOrder = (this.container.options.renderOrderOffset || 0) +
                    (1 - Math.log(this._renderZ + 1) / Math.log(this._camera.far + 1)) +
                    (this.depth + this.index * 0.001) * 0.0000001;
            }
        }
        updateContent() {
            const mesh = this.contentMesh;
            const texture = this.texture;
            const material = mesh.material;
            if (texture && material.map !== texture) {
                const contentScale = this.contentMesh.scale;
                const aspect = Math.abs(contentScale.x * this.scale.x / contentScale.y * this.scale.y);
                const targetAspect = this.domSize.x / this.domSize.y;
                // swap texture when the aspect ratio matches
                if (Math.abs(targetAspect - aspect) < 1e3) {
                    material.map = texture;
                    this.depthMaterial['map'] = texture;
                    material.needsUpdate = true;
                    this.depthMaterial.needsUpdate = true;
                }
            }
            material.transparent = true;
            // handle layer visibility or removal
            const mat = mesh.material;
            const isHidden = mat.opacity < 0.005;
            if (isHidden)
                mesh.visible = false;
            else if (mat.map)
                mesh.visible = true;
            if (this.needsRemoval && isHidden) {
                if (this.parent)
                    this.parent.remove(this);
                this.dispose();
            }
            this._refreshMediaBounds();
        }
        /** INTERNAL */
        [ON_BEFORE_UPDATE]() { }
        _doUpdate() {
            this[ON_BEFORE_UPDATE]();
            // content must update before layout
            this.updateContent();
            this.updateLayout();
            if (WebLayer3D.shouldApplyDOMLayout(this)) {
                this.position.copy(this.domLayout.position);
                this.quaternion.copy(this.domLayout.quaternion);
                this.scale.copy(this.domLayout.scale);
            }
            this.contentMesh.position.set(0, 0, 0);
            this.contentMesh.scale.copy(this.domSize);
            this.contentMesh.quaternion.set(0, 0, 0, 1);
            this._boundsMesh.position.set(0, 0, 0);
            this._boundsMesh.scale.copy(this.domSize);
            this._boundsMesh.quaternion.set(0, 0, 0, 1);
            if (this.needsRefresh && this.container.options.autoRefresh !== false)
                this.refresh();
            if (this._previousTexture !== this.texture) {
                if (this.texture)
                    this.container.manager.renderer.initTexture(this.texture);
                this._previousTexture = this.texture;
                this.container.options.onLayerPaint?.(this);
            }
            this._webLayer.update();
            this.container.manager.scheduleTasksIfNeeded();
        }
        update(recurse = false) {
            if (recurse)
                this.traverseLayersPreOrder(this._doUpdate);
            else
                this._doUpdate();
        }
        querySelector(selector) {
            const element = this.element.querySelector(selector) ||
                this.element.shadowRoot?.querySelector(selector);
            if (element) {
                return this.container.manager.layersByElement.get(element);
            }
            return undefined;
        }
        querySelectorAll(selector) {
            const elements = this.element.querySelectorAll(selector) || this.element.shadowRoot?.querySelectorAll(selector);
            return Array.from(elements).map((e) => this.container.manager.layersByElement.get(e)).filter(l => l);
        }
        traverseLayerAncestors(each) {
            const parentLayer = this.parentWebLayer;
            if (parentLayer) {
                parentLayer.traverseLayerAncestors(each);
                each.call(this, parentLayer);
            }
        }
        traverseLayersPreOrder(each) {
            if (each.call(this, this) === false)
                return false;
            for (const child of this.childWebLayers) {
                if (child.traverseLayersPreOrder(each) === false)
                    return false;
            }
            return true;
        }
        traverseLayersPostOrder(each) {
            for (const child of this.childWebLayers) {
                if (child.traverseLayersPostOrder(each) === false)
                    return false;
            }
            return each.call(this, this) || true;
        }
        dispose() {
            WebRenderer.disposeLayer(this._webLayer);
            for (const t of this.textures) {
                t.dispose();
            }
            for (const child of this.childWebLayers)
                child.dispose();
        }
        _refreshMediaBounds() {
            if (this._webLayer.isMediaElement) {
                const isVideo = this._webLayer.isVideoElement;
                const domState = this.domState;
                if (!domState)
                    return;
                const media = this.element;
                const texture = this.texture;
                const computedStyle = getComputedStyle(this.element);
                const { objectFit } = computedStyle;
                const { width: viewWidth, height: viewHeight } = this.bounds.copy(domState.bounds);
                const naturalWidth = isVideo ? media.videoWidth : media.naturalWidth;
                const naturalHeight = isVideo ? media.videoHeight : media.naturalHeight;
                const mediaRatio = naturalWidth / naturalHeight;
                const viewRatio = viewWidth / viewHeight;
                texture.center.set(0.5, 0.5);
                switch (objectFit) {
                    case 'none':
                        texture.repeat.set(viewWidth / naturalWidth, viewHeight / naturalHeight).clampScalar(0, 1);
                        break;
                    case 'contain':
                    case 'scale-down':
                        texture.repeat.set(1, 1);
                        if (viewRatio > mediaRatio) {
                            const width = this.bounds.height * mediaRatio || 0;
                            this.bounds.left += (this.bounds.width - width) / 2;
                            this.bounds.width = width;
                        }
                        else {
                            const height = this.bounds.width / mediaRatio || 0;
                            this.bounds.top += (this.bounds.height - height) / 2;
                            this.bounds.height = height;
                        }
                        break;
                    case 'cover':
                        texture.repeat.set(viewWidth / naturalWidth, viewHeight / naturalHeight);
                        if (viewRatio < mediaRatio) {
                            const width = this.bounds.height * mediaRatio || 0;
                            this.bounds.left += (this.bounds.width - width) / 2;
                            this.bounds.width = width;
                        }
                        else {
                            const height = this.bounds.width / mediaRatio || 0;
                            this.bounds.top += (this.bounds.height - height) / 2;
                            this.bounds.height = height;
                        }
                        break;
                    default:
                    case 'fill':
                        texture.repeat.set(1, 1);
                        break;
                }
                domState.bounds.copy(this.bounds);
            }
        }
        _updateDOMLayout() {
            if (this.needsRemoval) {
                return;
            }
            const currentState = this._webLayer.currentDOMState;
            if (!currentState)
                return;
            const { bounds: currentBounds, margin: currentMargin } = currentState;
            const isMedia = this._webLayer.isMediaElement;
            this.domLayout.position.set(0, 0, 0);
            this.domLayout.scale.set(1, 1, 1);
            this.domLayout.quaternion.set(0, 0, 0, 1);
            const bounds = this.bounds.copy(currentBounds);
            const margin = this.margin.copy(currentMargin);
            const width = bounds.width;
            const height = bounds.height;
            const marginLeft = isMedia ? 0 : margin.left;
            const marginRight = isMedia ? 0 : margin.right;
            const marginTop = isMedia ? 0 : margin.top;
            const marginBottom = isMedia ? 0 : margin.bottom;
            const fullWidth = width + marginLeft + marginRight;
            const fullHeight = height + marginTop + marginBottom;
            const pixelSize = 1 / this.container.manager.pixelsPerMeter;
            this.domSize.set(Math.max(pixelSize * fullWidth, 10e-6), Math.max(pixelSize * fullHeight, 10e-6), 1);
            const parentLayer = this.parentWebLayer;
            if (!parentLayer)
                return;
            const parentBounds = parentLayer.bounds;
            const parentMargin = parentLayer.margin;
            const parentFullWidth = parentBounds.width + parentMargin.left + parentMargin.right;
            const parentFullHeight = parentBounds.height + parentMargin.bottom + parentMargin.top;
            const parentLeftEdge = -parentFullWidth / 2 + parentMargin.left;
            const parentTopEdge = parentFullHeight / 2 - parentMargin.top;
            this.domLayout.position.set(pixelSize * (parentLeftEdge + fullWidth / 2 + bounds.left - marginLeft), pixelSize * (parentTopEdge - fullHeight / 2 - bounds.top + marginTop), 0);
            const computedStyle = getComputedStyle(this.element);
            const transform = computedStyle.transform;
            if (transform && transform !== 'none') {
                const cssTransform = WebRenderer.parseCSSTransform(computedStyle, bounds.width, bounds.height, pixelSize, scratchMatrix);
                if (cssTransform) {
                    this.domLayout.updateMatrix();
                    this.domLayout.matrix.multiply(cssTransform);
                    this.domLayout.matrix.decompose(this.domLayout.position, this.domLayout.quaternion, this.domLayout.scale);
                }
            }
        }
    }

    /**
     * @author Deepkolos / https://github.com/deepkolos
     */

    class WorkerPool$1 {

    	constructor( pool = 4 ) {

    		this.pool = pool;
    		this.queue = [];
    		this.workers = [];
    		this.workersResolve = [];
    		this.workerStatus = 0;

    	}

    	_initWorker( workerId ) {

    		if ( ! this.workers[ workerId ] ) {

    			const worker = this.workerCreator();
    			worker.addEventListener( 'message', this._onMessage.bind( this, workerId ) );
    			this.workers[ workerId ] = worker;

    		}

    	}

    	_getIdleWorker() {

    		for ( let i = 0; i < this.pool; i ++ )
    			if ( ! ( this.workerStatus & ( 1 << i ) ) ) return i;

    		return - 1;

    	}

    	_onMessage( workerId, msg ) {

    		const resolve = this.workersResolve[ workerId ];
    		resolve && resolve( msg );

    		if ( this.queue.length ) {

    			const { resolve, msg, transfer } = this.queue.shift();
    			this.workersResolve[ workerId ] = resolve;
    			this.workers[ workerId ].postMessage( msg, transfer );

    		} else {

    			this.workerStatus ^= 1 << workerId;

    		}

    	}

    	setWorkerCreator( workerCreator ) {

    		this.workerCreator = workerCreator;

    	}

    	setWorkerLimit( pool ) {

    		this.pool = pool;

    	}

    	postMessage( msg, transfer ) {

    		return new Promise( ( resolve ) => {

    			const workerId = this._getIdleWorker();

    			if ( workerId !== - 1 ) {

    				this._initWorker( workerId );
    				this.workerStatus |= 1 << workerId;
    				this.workersResolve[ workerId ] = resolve;
    				this.workers[ workerId ].postMessage( msg, transfer );

    			} else {

    				this.queue.push( { resolve, msg, transfer } );

    			}

    		} );

    	}

    	dispose() {

    		this.workers.forEach( ( worker ) => worker.terminate() );
    		this.workersResolve.length = 0;
    		this.workers.length = 0;
    		this.queue.length = 0;
    		this.workerStatus = 0;

    	}

    }

    /**
     * Loader for KTX 2.0 GPU Texture containers.
     *
     * KTX 2.0 is a container format for various GPU texture formats. The loader
     * supports Basis Universal GPU textures, which can be quickly transcoded to
     * a wide variety of GPU texture compression formats. While KTX 2.0 also allows
     * other hardware-specific formats, this loader does not yet parse them.
     *
     * References:
     * - KTX: http://github.khronos.org/KTX-Specification/
     * - DFD: https://www.khronos.org/registry/DataFormat/specs/1.3/dataformat.1.3.html#basicdescriptor
     */

    const KTX2TransferSRGB = 2;
    const KTX2_ALPHA_PREMULTIPLIED = 1;
    const _taskCache = new WeakMap();

    let _activeLoaders = 0;

    class KTX2Loader extends three.Loader {

    	constructor( manager ) {

    		super( manager );

    		this.transcoderPath = '';
    		this.transcoderBinary = null;
    		this.transcoderPending = null;

    		this.workerPool = new WorkerPool$1();
    		this.workerSourceURL = '';
    		this.workerConfig = null;

    		if ( typeof MSC_TRANSCODER !== 'undefined' ) {

    			console.warn(

    				'THREE.KTX2Loader: Please update to latest "basis_transcoder".'
    				+ ' "msc_basis_transcoder" is no longer supported in three.js r125+.'

    			);

    		}

    	}

    	setTranscoderPath( path ) {

    		this.transcoderPath = path;

    		return this;

    	}

    	setWorkerLimit( num ) {

    		this.workerPool.setWorkerLimit( num );

    		return this;

    	}

    	detectSupport( renderer ) {

    		this.workerConfig = {
    			astcSupported: renderer.extensions.has( 'WEBGL_compressed_texture_astc' ),
    			etc1Supported: renderer.extensions.has( 'WEBGL_compressed_texture_etc1' ),
    			etc2Supported: renderer.extensions.has( 'WEBGL_compressed_texture_etc' ),
    			dxtSupported: renderer.extensions.has( 'WEBGL_compressed_texture_s3tc' ),
    			bptcSupported: renderer.extensions.has( 'EXT_texture_compression_bptc' ),
    			pvrtcSupported: renderer.extensions.has( 'WEBGL_compressed_texture_pvrtc' )
    				|| renderer.extensions.has( 'WEBKIT_WEBGL_compressed_texture_pvrtc' )
    		};


    		if ( renderer.capabilities.isWebGL2 ) {

    			// https://github.com/mrdoob/three.js/pull/22928
    			this.workerConfig.etc1Supported = false;

    		}

    		return this;

    	}

    	dispose() {

    		this.workerPool.dispose();
    		if ( this.workerSourceURL ) URL.revokeObjectURL( this.workerSourceURL );

    		return this;

    	}

    	init() {

    		if ( ! this.transcoderPending ) {

    			// Load transcoder wrapper.
    			const jsLoader = new three.FileLoader( this.manager );
    			jsLoader.setPath( this.transcoderPath );
    			jsLoader.setWithCredentials( this.withCredentials );
    			const jsContent = jsLoader.loadAsync( 'basis_transcoder.js' );

    			// Load transcoder WASM binary.
    			const binaryLoader = new three.FileLoader( this.manager );
    			binaryLoader.setPath( this.transcoderPath );
    			binaryLoader.setResponseType( 'arraybuffer' );
    			binaryLoader.setWithCredentials( this.withCredentials );
    			const binaryContent = binaryLoader.loadAsync( 'basis_transcoder.wasm' );

    			this.transcoderPending = Promise.all( [ jsContent, binaryContent ] )
    				.then( ( [ jsContent, binaryContent ] ) => {

    					const fn = KTX2Loader.BasisWorker.toString();

    					const body = [
    						'/* constants */',
    						'let _EngineFormat = ' + JSON.stringify( KTX2Loader.EngineFormat ),
    						'let _TranscoderFormat = ' + JSON.stringify( KTX2Loader.TranscoderFormat ),
    						'let _BasisFormat = ' + JSON.stringify( KTX2Loader.BasisFormat ),
    						'/* basis_transcoder.js */',
    						jsContent,
    						'/* worker */',
    						fn.substring( fn.indexOf( '{' ) + 1, fn.lastIndexOf( '}' ) )
    					].join( '\n' );

    					this.workerSourceURL = URL.createObjectURL( new Blob( [ body ] ) );
    					this.transcoderBinary = binaryContent;

    					this.workerPool.setWorkerCreator( () => {

    						const worker = new Worker( this.workerSourceURL );
    						const transcoderBinary = this.transcoderBinary.slice( 0 );

    						worker.postMessage( { type: 'init', config: this.workerConfig, transcoderBinary }, [ transcoderBinary ] );

    						return worker;

    					} );

    				} );

    			if ( _activeLoaders > 0 ) {

    				// Each instance loads a transcoder and allocates workers, increasing network and memory cost.

    				console.warn(

    					'THREE.KTX2Loader: Multiple active KTX2 loaders may cause performance issues.'
    					+ ' Use a single KTX2Loader instance, or call .dispose() on old instances.'

    				);

    			}

    			_activeLoaders ++;

    		}

    		return this.transcoderPending;

    	}

    	load( url, onLoad, onProgress, onError ) {

    		if ( this.workerConfig === null ) {

    			throw new Error( 'THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.' );

    		}

    		const loader = new three.FileLoader( this.manager );

    		loader.setResponseType( 'arraybuffer' );
    		loader.setWithCredentials( this.withCredentials );

    		const texture = new three.CompressedTexture();

    		loader.load( url, ( buffer ) => {

    			// Check for an existing task using this buffer. A transferred buffer cannot be transferred
    			// again from this thread.
    			if ( _taskCache.has( buffer ) ) {

    				const cachedTask = _taskCache.get( buffer );

    				return cachedTask.promise.then( onLoad ).catch( onError );

    			}

    			this._createTexture( [ buffer ] )
    				.then( function ( _texture ) {

    					texture.copy( _texture );
    					texture.needsUpdate = true;

    					if ( onLoad ) onLoad( texture );

    				} )
    				.catch( onError );

    		}, onProgress, onError );

    		return texture;

    	}

    	_createTextureFrom( transcodeResult ) {

    		const { mipmaps, width, height, format, type, error, dfdTransferFn, dfdFlags } = transcodeResult;

    		if ( type === 'error' ) return Promise.reject( error );

    		const texture = new three.CompressedTexture( mipmaps, width, height, format, three.UnsignedByteType );
    		texture.minFilter = mipmaps.length === 1 ? three.LinearFilter : three.LinearMipmapLinearFilter;
    		texture.magFilter = three.LinearFilter;
    		texture.generateMipmaps = false;
    		texture.needsUpdate = true;
    		texture.encoding = dfdTransferFn === KTX2TransferSRGB ? three.sRGBEncoding : three.LinearEncoding;
    		texture.premultiplyAlpha = !! ( dfdFlags & KTX2_ALPHA_PREMULTIPLIED );

    		return texture;

    	}

    	/**
    	 * @param {ArrayBuffer[]} buffers
    	 * @param {object?} config
    	 * @return {Promise<CompressedTexture>}
    	 */
    	_createTexture( buffers, config = {} ) {

    		const taskConfig = config;
    		const texturePending = this.init().then( () => {

    			return this.workerPool.postMessage( { type: 'transcode', buffers, taskConfig: taskConfig }, buffers );

    		} ).then( ( e ) => this._createTextureFrom( e.data ) );

    		// Cache the task result.
    		_taskCache.set( buffers[ 0 ], { promise: texturePending } );

    		return texturePending;

    	}

    	dispose() {

    		URL.revokeObjectURL( this.workerSourceURL );
    		this.workerPool.dispose();

    		_activeLoaders --;

    		return this;

    	}

    }


    /* CONSTANTS */

    KTX2Loader.BasisFormat = {
    	ETC1S: 0,
    	UASTC_4x4: 1,
    };

    KTX2Loader.TranscoderFormat = {
    	ETC1: 0,
    	ETC2: 1,
    	BC1: 2,
    	BC3: 3,
    	BC4: 4,
    	BC5: 5,
    	BC7_M6_OPAQUE_ONLY: 6,
    	BC7_M5: 7,
    	PVRTC1_4_RGB: 8,
    	PVRTC1_4_RGBA: 9,
    	ASTC_4x4: 10,
    	ATC_RGB: 11,
    	ATC_RGBA_INTERPOLATED_ALPHA: 12,
    	RGBA32: 13,
    	RGB565: 14,
    	BGR565: 15,
    	RGBA4444: 16,
    };

    KTX2Loader.EngineFormat = {
    	RGBAFormat: three.RGBAFormat,
    	RGBA_ASTC_4x4_Format: three.RGBA_ASTC_4x4_Format,
    	RGBA_BPTC_Format: three.RGBA_BPTC_Format,
    	RGBA_ETC2_EAC_Format: three.RGBA_ETC2_EAC_Format,
    	RGBA_PVRTC_4BPPV1_Format: three.RGBA_PVRTC_4BPPV1_Format,
    	RGBA_S3TC_DXT5_Format: three.RGBA_S3TC_DXT5_Format,
    	RGB_ETC1_Format: three.RGB_ETC1_Format,
    	RGB_ETC2_Format: three.RGB_ETC2_Format,
    	RGB_PVRTC_4BPPV1_Format: three.RGB_PVRTC_4BPPV1_Format,
    	RGB_S3TC_DXT1_Format: three.RGB_S3TC_DXT1_Format,
    };


    /* WEB WORKER */

    KTX2Loader.BasisWorker = function () {

    	let config;
    	let transcoderPending;
    	let BasisModule;

    	const EngineFormat = _EngineFormat; // eslint-disable-line no-undef
    	const TranscoderFormat = _TranscoderFormat; // eslint-disable-line no-undef
    	const BasisFormat = _BasisFormat; // eslint-disable-line no-undef

    	self.addEventListener( 'message', function ( e ) {

    		const message = e.data;

    		switch ( message.type ) {

    			case 'init':
    				config = message.config;
    				init( message.transcoderBinary );
    				break;

    			case 'transcode':
    				transcoderPending.then( () => {

    					try {

    						const { width, height, hasAlpha, mipmaps, format, dfdTransferFn, dfdFlags } = transcode( message.buffers[ 0 ] );

    						const buffers = [];

    						for ( let i = 0; i < mipmaps.length; ++ i ) {

    							buffers.push( mipmaps[ i ].data.buffer );

    						}

    						self.postMessage( { type: 'transcode', id: message.id, width, height, hasAlpha, mipmaps, format, dfdTransferFn, dfdFlags }, buffers );

    					} catch ( error ) {

    						console.error( error );

    						self.postMessage( { type: 'error', id: message.id, error: error.message } );

    					}

    				} );
    				break;

    		}

    	} );

    	function init( wasmBinary ) {

    		transcoderPending = new Promise( ( resolve ) => {

    			BasisModule = { wasmBinary, onRuntimeInitialized: resolve };
    			BASIS( BasisModule ); // eslint-disable-line no-undef

    		} ).then( () => {

    			BasisModule.initializeBasis();

    			if ( BasisModule.KTX2File === undefined ) {

    				console.warn( 'THREE.KTX2Loader: Please update Basis Universal transcoder.' );

    			}

    		} );

    	}

    	function transcode( buffer ) {

    		const ktx2File = new BasisModule.KTX2File( new Uint8Array( buffer ) );

    		function cleanup() {

    			ktx2File.close();
    			ktx2File.delete();

    		}

    		if ( ! ktx2File.isValid() ) {

    			cleanup();
    			throw new Error( 'THREE.KTX2Loader:	Invalid or unsupported .ktx2 file' );

    		}

    		const basisFormat = ktx2File.isUASTC() ? BasisFormat.UASTC_4x4 : BasisFormat.ETC1S;
    		const width = ktx2File.getWidth();
    		const height = ktx2File.getHeight();
    		const levels = ktx2File.getLevels();
    		const hasAlpha = ktx2File.getHasAlpha();
    		const dfdTransferFn = ktx2File.getDFDTransferFunc();
    		const dfdFlags = ktx2File.getDFDFlags();

    		const { transcoderFormat, engineFormat } = getTranscoderFormat( basisFormat, width, height, hasAlpha );

    		if ( ! width || ! height || ! levels ) {

    			cleanup();
    			throw new Error( 'THREE.KTX2Loader:	Invalid texture' );

    		}

    		if ( ! ktx2File.startTranscoding() ) {

    			cleanup();
    			throw new Error( 'THREE.KTX2Loader: .startTranscoding failed' );

    		}

    		const mipmaps = [];

    		for ( let mip = 0; mip < levels; mip ++ ) {

    			const levelInfo = ktx2File.getImageLevelInfo( mip, 0, 0 );
    			const mipWidth = levelInfo.origWidth;
    			const mipHeight = levelInfo.origHeight;
    			const dst = new Uint8Array( ktx2File.getImageTranscodedSizeInBytes( mip, 0, 0, transcoderFormat ) );

    			const status = ktx2File.transcodeImage(
    				dst,
    				mip,
    				0,
    				0,
    				transcoderFormat,
    				0,
    				- 1,
    				- 1,
    			);

    			if ( ! status ) {

    				cleanup();
    				throw new Error( 'THREE.KTX2Loader: .transcodeImage failed.' );

    			}

    			mipmaps.push( { data: dst, width: mipWidth, height: mipHeight } );

    		}

    		cleanup();

    		return { width, height, hasAlpha, mipmaps, format: engineFormat, dfdTransferFn, dfdFlags };

    	}

    	//

    	// Optimal choice of a transcoder target format depends on the Basis format (ETC1S or UASTC),
    	// device capabilities, and texture dimensions. The list below ranks the formats separately
    	// for ETC1S and UASTC.
    	//
    	// In some cases, transcoding UASTC to RGBA32 might be preferred for higher quality (at
    	// significant memory cost) compared to ETC1/2, BC1/3, and PVRTC. The transcoder currently
    	// chooses RGBA32 only as a last resort and does not expose that option to the caller.
    	const FORMAT_OPTIONS = [
    		{
    			if: 'astcSupported',
    			basisFormat: [ BasisFormat.UASTC_4x4 ],
    			transcoderFormat: [ TranscoderFormat.ASTC_4x4, TranscoderFormat.ASTC_4x4 ],
    			engineFormat: [ EngineFormat.RGBA_ASTC_4x4_Format, EngineFormat.RGBA_ASTC_4x4_Format ],
    			priorityETC1S: Infinity,
    			priorityUASTC: 1,
    			needsPowerOfTwo: false,
    		},
    		{
    			if: 'bptcSupported',
    			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
    			transcoderFormat: [ TranscoderFormat.BC7_M5, TranscoderFormat.BC7_M5 ],
    			engineFormat: [ EngineFormat.RGBA_BPTC_Format, EngineFormat.RGBA_BPTC_Format ],
    			priorityETC1S: 3,
    			priorityUASTC: 2,
    			needsPowerOfTwo: false,
    		},
    		{
    			if: 'dxtSupported',
    			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
    			transcoderFormat: [ TranscoderFormat.BC1, TranscoderFormat.BC3 ],
    			engineFormat: [ EngineFormat.RGB_S3TC_DXT1_Format, EngineFormat.RGBA_S3TC_DXT5_Format ],
    			priorityETC1S: 4,
    			priorityUASTC: 5,
    			needsPowerOfTwo: false,
    		},
    		{
    			if: 'etc2Supported',
    			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
    			transcoderFormat: [ TranscoderFormat.ETC1, TranscoderFormat.ETC2 ],
    			engineFormat: [ EngineFormat.RGB_ETC2_Format, EngineFormat.RGBA_ETC2_EAC_Format ],
    			priorityETC1S: 1,
    			priorityUASTC: 3,
    			needsPowerOfTwo: false,
    		},
    		{
    			if: 'etc1Supported',
    			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
    			transcoderFormat: [ TranscoderFormat.ETC1 ],
    			engineFormat: [ EngineFormat.RGB_ETC1_Format ],
    			priorityETC1S: 2,
    			priorityUASTC: 4,
    			needsPowerOfTwo: false,
    		},
    		{
    			if: 'pvrtcSupported',
    			basisFormat: [ BasisFormat.ETC1S, BasisFormat.UASTC_4x4 ],
    			transcoderFormat: [ TranscoderFormat.PVRTC1_4_RGB, TranscoderFormat.PVRTC1_4_RGBA ],
    			engineFormat: [ EngineFormat.RGB_PVRTC_4BPPV1_Format, EngineFormat.RGBA_PVRTC_4BPPV1_Format ],
    			priorityETC1S: 5,
    			priorityUASTC: 6,
    			needsPowerOfTwo: true,
    		},
    	];

    	const ETC1S_OPTIONS = FORMAT_OPTIONS.sort( function ( a, b ) {

    		return a.priorityETC1S - b.priorityETC1S;

    	} );
    	const UASTC_OPTIONS = FORMAT_OPTIONS.sort( function ( a, b ) {

    		return a.priorityUASTC - b.priorityUASTC;

    	} );

    	function getTranscoderFormat( basisFormat, width, height, hasAlpha ) {

    		let transcoderFormat;
    		let engineFormat;

    		const options = basisFormat === BasisFormat.ETC1S ? ETC1S_OPTIONS : UASTC_OPTIONS;

    		for ( let i = 0; i < options.length; i ++ ) {

    			const opt = options[ i ];

    			if ( ! config[ opt.if ] ) continue;
    			if ( ! opt.basisFormat.includes( basisFormat ) ) continue;
    			if ( hasAlpha && opt.transcoderFormat.length < 2 ) continue;
    			if ( opt.needsPowerOfTwo && ! ( isPowerOfTwo( width ) && isPowerOfTwo( height ) ) ) continue;

    			transcoderFormat = opt.transcoderFormat[ hasAlpha ? 1 : 0 ];
    			engineFormat = opt.engineFormat[ hasAlpha ? 1 : 0 ];

    			return { transcoderFormat, engineFormat };

    		}

    		console.warn( 'THREE.KTX2Loader: No suitable compressed texture format found. Decoding to RGBA32.' );

    		transcoderFormat = TranscoderFormat.RGBA32;
    		engineFormat = EngineFormat.RGBAFormat;

    		return { transcoderFormat, engineFormat };

    	}

    	function isPowerOfTwo( value ) {

    		if ( value <= 2 ) return true;

    		return ( value & ( value - 1 ) ) === 0 && value !== 0;

    	}

    };

    /*
     * Dexie.js - a minimalistic wrapper for IndexedDB
     * ===============================================
     *
     * By David Fahlander, david.fahlander@gmail.com
     *
     * Version 3.2.1, Wed Feb 16 2022
     *
     * https://dexie.org
     *
     * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
     */
     
    const _global = typeof globalThis !== 'undefined' ? globalThis :
        typeof self !== 'undefined' ? self :
            typeof window !== 'undefined' ? window :
                global;

    const keys = Object.keys;
    const isArray = Array.isArray;
    if (typeof Promise !== 'undefined' && !_global.Promise) {
        _global.Promise = Promise;
    }
    function extend(obj, extension) {
        if (typeof extension !== 'object')
            return obj;
        keys(extension).forEach(function (key) {
            obj[key] = extension[key];
        });
        return obj;
    }
    const getProto = Object.getPrototypeOf;
    const _hasOwn = {}.hasOwnProperty;
    function hasOwn(obj, prop) {
        return _hasOwn.call(obj, prop);
    }
    function props(proto, extension) {
        if (typeof extension === 'function')
            extension = extension(getProto(proto));
        (typeof Reflect === "undefined" ? keys : Reflect.ownKeys)(extension).forEach(key => {
            setProp(proto, key, extension[key]);
        });
    }
    const defineProperty = Object.defineProperty;
    function setProp(obj, prop, functionOrGetSet, options) {
        defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ?
            { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } :
            { value: functionOrGetSet, configurable: true, writable: true }, options));
    }
    function derive(Child) {
        return {
            from: function (Parent) {
                Child.prototype = Object.create(Parent.prototype);
                setProp(Child.prototype, "constructor", Child);
                return {
                    extend: props.bind(null, Child.prototype)
                };
            }
        };
    }
    const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    function getPropertyDescriptor(obj, prop) {
        const pd = getOwnPropertyDescriptor(obj, prop);
        let proto;
        return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
    }
    const _slice = [].slice;
    function slice(args, start, end) {
        return _slice.call(args, start, end);
    }
    function override(origFunc, overridedFactory) {
        return overridedFactory(origFunc);
    }
    function assert(b) {
        if (!b)
            throw new Error("Assertion Failed");
    }
    function asap$1(fn) {
        if (_global.setImmediate)
            setImmediate(fn);
        else
            setTimeout(fn, 0);
    }
    function arrayToObject(array, extractor) {
        return array.reduce((result, item, i) => {
            var nameAndValue = extractor(item, i);
            if (nameAndValue)
                result[nameAndValue[0]] = nameAndValue[1];
            return result;
        }, {});
    }
    function tryCatch(fn, onerror, args) {
        try {
            fn.apply(null, args);
        }
        catch (ex) {
            onerror && onerror(ex);
        }
    }
    function getByKeyPath(obj, keyPath) {
        if (hasOwn(obj, keyPath))
            return obj[keyPath];
        if (!keyPath)
            return obj;
        if (typeof keyPath !== 'string') {
            var rv = [];
            for (var i = 0, l = keyPath.length; i < l; ++i) {
                var val = getByKeyPath(obj, keyPath[i]);
                rv.push(val);
            }
            return rv;
        }
        var period = keyPath.indexOf('.');
        if (period !== -1) {
            var innerObj = obj[keyPath.substr(0, period)];
            return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
        }
        return undefined;
    }
    function setByKeyPath(obj, keyPath, value) {
        if (!obj || keyPath === undefined)
            return;
        if ('isFrozen' in Object && Object.isFrozen(obj))
            return;
        if (typeof keyPath !== 'string' && 'length' in keyPath) {
            assert(typeof value !== 'string' && 'length' in value);
            for (var i = 0, l = keyPath.length; i < l; ++i) {
                setByKeyPath(obj, keyPath[i], value[i]);
            }
        }
        else {
            var period = keyPath.indexOf('.');
            if (period !== -1) {
                var currentKeyPath = keyPath.substr(0, period);
                var remainingKeyPath = keyPath.substr(period + 1);
                if (remainingKeyPath === "")
                    if (value === undefined) {
                        if (isArray(obj) && !isNaN(parseInt(currentKeyPath)))
                            obj.splice(currentKeyPath, 1);
                        else
                            delete obj[currentKeyPath];
                    }
                    else
                        obj[currentKeyPath] = value;
                else {
                    var innerObj = obj[currentKeyPath];
                    if (!innerObj)
                        innerObj = (obj[currentKeyPath] = {});
                    setByKeyPath(innerObj, remainingKeyPath, value);
                }
            }
            else {
                if (value === undefined) {
                    if (isArray(obj) && !isNaN(parseInt(keyPath)))
                        obj.splice(keyPath, 1);
                    else
                        delete obj[keyPath];
                }
                else
                    obj[keyPath] = value;
            }
        }
    }
    function delByKeyPath(obj, keyPath) {
        if (typeof keyPath === 'string')
            setByKeyPath(obj, keyPath, undefined);
        else if ('length' in keyPath)
            [].map.call(keyPath, function (kp) {
                setByKeyPath(obj, kp, undefined);
            });
    }
    function shallowClone(obj) {
        var rv = {};
        for (var m in obj) {
            if (hasOwn(obj, m))
                rv[m] = obj[m];
        }
        return rv;
    }
    const concat = [].concat;
    function flatten(a) {
        return concat.apply([], a);
    }
    const intrinsicTypeNames = "Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey"
        .split(',').concat(flatten([8, 16, 32, 64].map(num => ["Int", "Uint", "Float"].map(t => t + num + "Array")))).filter(t => _global[t]);
    const intrinsicTypes = intrinsicTypeNames.map(t => _global[t]);
    arrayToObject(intrinsicTypeNames, x => [x, true]);
    let circularRefs = null;
    function deepClone(any) {
        circularRefs = typeof WeakMap !== 'undefined' && new WeakMap();
        const rv = innerDeepClone(any);
        circularRefs = null;
        return rv;
    }
    function innerDeepClone(any) {
        if (!any || typeof any !== 'object')
            return any;
        let rv = circularRefs && circularRefs.get(any);
        if (rv)
            return rv;
        if (isArray(any)) {
            rv = [];
            circularRefs && circularRefs.set(any, rv);
            for (var i = 0, l = any.length; i < l; ++i) {
                rv.push(innerDeepClone(any[i]));
            }
        }
        else if (intrinsicTypes.indexOf(any.constructor) >= 0) {
            rv = any;
        }
        else {
            const proto = getProto(any);
            rv = proto === Object.prototype ? {} : Object.create(proto);
            circularRefs && circularRefs.set(any, rv);
            for (var prop in any) {
                if (hasOwn(any, prop)) {
                    rv[prop] = innerDeepClone(any[prop]);
                }
            }
        }
        return rv;
    }
    const { toString } = {};
    function toStringTag(o) {
        return toString.call(o).slice(8, -1);
    }
    const iteratorSymbol = typeof Symbol !== 'undefined' ?
        Symbol.iterator :
        '@@iterator';
    const getIteratorOf = typeof iteratorSymbol === "symbol" ? function (x) {
        var i;
        return x != null && (i = x[iteratorSymbol]) && i.apply(x);
    } : function () { return null; };
    const NO_CHAR_ARRAY = {};
    function getArrayOf(arrayLike) {
        var i, a, x, it;
        if (arguments.length === 1) {
            if (isArray(arrayLike))
                return arrayLike.slice();
            if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string')
                return [arrayLike];
            if ((it = getIteratorOf(arrayLike))) {
                a = [];
                while ((x = it.next()), !x.done)
                    a.push(x.value);
                return a;
            }
            if (arrayLike == null)
                return [arrayLike];
            i = arrayLike.length;
            if (typeof i === 'number') {
                a = new Array(i);
                while (i--)
                    a[i] = arrayLike[i];
                return a;
            }
            return [arrayLike];
        }
        i = arguments.length;
        a = new Array(i);
        while (i--)
            a[i] = arguments[i];
        return a;
    }
    const isAsyncFunction = typeof Symbol !== 'undefined'
        ? (fn) => fn[Symbol.toStringTag] === 'AsyncFunction'
        : () => false;

    var debug = typeof location !== 'undefined' &&
        /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
    function setDebug(value, filter) {
        debug = value;
        libraryFilter = filter;
    }
    var libraryFilter = () => true;
    const NEEDS_THROW_FOR_STACK = !new Error("").stack;
    function getErrorWithStack() {
        if (NEEDS_THROW_FOR_STACK)
            try {
                getErrorWithStack.arguments;
                throw new Error();
            }
            catch (e) {
                return e;
            }
        return new Error();
    }
    function prettyStack(exception, numIgnoredFrames) {
        var stack = exception.stack;
        if (!stack)
            return "";
        numIgnoredFrames = (numIgnoredFrames || 0);
        if (stack.indexOf(exception.name) === 0)
            numIgnoredFrames += (exception.name + exception.message).split('\n').length;
        return stack.split('\n')
            .slice(numIgnoredFrames)
            .filter(libraryFilter)
            .map(frame => "\n" + frame)
            .join('');
    }

    var dexieErrorNames = [
        'Modify',
        'Bulk',
        'OpenFailed',
        'VersionChange',
        'Schema',
        'Upgrade',
        'InvalidTable',
        'MissingAPI',
        'NoSuchDatabase',
        'InvalidArgument',
        'SubTransaction',
        'Unsupported',
        'Internal',
        'DatabaseClosed',
        'PrematureCommit',
        'ForeignAwait'
    ];
    var idbDomErrorNames = [
        'Unknown',
        'Constraint',
        'Data',
        'TransactionInactive',
        'ReadOnly',
        'Version',
        'NotFound',
        'InvalidState',
        'InvalidAccess',
        'Abort',
        'Timeout',
        'QuotaExceeded',
        'Syntax',
        'DataClone'
    ];
    var errorList = dexieErrorNames.concat(idbDomErrorNames);
    var defaultTexts = {
        VersionChanged: "Database version changed by other database connection",
        DatabaseClosed: "Database has been closed",
        Abort: "Transaction aborted",
        TransactionInactive: "Transaction has already completed or failed",
        MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
    };
    function DexieError(name, msg) {
        this._e = getErrorWithStack();
        this.name = name;
        this.message = msg;
    }
    derive(DexieError).from(Error).extend({
        stack: {
            get: function () {
                return this._stack ||
                    (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
            }
        },
        toString: function () { return this.name + ": " + this.message; }
    });
    function getMultiErrorMessage(msg, failures) {
        return msg + ". Errors: " + Object.keys(failures)
            .map(key => failures[key].toString())
            .filter((v, i, s) => s.indexOf(v) === i)
            .join('\n');
    }
    function ModifyError(msg, failures, successCount, failedKeys) {
        this._e = getErrorWithStack();
        this.failures = failures;
        this.failedKeys = failedKeys;
        this.successCount = successCount;
        this.message = getMultiErrorMessage(msg, failures);
    }
    derive(ModifyError).from(DexieError);
    function BulkError(msg, failures) {
        this._e = getErrorWithStack();
        this.name = "BulkError";
        this.failures = Object.keys(failures).map(pos => failures[pos]);
        this.failuresByPos = failures;
        this.message = getMultiErrorMessage(msg, failures);
    }
    derive(BulkError).from(DexieError);
    var errnames = errorList.reduce((obj, name) => (obj[name] = name + "Error", obj), {});
    const BaseException = DexieError;
    var exceptions = errorList.reduce((obj, name) => {
        var fullName = name + "Error";
        function DexieError(msgOrInner, inner) {
            this._e = getErrorWithStack();
            this.name = fullName;
            if (!msgOrInner) {
                this.message = defaultTexts[name] || fullName;
                this.inner = null;
            }
            else if (typeof msgOrInner === 'string') {
                this.message = `${msgOrInner}${!inner ? '' : '\n ' + inner}`;
                this.inner = inner || null;
            }
            else if (typeof msgOrInner === 'object') {
                this.message = `${msgOrInner.name} ${msgOrInner.message}`;
                this.inner = msgOrInner;
            }
        }
        derive(DexieError).from(BaseException);
        obj[name] = DexieError;
        return obj;
    }, {});
    exceptions.Syntax = SyntaxError;
    exceptions.Type = TypeError;
    exceptions.Range = RangeError;
    var exceptionMap = idbDomErrorNames.reduce((obj, name) => {
        obj[name + "Error"] = exceptions[name];
        return obj;
    }, {});
    function mapError(domError, message) {
        if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
            return domError;
        var rv = new exceptionMap[domError.name](message || domError.message, domError);
        if ("stack" in domError) {
            setProp(rv, "stack", { get: function () {
                    return this.inner.stack;
                } });
        }
        return rv;
    }
    var fullNameExceptions = errorList.reduce((obj, name) => {
        if (["Syntax", "Type", "Range"].indexOf(name) === -1)
            obj[name + "Error"] = exceptions[name];
        return obj;
    }, {});
    fullNameExceptions.ModifyError = ModifyError;
    fullNameExceptions.DexieError = DexieError;
    fullNameExceptions.BulkError = BulkError;

    function nop() { }
    function mirror(val) { return val; }
    function pureFunctionChain(f1, f2) {
        if (f1 == null || f1 === mirror)
            return f2;
        return function (val) {
            return f2(f1(val));
        };
    }
    function callBoth(on1, on2) {
        return function () {
            on1.apply(this, arguments);
            on2.apply(this, arguments);
        };
    }
    function hookCreatingChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res !== undefined)
                arguments[0] = res;
            var onsuccess = this.onsuccess,
            onerror = this.onerror;
            this.onsuccess = null;
            this.onerror = null;
            var res2 = f2.apply(this, arguments);
            if (onsuccess)
                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res2 !== undefined ? res2 : res;
        };
    }
    function hookDeletingChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            f1.apply(this, arguments);
            var onsuccess = this.onsuccess,
            onerror = this.onerror;
            this.onsuccess = this.onerror = null;
            f2.apply(this, arguments);
            if (onsuccess)
                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        };
    }
    function hookUpdatingChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function (modifications) {
            var res = f1.apply(this, arguments);
            extend(modifications, res);
            var onsuccess = this.onsuccess,
            onerror = this.onerror;
            this.onsuccess = null;
            this.onerror = null;
            var res2 = f2.apply(this, arguments);
            if (onsuccess)
                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res === undefined ?
                (res2 === undefined ? undefined : res2) :
                (extend(res, res2));
        };
    }
    function reverseStoppableEventChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            if (f2.apply(this, arguments) === false)
                return false;
            return f1.apply(this, arguments);
        };
    }
    function promisableChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res && typeof res.then === 'function') {
                var thiz = this, i = arguments.length, args = new Array(i);
                while (i--)
                    args[i] = arguments[i];
                return res.then(function () {
                    return f2.apply(thiz, args);
                });
            }
            return f2.apply(this, arguments);
        };
    }

    var INTERNAL = {};
    const LONG_STACKS_CLIP_LIMIT = 100,
    MAX_LONG_STACKS = 20, ZONE_ECHO_LIMIT = 100, [resolvedNativePromise, nativePromiseProto, resolvedGlobalPromise] = typeof Promise === 'undefined' ?
        [] :
        (() => {
            let globalP = Promise.resolve();
            if (typeof crypto === 'undefined' || !crypto.subtle)
                return [globalP, getProto(globalP), globalP];
            const nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
            return [
                nativeP,
                getProto(nativeP),
                globalP
            ];
        })(), nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
    const NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
    const patchGlobalPromise = !!resolvedGlobalPromise;
    var stack_being_generated = false;
    var schedulePhysicalTick = resolvedGlobalPromise ?
        () => { resolvedGlobalPromise.then(physicalTick); }
        :
            _global.setImmediate ?
                setImmediate.bind(null, physicalTick) :
                _global.MutationObserver ?
                    () => {
                        var hiddenDiv = document.createElement("div");
                        (new MutationObserver(() => {
                            physicalTick();
                            hiddenDiv = null;
                        })).observe(hiddenDiv, { attributes: true });
                        hiddenDiv.setAttribute('i', '1');
                    } :
                    () => { setTimeout(physicalTick, 0); };
    var asap = function (callback, args) {
        microtickQueue.push([callback, args]);
        if (needsNewPhysicalTick) {
            schedulePhysicalTick();
            needsNewPhysicalTick = false;
        }
    };
    var isOutsideMicroTick = true,
    needsNewPhysicalTick = true,
    unhandledErrors = [],
    rejectingErrors = [],
    currentFulfiller = null, rejectionMapper = mirror;
    var globalPSD = {
        id: 'global',
        global: true,
        ref: 0,
        unhandleds: [],
        onunhandled: globalError,
        pgp: false,
        env: {},
        finalize: function () {
            this.unhandleds.forEach(uh => {
                try {
                    globalError(uh[0], uh[1]);
                }
                catch (e) { }
            });
        }
    };
    var PSD = globalPSD;
    var microtickQueue = [];
    var numScheduledCalls = 0;
    var tickFinalizers = [];
    function DexiePromise(fn) {
        if (typeof this !== 'object')
            throw new TypeError('Promises must be constructed via new');
        this._listeners = [];
        this.onuncatched = nop;
        this._lib = false;
        var psd = (this._PSD = PSD);
        if (debug) {
            this._stackHolder = getErrorWithStack();
            this._prev = null;
            this._numPrev = 0;
        }
        if (typeof fn !== 'function') {
            if (fn !== INTERNAL)
                throw new TypeError('Not a function');
            this._state = arguments[1];
            this._value = arguments[2];
            if (this._state === false)
                handleRejection(this, this._value);
            return;
        }
        this._state = null;
        this._value = null;
        ++psd.ref;
        executePromiseTask(this, fn);
    }
    const thenProp = {
        get: function () {
            var psd = PSD, microTaskId = totalEchoes;
            function then(onFulfilled, onRejected) {
                var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
                const cleanup = possibleAwait && !decrementExpectedAwaits();
                var rv = new DexiePromise((resolve, reject) => {
                    propagateToListener(this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup), resolve, reject, psd));
                });
                debug && linkToPreviousPromise(rv, this);
                return rv;
            }
            then.prototype = INTERNAL;
            return then;
        },
        set: function (value) {
            setProp(this, 'then', value && value.prototype === INTERNAL ?
                thenProp :
                {
                    get: function () {
                        return value;
                    },
                    set: thenProp.set
                });
        }
    };
    props(DexiePromise.prototype, {
        then: thenProp,
        _then: function (onFulfilled, onRejected) {
            propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
        },
        catch: function (onRejected) {
            if (arguments.length === 1)
                return this.then(null, onRejected);
            var type = arguments[0], handler = arguments[1];
            return typeof type === 'function' ? this.then(null, err =>
            err instanceof type ? handler(err) : PromiseReject(err))
                : this.then(null, err =>
                err && err.name === type ? handler(err) : PromiseReject(err));
        },
        finally: function (onFinally) {
            return this.then(value => {
                onFinally();
                return value;
            }, err => {
                onFinally();
                return PromiseReject(err);
            });
        },
        stack: {
            get: function () {
                if (this._stack)
                    return this._stack;
                try {
                    stack_being_generated = true;
                    var stacks = getStack(this, [], MAX_LONG_STACKS);
                    var stack = stacks.join("\nFrom previous: ");
                    if (this._state !== null)
                        this._stack = stack;
                    return stack;
                }
                finally {
                    stack_being_generated = false;
                }
            }
        },
        timeout: function (ms, msg) {
            return ms < Infinity ?
                new DexiePromise((resolve, reject) => {
                    var handle = setTimeout(() => reject(new exceptions.Timeout(msg)), ms);
                    this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
                }) : this;
        }
    });
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag)
        setProp(DexiePromise.prototype, Symbol.toStringTag, 'Dexie.Promise');
    globalPSD.env = snapShot();
    function Listener(onFulfilled, onRejected, resolve, reject, zone) {
        this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
        this.onRejected = typeof onRejected === 'function' ? onRejected : null;
        this.resolve = resolve;
        this.reject = reject;
        this.psd = zone;
    }
    props(DexiePromise, {
        all: function () {
            var values = getArrayOf.apply(null, arguments)
                .map(onPossibleParallellAsync);
            return new DexiePromise(function (resolve, reject) {
                if (values.length === 0)
                    resolve([]);
                var remaining = values.length;
                values.forEach((a, i) => DexiePromise.resolve(a).then(x => {
                    values[i] = x;
                    if (!--remaining)
                        resolve(values);
                }, reject));
            });
        },
        resolve: value => {
            if (value instanceof DexiePromise)
                return value;
            if (value && typeof value.then === 'function')
                return new DexiePromise((resolve, reject) => {
                    value.then(resolve, reject);
                });
            var rv = new DexiePromise(INTERNAL, true, value);
            linkToPreviousPromise(rv, currentFulfiller);
            return rv;
        },
        reject: PromiseReject,
        race: function () {
            var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise((resolve, reject) => {
                values.map(value => DexiePromise.resolve(value).then(resolve, reject));
            });
        },
        PSD: {
            get: () => PSD,
            set: value => PSD = value
        },
        totalEchoes: { get: () => totalEchoes },
        newPSD: newScope,
        usePSD: usePSD,
        scheduler: {
            get: () => asap,
            set: value => { asap = value; }
        },
        rejectionMapper: {
            get: () => rejectionMapper,
            set: value => { rejectionMapper = value; }
        },
        follow: (fn, zoneProps) => {
            return new DexiePromise((resolve, reject) => {
                return newScope((resolve, reject) => {
                    var psd = PSD;
                    psd.unhandleds = [];
                    psd.onunhandled = reject;
                    psd.finalize = callBoth(function () {
                        run_at_end_of_this_or_next_physical_tick(() => {
                            this.unhandleds.length === 0 ? resolve() : reject(this.unhandleds[0]);
                        });
                    }, psd.finalize);
                    fn();
                }, zoneProps, resolve, reject);
            });
        }
    });
    if (NativePromise) {
        if (NativePromise.allSettled)
            setProp(DexiePromise, "allSettled", function () {
                const possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
                return new DexiePromise(resolve => {
                    if (possiblePromises.length === 0)
                        resolve([]);
                    let remaining = possiblePromises.length;
                    const results = new Array(remaining);
                    possiblePromises.forEach((p, i) => DexiePromise.resolve(p).then(value => results[i] = { status: "fulfilled", value }, reason => results[i] = { status: "rejected", reason })
                        .then(() => --remaining || resolve(results)));
                });
            });
        if (NativePromise.any && typeof AggregateError !== 'undefined')
            setProp(DexiePromise, "any", function () {
                const possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
                return new DexiePromise((resolve, reject) => {
                    if (possiblePromises.length === 0)
                        reject(new AggregateError([]));
                    let remaining = possiblePromises.length;
                    const failures = new Array(remaining);
                    possiblePromises.forEach((p, i) => DexiePromise.resolve(p).then(value => resolve(value), failure => {
                        failures[i] = failure;
                        if (!--remaining)
                            reject(new AggregateError(failures));
                    }));
                });
            });
    }
    function executePromiseTask(promise, fn) {
        try {
            fn(value => {
                if (promise._state !== null)
                    return;
                if (value === promise)
                    throw new TypeError('A promise cannot be resolved with itself.');
                var shouldExecuteTick = promise._lib && beginMicroTickScope();
                if (value && typeof value.then === 'function') {
                    executePromiseTask(promise, (resolve, reject) => {
                        value instanceof DexiePromise ?
                            value._then(resolve, reject) :
                            value.then(resolve, reject);
                    });
                }
                else {
                    promise._state = true;
                    promise._value = value;
                    propagateAllListeners(promise);
                }
                if (shouldExecuteTick)
                    endMicroTickScope();
            }, handleRejection.bind(null, promise));
        }
        catch (ex) {
            handleRejection(promise, ex);
        }
    }
    function handleRejection(promise, reason) {
        rejectingErrors.push(reason);
        if (promise._state !== null)
            return;
        var shouldExecuteTick = promise._lib && beginMicroTickScope();
        reason = rejectionMapper(reason);
        promise._state = false;
        promise._value = reason;
        debug && reason !== null && typeof reason === 'object' && !reason._promise && tryCatch(() => {
            var origProp = getPropertyDescriptor(reason, "stack");
            reason._promise = promise;
            setProp(reason, "stack", {
                get: () => stack_being_generated ?
                    origProp && (origProp.get ?
                        origProp.get.apply(reason) :
                        origProp.value) :
                    promise.stack
            });
        });
        addPossiblyUnhandledError(promise);
        propagateAllListeners(promise);
        if (shouldExecuteTick)
            endMicroTickScope();
    }
    function propagateAllListeners(promise) {
        var listeners = promise._listeners;
        promise._listeners = [];
        for (var i = 0, len = listeners.length; i < len; ++i) {
            propagateToListener(promise, listeners[i]);
        }
        var psd = promise._PSD;
        --psd.ref || psd.finalize();
        if (numScheduledCalls === 0) {
            ++numScheduledCalls;
            asap(() => {
                if (--numScheduledCalls === 0)
                    finalizePhysicalTick();
            }, []);
        }
    }
    function propagateToListener(promise, listener) {
        if (promise._state === null) {
            promise._listeners.push(listener);
            return;
        }
        var cb = promise._state ? listener.onFulfilled : listener.onRejected;
        if (cb === null) {
            return (promise._state ? listener.resolve : listener.reject)(promise._value);
        }
        ++listener.psd.ref;
        ++numScheduledCalls;
        asap(callListener, [cb, promise, listener]);
    }
    function callListener(cb, promise, listener) {
        try {
            currentFulfiller = promise;
            var ret, value = promise._value;
            if (promise._state) {
                ret = cb(value);
            }
            else {
                if (rejectingErrors.length)
                    rejectingErrors = [];
                ret = cb(value);
                if (rejectingErrors.indexOf(value) === -1)
                    markErrorAsHandled(promise);
            }
            listener.resolve(ret);
        }
        catch (e) {
            listener.reject(e);
        }
        finally {
            currentFulfiller = null;
            if (--numScheduledCalls === 0)
                finalizePhysicalTick();
            --listener.psd.ref || listener.psd.finalize();
        }
    }
    function getStack(promise, stacks, limit) {
        if (stacks.length === limit)
            return stacks;
        var stack = "";
        if (promise._state === false) {
            var failure = promise._value, errorName, message;
            if (failure != null) {
                errorName = failure.name || "Error";
                message = failure.message || failure;
                stack = prettyStack(failure, 0);
            }
            else {
                errorName = failure;
                message = "";
            }
            stacks.push(errorName + (message ? ": " + message : "") + stack);
        }
        if (debug) {
            stack = prettyStack(promise._stackHolder, 2);
            if (stack && stacks.indexOf(stack) === -1)
                stacks.push(stack);
            if (promise._prev)
                getStack(promise._prev, stacks, limit);
        }
        return stacks;
    }
    function linkToPreviousPromise(promise, prev) {
        var numPrev = prev ? prev._numPrev + 1 : 0;
        if (numPrev < LONG_STACKS_CLIP_LIMIT) {
            promise._prev = prev;
            promise._numPrev = numPrev;
        }
    }
    function physicalTick() {
        beginMicroTickScope() && endMicroTickScope();
    }
    function beginMicroTickScope() {
        var wasRootExec = isOutsideMicroTick;
        isOutsideMicroTick = false;
        needsNewPhysicalTick = false;
        return wasRootExec;
    }
    function endMicroTickScope() {
        var callbacks, i, l;
        do {
            while (microtickQueue.length > 0) {
                callbacks = microtickQueue;
                microtickQueue = [];
                l = callbacks.length;
                for (i = 0; i < l; ++i) {
                    var item = callbacks[i];
                    item[0].apply(null, item[1]);
                }
            }
        } while (microtickQueue.length > 0);
        isOutsideMicroTick = true;
        needsNewPhysicalTick = true;
    }
    function finalizePhysicalTick() {
        var unhandledErrs = unhandledErrors;
        unhandledErrors = [];
        unhandledErrs.forEach(p => {
            p._PSD.onunhandled.call(null, p._value, p);
        });
        var finalizers = tickFinalizers.slice(0);
        var i = finalizers.length;
        while (i)
            finalizers[--i]();
    }
    function run_at_end_of_this_or_next_physical_tick(fn) {
        function finalizer() {
            fn();
            tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
        }
        tickFinalizers.push(finalizer);
        ++numScheduledCalls;
        asap(() => {
            if (--numScheduledCalls === 0)
                finalizePhysicalTick();
        }, []);
    }
    function addPossiblyUnhandledError(promise) {
        if (!unhandledErrors.some(p => p._value === promise._value))
            unhandledErrors.push(promise);
    }
    function markErrorAsHandled(promise) {
        var i = unhandledErrors.length;
        while (i)
            if (unhandledErrors[--i]._value === promise._value) {
                unhandledErrors.splice(i, 1);
                return;
            }
    }
    function PromiseReject(reason) {
        return new DexiePromise(INTERNAL, false, reason);
    }
    function wrap(fn, errorCatcher) {
        var psd = PSD;
        return function () {
            var wasRootExec = beginMicroTickScope(), outerScope = PSD;
            try {
                switchToZone(psd, true);
                return fn.apply(this, arguments);
            }
            catch (e) {
                errorCatcher && errorCatcher(e);
            }
            finally {
                switchToZone(outerScope, false);
                if (wasRootExec)
                    endMicroTickScope();
            }
        };
    }
    const task = { awaits: 0, echoes: 0, id: 0 };
    var taskCounter = 0;
    var zoneStack = [];
    var zoneEchoes = 0;
    var totalEchoes = 0;
    var zone_id_counter = 0;
    function newScope(fn, props, a1, a2) {
        var parent = PSD, psd = Object.create(parent);
        psd.parent = parent;
        psd.ref = 0;
        psd.global = false;
        psd.id = ++zone_id_counter;
        var globalEnv = globalPSD.env;
        psd.env = patchGlobalPromise ? {
            Promise: DexiePromise,
            PromiseProp: { value: DexiePromise, configurable: true, writable: true },
            all: DexiePromise.all,
            race: DexiePromise.race,
            allSettled: DexiePromise.allSettled,
            any: DexiePromise.any,
            resolve: DexiePromise.resolve,
            reject: DexiePromise.reject,
            nthen: getPatchedPromiseThen(globalEnv.nthen, psd),
            gthen: getPatchedPromiseThen(globalEnv.gthen, psd)
        } : {};
        if (props)
            extend(psd, props);
        ++parent.ref;
        psd.finalize = function () {
            --this.parent.ref || this.parent.finalize();
        };
        var rv = usePSD(psd, fn, a1, a2);
        if (psd.ref === 0)
            psd.finalize();
        return rv;
    }
    function incrementExpectedAwaits() {
        if (!task.id)
            task.id = ++taskCounter;
        ++task.awaits;
        task.echoes += ZONE_ECHO_LIMIT;
        return task.id;
    }
    function decrementExpectedAwaits() {
        if (!task.awaits)
            return false;
        if (--task.awaits === 0)
            task.id = 0;
        task.echoes = task.awaits * ZONE_ECHO_LIMIT;
        return true;
    }
    if (('' + nativePromiseThen).indexOf('[native code]') === -1) {
        incrementExpectedAwaits = decrementExpectedAwaits = nop;
    }
    function onPossibleParallellAsync(possiblePromise) {
        if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
            incrementExpectedAwaits();
            return possiblePromise.then(x => {
                decrementExpectedAwaits();
                return x;
            }, e => {
                decrementExpectedAwaits();
                return rejection(e);
            });
        }
        return possiblePromise;
    }
    function zoneEnterEcho(targetZone) {
        ++totalEchoes;
        if (!task.echoes || --task.echoes === 0) {
            task.echoes = task.id = 0;
        }
        zoneStack.push(PSD);
        switchToZone(targetZone, true);
    }
    function zoneLeaveEcho() {
        var zone = zoneStack[zoneStack.length - 1];
        zoneStack.pop();
        switchToZone(zone, false);
    }
    function switchToZone(targetZone, bEnteringZone) {
        var currentZone = PSD;
        if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
            enqueueNativeMicroTask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
        }
        if (targetZone === PSD)
            return;
        PSD = targetZone;
        if (currentZone === globalPSD)
            globalPSD.env = snapShot();
        if (patchGlobalPromise) {
            var GlobalPromise = globalPSD.env.Promise;
            var targetEnv = targetZone.env;
            nativePromiseProto.then = targetEnv.nthen;
            GlobalPromise.prototype.then = targetEnv.gthen;
            if (currentZone.global || targetZone.global) {
                Object.defineProperty(_global, 'Promise', targetEnv.PromiseProp);
                GlobalPromise.all = targetEnv.all;
                GlobalPromise.race = targetEnv.race;
                GlobalPromise.resolve = targetEnv.resolve;
                GlobalPromise.reject = targetEnv.reject;
                if (targetEnv.allSettled)
                    GlobalPromise.allSettled = targetEnv.allSettled;
                if (targetEnv.any)
                    GlobalPromise.any = targetEnv.any;
            }
        }
    }
    function snapShot() {
        var GlobalPromise = _global.Promise;
        return patchGlobalPromise ? {
            Promise: GlobalPromise,
            PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
            all: GlobalPromise.all,
            race: GlobalPromise.race,
            allSettled: GlobalPromise.allSettled,
            any: GlobalPromise.any,
            resolve: GlobalPromise.resolve,
            reject: GlobalPromise.reject,
            nthen: nativePromiseProto.then,
            gthen: GlobalPromise.prototype.then
        } : {};
    }
    function usePSD(psd, fn, a1, a2, a3) {
        var outerScope = PSD;
        try {
            switchToZone(psd, true);
            return fn(a1, a2, a3);
        }
        finally {
            switchToZone(outerScope, false);
        }
    }
    function enqueueNativeMicroTask(job) {
        nativePromiseThen.call(resolvedNativePromise, job);
    }
    function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
        return typeof fn !== 'function' ? fn : function () {
            var outerZone = PSD;
            if (possibleAwait)
                incrementExpectedAwaits();
            switchToZone(zone, true);
            try {
                return fn.apply(this, arguments);
            }
            finally {
                switchToZone(outerZone, false);
                if (cleanup)
                    enqueueNativeMicroTask(decrementExpectedAwaits);
            }
        };
    }
    function getPatchedPromiseThen(origThen, zone) {
        return function (onResolved, onRejected) {
            return origThen.call(this, nativeAwaitCompatibleWrap(onResolved, zone), nativeAwaitCompatibleWrap(onRejected, zone));
        };
    }
    const UNHANDLEDREJECTION = "unhandledrejection";
    function globalError(err, promise) {
        var rv;
        try {
            rv = promise.onuncatched(err);
        }
        catch (e) { }
        if (rv !== false)
            try {
                var event, eventData = { promise: promise, reason: err };
                if (_global.document && document.createEvent) {
                    event = document.createEvent('Event');
                    event.initEvent(UNHANDLEDREJECTION, true, true);
                    extend(event, eventData);
                }
                else if (_global.CustomEvent) {
                    event = new CustomEvent(UNHANDLEDREJECTION, { detail: eventData });
                    extend(event, eventData);
                }
                if (event && _global.dispatchEvent) {
                    dispatchEvent(event);
                    if (!_global.PromiseRejectionEvent && _global.onunhandledrejection)
                        try {
                            _global.onunhandledrejection(event);
                        }
                        catch (_) { }
                }
                if (debug && event && !event.defaultPrevented) {
                    console.warn(`Unhandled rejection: ${err.stack || err}`);
                }
            }
            catch (e) { }
    }
    var rejection = DexiePromise.reject;

    function tempTransaction(db, mode, storeNames, fn) {
        if (!db.idbdb || (!db._state.openComplete && (!PSD.letThrough && !db._vip))) {
            if (db._state.openComplete) {
                return rejection(new exceptions.DatabaseClosed(db._state.dbOpenError));
            }
            if (!db._state.isBeingOpened) {
                if (!db._options.autoOpen)
                    return rejection(new exceptions.DatabaseClosed());
                db.open().catch(nop);
            }
            return db._state.dbReadyPromise.then(() => tempTransaction(db, mode, storeNames, fn));
        }
        else {
            var trans = db._createTransaction(mode, storeNames, db._dbSchema);
            try {
                trans.create();
                db._state.PR1398_maxLoop = 3;
            }
            catch (ex) {
                if (ex.name === errnames.InvalidState && db.isOpen() && --db._state.PR1398_maxLoop > 0) {
                    console.warn('Dexie: Need to reopen db');
                    db._close();
                    return db.open().then(() => tempTransaction(db, mode, storeNames, fn));
                }
                return rejection(ex);
            }
            return trans._promise(mode, (resolve, reject) => {
                return newScope(() => {
                    PSD.trans = trans;
                    return fn(resolve, reject, trans);
                });
            }).then(result => {
                return trans._completion.then(() => result);
            });
        }
    }

    const DEXIE_VERSION = '3.2.1';
    const maxString = String.fromCharCode(65535);
    const minKey = -Infinity;
    const INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
    const STRING_EXPECTED = "String expected.";
    const connections = [];
    const isIEOrEdge = typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
    const hasIEDeleteObjectStoreBug = isIEOrEdge;
    const hangsOnDeleteLargeKeyRange = isIEOrEdge;
    const dexieStackFrameFilter = frame => !/(dexie\.js|dexie\.min\.js)/.test(frame);
    const DBNAMES_DB = '__dbnames';
    const READONLY = 'readonly';
    const READWRITE = 'readwrite';

    function combine(filter1, filter2) {
        return filter1 ?
            filter2 ?
                function () { return filter1.apply(this, arguments) && filter2.apply(this, arguments); } :
                filter1 :
            filter2;
    }

    const AnyRange = {
        type: 3 ,
        lower: -Infinity,
        lowerOpen: false,
        upper: [[]],
        upperOpen: false
    };

    function workaroundForUndefinedPrimKey(keyPath) {
        return typeof keyPath === "string" && !/\./.test(keyPath)
            ? (obj) => {
                if (obj[keyPath] === undefined && (keyPath in obj)) {
                    obj = deepClone(obj);
                    delete obj[keyPath];
                }
                return obj;
            }
            : (obj) => obj;
    }

    class Table {
        _trans(mode, fn, writeLocked) {
            const trans = this._tx || PSD.trans;
            const tableName = this.name;
            function checkTableInTransaction(resolve, reject, trans) {
                if (!trans.schema[tableName])
                    throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
                return fn(trans.idbtrans, trans);
            }
            const wasRootExec = beginMicroTickScope();
            try {
                return trans && trans.db === this.db ?
                    trans === PSD.trans ?
                        trans._promise(mode, checkTableInTransaction, writeLocked) :
                        newScope(() => trans._promise(mode, checkTableInTransaction, writeLocked), { trans: trans, transless: PSD.transless || PSD }) :
                    tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
            }
            finally {
                if (wasRootExec)
                    endMicroTickScope();
            }
        }
        get(keyOrCrit, cb) {
            if (keyOrCrit && keyOrCrit.constructor === Object)
                return this.where(keyOrCrit).first(cb);
            return this._trans('readonly', (trans) => {
                return this.core.get({ trans, key: keyOrCrit })
                    .then(res => this.hook.reading.fire(res));
            }).then(cb);
        }
        where(indexOrCrit) {
            if (typeof indexOrCrit === 'string')
                return new this.db.WhereClause(this, indexOrCrit);
            if (isArray(indexOrCrit))
                return new this.db.WhereClause(this, `[${indexOrCrit.join('+')}]`);
            const keyPaths = keys(indexOrCrit);
            if (keyPaths.length === 1)
                return this
                    .where(keyPaths[0])
                    .equals(indexOrCrit[keyPaths[0]]);
            const compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(ix => ix.compound &&
                keyPaths.every(keyPath => ix.keyPath.indexOf(keyPath) >= 0) &&
                ix.keyPath.every(keyPath => keyPaths.indexOf(keyPath) >= 0))[0];
            if (compoundIndex && this.db._maxKey !== maxString)
                return this
                    .where(compoundIndex.name)
                    .equals(compoundIndex.keyPath.map(kp => indexOrCrit[kp]));
            if (!compoundIndex && debug)
                console.warn(`The query ${JSON.stringify(indexOrCrit)} on ${this.name} would benefit of a ` +
                    `compound index [${keyPaths.join('+')}]`);
            const { idxByName } = this.schema;
            const idb = this.db._deps.indexedDB;
            function equals(a, b) {
                try {
                    return idb.cmp(a, b) === 0;
                }
                catch (e) {
                    return false;
                }
            }
            const [idx, filterFunction] = keyPaths.reduce(([prevIndex, prevFilterFn], keyPath) => {
                const index = idxByName[keyPath];
                const value = indexOrCrit[keyPath];
                return [
                    prevIndex || index,
                    prevIndex || !index ?
                        combine(prevFilterFn, index && index.multi ?
                            x => {
                                const prop = getByKeyPath(x, keyPath);
                                return isArray(prop) && prop.some(item => equals(value, item));
                            } : x => equals(value, getByKeyPath(x, keyPath)))
                        : prevFilterFn
                ];
            }, [null, null]);
            return idx ?
                this.where(idx.name).equals(indexOrCrit[idx.keyPath])
                    .filter(filterFunction) :
                compoundIndex ?
                    this.filter(filterFunction) :
                    this.where(keyPaths).equals('');
        }
        filter(filterFunction) {
            return this.toCollection().and(filterFunction);
        }
        count(thenShortcut) {
            return this.toCollection().count(thenShortcut);
        }
        offset(offset) {
            return this.toCollection().offset(offset);
        }
        limit(numRows) {
            return this.toCollection().limit(numRows);
        }
        each(callback) {
            return this.toCollection().each(callback);
        }
        toArray(thenShortcut) {
            return this.toCollection().toArray(thenShortcut);
        }
        toCollection() {
            return new this.db.Collection(new this.db.WhereClause(this));
        }
        orderBy(index) {
            return new this.db.Collection(new this.db.WhereClause(this, isArray(index) ?
                `[${index.join('+')}]` :
                index));
        }
        reverse() {
            return this.toCollection().reverse();
        }
        mapToClass(constructor) {
            this.schema.mappedClass = constructor;
            const readHook = obj => {
                if (!obj)
                    return obj;
                const res = Object.create(constructor.prototype);
                for (var m in obj)
                    if (hasOwn(obj, m))
                        try {
                            res[m] = obj[m];
                        }
                        catch (_) { }
                return res;
            };
            if (this.schema.readHook) {
                this.hook.reading.unsubscribe(this.schema.readHook);
            }
            this.schema.readHook = readHook;
            this.hook("reading", readHook);
            return constructor;
        }
        defineClass() {
            function Class(content) {
                extend(this, content);
            }
            return this.mapToClass(Class);
        }
        add(obj, key) {
            const { auto, keyPath } = this.schema.primKey;
            let objToAdd = obj;
            if (keyPath && auto) {
                objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
            }
            return this._trans('readwrite', trans => {
                return this.core.mutate({ trans, type: 'add', keys: key != null ? [key] : null, values: [objToAdd] });
            }).then(res => res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult)
                .then(lastResult => {
                if (keyPath) {
                    try {
                        setByKeyPath(obj, keyPath, lastResult);
                    }
                    catch (_) { }
                }
                return lastResult;
            });
        }
        update(keyOrObject, modifications) {
            if (typeof keyOrObject === 'object' && !isArray(keyOrObject)) {
                const key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
                if (key === undefined)
                    return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
                try {
                    if (typeof modifications !== "function") {
                        keys(modifications).forEach(keyPath => {
                            setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
                        });
                    }
                    else {
                        modifications(keyOrObject, { value: keyOrObject, primKey: key });
                    }
                }
                catch (_a) {
                }
                return this.where(":id").equals(key).modify(modifications);
            }
            else {
                return this.where(":id").equals(keyOrObject).modify(modifications);
            }
        }
        put(obj, key) {
            const { auto, keyPath } = this.schema.primKey;
            let objToAdd = obj;
            if (keyPath && auto) {
                objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
            }
            return this._trans('readwrite', trans => this.core.mutate({ trans, type: 'put', values: [objToAdd], keys: key != null ? [key] : null }))
                .then(res => res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult)
                .then(lastResult => {
                if (keyPath) {
                    try {
                        setByKeyPath(obj, keyPath, lastResult);
                    }
                    catch (_) { }
                }
                return lastResult;
            });
        }
        delete(key) {
            return this._trans('readwrite', trans => this.core.mutate({ trans, type: 'delete', keys: [key] }))
                .then(res => res.numFailures ? DexiePromise.reject(res.failures[0]) : undefined);
        }
        clear() {
            return this._trans('readwrite', trans => this.core.mutate({ trans, type: 'deleteRange', range: AnyRange }))
                .then(res => res.numFailures ? DexiePromise.reject(res.failures[0]) : undefined);
        }
        bulkGet(keys) {
            return this._trans('readonly', trans => {
                return this.core.getMany({
                    keys,
                    trans
                }).then(result => result.map(res => this.hook.reading.fire(res)));
            });
        }
        bulkAdd(objects, keysOrOptions, options) {
            const keys = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
            options = options || (keys ? undefined : keysOrOptions);
            const wantResults = options ? options.allKeys : undefined;
            return this._trans('readwrite', trans => {
                const { auto, keyPath } = this.schema.primKey;
                if (keyPath && keys)
                    throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
                if (keys && keys.length !== objects.length)
                    throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                const numObjects = objects.length;
                let objectsToAdd = keyPath && auto ?
                    objects.map(workaroundForUndefinedPrimKey(keyPath)) :
                    objects;
                return this.core.mutate({ trans, type: 'add', keys: keys, values: objectsToAdd, wantResults })
                    .then(({ numFailures, results, lastResult, failures }) => {
                    const result = wantResults ? results : lastResult;
                    if (numFailures === 0)
                        return result;
                    throw new BulkError(`${this.name}.bulkAdd(): ${numFailures} of ${numObjects} operations failed`, failures);
                });
            });
        }
        bulkPut(objects, keysOrOptions, options) {
            const keys = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
            options = options || (keys ? undefined : keysOrOptions);
            const wantResults = options ? options.allKeys : undefined;
            return this._trans('readwrite', trans => {
                const { auto, keyPath } = this.schema.primKey;
                if (keyPath && keys)
                    throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
                if (keys && keys.length !== objects.length)
                    throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                const numObjects = objects.length;
                let objectsToPut = keyPath && auto ?
                    objects.map(workaroundForUndefinedPrimKey(keyPath)) :
                    objects;
                return this.core.mutate({ trans, type: 'put', keys: keys, values: objectsToPut, wantResults })
                    .then(({ numFailures, results, lastResult, failures }) => {
                    const result = wantResults ? results : lastResult;
                    if (numFailures === 0)
                        return result;
                    throw new BulkError(`${this.name}.bulkPut(): ${numFailures} of ${numObjects} operations failed`, failures);
                });
            });
        }
        bulkDelete(keys) {
            const numKeys = keys.length;
            return this._trans('readwrite', trans => {
                return this.core.mutate({ trans, type: 'delete', keys: keys });
            }).then(({ numFailures, lastResult, failures }) => {
                if (numFailures === 0)
                    return lastResult;
                throw new BulkError(`${this.name}.bulkDelete(): ${numFailures} of ${numKeys} operations failed`, failures);
            });
        }
    }

    function Events(ctx) {
        var evs = {};
        var rv = function (eventName, subscriber) {
            if (subscriber) {
                var i = arguments.length, args = new Array(i - 1);
                while (--i)
                    args[i - 1] = arguments[i];
                evs[eventName].subscribe.apply(null, args);
                return ctx;
            }
            else if (typeof (eventName) === 'string') {
                return evs[eventName];
            }
        };
        rv.addEventType = add;
        for (var i = 1, l = arguments.length; i < l; ++i) {
            add(arguments[i]);
        }
        return rv;
        function add(eventName, chainFunction, defaultFunction) {
            if (typeof eventName === 'object')
                return addConfiguredEvents(eventName);
            if (!chainFunction)
                chainFunction = reverseStoppableEventChain;
            if (!defaultFunction)
                defaultFunction = nop;
            var context = {
                subscribers: [],
                fire: defaultFunction,
                subscribe: function (cb) {
                    if (context.subscribers.indexOf(cb) === -1) {
                        context.subscribers.push(cb);
                        context.fire = chainFunction(context.fire, cb);
                    }
                },
                unsubscribe: function (cb) {
                    context.subscribers = context.subscribers.filter(function (fn) { return fn !== cb; });
                    context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
                }
            };
            evs[eventName] = rv[eventName] = context;
            return context;
        }
        function addConfiguredEvents(cfg) {
            keys(cfg).forEach(function (eventName) {
                var args = cfg[eventName];
                if (isArray(args)) {
                    add(eventName, cfg[eventName][0], cfg[eventName][1]);
                }
                else if (args === 'asap') {
                    var context = add(eventName, mirror, function fire() {
                        var i = arguments.length, args = new Array(i);
                        while (i--)
                            args[i] = arguments[i];
                        context.subscribers.forEach(function (fn) {
                            asap$1(function fireEvent() {
                                fn.apply(null, args);
                            });
                        });
                    });
                }
                else
                    throw new exceptions.InvalidArgument("Invalid event config");
            });
        }
    }

    function makeClassConstructor(prototype, constructor) {
        derive(constructor).from({ prototype });
        return constructor;
    }

    function createTableConstructor(db) {
        return makeClassConstructor(Table.prototype, function Table(name, tableSchema, trans) {
            this.db = db;
            this._tx = trans;
            this.name = name;
            this.schema = tableSchema;
            this.hook = db._allTables[name] ? db._allTables[name].hook : Events(null, {
                "creating": [hookCreatingChain, nop],
                "reading": [pureFunctionChain, mirror],
                "updating": [hookUpdatingChain, nop],
                "deleting": [hookDeletingChain, nop]
            });
        });
    }

    function isPlainKeyRange(ctx, ignoreLimitFilter) {
        return !(ctx.filter || ctx.algorithm || ctx.or) &&
            (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
    }
    function addFilter(ctx, fn) {
        ctx.filter = combine(ctx.filter, fn);
    }
    function addReplayFilter(ctx, factory, isLimitFilter) {
        var curr = ctx.replayFilter;
        ctx.replayFilter = curr ? () => combine(curr(), factory()) : factory;
        ctx.justLimit = isLimitFilter && !curr;
    }
    function addMatchFilter(ctx, fn) {
        ctx.isMatch = combine(ctx.isMatch, fn);
    }
    function getIndexOrStore(ctx, coreSchema) {
        if (ctx.isPrimKey)
            return coreSchema.primaryKey;
        const index = coreSchema.getIndexByKeyPath(ctx.index);
        if (!index)
            throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
        return index;
    }
    function openCursor(ctx, coreTable, trans) {
        const index = getIndexOrStore(ctx, coreTable.schema);
        return coreTable.openCursor({
            trans,
            values: !ctx.keysOnly,
            reverse: ctx.dir === 'prev',
            unique: !!ctx.unique,
            query: {
                index,
                range: ctx.range
            }
        });
    }
    function iter(ctx, fn, coreTrans, coreTable) {
        const filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
        if (!ctx.or) {
            return iterate(openCursor(ctx, coreTable, coreTrans), combine(ctx.algorithm, filter), fn, !ctx.keysOnly && ctx.valueMapper);
        }
        else {
            const set = {};
            const union = (item, cursor, advance) => {
                if (!filter || filter(cursor, advance, result => cursor.stop(result), err => cursor.fail(err))) {
                    var primaryKey = cursor.primaryKey;
                    var key = '' + primaryKey;
                    if (key === '[object ArrayBuffer]')
                        key = '' + new Uint8Array(primaryKey);
                    if (!hasOwn(set, key)) {
                        set[key] = true;
                        fn(item, cursor, advance);
                    }
                }
            };
            return Promise.all([
                ctx.or._iterate(union, coreTrans),
                iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)
            ]);
        }
    }
    function iterate(cursorPromise, filter, fn, valueMapper) {
        var mappedFn = valueMapper ? (x, c, a) => fn(valueMapper(x), c, a) : fn;
        var wrappedFn = wrap(mappedFn);
        return cursorPromise.then(cursor => {
            if (cursor) {
                return cursor.start(() => {
                    var c = () => cursor.continue();
                    if (!filter || filter(cursor, advancer => c = advancer, val => { cursor.stop(val); c = nop; }, e => { cursor.fail(e); c = nop; }))
                        wrappedFn(cursor.value, cursor, advancer => c = advancer);
                    c();
                });
            }
        });
    }

    function cmp(a, b) {
        try {
            const ta = type(a);
            const tb = type(b);
            if (ta !== tb) {
                if (ta === 'Array')
                    return 1;
                if (tb === 'Array')
                    return -1;
                if (ta === 'binary')
                    return 1;
                if (tb === 'binary')
                    return -1;
                if (ta === 'string')
                    return 1;
                if (tb === 'string')
                    return -1;
                if (ta === 'Date')
                    return 1;
                if (tb !== 'Date')
                    return NaN;
                return -1;
            }
            switch (ta) {
                case 'number':
                case 'Date':
                case 'string':
                    return a > b ? 1 : a < b ? -1 : 0;
                case 'binary': {
                    return compareUint8Arrays(getUint8Array(a), getUint8Array(b));
                }
                case 'Array':
                    return compareArrays(a, b);
            }
        }
        catch (_a) { }
        return NaN;
    }
    function compareArrays(a, b) {
        const al = a.length;
        const bl = b.length;
        const l = al < bl ? al : bl;
        for (let i = 0; i < l; ++i) {
            const res = cmp(a[i], b[i]);
            if (res !== 0)
                return res;
        }
        return al === bl ? 0 : al < bl ? -1 : 1;
    }
    function compareUint8Arrays(a, b) {
        const al = a.length;
        const bl = b.length;
        const l = al < bl ? al : bl;
        for (let i = 0; i < l; ++i) {
            if (a[i] !== b[i])
                return a[i] < b[i] ? -1 : 1;
        }
        return al === bl ? 0 : al < bl ? -1 : 1;
    }
    function type(x) {
        const t = typeof x;
        if (t !== 'object')
            return t;
        if (ArrayBuffer.isView(x))
            return 'binary';
        const tsTag = toStringTag(x);
        return tsTag === 'ArrayBuffer' ? 'binary' : tsTag;
    }
    function getUint8Array(a) {
        if (a instanceof Uint8Array)
            return a;
        if (ArrayBuffer.isView(a))
            return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        return new Uint8Array(a);
    }

    class Collection {
        _read(fn, cb) {
            var ctx = this._ctx;
            return ctx.error ?
                ctx.table._trans(null, rejection.bind(null, ctx.error)) :
                ctx.table._trans('readonly', fn).then(cb);
        }
        _write(fn) {
            var ctx = this._ctx;
            return ctx.error ?
                ctx.table._trans(null, rejection.bind(null, ctx.error)) :
                ctx.table._trans('readwrite', fn, "locked");
        }
        _addAlgorithm(fn) {
            var ctx = this._ctx;
            ctx.algorithm = combine(ctx.algorithm, fn);
        }
        _iterate(fn, coreTrans) {
            return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
        }
        clone(props) {
            var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
            if (props)
                extend(ctx, props);
            rv._ctx = ctx;
            return rv;
        }
        raw() {
            this._ctx.valueMapper = null;
            return this;
        }
        each(fn) {
            var ctx = this._ctx;
            return this._read(trans => iter(ctx, fn, trans, ctx.table.core));
        }
        count(cb) {
            return this._read(trans => {
                const ctx = this._ctx;
                const coreTable = ctx.table.core;
                if (isPlainKeyRange(ctx, true)) {
                    return coreTable.count({
                        trans,
                        query: {
                            index: getIndexOrStore(ctx, coreTable.schema),
                            range: ctx.range
                        }
                    }).then(count => Math.min(count, ctx.limit));
                }
                else {
                    var count = 0;
                    return iter(ctx, () => { ++count; return false; }, trans, coreTable)
                        .then(() => count);
                }
            }).then(cb);
        }
        sortBy(keyPath, cb) {
            const parts = keyPath.split('.').reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
            function getval(obj, i) {
                if (i)
                    return getval(obj[parts[i]], i - 1);
                return obj[lastPart];
            }
            var order = this._ctx.dir === "next" ? 1 : -1;
            function sorter(a, b) {
                var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
                return aVal < bVal ? -order : aVal > bVal ? order : 0;
            }
            return this.toArray(function (a) {
                return a.sort(sorter);
            }).then(cb);
        }
        toArray(cb) {
            return this._read(trans => {
                var ctx = this._ctx;
                if (ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                    const { valueMapper } = ctx;
                    const index = getIndexOrStore(ctx, ctx.table.core.schema);
                    return ctx.table.core.query({
                        trans,
                        limit: ctx.limit,
                        values: true,
                        query: {
                            index,
                            range: ctx.range
                        }
                    }).then(({ result }) => valueMapper ? result.map(valueMapper) : result);
                }
                else {
                    const a = [];
                    return iter(ctx, item => a.push(item), trans, ctx.table.core).then(() => a);
                }
            }, cb);
        }
        offset(offset) {
            var ctx = this._ctx;
            if (offset <= 0)
                return this;
            ctx.offset += offset;
            if (isPlainKeyRange(ctx)) {
                addReplayFilter(ctx, () => {
                    var offsetLeft = offset;
                    return (cursor, advance) => {
                        if (offsetLeft === 0)
                            return true;
                        if (offsetLeft === 1) {
                            --offsetLeft;
                            return false;
                        }
                        advance(() => {
                            cursor.advance(offsetLeft);
                            offsetLeft = 0;
                        });
                        return false;
                    };
                });
            }
            else {
                addReplayFilter(ctx, () => {
                    var offsetLeft = offset;
                    return () => (--offsetLeft < 0);
                });
            }
            return this;
        }
        limit(numRows) {
            this._ctx.limit = Math.min(this._ctx.limit, numRows);
            addReplayFilter(this._ctx, () => {
                var rowsLeft = numRows;
                return function (cursor, advance, resolve) {
                    if (--rowsLeft <= 0)
                        advance(resolve);
                    return rowsLeft >= 0;
                };
            }, true);
            return this;
        }
        until(filterFunction, bIncludeStopEntry) {
            addFilter(this._ctx, function (cursor, advance, resolve) {
                if (filterFunction(cursor.value)) {
                    advance(resolve);
                    return bIncludeStopEntry;
                }
                else {
                    return true;
                }
            });
            return this;
        }
        first(cb) {
            return this.limit(1).toArray(function (a) { return a[0]; }).then(cb);
        }
        last(cb) {
            return this.reverse().first(cb);
        }
        filter(filterFunction) {
            addFilter(this._ctx, function (cursor) {
                return filterFunction(cursor.value);
            });
            addMatchFilter(this._ctx, filterFunction);
            return this;
        }
        and(filter) {
            return this.filter(filter);
        }
        or(indexName) {
            return new this.db.WhereClause(this._ctx.table, indexName, this);
        }
        reverse() {
            this._ctx.dir = (this._ctx.dir === "prev" ? "next" : "prev");
            if (this._ondirectionchange)
                this._ondirectionchange(this._ctx.dir);
            return this;
        }
        desc() {
            return this.reverse();
        }
        eachKey(cb) {
            var ctx = this._ctx;
            ctx.keysOnly = !ctx.isMatch;
            return this.each(function (val, cursor) { cb(cursor.key, cursor); });
        }
        eachUniqueKey(cb) {
            this._ctx.unique = "unique";
            return this.eachKey(cb);
        }
        eachPrimaryKey(cb) {
            var ctx = this._ctx;
            ctx.keysOnly = !ctx.isMatch;
            return this.each(function (val, cursor) { cb(cursor.primaryKey, cursor); });
        }
        keys(cb) {
            var ctx = this._ctx;
            ctx.keysOnly = !ctx.isMatch;
            var a = [];
            return this.each(function (item, cursor) {
                a.push(cursor.key);
            }).then(function () {
                return a;
            }).then(cb);
        }
        primaryKeys(cb) {
            var ctx = this._ctx;
            if (ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                return this._read(trans => {
                    var index = getIndexOrStore(ctx, ctx.table.core.schema);
                    return ctx.table.core.query({
                        trans,
                        values: false,
                        limit: ctx.limit,
                        query: {
                            index,
                            range: ctx.range
                        }
                    });
                }).then(({ result }) => result).then(cb);
            }
            ctx.keysOnly = !ctx.isMatch;
            var a = [];
            return this.each(function (item, cursor) {
                a.push(cursor.primaryKey);
            }).then(function () {
                return a;
            }).then(cb);
        }
        uniqueKeys(cb) {
            this._ctx.unique = "unique";
            return this.keys(cb);
        }
        firstKey(cb) {
            return this.limit(1).keys(function (a) { return a[0]; }).then(cb);
        }
        lastKey(cb) {
            return this.reverse().firstKey(cb);
        }
        distinct() {
            var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
            if (!idx || !idx.multi)
                return this;
            var set = {};
            addFilter(this._ctx, function (cursor) {
                var strKey = cursor.primaryKey.toString();
                var found = hasOwn(set, strKey);
                set[strKey] = true;
                return !found;
            });
            return this;
        }
        modify(changes) {
            var ctx = this._ctx;
            return this._write(trans => {
                var modifyer;
                if (typeof changes === 'function') {
                    modifyer = changes;
                }
                else {
                    var keyPaths = keys(changes);
                    var numKeys = keyPaths.length;
                    modifyer = function (item) {
                        var anythingModified = false;
                        for (var i = 0; i < numKeys; ++i) {
                            var keyPath = keyPaths[i], val = changes[keyPath];
                            if (getByKeyPath(item, keyPath) !== val) {
                                setByKeyPath(item, keyPath, val);
                                anythingModified = true;
                            }
                        }
                        return anythingModified;
                    };
                }
                const coreTable = ctx.table.core;
                const { outbound, extractKey } = coreTable.schema.primaryKey;
                const limit = this.db._options.modifyChunkSize || 200;
                const totalFailures = [];
                let successCount = 0;
                const failedKeys = [];
                const applyMutateResult = (expectedCount, res) => {
                    const { failures, numFailures } = res;
                    successCount += expectedCount - numFailures;
                    for (let pos of keys(failures)) {
                        totalFailures.push(failures[pos]);
                    }
                };
                return this.clone().primaryKeys().then(keys => {
                    const nextChunk = (offset) => {
                        const count = Math.min(limit, keys.length - offset);
                        return coreTable.getMany({
                            trans,
                            keys: keys.slice(offset, offset + count),
                            cache: "immutable"
                        }).then(values => {
                            const addValues = [];
                            const putValues = [];
                            const putKeys = outbound ? [] : null;
                            const deleteKeys = [];
                            for (let i = 0; i < count; ++i) {
                                const origValue = values[i];
                                const ctx = {
                                    value: deepClone(origValue),
                                    primKey: keys[offset + i]
                                };
                                if (modifyer.call(ctx, ctx.value, ctx) !== false) {
                                    if (ctx.value == null) {
                                        deleteKeys.push(keys[offset + i]);
                                    }
                                    else if (!outbound && cmp(extractKey(origValue), extractKey(ctx.value)) !== 0) {
                                        deleteKeys.push(keys[offset + i]);
                                        addValues.push(ctx.value);
                                    }
                                    else {
                                        putValues.push(ctx.value);
                                        if (outbound)
                                            putKeys.push(keys[offset + i]);
                                    }
                                }
                            }
                            const criteria = isPlainKeyRange(ctx) &&
                                ctx.limit === Infinity &&
                                (typeof changes !== 'function' || changes === deleteCallback) && {
                                index: ctx.index,
                                range: ctx.range
                            };
                            return Promise.resolve(addValues.length > 0 &&
                                coreTable.mutate({ trans, type: 'add', values: addValues })
                                    .then(res => {
                                    for (let pos in res.failures) {
                                        deleteKeys.splice(parseInt(pos), 1);
                                    }
                                    applyMutateResult(addValues.length, res);
                                })).then(() => (putValues.length > 0 || (criteria && typeof changes === 'object')) &&
                                coreTable.mutate({
                                    trans,
                                    type: 'put',
                                    keys: putKeys,
                                    values: putValues,
                                    criteria,
                                    changeSpec: typeof changes !== 'function'
                                        && changes
                                }).then(res => applyMutateResult(putValues.length, res))).then(() => (deleteKeys.length > 0 || (criteria && changes === deleteCallback)) &&
                                coreTable.mutate({
                                    trans,
                                    type: 'delete',
                                    keys: deleteKeys,
                                    criteria
                                }).then(res => applyMutateResult(deleteKeys.length, res))).then(() => {
                                return keys.length > offset + count && nextChunk(offset + limit);
                            });
                        });
                    };
                    return nextChunk(0).then(() => {
                        if (totalFailures.length > 0)
                            throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys);
                        return keys.length;
                    });
                });
            });
        }
        delete() {
            var ctx = this._ctx, range = ctx.range;
            if (isPlainKeyRange(ctx) &&
                ((ctx.isPrimKey && !hangsOnDeleteLargeKeyRange) || range.type === 3 ))
             {
                return this._write(trans => {
                    const { primaryKey } = ctx.table.core.schema;
                    const coreRange = range;
                    return ctx.table.core.count({ trans, query: { index: primaryKey, range: coreRange } }).then(count => {
                        return ctx.table.core.mutate({ trans, type: 'deleteRange', range: coreRange })
                            .then(({ failures, lastResult, results, numFailures }) => {
                            if (numFailures)
                                throw new ModifyError("Could not delete some values", Object.keys(failures).map(pos => failures[pos]), count - numFailures);
                            return count - numFailures;
                        });
                    });
                });
            }
            return this.modify(deleteCallback);
        }
    }
    const deleteCallback = (value, ctx) => ctx.value = null;

    function createCollectionConstructor(db) {
        return makeClassConstructor(Collection.prototype, function Collection(whereClause, keyRangeGenerator) {
            this.db = db;
            let keyRange = AnyRange, error = null;
            if (keyRangeGenerator)
                try {
                    keyRange = keyRangeGenerator();
                }
                catch (ex) {
                    error = ex;
                }
            const whereCtx = whereClause._ctx;
            const table = whereCtx.table;
            const readingHook = table.hook.reading.fire;
            this._ctx = {
                table: table,
                index: whereCtx.index,
                isPrimKey: (!whereCtx.index || (table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name)),
                range: keyRange,
                keysOnly: false,
                dir: "next",
                unique: "",
                algorithm: null,
                filter: null,
                replayFilter: null,
                justLimit: true,
                isMatch: null,
                offset: 0,
                limit: Infinity,
                error: error,
                or: whereCtx.or,
                valueMapper: readingHook !== mirror ? readingHook : null
            };
        });
    }

    function simpleCompare(a, b) {
        return a < b ? -1 : a === b ? 0 : 1;
    }
    function simpleCompareReverse(a, b) {
        return a > b ? -1 : a === b ? 0 : 1;
    }

    function fail(collectionOrWhereClause, err, T) {
        var collection = collectionOrWhereClause instanceof WhereClause ?
            new collectionOrWhereClause.Collection(collectionOrWhereClause) :
            collectionOrWhereClause;
        collection._ctx.error = T ? new T(err) : new TypeError(err);
        return collection;
    }
    function emptyCollection(whereClause) {
        return new whereClause.Collection(whereClause, () => rangeEqual("")).limit(0);
    }
    function upperFactory(dir) {
        return dir === "next" ?
            (s) => s.toUpperCase() :
            (s) => s.toLowerCase();
    }
    function lowerFactory(dir) {
        return dir === "next" ?
            (s) => s.toLowerCase() :
            (s) => s.toUpperCase();
    }
    function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
        var length = Math.min(key.length, lowerNeedle.length);
        var llp = -1;
        for (var i = 0; i < length; ++i) {
            var lwrKeyChar = lowerKey[i];
            if (lwrKeyChar !== lowerNeedle[i]) {
                if (cmp(key[i], upperNeedle[i]) < 0)
                    return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
                if (cmp(key[i], lowerNeedle[i]) < 0)
                    return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
                if (llp >= 0)
                    return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
                return null;
            }
            if (cmp(key[i], lwrKeyChar) < 0)
                llp = i;
        }
        if (length < lowerNeedle.length && dir === "next")
            return key + upperNeedle.substr(key.length);
        if (length < key.length && dir === "prev")
            return key.substr(0, upperNeedle.length);
        return (llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1));
    }
    function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
        var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
        if (!needles.every(s => typeof s === 'string')) {
            return fail(whereClause, STRING_EXPECTED);
        }
        function initDirection(dir) {
            upper = upperFactory(dir);
            lower = lowerFactory(dir);
            compare = (dir === "next" ? simpleCompare : simpleCompareReverse);
            var needleBounds = needles.map(function (needle) {
                return { lower: lower(needle), upper: upper(needle) };
            }).sort(function (a, b) {
                return compare(a.lower, b.lower);
            });
            upperNeedles = needleBounds.map(function (nb) { return nb.upper; });
            lowerNeedles = needleBounds.map(function (nb) { return nb.lower; });
            direction = dir;
            nextKeySuffix = (dir === "next" ? "" : suffix);
        }
        initDirection("next");
        var c = new whereClause.Collection(whereClause, () => createRange(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix));
        c._ondirectionchange = function (direction) {
            initDirection(direction);
        };
        var firstPossibleNeedle = 0;
        c._addAlgorithm(function (cursor, advance, resolve) {
            var key = cursor.key;
            if (typeof key !== 'string')
                return false;
            var lowerKey = lower(key);
            if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
                return true;
            }
            else {
                var lowestPossibleCasing = null;
                for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
                    var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
                    if (casing === null && lowestPossibleCasing === null)
                        firstPossibleNeedle = i + 1;
                    else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                        lowestPossibleCasing = casing;
                    }
                }
                if (lowestPossibleCasing !== null) {
                    advance(function () { cursor.continue(lowestPossibleCasing + nextKeySuffix); });
                }
                else {
                    advance(resolve);
                }
                return false;
            }
        });
        return c;
    }
    function createRange(lower, upper, lowerOpen, upperOpen) {
        return {
            type: 2 ,
            lower,
            upper,
            lowerOpen,
            upperOpen
        };
    }
    function rangeEqual(value) {
        return {
            type: 1 ,
            lower: value,
            upper: value
        };
    }

    class WhereClause {
        get Collection() {
            return this._ctx.table.db.Collection;
        }
        between(lower, upper, includeLower, includeUpper) {
            includeLower = includeLower !== false;
            includeUpper = includeUpper === true;
            try {
                if ((this._cmp(lower, upper) > 0) ||
                    (this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)))
                    return emptyCollection(this);
                return new this.Collection(this, () => createRange(lower, upper, !includeLower, !includeUpper));
            }
            catch (e) {
                return fail(this, INVALID_KEY_ARGUMENT);
            }
        }
        equals(value) {
            if (value == null)
                return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, () => rangeEqual(value));
        }
        above(value) {
            if (value == null)
                return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, () => createRange(value, undefined, true));
        }
        aboveOrEqual(value) {
            if (value == null)
                return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, () => createRange(value, undefined, false));
        }
        below(value) {
            if (value == null)
                return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, () => createRange(undefined, value, false, true));
        }
        belowOrEqual(value) {
            if (value == null)
                return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, () => createRange(undefined, value));
        }
        startsWith(str) {
            if (typeof str !== 'string')
                return fail(this, STRING_EXPECTED);
            return this.between(str, str + maxString, true, true);
        }
        startsWithIgnoreCase(str) {
            if (str === "")
                return this.startsWith(str);
            return addIgnoreCaseAlgorithm(this, (x, a) => x.indexOf(a[0]) === 0, [str], maxString);
        }
        equalsIgnoreCase(str) {
            return addIgnoreCaseAlgorithm(this, (x, a) => x === a[0], [str], "");
        }
        anyOfIgnoreCase() {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (set.length === 0)
                return emptyCollection(this);
            return addIgnoreCaseAlgorithm(this, (x, a) => a.indexOf(x) !== -1, set, "");
        }
        startsWithAnyOfIgnoreCase() {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (set.length === 0)
                return emptyCollection(this);
            return addIgnoreCaseAlgorithm(this, (x, a) => a.some(n => x.indexOf(n) === 0), set, maxString);
        }
        anyOf() {
            const set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            let compare = this._cmp;
            try {
                set.sort(compare);
            }
            catch (e) {
                return fail(this, INVALID_KEY_ARGUMENT);
            }
            if (set.length === 0)
                return emptyCollection(this);
            const c = new this.Collection(this, () => createRange(set[0], set[set.length - 1]));
            c._ondirectionchange = direction => {
                compare = (direction === "next" ?
                    this._ascending :
                    this._descending);
                set.sort(compare);
            };
            let i = 0;
            c._addAlgorithm((cursor, advance, resolve) => {
                const key = cursor.key;
                while (compare(key, set[i]) > 0) {
                    ++i;
                    if (i === set.length) {
                        advance(resolve);
                        return false;
                    }
                }
                if (compare(key, set[i]) === 0) {
                    return true;
                }
                else {
                    advance(() => { cursor.continue(set[i]); });
                    return false;
                }
            });
            return c;
        }
        notEqual(value) {
            return this.inAnyRange([[minKey, value], [value, this.db._maxKey]], { includeLowers: false, includeUppers: false });
        }
        noneOf() {
            const set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (set.length === 0)
                return new this.Collection(this);
            try {
                set.sort(this._ascending);
            }
            catch (e) {
                return fail(this, INVALID_KEY_ARGUMENT);
            }
            const ranges = set.reduce((res, val) => res ?
                res.concat([[res[res.length - 1][1], val]]) :
                [[minKey, val]], null);
            ranges.push([set[set.length - 1], this.db._maxKey]);
            return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
        }
        inAnyRange(ranges, options) {
            const cmp = this._cmp, ascending = this._ascending, descending = this._descending, min = this._min, max = this._max;
            if (ranges.length === 0)
                return emptyCollection(this);
            if (!ranges.every(range => range[0] !== undefined &&
                range[1] !== undefined &&
                ascending(range[0], range[1]) <= 0)) {
                return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
            }
            const includeLowers = !options || options.includeLowers !== false;
            const includeUppers = options && options.includeUppers === true;
            function addRange(ranges, newRange) {
                let i = 0, l = ranges.length;
                for (; i < l; ++i) {
                    const range = ranges[i];
                    if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
                        range[0] = min(range[0], newRange[0]);
                        range[1] = max(range[1], newRange[1]);
                        break;
                    }
                }
                if (i === l)
                    ranges.push(newRange);
                return ranges;
            }
            let sortDirection = ascending;
            function rangeSorter(a, b) { return sortDirection(a[0], b[0]); }
            let set;
            try {
                set = ranges.reduce(addRange, []);
                set.sort(rangeSorter);
            }
            catch (ex) {
                return fail(this, INVALID_KEY_ARGUMENT);
            }
            let rangePos = 0;
            const keyIsBeyondCurrentEntry = includeUppers ?
                key => ascending(key, set[rangePos][1]) > 0 :
                key => ascending(key, set[rangePos][1]) >= 0;
            const keyIsBeforeCurrentEntry = includeLowers ?
                key => descending(key, set[rangePos][0]) > 0 :
                key => descending(key, set[rangePos][0]) >= 0;
            function keyWithinCurrentRange(key) {
                return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
            }
            let checkKey = keyIsBeyondCurrentEntry;
            const c = new this.Collection(this, () => createRange(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers));
            c._ondirectionchange = direction => {
                if (direction === "next") {
                    checkKey = keyIsBeyondCurrentEntry;
                    sortDirection = ascending;
                }
                else {
                    checkKey = keyIsBeforeCurrentEntry;
                    sortDirection = descending;
                }
                set.sort(rangeSorter);
            };
            c._addAlgorithm((cursor, advance, resolve) => {
                var key = cursor.key;
                while (checkKey(key)) {
                    ++rangePos;
                    if (rangePos === set.length) {
                        advance(resolve);
                        return false;
                    }
                }
                if (keyWithinCurrentRange(key)) {
                    return true;
                }
                else if (this._cmp(key, set[rangePos][1]) === 0 || this._cmp(key, set[rangePos][0]) === 0) {
                    return false;
                }
                else {
                    advance(() => {
                        if (sortDirection === ascending)
                            cursor.continue(set[rangePos][0]);
                        else
                            cursor.continue(set[rangePos][1]);
                    });
                    return false;
                }
            });
            return c;
        }
        startsWithAnyOf() {
            const set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (!set.every(s => typeof s === 'string')) {
                return fail(this, "startsWithAnyOf() only works with strings");
            }
            if (set.length === 0)
                return emptyCollection(this);
            return this.inAnyRange(set.map((str) => [str, str + maxString]));
        }
    }

    function createWhereClauseConstructor(db) {
        return makeClassConstructor(WhereClause.prototype, function WhereClause(table, index, orCollection) {
            this.db = db;
            this._ctx = {
                table: table,
                index: index === ":id" ? null : index,
                or: orCollection
            };
            const indexedDB = db._deps.indexedDB;
            if (!indexedDB)
                throw new exceptions.MissingAPI();
            this._cmp = this._ascending = indexedDB.cmp.bind(indexedDB);
            this._descending = (a, b) => indexedDB.cmp(b, a);
            this._max = (a, b) => indexedDB.cmp(a, b) > 0 ? a : b;
            this._min = (a, b) => indexedDB.cmp(a, b) < 0 ? a : b;
            this._IDBKeyRange = db._deps.IDBKeyRange;
        });
    }

    function eventRejectHandler(reject) {
        return wrap(function (event) {
            preventDefault(event);
            reject(event.target.error);
            return false;
        });
    }
    function preventDefault(event) {
        if (event.stopPropagation)
            event.stopPropagation();
        if (event.preventDefault)
            event.preventDefault();
    }

    const DEXIE_STORAGE_MUTATED_EVENT_NAME = 'storagemutated';
    const STORAGE_MUTATED_DOM_EVENT_NAME = 'x-storagemutated-1';
    const globalEvents = Events(null, DEXIE_STORAGE_MUTATED_EVENT_NAME);

    class Transaction {
        _lock() {
            assert(!PSD.global);
            ++this._reculock;
            if (this._reculock === 1 && !PSD.global)
                PSD.lockOwnerFor = this;
            return this;
        }
        _unlock() {
            assert(!PSD.global);
            if (--this._reculock === 0) {
                if (!PSD.global)
                    PSD.lockOwnerFor = null;
                while (this._blockedFuncs.length > 0 && !this._locked()) {
                    var fnAndPSD = this._blockedFuncs.shift();
                    try {
                        usePSD(fnAndPSD[1], fnAndPSD[0]);
                    }
                    catch (e) { }
                }
            }
            return this;
        }
        _locked() {
            return this._reculock && PSD.lockOwnerFor !== this;
        }
        create(idbtrans) {
            if (!this.mode)
                return this;
            const idbdb = this.db.idbdb;
            const dbOpenError = this.db._state.dbOpenError;
            assert(!this.idbtrans);
            if (!idbtrans && !idbdb) {
                switch (dbOpenError && dbOpenError.name) {
                    case "DatabaseClosedError":
                        throw new exceptions.DatabaseClosed(dbOpenError);
                    case "MissingAPIError":
                        throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
                    default:
                        throw new exceptions.OpenFailed(dbOpenError);
                }
            }
            if (!this.active)
                throw new exceptions.TransactionInactive();
            assert(this._completion._state === null);
            idbtrans = this.idbtrans = idbtrans ||
                (this.db.core
                    ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })
                    : idbdb.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }));
            idbtrans.onerror = wrap(ev => {
                preventDefault(ev);
                this._reject(idbtrans.error);
            });
            idbtrans.onabort = wrap(ev => {
                preventDefault(ev);
                this.active && this._reject(new exceptions.Abort(idbtrans.error));
                this.active = false;
                this.on("abort").fire(ev);
            });
            idbtrans.oncomplete = wrap(() => {
                this.active = false;
                this._resolve();
                if ('mutatedParts' in idbtrans) {
                    globalEvents.storagemutated.fire(idbtrans["mutatedParts"]);
                }
            });
            return this;
        }
        _promise(mode, fn, bWriteLock) {
            if (mode === 'readwrite' && this.mode !== 'readwrite')
                return rejection(new exceptions.ReadOnly("Transaction is readonly"));
            if (!this.active)
                return rejection(new exceptions.TransactionInactive());
            if (this._locked()) {
                return new DexiePromise((resolve, reject) => {
                    this._blockedFuncs.push([() => {
                            this._promise(mode, fn, bWriteLock).then(resolve, reject);
                        }, PSD]);
                });
            }
            else if (bWriteLock) {
                return newScope(() => {
                    var p = new DexiePromise((resolve, reject) => {
                        this._lock();
                        const rv = fn(resolve, reject, this);
                        if (rv && rv.then)
                            rv.then(resolve, reject);
                    });
                    p.finally(() => this._unlock());
                    p._lib = true;
                    return p;
                });
            }
            else {
                var p = new DexiePromise((resolve, reject) => {
                    var rv = fn(resolve, reject, this);
                    if (rv && rv.then)
                        rv.then(resolve, reject);
                });
                p._lib = true;
                return p;
            }
        }
        _root() {
            return this.parent ? this.parent._root() : this;
        }
        waitFor(promiseLike) {
            var root = this._root();
            const promise = DexiePromise.resolve(promiseLike);
            if (root._waitingFor) {
                root._waitingFor = root._waitingFor.then(() => promise);
            }
            else {
                root._waitingFor = promise;
                root._waitingQueue = [];
                var store = root.idbtrans.objectStore(root.storeNames[0]);
                (function spin() {
                    ++root._spinCount;
                    while (root._waitingQueue.length)
                        (root._waitingQueue.shift())();
                    if (root._waitingFor)
                        store.get(-Infinity).onsuccess = spin;
                }());
            }
            var currentWaitPromise = root._waitingFor;
            return new DexiePromise((resolve, reject) => {
                promise.then(res => root._waitingQueue.push(wrap(resolve.bind(null, res))), err => root._waitingQueue.push(wrap(reject.bind(null, err)))).finally(() => {
                    if (root._waitingFor === currentWaitPromise) {
                        root._waitingFor = null;
                    }
                });
            });
        }
        abort() {
            if (this.active) {
                this.active = false;
                if (this.idbtrans)
                    this.idbtrans.abort();
                this._reject(new exceptions.Abort());
            }
        }
        table(tableName) {
            const memoizedTables = (this._memoizedTables || (this._memoizedTables = {}));
            if (hasOwn(memoizedTables, tableName))
                return memoizedTables[tableName];
            const tableSchema = this.schema[tableName];
            if (!tableSchema) {
                throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
            }
            const transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
            transactionBoundTable.core = this.db.core.table(tableName);
            memoizedTables[tableName] = transactionBoundTable;
            return transactionBoundTable;
        }
    }

    function createTransactionConstructor(db) {
        return makeClassConstructor(Transaction.prototype, function Transaction(mode, storeNames, dbschema, chromeTransactionDurability, parent) {
            this.db = db;
            this.mode = mode;
            this.storeNames = storeNames;
            this.schema = dbschema;
            this.chromeTransactionDurability = chromeTransactionDurability;
            this.idbtrans = null;
            this.on = Events(this, "complete", "error", "abort");
            this.parent = parent || null;
            this.active = true;
            this._reculock = 0;
            this._blockedFuncs = [];
            this._resolve = null;
            this._reject = null;
            this._waitingFor = null;
            this._waitingQueue = null;
            this._spinCount = 0;
            this._completion = new DexiePromise((resolve, reject) => {
                this._resolve = resolve;
                this._reject = reject;
            });
            this._completion.then(() => {
                this.active = false;
                this.on.complete.fire();
            }, e => {
                var wasActive = this.active;
                this.active = false;
                this.on.error.fire(e);
                this.parent ?
                    this.parent._reject(e) :
                    wasActive && this.idbtrans && this.idbtrans.abort();
                return rejection(e);
            });
        });
    }

    function createIndexSpec(name, keyPath, unique, multi, auto, compound, isPrimKey) {
        return {
            name,
            keyPath,
            unique,
            multi,
            auto,
            compound,
            src: (unique && !isPrimKey ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + nameFromKeyPath(keyPath)
        };
    }
    function nameFromKeyPath(keyPath) {
        return typeof keyPath === 'string' ?
            keyPath :
            keyPath ? ('[' + [].join.call(keyPath, '+') + ']') : "";
    }

    function createTableSchema(name, primKey, indexes) {
        return {
            name,
            primKey,
            indexes,
            mappedClass: null,
            idxByName: arrayToObject(indexes, index => [index.name, index])
        };
    }

    function safariMultiStoreFix(storeNames) {
        return storeNames.length === 1 ? storeNames[0] : storeNames;
    }
    let getMaxKey = (IdbKeyRange) => {
        try {
            IdbKeyRange.only([[]]);
            getMaxKey = () => [[]];
            return [[]];
        }
        catch (e) {
            getMaxKey = () => maxString;
            return maxString;
        }
    };

    function getKeyExtractor(keyPath) {
        if (keyPath == null) {
            return () => undefined;
        }
        else if (typeof keyPath === 'string') {
            return getSinglePathKeyExtractor(keyPath);
        }
        else {
            return obj => getByKeyPath(obj, keyPath);
        }
    }
    function getSinglePathKeyExtractor(keyPath) {
        const split = keyPath.split('.');
        if (split.length === 1) {
            return obj => obj[keyPath];
        }
        else {
            return obj => getByKeyPath(obj, keyPath);
        }
    }

    function arrayify(arrayLike) {
        return [].slice.call(arrayLike);
    }
    let _id_counter = 0;
    function getKeyPathAlias(keyPath) {
        return keyPath == null ?
            ":id" :
            typeof keyPath === 'string' ?
                keyPath :
                `[${keyPath.join('+')}]`;
    }
    function createDBCore(db, IdbKeyRange, tmpTrans) {
        function extractSchema(db, trans) {
            const tables = arrayify(db.objectStoreNames);
            return {
                schema: {
                    name: db.name,
                    tables: tables.map(table => trans.objectStore(table)).map(store => {
                        const { keyPath, autoIncrement } = store;
                        const compound = isArray(keyPath);
                        const outbound = keyPath == null;
                        const indexByKeyPath = {};
                        const result = {
                            name: store.name,
                            primaryKey: {
                                name: null,
                                isPrimaryKey: true,
                                outbound,
                                compound,
                                keyPath,
                                autoIncrement,
                                unique: true,
                                extractKey: getKeyExtractor(keyPath)
                            },
                            indexes: arrayify(store.indexNames).map(indexName => store.index(indexName))
                                .map(index => {
                                const { name, unique, multiEntry, keyPath } = index;
                                const compound = isArray(keyPath);
                                const result = {
                                    name,
                                    compound,
                                    keyPath,
                                    unique,
                                    multiEntry,
                                    extractKey: getKeyExtractor(keyPath)
                                };
                                indexByKeyPath[getKeyPathAlias(keyPath)] = result;
                                return result;
                            }),
                            getIndexByKeyPath: (keyPath) => indexByKeyPath[getKeyPathAlias(keyPath)]
                        };
                        indexByKeyPath[":id"] = result.primaryKey;
                        if (keyPath != null) {
                            indexByKeyPath[getKeyPathAlias(keyPath)] = result.primaryKey;
                        }
                        return result;
                    })
                },
                hasGetAll: tables.length > 0 && ('getAll' in trans.objectStore(tables[0])) &&
                    !(typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) &&
                        !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
                        [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
            };
        }
        function makeIDBKeyRange(range) {
            if (range.type === 3 )
                return null;
            if (range.type === 4 )
                throw new Error("Cannot convert never type to IDBKeyRange");
            const { lower, upper, lowerOpen, upperOpen } = range;
            const idbRange = lower === undefined ?
                upper === undefined ?
                    null :
                    IdbKeyRange.upperBound(upper, !!upperOpen) :
                upper === undefined ?
                    IdbKeyRange.lowerBound(lower, !!lowerOpen) :
                    IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
            return idbRange;
        }
        function createDbCoreTable(tableSchema) {
            const tableName = tableSchema.name;
            function mutate({ trans, type, keys, values, range }) {
                return new Promise((resolve, reject) => {
                    resolve = wrap(resolve);
                    const store = trans.objectStore(tableName);
                    const outbound = store.keyPath == null;
                    const isAddOrPut = type === "put" || type === "add";
                    if (!isAddOrPut && type !== 'delete' && type !== 'deleteRange')
                        throw new Error("Invalid operation type: " + type);
                    const { length } = keys || values || { length: 1 };
                    if (keys && values && keys.length !== values.length) {
                        throw new Error("Given keys array must have same length as given values array.");
                    }
                    if (length === 0)
                        return resolve({ numFailures: 0, failures: {}, results: [], lastResult: undefined });
                    let req;
                    const reqs = [];
                    const failures = [];
                    let numFailures = 0;
                    const errorHandler = event => {
                        ++numFailures;
                        preventDefault(event);
                    };
                    if (type === 'deleteRange') {
                        if (range.type === 4 )
                            return resolve({ numFailures, failures, results: [], lastResult: undefined });
                        if (range.type === 3 )
                            reqs.push(req = store.clear());
                        else
                            reqs.push(req = store.delete(makeIDBKeyRange(range)));
                    }
                    else {
                        const [args1, args2] = isAddOrPut ?
                            outbound ?
                                [values, keys] :
                                [values, null] :
                            [keys, null];
                        if (isAddOrPut) {
                            for (let i = 0; i < length; ++i) {
                                reqs.push(req = (args2 && args2[i] !== undefined ?
                                    store[type](args1[i], args2[i]) :
                                    store[type](args1[i])));
                                req.onerror = errorHandler;
                            }
                        }
                        else {
                            for (let i = 0; i < length; ++i) {
                                reqs.push(req = store[type](args1[i]));
                                req.onerror = errorHandler;
                            }
                        }
                    }
                    const done = event => {
                        const lastResult = event.target.result;
                        reqs.forEach((req, i) => req.error != null && (failures[i] = req.error));
                        resolve({
                            numFailures,
                            failures,
                            results: type === "delete" ? keys : reqs.map(req => req.result),
                            lastResult
                        });
                    };
                    req.onerror = event => {
                        errorHandler(event);
                        done(event);
                    };
                    req.onsuccess = done;
                });
            }
            function openCursor({ trans, values, query, reverse, unique }) {
                return new Promise((resolve, reject) => {
                    resolve = wrap(resolve);
                    const { index, range } = query;
                    const store = trans.objectStore(tableName);
                    const source = index.isPrimaryKey ?
                        store :
                        store.index(index.name);
                    const direction = reverse ?
                        unique ?
                            "prevunique" :
                            "prev" :
                        unique ?
                            "nextunique" :
                            "next";
                    const req = values || !('openKeyCursor' in source) ?
                        source.openCursor(makeIDBKeyRange(range), direction) :
                        source.openKeyCursor(makeIDBKeyRange(range), direction);
                    req.onerror = eventRejectHandler(reject);
                    req.onsuccess = wrap(ev => {
                        const cursor = req.result;
                        if (!cursor) {
                            resolve(null);
                            return;
                        }
                        cursor.___id = ++_id_counter;
                        cursor.done = false;
                        const _cursorContinue = cursor.continue.bind(cursor);
                        let _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
                        if (_cursorContinuePrimaryKey)
                            _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
                        const _cursorAdvance = cursor.advance.bind(cursor);
                        const doThrowCursorIsNotStarted = () => { throw new Error("Cursor not started"); };
                        const doThrowCursorIsStopped = () => { throw new Error("Cursor not stopped"); };
                        cursor.trans = trans;
                        cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
                        cursor.fail = wrap(reject);
                        cursor.next = function () {
                            let gotOne = 1;
                            return this.start(() => gotOne-- ? this.continue() : this.stop()).then(() => this);
                        };
                        cursor.start = (callback) => {
                            const iterationPromise = new Promise((resolveIteration, rejectIteration) => {
                                resolveIteration = wrap(resolveIteration);
                                req.onerror = eventRejectHandler(rejectIteration);
                                cursor.fail = rejectIteration;
                                cursor.stop = value => {
                                    cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
                                    resolveIteration(value);
                                };
                            });
                            const guardedCallback = () => {
                                if (req.result) {
                                    try {
                                        callback();
                                    }
                                    catch (err) {
                                        cursor.fail(err);
                                    }
                                }
                                else {
                                    cursor.done = true;
                                    cursor.start = () => { throw new Error("Cursor behind last entry"); };
                                    cursor.stop();
                                }
                            };
                            req.onsuccess = wrap(ev => {
                                req.onsuccess = guardedCallback;
                                guardedCallback();
                            });
                            cursor.continue = _cursorContinue;
                            cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
                            cursor.advance = _cursorAdvance;
                            guardedCallback();
                            return iterationPromise;
                        };
                        resolve(cursor);
                    }, reject);
                });
            }
            function query(hasGetAll) {
                return (request) => {
                    return new Promise((resolve, reject) => {
                        resolve = wrap(resolve);
                        const { trans, values, limit, query } = request;
                        const nonInfinitLimit = limit === Infinity ? undefined : limit;
                        const { index, range } = query;
                        const store = trans.objectStore(tableName);
                        const source = index.isPrimaryKey ? store : store.index(index.name);
                        const idbKeyRange = makeIDBKeyRange(range);
                        if (limit === 0)
                            return resolve({ result: [] });
                        if (hasGetAll) {
                            const req = values ?
                                source.getAll(idbKeyRange, nonInfinitLimit) :
                                source.getAllKeys(idbKeyRange, nonInfinitLimit);
                            req.onsuccess = event => resolve({ result: event.target.result });
                            req.onerror = eventRejectHandler(reject);
                        }
                        else {
                            let count = 0;
                            const req = values || !('openKeyCursor' in source) ?
                                source.openCursor(idbKeyRange) :
                                source.openKeyCursor(idbKeyRange);
                            const result = [];
                            req.onsuccess = event => {
                                const cursor = req.result;
                                if (!cursor)
                                    return resolve({ result });
                                result.push(values ? cursor.value : cursor.primaryKey);
                                if (++count === limit)
                                    return resolve({ result });
                                cursor.continue();
                            };
                            req.onerror = eventRejectHandler(reject);
                        }
                    });
                };
            }
            return {
                name: tableName,
                schema: tableSchema,
                mutate,
                getMany({ trans, keys }) {
                    return new Promise((resolve, reject) => {
                        resolve = wrap(resolve);
                        const store = trans.objectStore(tableName);
                        const length = keys.length;
                        const result = new Array(length);
                        let keyCount = 0;
                        let callbackCount = 0;
                        let req;
                        const successHandler = event => {
                            const req = event.target;
                            if ((result[req._pos] = req.result) != null)
                                ;
                            if (++callbackCount === keyCount)
                                resolve(result);
                        };
                        const errorHandler = eventRejectHandler(reject);
                        for (let i = 0; i < length; ++i) {
                            const key = keys[i];
                            if (key != null) {
                                req = store.get(keys[i]);
                                req._pos = i;
                                req.onsuccess = successHandler;
                                req.onerror = errorHandler;
                                ++keyCount;
                            }
                        }
                        if (keyCount === 0)
                            resolve(result);
                    });
                },
                get({ trans, key }) {
                    return new Promise((resolve, reject) => {
                        resolve = wrap(resolve);
                        const store = trans.objectStore(tableName);
                        const req = store.get(key);
                        req.onsuccess = event => resolve(event.target.result);
                        req.onerror = eventRejectHandler(reject);
                    });
                },
                query: query(hasGetAll),
                openCursor,
                count({ query, trans }) {
                    const { index, range } = query;
                    return new Promise((resolve, reject) => {
                        const store = trans.objectStore(tableName);
                        const source = index.isPrimaryKey ? store : store.index(index.name);
                        const idbKeyRange = makeIDBKeyRange(range);
                        const req = idbKeyRange ? source.count(idbKeyRange) : source.count();
                        req.onsuccess = wrap(ev => resolve(ev.target.result));
                        req.onerror = eventRejectHandler(reject);
                    });
                }
            };
        }
        const { schema, hasGetAll } = extractSchema(db, tmpTrans);
        const tables = schema.tables.map(tableSchema => createDbCoreTable(tableSchema));
        const tableMap = {};
        tables.forEach(table => tableMap[table.name] = table);
        return {
            stack: "dbcore",
            transaction: db.transaction.bind(db),
            table(name) {
                const result = tableMap[name];
                if (!result)
                    throw new Error(`Table '${name}' not found`);
                return tableMap[name];
            },
            MIN_KEY: -Infinity,
            MAX_KEY: getMaxKey(IdbKeyRange),
            schema
        };
    }

    function createMiddlewareStack(stackImpl, middlewares) {
        return middlewares.reduce((down, { create }) => ({ ...down, ...create(down) }), stackImpl);
    }
    function createMiddlewareStacks(middlewares, idbdb, { IDBKeyRange, indexedDB }, tmpTrans) {
        const dbcore = createMiddlewareStack(createDBCore(idbdb, IDBKeyRange, tmpTrans), middlewares.dbcore);
        return {
            dbcore
        };
    }
    function generateMiddlewareStacks({ _novip: db }, tmpTrans) {
        const idbdb = tmpTrans.db;
        const stacks = createMiddlewareStacks(db._middlewares, idbdb, db._deps, tmpTrans);
        db.core = stacks.dbcore;
        db.tables.forEach(table => {
            const tableName = table.name;
            if (db.core.schema.tables.some(tbl => tbl.name === tableName)) {
                table.core = db.core.table(tableName);
                if (db[tableName] instanceof db.Table) {
                    db[tableName].core = table.core;
                }
            }
        });
    }

    function setApiOnPlace({ _novip: db }, objs, tableNames, dbschema) {
        tableNames.forEach(tableName => {
            const schema = dbschema[tableName];
            objs.forEach(obj => {
                const propDesc = getPropertyDescriptor(obj, tableName);
                if (!propDesc || ("value" in propDesc && propDesc.value === undefined)) {
                    if (obj === db.Transaction.prototype || obj instanceof db.Transaction) {
                        setProp(obj, tableName, {
                            get() { return this.table(tableName); },
                            set(value) {
                                defineProperty(this, tableName, { value, writable: true, configurable: true, enumerable: true });
                            }
                        });
                    }
                    else {
                        obj[tableName] = new db.Table(tableName, schema);
                    }
                }
            });
        });
    }
    function removeTablesApi({ _novip: db }, objs) {
        objs.forEach(obj => {
            for (let key in obj) {
                if (obj[key] instanceof db.Table)
                    delete obj[key];
            }
        });
    }
    function lowerVersionFirst(a, b) {
        return a._cfg.version - b._cfg.version;
    }
    function runUpgraders(db, oldVersion, idbUpgradeTrans, reject) {
        const globalSchema = db._dbSchema;
        const trans = db._createTransaction('readwrite', db._storeNames, globalSchema);
        trans.create(idbUpgradeTrans);
        trans._completion.catch(reject);
        const rejectTransaction = trans._reject.bind(trans);
        const transless = PSD.transless || PSD;
        newScope(() => {
            PSD.trans = trans;
            PSD.transless = transless;
            if (oldVersion === 0) {
                keys(globalSchema).forEach(tableName => {
                    createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
                });
                generateMiddlewareStacks(db, idbUpgradeTrans);
                DexiePromise.follow(() => db.on.populate.fire(trans)).catch(rejectTransaction);
            }
            else
                updateTablesAndIndexes(db, oldVersion, trans, idbUpgradeTrans).catch(rejectTransaction);
        });
    }
    function updateTablesAndIndexes({ _novip: db }, oldVersion, trans, idbUpgradeTrans) {
        const queue = [];
        const versions = db._versions;
        let globalSchema = db._dbSchema = buildGlobalSchema(db, db.idbdb, idbUpgradeTrans);
        let anyContentUpgraderHasRun = false;
        const versToRun = versions.filter(v => v._cfg.version >= oldVersion);
        versToRun.forEach(version => {
            queue.push(() => {
                const oldSchema = globalSchema;
                const newSchema = version._cfg.dbschema;
                adjustToExistingIndexNames(db, oldSchema, idbUpgradeTrans);
                adjustToExistingIndexNames(db, newSchema, idbUpgradeTrans);
                globalSchema = db._dbSchema = newSchema;
                const diff = getSchemaDiff(oldSchema, newSchema);
                diff.add.forEach(tuple => {
                    createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
                });
                diff.change.forEach(change => {
                    if (change.recreate) {
                        throw new exceptions.Upgrade("Not yet support for changing primary key");
                    }
                    else {
                        const store = idbUpgradeTrans.objectStore(change.name);
                        change.add.forEach(idx => addIndex(store, idx));
                        change.change.forEach(idx => {
                            store.deleteIndex(idx.name);
                            addIndex(store, idx);
                        });
                        change.del.forEach(idxName => store.deleteIndex(idxName));
                    }
                });
                const contentUpgrade = version._cfg.contentUpgrade;
                if (contentUpgrade && version._cfg.version > oldVersion) {
                    generateMiddlewareStacks(db, idbUpgradeTrans);
                    trans._memoizedTables = {};
                    anyContentUpgraderHasRun = true;
                    let upgradeSchema = shallowClone(newSchema);
                    diff.del.forEach(table => {
                        upgradeSchema[table] = oldSchema[table];
                    });
                    removeTablesApi(db, [db.Transaction.prototype]);
                    setApiOnPlace(db, [db.Transaction.prototype], keys(upgradeSchema), upgradeSchema);
                    trans.schema = upgradeSchema;
                    const contentUpgradeIsAsync = isAsyncFunction(contentUpgrade);
                    if (contentUpgradeIsAsync) {
                        incrementExpectedAwaits();
                    }
                    let returnValue;
                    const promiseFollowed = DexiePromise.follow(() => {
                        returnValue = contentUpgrade(trans);
                        if (returnValue) {
                            if (contentUpgradeIsAsync) {
                                var decrementor = decrementExpectedAwaits.bind(null, null);
                                returnValue.then(decrementor, decrementor);
                            }
                        }
                    });
                    return (returnValue && typeof returnValue.then === 'function' ?
                        DexiePromise.resolve(returnValue) : promiseFollowed.then(() => returnValue));
                }
            });
            queue.push(idbtrans => {
                if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug) {
                    const newSchema = version._cfg.dbschema;
                    deleteRemovedTables(newSchema, idbtrans);
                }
                removeTablesApi(db, [db.Transaction.prototype]);
                setApiOnPlace(db, [db.Transaction.prototype], db._storeNames, db._dbSchema);
                trans.schema = db._dbSchema;
            });
        });
        function runQueue() {
            return queue.length ? DexiePromise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) :
                DexiePromise.resolve();
        }
        return runQueue().then(() => {
            createMissingTables(globalSchema, idbUpgradeTrans);
        });
    }
    function getSchemaDiff(oldSchema, newSchema) {
        const diff = {
            del: [],
            add: [],
            change: []
        };
        let table;
        for (table in oldSchema) {
            if (!newSchema[table])
                diff.del.push(table);
        }
        for (table in newSchema) {
            const oldDef = oldSchema[table], newDef = newSchema[table];
            if (!oldDef) {
                diff.add.push([table, newDef]);
            }
            else {
                const change = {
                    name: table,
                    def: newDef,
                    recreate: false,
                    del: [],
                    add: [],
                    change: []
                };
                if ((
                '' + (oldDef.primKey.keyPath || '')) !== ('' + (newDef.primKey.keyPath || '')) ||
                    (oldDef.primKey.auto !== newDef.primKey.auto && !isIEOrEdge))
                 {
                    change.recreate = true;
                    diff.change.push(change);
                }
                else {
                    const oldIndexes = oldDef.idxByName;
                    const newIndexes = newDef.idxByName;
                    let idxName;
                    for (idxName in oldIndexes) {
                        if (!newIndexes[idxName])
                            change.del.push(idxName);
                    }
                    for (idxName in newIndexes) {
                        const oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
                        if (!oldIdx)
                            change.add.push(newIdx);
                        else if (oldIdx.src !== newIdx.src)
                            change.change.push(newIdx);
                    }
                    if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                        diff.change.push(change);
                    }
                }
            }
        }
        return diff;
    }
    function createTable(idbtrans, tableName, primKey, indexes) {
        const store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ?
            { keyPath: primKey.keyPath, autoIncrement: primKey.auto } :
            { autoIncrement: primKey.auto });
        indexes.forEach(idx => addIndex(store, idx));
        return store;
    }
    function createMissingTables(newSchema, idbtrans) {
        keys(newSchema).forEach(tableName => {
            if (!idbtrans.db.objectStoreNames.contains(tableName)) {
                createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
            }
        });
    }
    function deleteRemovedTables(newSchema, idbtrans) {
        [].slice.call(idbtrans.db.objectStoreNames).forEach(storeName => newSchema[storeName] == null && idbtrans.db.deleteObjectStore(storeName));
    }
    function addIndex(store, idx) {
        store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
    }
    function buildGlobalSchema(db, idbdb, tmpTrans) {
        const globalSchema = {};
        const dbStoreNames = slice(idbdb.objectStoreNames, 0);
        dbStoreNames.forEach(storeName => {
            const store = tmpTrans.objectStore(storeName);
            let keyPath = store.keyPath;
            const primKey = createIndexSpec(nameFromKeyPath(keyPath), keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== "string", true);
            const indexes = [];
            for (let j = 0; j < store.indexNames.length; ++j) {
                const idbindex = store.index(store.indexNames[j]);
                keyPath = idbindex.keyPath;
                var index = createIndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== "string", false);
                indexes.push(index);
            }
            globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
        });
        return globalSchema;
    }
    function readGlobalSchema({ _novip: db }, idbdb, tmpTrans) {
        db.verno = idbdb.version / 10;
        const globalSchema = db._dbSchema = buildGlobalSchema(db, idbdb, tmpTrans);
        db._storeNames = slice(idbdb.objectStoreNames, 0);
        setApiOnPlace(db, [db._allTables], keys(globalSchema), globalSchema);
    }
    function verifyInstalledSchema(db, tmpTrans) {
        const installedSchema = buildGlobalSchema(db, db.idbdb, tmpTrans);
        const diff = getSchemaDiff(installedSchema, db._dbSchema);
        return !(diff.add.length || diff.change.some(ch => ch.add.length || ch.change.length));
    }
    function adjustToExistingIndexNames({ _novip: db }, schema, idbtrans) {
        const storeNames = idbtrans.db.objectStoreNames;
        for (let i = 0; i < storeNames.length; ++i) {
            const storeName = storeNames[i];
            const store = idbtrans.objectStore(storeName);
            db._hasGetAll = 'getAll' in store;
            for (let j = 0; j < store.indexNames.length; ++j) {
                const indexName = store.indexNames[j];
                const keyPath = store.index(indexName).keyPath;
                const dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
                if (schema[storeName]) {
                    const indexSpec = schema[storeName].idxByName[dexieName];
                    if (indexSpec) {
                        indexSpec.name = indexName;
                        delete schema[storeName].idxByName[dexieName];
                        schema[storeName].idxByName[indexName] = indexSpec;
                    }
                }
            }
        }
        if (typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) &&
            !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
            _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope &&
            [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
            db._hasGetAll = false;
        }
    }
    function parseIndexSyntax(primKeyAndIndexes) {
        return primKeyAndIndexes.split(',').map((index, indexNum) => {
            index = index.trim();
            const name = index.replace(/([&*]|\+\+)/g, "");
            const keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;
            return createIndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), indexNum === 0);
        });
    }

    class Version {
        _parseStoresSpec(stores, outSchema) {
            keys(stores).forEach(tableName => {
                if (stores[tableName] !== null) {
                    var indexes = parseIndexSyntax(stores[tableName]);
                    var primKey = indexes.shift();
                    if (primKey.multi)
                        throw new exceptions.Schema("Primary key cannot be multi-valued");
                    indexes.forEach(idx => {
                        if (idx.auto)
                            throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                        if (!idx.keyPath)
                            throw new exceptions.Schema("Index must have a name and cannot be an empty string");
                    });
                    outSchema[tableName] = createTableSchema(tableName, primKey, indexes);
                }
            });
        }
        stores(stores) {
            const db = this.db;
            this._cfg.storesSource = this._cfg.storesSource ?
                extend(this._cfg.storesSource, stores) :
                stores;
            const versions = db._versions;
            const storesSpec = {};
            let dbschema = {};
            versions.forEach(version => {
                extend(storesSpec, version._cfg.storesSource);
                dbschema = (version._cfg.dbschema = {});
                version._parseStoresSpec(storesSpec, dbschema);
            });
            db._dbSchema = dbschema;
            removeTablesApi(db, [db._allTables, db, db.Transaction.prototype]);
            setApiOnPlace(db, [db._allTables, db, db.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
            db._storeNames = keys(dbschema);
            return this;
        }
        upgrade(upgradeFunction) {
            this._cfg.contentUpgrade = promisableChain(this._cfg.contentUpgrade || nop, upgradeFunction);
            return this;
        }
    }

    function createVersionConstructor(db) {
        return makeClassConstructor(Version.prototype, function Version(versionNumber) {
            this.db = db;
            this._cfg = {
                version: versionNumber,
                storesSource: null,
                dbschema: {},
                tables: {},
                contentUpgrade: null
            };
        });
    }

    function getDbNamesTable(indexedDB, IDBKeyRange) {
        let dbNamesDB = indexedDB["_dbNamesDB"];
        if (!dbNamesDB) {
            dbNamesDB = indexedDB["_dbNamesDB"] = new Dexie$1(DBNAMES_DB, {
                addons: [],
                indexedDB,
                IDBKeyRange,
            });
            dbNamesDB.version(1).stores({ dbnames: "name" });
        }
        return dbNamesDB.table("dbnames");
    }
    function hasDatabasesNative(indexedDB) {
        return indexedDB && typeof indexedDB.databases === "function";
    }
    function getDatabaseNames({ indexedDB, IDBKeyRange, }) {
        return hasDatabasesNative(indexedDB)
            ? Promise.resolve(indexedDB.databases()).then((infos) => infos
                .map((info) => info.name)
                .filter((name) => name !== DBNAMES_DB))
            : getDbNamesTable(indexedDB, IDBKeyRange).toCollection().primaryKeys();
    }
    function _onDatabaseCreated({ indexedDB, IDBKeyRange }, name) {
        !hasDatabasesNative(indexedDB) &&
            name !== DBNAMES_DB &&
            getDbNamesTable(indexedDB, IDBKeyRange).put({ name }).catch(nop);
    }
    function _onDatabaseDeleted({ indexedDB, IDBKeyRange }, name) {
        !hasDatabasesNative(indexedDB) &&
            name !== DBNAMES_DB &&
            getDbNamesTable(indexedDB, IDBKeyRange).delete(name).catch(nop);
    }

    function vip(fn) {
        return newScope(function () {
            PSD.letThrough = true;
            return fn();
        });
    }

    function idbReady() {
        var isSafari = !navigator.userAgentData &&
            /Safari\//.test(navigator.userAgent) &&
            !/Chrom(e|ium)\//.test(navigator.userAgent);
        if (!isSafari || !indexedDB.databases)
            return Promise.resolve();
        var intervalId;
        return new Promise(function (resolve) {
            var tryIdb = function () { return indexedDB.databases().finally(resolve); };
            intervalId = setInterval(tryIdb, 100);
            tryIdb();
        }).finally(function () { return clearInterval(intervalId); });
    }

    function dexieOpen(db) {
        const state = db._state;
        const { indexedDB } = db._deps;
        if (state.isBeingOpened || db.idbdb)
            return state.dbReadyPromise.then(() => state.dbOpenError ?
                rejection(state.dbOpenError) :
                db);
        debug && (state.openCanceller._stackHolder = getErrorWithStack());
        state.isBeingOpened = true;
        state.dbOpenError = null;
        state.openComplete = false;
        const openCanceller = state.openCanceller;
        function throwIfCancelled() {
            if (state.openCanceller !== openCanceller)
                throw new exceptions.DatabaseClosed('db.open() was cancelled');
        }
        let resolveDbReady = state.dbReadyResolve,
        upgradeTransaction = null, wasCreated = false;
        return DexiePromise.race([openCanceller, (typeof navigator === 'undefined' ? DexiePromise.resolve() : idbReady()).then(() => new DexiePromise((resolve, reject) => {
                throwIfCancelled();
                if (!indexedDB)
                    throw new exceptions.MissingAPI();
                const dbName = db.name;
                const req = state.autoSchema ?
                    indexedDB.open(dbName) :
                    indexedDB.open(dbName, Math.round(db.verno * 10));
                if (!req)
                    throw new exceptions.MissingAPI();
                req.onerror = eventRejectHandler(reject);
                req.onblocked = wrap(db._fireOnBlocked);
                req.onupgradeneeded = wrap(e => {
                    upgradeTransaction = req.transaction;
                    if (state.autoSchema && !db._options.allowEmptyDB) {
                        req.onerror = preventDefault;
                        upgradeTransaction.abort();
                        req.result.close();
                        const delreq = indexedDB.deleteDatabase(dbName);
                        delreq.onsuccess = delreq.onerror = wrap(() => {
                            reject(new exceptions.NoSuchDatabase(`Database ${dbName} doesnt exist`));
                        });
                    }
                    else {
                        upgradeTransaction.onerror = eventRejectHandler(reject);
                        var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion;
                        wasCreated = oldVer < 1;
                        db._novip.idbdb = req.result;
                        runUpgraders(db, oldVer / 10, upgradeTransaction, reject);
                    }
                }, reject);
                req.onsuccess = wrap(() => {
                    upgradeTransaction = null;
                    const idbdb = db._novip.idbdb = req.result;
                    const objectStoreNames = slice(idbdb.objectStoreNames);
                    if (objectStoreNames.length > 0)
                        try {
                            const tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), 'readonly');
                            if (state.autoSchema)
                                readGlobalSchema(db, idbdb, tmpTrans);
                            else {
                                adjustToExistingIndexNames(db, db._dbSchema, tmpTrans);
                                if (!verifyInstalledSchema(db, tmpTrans)) {
                                    console.warn(`Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Some queries may fail.`);
                                }
                            }
                            generateMiddlewareStacks(db, tmpTrans);
                        }
                        catch (e) {
                        }
                    connections.push(db);
                    idbdb.onversionchange = wrap(ev => {
                        state.vcFired = true;
                        db.on("versionchange").fire(ev);
                    });
                    idbdb.onclose = wrap(ev => {
                        db.on("close").fire(ev);
                    });
                    if (wasCreated)
                        _onDatabaseCreated(db._deps, dbName);
                    resolve();
                }, reject);
            }))]).then(() => {
            throwIfCancelled();
            state.onReadyBeingFired = [];
            return DexiePromise.resolve(vip(() => db.on.ready.fire(db.vip))).then(function fireRemainders() {
                if (state.onReadyBeingFired.length > 0) {
                    let remainders = state.onReadyBeingFired.reduce(promisableChain, nop);
                    state.onReadyBeingFired = [];
                    return DexiePromise.resolve(vip(() => remainders(db.vip))).then(fireRemainders);
                }
            });
        }).finally(() => {
            state.onReadyBeingFired = null;
            state.isBeingOpened = false;
        }).then(() => {
            return db;
        }).catch(err => {
            state.dbOpenError = err;
            try {
                upgradeTransaction && upgradeTransaction.abort();
            }
            catch (_a) { }
            if (openCanceller === state.openCanceller) {
                db._close();
            }
            return rejection(err);
        }).finally(() => {
            state.openComplete = true;
            resolveDbReady();
        });
    }

    function awaitIterator(iterator) {
        var callNext = result => iterator.next(result), doThrow = error => iterator.throw(error), onSuccess = step(callNext), onError = step(doThrow);
        function step(getNext) {
            return (val) => {
                var next = getNext(val), value = next.value;
                return next.done ? value :
                    (!value || typeof value.then !== 'function' ?
                        isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) :
                        value.then(onSuccess, onError));
            };
        }
        return step(callNext)();
    }

    function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
        var i = arguments.length;
        if (i < 2)
            throw new exceptions.InvalidArgument("Too few arguments");
        var args = new Array(i - 1);
        while (--i)
            args[i - 1] = arguments[i];
        scopeFunc = args.pop();
        var tables = flatten(args);
        return [mode, tables, scopeFunc];
    }
    function enterTransactionScope(db, mode, storeNames, parentTransaction, scopeFunc) {
        return DexiePromise.resolve().then(() => {
            const transless = PSD.transless || PSD;
            const trans = db._createTransaction(mode, storeNames, db._dbSchema, parentTransaction);
            const zoneProps = {
                trans: trans,
                transless: transless
            };
            if (parentTransaction) {
                trans.idbtrans = parentTransaction.idbtrans;
            }
            else {
                try {
                    trans.create();
                    db._state.PR1398_maxLoop = 3;
                }
                catch (ex) {
                    if (ex.name === errnames.InvalidState && db.isOpen() && --db._state.PR1398_maxLoop > 0) {
                        console.warn('Dexie: Need to reopen db');
                        db._close();
                        return db.open().then(() => enterTransactionScope(db, mode, storeNames, null, scopeFunc));
                    }
                    return rejection(ex);
                }
            }
            const scopeFuncIsAsync = isAsyncFunction(scopeFunc);
            if (scopeFuncIsAsync) {
                incrementExpectedAwaits();
            }
            let returnValue;
            const promiseFollowed = DexiePromise.follow(() => {
                returnValue = scopeFunc.call(trans, trans);
                if (returnValue) {
                    if (scopeFuncIsAsync) {
                        var decrementor = decrementExpectedAwaits.bind(null, null);
                        returnValue.then(decrementor, decrementor);
                    }
                    else if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
                        returnValue = awaitIterator(returnValue);
                    }
                }
            }, zoneProps);
            return (returnValue && typeof returnValue.then === 'function' ?
                DexiePromise.resolve(returnValue).then(x => trans.active ?
                    x
                    : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn")))
                : promiseFollowed.then(() => returnValue)).then(x => {
                if (parentTransaction)
                    trans._resolve();
                return trans._completion.then(() => x);
            }).catch(e => {
                trans._reject(e);
                return rejection(e);
            });
        });
    }

    function pad(a, value, count) {
        const result = isArray(a) ? a.slice() : [a];
        for (let i = 0; i < count; ++i)
            result.push(value);
        return result;
    }
    function createVirtualIndexMiddleware(down) {
        return {
            ...down,
            table(tableName) {
                const table = down.table(tableName);
                const { schema } = table;
                const indexLookup = {};
                const allVirtualIndexes = [];
                function addVirtualIndexes(keyPath, keyTail, lowLevelIndex) {
                    const keyPathAlias = getKeyPathAlias(keyPath);
                    const indexList = (indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || []);
                    const keyLength = keyPath == null ? 0 : typeof keyPath === 'string' ? 1 : keyPath.length;
                    const isVirtual = keyTail > 0;
                    const virtualIndex = {
                        ...lowLevelIndex,
                        isVirtual,
                        keyTail,
                        keyLength,
                        extractKey: getKeyExtractor(keyPath),
                        unique: !isVirtual && lowLevelIndex.unique
                    };
                    indexList.push(virtualIndex);
                    if (!virtualIndex.isPrimaryKey) {
                        allVirtualIndexes.push(virtualIndex);
                    }
                    if (keyLength > 1) {
                        const virtualKeyPath = keyLength === 2 ?
                            keyPath[0] :
                            keyPath.slice(0, keyLength - 1);
                        addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
                    }
                    indexList.sort((a, b) => a.keyTail - b.keyTail);
                    return virtualIndex;
                }
                const primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
                indexLookup[":id"] = [primaryKey];
                for (const index of schema.indexes) {
                    addVirtualIndexes(index.keyPath, 0, index);
                }
                function findBestIndex(keyPath) {
                    const result = indexLookup[getKeyPathAlias(keyPath)];
                    return result && result[0];
                }
                function translateRange(range, keyTail) {
                    return {
                        type: range.type === 1  ?
                            2  :
                            range.type,
                        lower: pad(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
                        lowerOpen: true,
                        upper: pad(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
                        upperOpen: true
                    };
                }
                function translateRequest(req) {
                    const index = req.query.index;
                    return index.isVirtual ? {
                        ...req,
                        query: {
                            index,
                            range: translateRange(req.query.range, index.keyTail)
                        }
                    } : req;
                }
                const result = {
                    ...table,
                    schema: {
                        ...schema,
                        primaryKey,
                        indexes: allVirtualIndexes,
                        getIndexByKeyPath: findBestIndex
                    },
                    count(req) {
                        return table.count(translateRequest(req));
                    },
                    query(req) {
                        return table.query(translateRequest(req));
                    },
                    openCursor(req) {
                        const { keyTail, isVirtual, keyLength } = req.query.index;
                        if (!isVirtual)
                            return table.openCursor(req);
                        function createVirtualCursor(cursor) {
                            function _continue(key) {
                                key != null ?
                                    cursor.continue(pad(key, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) :
                                    req.unique ?
                                        cursor.continue(cursor.key.slice(0, keyLength)
                                            .concat(req.reverse
                                            ? down.MIN_KEY
                                            : down.MAX_KEY, keyTail)) :
                                        cursor.continue();
                            }
                            const virtualCursor = Object.create(cursor, {
                                continue: { value: _continue },
                                continuePrimaryKey: {
                                    value(key, primaryKey) {
                                        cursor.continuePrimaryKey(pad(key, down.MAX_KEY, keyTail), primaryKey);
                                    }
                                },
                                primaryKey: {
                                    get() {
                                        return cursor.primaryKey;
                                    }
                                },
                                key: {
                                    get() {
                                        const key = cursor.key;
                                        return keyLength === 1 ?
                                            key[0] :
                                            key.slice(0, keyLength);
                                    }
                                },
                                value: {
                                    get() {
                                        return cursor.value;
                                    }
                                }
                            });
                            return virtualCursor;
                        }
                        return table.openCursor(translateRequest(req))
                            .then(cursor => cursor && createVirtualCursor(cursor));
                    }
                };
                return result;
            }
        };
    }
    const virtualIndexMiddleware = {
        stack: "dbcore",
        name: "VirtualIndexMiddleware",
        level: 1,
        create: createVirtualIndexMiddleware
    };

    function getObjectDiff(a, b, rv, prfx) {
        rv = rv || {};
        prfx = prfx || '';
        keys(a).forEach((prop) => {
            if (!hasOwn(b, prop)) {
                rv[prfx + prop] = undefined;
            }
            else {
                var ap = a[prop], bp = b[prop];
                if (typeof ap === 'object' && typeof bp === 'object' && ap && bp) {
                    const apTypeName = toStringTag(ap);
                    const bpTypeName = toStringTag(bp);
                    if (apTypeName !== bpTypeName) {
                        rv[prfx + prop] = b[prop];
                    }
                    else if (apTypeName === 'Object') {
                        getObjectDiff(ap, bp, rv, prfx + prop + '.');
                    }
                    else if (ap !== bp) {
                        rv[prfx + prop] = b[prop];
                    }
                }
                else if (ap !== bp)
                    rv[prfx + prop] = b[prop];
            }
        });
        keys(b).forEach((prop) => {
            if (!hasOwn(a, prop)) {
                rv[prfx + prop] = b[prop];
            }
        });
        return rv;
    }

    function getEffectiveKeys(primaryKey, req) {
        if (req.type === 'delete')
            return req.keys;
        return req.keys || req.values.map(primaryKey.extractKey);
    }

    const hooksMiddleware = {
        stack: "dbcore",
        name: "HooksMiddleware",
        level: 2,
        create: (downCore) => ({
            ...downCore,
            table(tableName) {
                const downTable = downCore.table(tableName);
                const { primaryKey } = downTable.schema;
                const tableMiddleware = {
                    ...downTable,
                    mutate(req) {
                        const dxTrans = PSD.trans;
                        const { deleting, creating, updating } = dxTrans.table(tableName).hook;
                        switch (req.type) {
                            case 'add':
                                if (creating.fire === nop)
                                    break;
                                return dxTrans._promise('readwrite', () => addPutOrDelete(req), true);
                            case 'put':
                                if (creating.fire === nop && updating.fire === nop)
                                    break;
                                return dxTrans._promise('readwrite', () => addPutOrDelete(req), true);
                            case 'delete':
                                if (deleting.fire === nop)
                                    break;
                                return dxTrans._promise('readwrite', () => addPutOrDelete(req), true);
                            case 'deleteRange':
                                if (deleting.fire === nop)
                                    break;
                                return dxTrans._promise('readwrite', () => deleteRange(req), true);
                        }
                        return downTable.mutate(req);
                        function addPutOrDelete(req) {
                            const dxTrans = PSD.trans;
                            const keys = req.keys || getEffectiveKeys(primaryKey, req);
                            if (!keys)
                                throw new Error("Keys missing");
                            req = req.type === 'add' || req.type === 'put' ?
                                { ...req, keys } :
                                { ...req };
                            if (req.type !== 'delete')
                                req.values = [...req.values];
                            if (req.keys)
                                req.keys = [...req.keys];
                            return getExistingValues(downTable, req, keys).then(existingValues => {
                                const contexts = keys.map((key, i) => {
                                    const existingValue = existingValues[i];
                                    const ctx = { onerror: null, onsuccess: null };
                                    if (req.type === 'delete') {
                                        deleting.fire.call(ctx, key, existingValue, dxTrans);
                                    }
                                    else if (req.type === 'add' || existingValue === undefined) {
                                        const generatedPrimaryKey = creating.fire.call(ctx, key, req.values[i], dxTrans);
                                        if (key == null && generatedPrimaryKey != null) {
                                            key = generatedPrimaryKey;
                                            req.keys[i] = key;
                                            if (!primaryKey.outbound) {
                                                setByKeyPath(req.values[i], primaryKey.keyPath, key);
                                            }
                                        }
                                    }
                                    else {
                                        const objectDiff = getObjectDiff(existingValue, req.values[i]);
                                        const additionalChanges = updating.fire.call(ctx, objectDiff, key, existingValue, dxTrans);
                                        if (additionalChanges) {
                                            const requestedValue = req.values[i];
                                            Object.keys(additionalChanges).forEach(keyPath => {
                                                if (hasOwn(requestedValue, keyPath)) {
                                                    requestedValue[keyPath] = additionalChanges[keyPath];
                                                }
                                                else {
                                                    setByKeyPath(requestedValue, keyPath, additionalChanges[keyPath]);
                                                }
                                            });
                                        }
                                    }
                                    return ctx;
                                });
                                return downTable.mutate(req).then(({ failures, results, numFailures, lastResult }) => {
                                    for (let i = 0; i < keys.length; ++i) {
                                        const primKey = results ? results[i] : keys[i];
                                        const ctx = contexts[i];
                                        if (primKey == null) {
                                            ctx.onerror && ctx.onerror(failures[i]);
                                        }
                                        else {
                                            ctx.onsuccess && ctx.onsuccess(req.type === 'put' && existingValues[i] ?
                                                req.values[i] :
                                                primKey
                                            );
                                        }
                                    }
                                    return { failures, results, numFailures, lastResult };
                                }).catch(error => {
                                    contexts.forEach(ctx => ctx.onerror && ctx.onerror(error));
                                    return Promise.reject(error);
                                });
                            });
                        }
                        function deleteRange(req) {
                            return deleteNextChunk(req.trans, req.range, 10000);
                        }
                        function deleteNextChunk(trans, range, limit) {
                            return downTable.query({ trans, values: false, query: { index: primaryKey, range }, limit })
                                .then(({ result }) => {
                                return addPutOrDelete({ type: 'delete', keys: result, trans }).then(res => {
                                    if (res.numFailures > 0)
                                        return Promise.reject(res.failures[0]);
                                    if (result.length < limit) {
                                        return { failures: [], numFailures: 0, lastResult: undefined };
                                    }
                                    else {
                                        return deleteNextChunk(trans, { ...range, lower: result[result.length - 1], lowerOpen: true }, limit);
                                    }
                                });
                            });
                        }
                    }
                };
                return tableMiddleware;
            },
        })
    };
    function getExistingValues(table, req, effectiveKeys) {
        return req.type === "add"
            ? Promise.resolve([])
            : table.getMany({ trans: req.trans, keys: effectiveKeys, cache: "immutable" });
    }

    function getFromTransactionCache(keys, cache, clone) {
        try {
            if (!cache)
                return null;
            if (cache.keys.length < keys.length)
                return null;
            const result = [];
            for (let i = 0, j = 0; i < cache.keys.length && j < keys.length; ++i) {
                if (cmp(cache.keys[i], keys[j]) !== 0)
                    continue;
                result.push(clone ? deepClone(cache.values[i]) : cache.values[i]);
                ++j;
            }
            return result.length === keys.length ? result : null;
        }
        catch (_a) {
            return null;
        }
    }
    const cacheExistingValuesMiddleware = {
        stack: "dbcore",
        level: -1,
        create: (core) => {
            return {
                table: (tableName) => {
                    const table = core.table(tableName);
                    return {
                        ...table,
                        getMany: (req) => {
                            if (!req.cache) {
                                return table.getMany(req);
                            }
                            const cachedResult = getFromTransactionCache(req.keys, req.trans["_cache"], req.cache === "clone");
                            if (cachedResult) {
                                return DexiePromise.resolve(cachedResult);
                            }
                            return table.getMany(req).then((res) => {
                                req.trans["_cache"] = {
                                    keys: req.keys,
                                    values: req.cache === "clone" ? deepClone(res) : res,
                                };
                                return res;
                            });
                        },
                        mutate: (req) => {
                            if (req.type !== "add")
                                req.trans["_cache"] = null;
                            return table.mutate(req);
                        },
                    };
                },
            };
        },
    };

    function isEmptyRange(node) {
        return !("from" in node);
    }
    const RangeSet = function (fromOrTree, to) {
        if (this) {
            extend(this, arguments.length ? { d: 1, from: fromOrTree, to: arguments.length > 1 ? to : fromOrTree } : { d: 0 });
        }
        else {
            const rv = new RangeSet();
            if (fromOrTree && ("d" in fromOrTree)) {
                extend(rv, fromOrTree);
            }
            return rv;
        }
    };
    props(RangeSet.prototype, {
        add(rangeSet) {
            mergeRanges(this, rangeSet);
            return this;
        },
        addKey(key) {
            addRange(this, key, key);
            return this;
        },
        addKeys(keys) {
            keys.forEach(key => addRange(this, key, key));
            return this;
        },
        [iteratorSymbol]() {
            return getRangeSetIterator(this);
        }
    });
    function addRange(target, from, to) {
        const diff = cmp(from, to);
        if (isNaN(diff))
            return;
        if (diff > 0)
            throw RangeError();
        if (isEmptyRange(target))
            return extend(target, { from, to, d: 1 });
        const left = target.l;
        const right = target.r;
        if (cmp(to, target.from) < 0) {
            left
                ? addRange(left, from, to)
                : (target.l = { from, to, d: 1, l: null, r: null });
            return rebalance(target);
        }
        if (cmp(from, target.to) > 0) {
            right
                ? addRange(right, from, to)
                : (target.r = { from, to, d: 1, l: null, r: null });
            return rebalance(target);
        }
        if (cmp(from, target.from) < 0) {
            target.from = from;
            target.l = null;
            target.d = right ? right.d + 1 : 1;
        }
        if (cmp(to, target.to) > 0) {
            target.to = to;
            target.r = null;
            target.d = target.l ? target.l.d + 1 : 1;
        }
        const rightWasCutOff = !target.r;
        if (left && !target.l) {
            mergeRanges(target, left);
        }
        if (right && rightWasCutOff) {
            mergeRanges(target, right);
        }
    }
    function mergeRanges(target, newSet) {
        function _addRangeSet(target, { from, to, l, r }) {
            addRange(target, from, to);
            if (l)
                _addRangeSet(target, l);
            if (r)
                _addRangeSet(target, r);
        }
        if (!isEmptyRange(newSet))
            _addRangeSet(target, newSet);
    }
    function rangesOverlap(rangeSet1, rangeSet2) {
        const i1 = getRangeSetIterator(rangeSet2);
        let nextResult1 = i1.next();
        if (nextResult1.done)
            return false;
        let a = nextResult1.value;
        const i2 = getRangeSetIterator(rangeSet1);
        let nextResult2 = i2.next(a.from);
        let b = nextResult2.value;
        while (!nextResult1.done && !nextResult2.done) {
            if (cmp(b.from, a.to) <= 0 && cmp(b.to, a.from) >= 0)
                return true;
            cmp(a.from, b.from) < 0
                ? (a = (nextResult1 = i1.next(b.from)).value)
                : (b = (nextResult2 = i2.next(a.from)).value);
        }
        return false;
    }
    function getRangeSetIterator(node) {
        let state = isEmptyRange(node) ? null : { s: 0, n: node };
        return {
            next(key) {
                const keyProvided = arguments.length > 0;
                while (state) {
                    switch (state.s) {
                        case 0:
                            state.s = 1;
                            if (keyProvided) {
                                while (state.n.l && cmp(key, state.n.from) < 0)
                                    state = { up: state, n: state.n.l, s: 1 };
                            }
                            else {
                                while (state.n.l)
                                    state = { up: state, n: state.n.l, s: 1 };
                            }
                        case 1:
                            state.s = 2;
                            if (!keyProvided || cmp(key, state.n.to) <= 0)
                                return { value: state.n, done: false };
                        case 2:
                            if (state.n.r) {
                                state.s = 3;
                                state = { up: state, n: state.n.r, s: 0 };
                                continue;
                            }
                        case 3:
                            state = state.up;
                    }
                }
                return { done: true };
            },
        };
    }
    function rebalance(target) {
        var _a, _b;
        const diff = (((_a = target.r) === null || _a === void 0 ? void 0 : _a.d) || 0) - (((_b = target.l) === null || _b === void 0 ? void 0 : _b.d) || 0);
        const r = diff > 1 ? "r" : diff < -1 ? "l" : "";
        if (r) {
            const l = r === "r" ? "l" : "r";
            const rootClone = { ...target };
            const oldRootRight = target[r];
            target.from = oldRootRight.from;
            target.to = oldRootRight.to;
            target[r] = oldRootRight[r];
            rootClone[r] = oldRootRight[l];
            target[l] = rootClone;
            rootClone.d = computeDepth(rootClone);
        }
        target.d = computeDepth(target);
    }
    function computeDepth({ r, l }) {
        return (r ? (l ? Math.max(r.d, l.d) : r.d) : l ? l.d : 0) + 1;
    }

    const observabilityMiddleware = {
        stack: "dbcore",
        level: 0,
        create: (core) => {
            const dbName = core.schema.name;
            const FULL_RANGE = new RangeSet(core.MIN_KEY, core.MAX_KEY);
            return {
                ...core,
                table: (tableName) => {
                    const table = core.table(tableName);
                    const { schema } = table;
                    const { primaryKey } = schema;
                    const { extractKey, outbound } = primaryKey;
                    const tableClone = {
                        ...table,
                        mutate: (req) => {
                            const trans = req.trans;
                            const mutatedParts = trans.mutatedParts || (trans.mutatedParts = {});
                            const getRangeSet = (indexName) => {
                                const part = `idb://${dbName}/${tableName}/${indexName}`;
                                return (mutatedParts[part] ||
                                    (mutatedParts[part] = new RangeSet()));
                            };
                            const pkRangeSet = getRangeSet("");
                            const delsRangeSet = getRangeSet(":dels");
                            const { type } = req;
                            let [keys, newObjs] = req.type === "deleteRange"
                                ? [req.range]
                                : req.type === "delete"
                                    ? [req.keys]
                                    : req.values.length < 50
                                        ? [[], req.values]
                                        : [];
                            const oldCache = req.trans["_cache"];
                            return table.mutate(req).then((res) => {
                                if (isArray(keys)) {
                                    if (type !== "delete")
                                        keys = res.results;
                                    pkRangeSet.addKeys(keys);
                                    const oldObjs = getFromTransactionCache(keys, oldCache);
                                    if (!oldObjs && type !== "add") {
                                        delsRangeSet.addKeys(keys);
                                    }
                                    if (oldObjs || newObjs) {
                                        trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs);
                                    }
                                }
                                else if (keys) {
                                    const range = { from: keys.lower, to: keys.upper };
                                    delsRangeSet.add(range);
                                    pkRangeSet.add(range);
                                }
                                else {
                                    pkRangeSet.add(FULL_RANGE);
                                    delsRangeSet.add(FULL_RANGE);
                                    schema.indexes.forEach(idx => getRangeSet(idx.name).add(FULL_RANGE));
                                }
                                return res;
                            });
                        },
                    };
                    const getRange = ({ query: { index, range }, }) => {
                        var _a, _b;
                        return [
                            index,
                            new RangeSet((_a = range.lower) !== null && _a !== void 0 ? _a : core.MIN_KEY, (_b = range.upper) !== null && _b !== void 0 ? _b : core.MAX_KEY),
                        ];
                    };
                    const readSubscribers = {
                        get: (req) => [primaryKey, new RangeSet(req.key)],
                        getMany: (req) => [primaryKey, new RangeSet().addKeys(req.keys)],
                        count: getRange,
                        query: getRange,
                        openCursor: getRange,
                    };
                    keys(readSubscribers).forEach(method => {
                        tableClone[method] = function (req) {
                            const { subscr } = PSD;
                            if (subscr) {
                                const getRangeSet = (indexName) => {
                                    const part = `idb://${dbName}/${tableName}/${indexName}`;
                                    return (subscr[part] ||
                                        (subscr[part] = new RangeSet()));
                                };
                                const pkRangeSet = getRangeSet("");
                                const delsRangeSet = getRangeSet(":dels");
                                const [queriedIndex, queriedRanges] = readSubscribers[method](req);
                                getRangeSet(queriedIndex.name || "").add(queriedRanges);
                                if (!queriedIndex.isPrimaryKey) {
                                    if (method === "count") {
                                        delsRangeSet.add(FULL_RANGE);
                                    }
                                    else {
                                        const keysPromise = method === "query" &&
                                            outbound &&
                                            req.values &&
                                            table.query({
                                                ...req,
                                                values: false,
                                            });
                                        return table[method].apply(this, arguments).then((res) => {
                                            if (method === "query") {
                                                if (outbound && req.values) {
                                                    return keysPromise.then(({ result: resultingKeys }) => {
                                                        pkRangeSet.addKeys(resultingKeys);
                                                        return res;
                                                    });
                                                }
                                                const pKeys = req.values
                                                    ? res.result.map(extractKey)
                                                    : res.result;
                                                if (req.values) {
                                                    pkRangeSet.addKeys(pKeys);
                                                }
                                                else {
                                                    delsRangeSet.addKeys(pKeys);
                                                }
                                            }
                                            else if (method === "openCursor") {
                                                const cursor = res;
                                                const wantValues = req.values;
                                                return (cursor &&
                                                    Object.create(cursor, {
                                                        key: {
                                                            get() {
                                                                delsRangeSet.addKey(cursor.primaryKey);
                                                                return cursor.key;
                                                            },
                                                        },
                                                        primaryKey: {
                                                            get() {
                                                                const pkey = cursor.primaryKey;
                                                                delsRangeSet.addKey(pkey);
                                                                return pkey;
                                                            },
                                                        },
                                                        value: {
                                                            get() {
                                                                wantValues && pkRangeSet.addKey(cursor.primaryKey);
                                                                return cursor.value;
                                                            },
                                                        },
                                                    }));
                                            }
                                            return res;
                                        });
                                    }
                                }
                            }
                            return table[method].apply(this, arguments);
                        };
                    });
                    return tableClone;
                },
            };
        },
    };
    function trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs) {
        function addAffectedIndex(ix) {
            const rangeSet = getRangeSet(ix.name || "");
            function extractKey(obj) {
                return obj != null ? ix.extractKey(obj) : null;
            }
            const addKeyOrKeys = (key) => ix.multiEntry && isArray(key)
                ? key.forEach(key => rangeSet.addKey(key))
                : rangeSet.addKey(key);
            (oldObjs || newObjs).forEach((_, i) => {
                const oldKey = oldObjs && extractKey(oldObjs[i]);
                const newKey = newObjs && extractKey(newObjs[i]);
                if (cmp(oldKey, newKey) !== 0) {
                    if (oldKey != null)
                        addKeyOrKeys(oldKey);
                    if (newKey != null)
                        addKeyOrKeys(newKey);
                }
            });
        }
        schema.indexes.forEach(addAffectedIndex);
    }

    class Dexie$1 {
        constructor(name, options) {
            this._middlewares = {};
            this.verno = 0;
            const deps = Dexie$1.dependencies;
            this._options = options = {
                addons: Dexie$1.addons,
                autoOpen: true,
                indexedDB: deps.indexedDB,
                IDBKeyRange: deps.IDBKeyRange,
                ...options
            };
            this._deps = {
                indexedDB: options.indexedDB,
                IDBKeyRange: options.IDBKeyRange
            };
            const { addons, } = options;
            this._dbSchema = {};
            this._versions = [];
            this._storeNames = [];
            this._allTables = {};
            this.idbdb = null;
            this._novip = this;
            const state = {
                dbOpenError: null,
                isBeingOpened: false,
                onReadyBeingFired: null,
                openComplete: false,
                dbReadyResolve: nop,
                dbReadyPromise: null,
                cancelOpen: nop,
                openCanceller: null,
                autoSchema: true,
                PR1398_maxLoop: 3
            };
            state.dbReadyPromise = new DexiePromise(resolve => {
                state.dbReadyResolve = resolve;
            });
            state.openCanceller = new DexiePromise((_, reject) => {
                state.cancelOpen = reject;
            });
            this._state = state;
            this.name = name;
            this.on = Events(this, "populate", "blocked", "versionchange", "close", { ready: [promisableChain, nop] });
            this.on.ready.subscribe = override(this.on.ready.subscribe, subscribe => {
                return (subscriber, bSticky) => {
                    Dexie$1.vip(() => {
                        const state = this._state;
                        if (state.openComplete) {
                            if (!state.dbOpenError)
                                DexiePromise.resolve().then(subscriber);
                            if (bSticky)
                                subscribe(subscriber);
                        }
                        else if (state.onReadyBeingFired) {
                            state.onReadyBeingFired.push(subscriber);
                            if (bSticky)
                                subscribe(subscriber);
                        }
                        else {
                            subscribe(subscriber);
                            const db = this;
                            if (!bSticky)
                                subscribe(function unsubscribe() {
                                    db.on.ready.unsubscribe(subscriber);
                                    db.on.ready.unsubscribe(unsubscribe);
                                });
                        }
                    });
                };
            });
            this.Collection = createCollectionConstructor(this);
            this.Table = createTableConstructor(this);
            this.Transaction = createTransactionConstructor(this);
            this.Version = createVersionConstructor(this);
            this.WhereClause = createWhereClauseConstructor(this);
            this.on("versionchange", ev => {
                if (ev.newVersion > 0)
                    console.warn(`Another connection wants to upgrade database '${this.name}'. Closing db now to resume the upgrade.`);
                else
                    console.warn(`Another connection wants to delete database '${this.name}'. Closing db now to resume the delete request.`);
                this.close();
            });
            this.on("blocked", ev => {
                if (!ev.newVersion || ev.newVersion < ev.oldVersion)
                    console.warn(`Dexie.delete('${this.name}') was blocked`);
                else
                    console.warn(`Upgrade '${this.name}' blocked by other connection holding version ${ev.oldVersion / 10}`);
            });
            this._maxKey = getMaxKey(options.IDBKeyRange);
            this._createTransaction = (mode, storeNames, dbschema, parentTransaction) => new this.Transaction(mode, storeNames, dbschema, this._options.chromeTransactionDurability, parentTransaction);
            this._fireOnBlocked = ev => {
                this.on("blocked").fire(ev);
                connections
                    .filter(c => c.name === this.name && c !== this && !c._state.vcFired)
                    .map(c => c.on("versionchange").fire(ev));
            };
            this.use(virtualIndexMiddleware);
            this.use(hooksMiddleware);
            this.use(observabilityMiddleware);
            this.use(cacheExistingValuesMiddleware);
            this.vip = Object.create(this, { _vip: { value: true } });
            addons.forEach(addon => addon(this));
        }
        version(versionNumber) {
            if (isNaN(versionNumber) || versionNumber < 0.1)
                throw new exceptions.Type(`Given version is not a positive number`);
            versionNumber = Math.round(versionNumber * 10) / 10;
            if (this.idbdb || this._state.isBeingOpened)
                throw new exceptions.Schema("Cannot add version when database is open");
            this.verno = Math.max(this.verno, versionNumber);
            const versions = this._versions;
            var versionInstance = versions.filter(v => v._cfg.version === versionNumber)[0];
            if (versionInstance)
                return versionInstance;
            versionInstance = new this.Version(versionNumber);
            versions.push(versionInstance);
            versions.sort(lowerVersionFirst);
            versionInstance.stores({});
            this._state.autoSchema = false;
            return versionInstance;
        }
        _whenReady(fn) {
            return (this.idbdb && (this._state.openComplete || PSD.letThrough || this._vip)) ? fn() : new DexiePromise((resolve, reject) => {
                if (this._state.openComplete) {
                    return reject(new exceptions.DatabaseClosed(this._state.dbOpenError));
                }
                if (!this._state.isBeingOpened) {
                    if (!this._options.autoOpen) {
                        reject(new exceptions.DatabaseClosed());
                        return;
                    }
                    this.open().catch(nop);
                }
                this._state.dbReadyPromise.then(resolve, reject);
            }).then(fn);
        }
        use({ stack, create, level, name }) {
            if (name)
                this.unuse({ stack, name });
            const middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
            middlewares.push({ stack, create, level: level == null ? 10 : level, name });
            middlewares.sort((a, b) => a.level - b.level);
            return this;
        }
        unuse({ stack, name, create }) {
            if (stack && this._middlewares[stack]) {
                this._middlewares[stack] = this._middlewares[stack].filter(mw => create ? mw.create !== create :
                    name ? mw.name !== name :
                        false);
            }
            return this;
        }
        open() {
            return dexieOpen(this);
        }
        _close() {
            const state = this._state;
            const idx = connections.indexOf(this);
            if (idx >= 0)
                connections.splice(idx, 1);
            if (this.idbdb) {
                try {
                    this.idbdb.close();
                }
                catch (e) { }
                this._novip.idbdb = null;
            }
            state.dbReadyPromise = new DexiePromise(resolve => {
                state.dbReadyResolve = resolve;
            });
            state.openCanceller = new DexiePromise((_, reject) => {
                state.cancelOpen = reject;
            });
        }
        close() {
            this._close();
            const state = this._state;
            this._options.autoOpen = false;
            state.dbOpenError = new exceptions.DatabaseClosed();
            if (state.isBeingOpened)
                state.cancelOpen(state.dbOpenError);
        }
        delete() {
            const hasArguments = arguments.length > 0;
            const state = this._state;
            return new DexiePromise((resolve, reject) => {
                const doDelete = () => {
                    this.close();
                    var req = this._deps.indexedDB.deleteDatabase(this.name);
                    req.onsuccess = wrap(() => {
                        _onDatabaseDeleted(this._deps, this.name);
                        resolve();
                    });
                    req.onerror = eventRejectHandler(reject);
                    req.onblocked = this._fireOnBlocked;
                };
                if (hasArguments)
                    throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");
                if (state.isBeingOpened) {
                    state.dbReadyPromise.then(doDelete);
                }
                else {
                    doDelete();
                }
            });
        }
        backendDB() {
            return this.idbdb;
        }
        isOpen() {
            return this.idbdb !== null;
        }
        hasBeenClosed() {
            const dbOpenError = this._state.dbOpenError;
            return dbOpenError && (dbOpenError.name === 'DatabaseClosed');
        }
        hasFailed() {
            return this._state.dbOpenError !== null;
        }
        dynamicallyOpened() {
            return this._state.autoSchema;
        }
        get tables() {
            return keys(this._allTables).map(name => this._allTables[name]);
        }
        transaction() {
            const args = extractTransactionArgs.apply(this, arguments);
            return this._transaction.apply(this, args);
        }
        _transaction(mode, tables, scopeFunc) {
            let parentTransaction = PSD.trans;
            if (!parentTransaction || parentTransaction.db !== this || mode.indexOf('!') !== -1)
                parentTransaction = null;
            const onlyIfCompatible = mode.indexOf('?') !== -1;
            mode = mode.replace('!', '').replace('?', '');
            let idbMode, storeNames;
            try {
                storeNames = tables.map(table => {
                    var storeName = table instanceof this.Table ? table.name : table;
                    if (typeof storeName !== 'string')
                        throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
                    return storeName;
                });
                if (mode == "r" || mode === READONLY)
                    idbMode = READONLY;
                else if (mode == "rw" || mode == READWRITE)
                    idbMode = READWRITE;
                else
                    throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
                if (parentTransaction) {
                    if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
                        if (onlyIfCompatible) {
                            parentTransaction = null;
                        }
                        else
                            throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                    }
                    if (parentTransaction) {
                        storeNames.forEach(storeName => {
                            if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                                if (onlyIfCompatible) {
                                    parentTransaction = null;
                                }
                                else
                                    throw new exceptions.SubTransaction("Table " + storeName +
                                        " not included in parent transaction.");
                            }
                        });
                    }
                    if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
                        parentTransaction = null;
                    }
                }
            }
            catch (e) {
                return parentTransaction ?
                    parentTransaction._promise(null, (_, reject) => { reject(e); }) :
                    rejection(e);
            }
            const enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
            return (parentTransaction ?
                parentTransaction._promise(idbMode, enterTransaction, "lock") :
                PSD.trans ?
                    usePSD(PSD.transless, () => this._whenReady(enterTransaction)) :
                    this._whenReady(enterTransaction));
        }
        table(tableName) {
            if (!hasOwn(this._allTables, tableName)) {
                throw new exceptions.InvalidTable(`Table ${tableName} does not exist`);
            }
            return this._allTables[tableName];
        }
    }

    const symbolObservable = typeof Symbol !== "undefined" && "observable" in Symbol
        ? Symbol.observable
        : "@@observable";
    class Observable {
        constructor(subscribe) {
            this._subscribe = subscribe;
        }
        subscribe(x, error, complete) {
            return this._subscribe(!x || typeof x === "function" ? { next: x, error, complete } : x);
        }
        [symbolObservable]() {
            return this;
        }
    }

    function extendObservabilitySet(target, newSet) {
        keys(newSet).forEach(part => {
            const rangeSet = target[part] || (target[part] = new RangeSet());
            mergeRanges(rangeSet, newSet[part]);
        });
        return target;
    }

    function liveQuery(querier) {
        return new Observable((observer) => {
            const scopeFuncIsAsync = isAsyncFunction(querier);
            function execute(subscr) {
                if (scopeFuncIsAsync) {
                    incrementExpectedAwaits();
                }
                const exec = () => newScope(querier, { subscr, trans: null });
                const rv = PSD.trans
                    ?
                        usePSD(PSD.transless, exec)
                    : exec();
                if (scopeFuncIsAsync) {
                    rv.then(decrementExpectedAwaits, decrementExpectedAwaits);
                }
                return rv;
            }
            let closed = false;
            let accumMuts = {};
            let currentObs = {};
            const subscription = {
                get closed() {
                    return closed;
                },
                unsubscribe: () => {
                    closed = true;
                    globalEvents.storagemutated.unsubscribe(mutationListener);
                },
            };
            observer.start && observer.start(subscription);
            let querying = false, startedListening = false;
            function shouldNotify() {
                return keys(currentObs).some((key) => accumMuts[key] && rangesOverlap(accumMuts[key], currentObs[key]));
            }
            const mutationListener = (parts) => {
                extendObservabilitySet(accumMuts, parts);
                if (shouldNotify()) {
                    doQuery();
                }
            };
            const doQuery = () => {
                if (querying || closed)
                    return;
                accumMuts = {};
                const subscr = {};
                const ret = execute(subscr);
                if (!startedListening) {
                    globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, mutationListener);
                    startedListening = true;
                }
                querying = true;
                Promise.resolve(ret).then((result) => {
                    querying = false;
                    if (closed)
                        return;
                    if (shouldNotify()) {
                        doQuery();
                    }
                    else {
                        accumMuts = {};
                        currentObs = subscr;
                        observer.next && observer.next(result);
                    }
                }, (err) => {
                    querying = false;
                    observer.error && observer.error(err);
                    subscription.unsubscribe();
                });
            };
            doQuery();
            return subscription;
        });
    }

    let domDeps;
    try {
        domDeps = {
            indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
            IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
        };
    }
    catch (e) {
        domDeps = { indexedDB: null, IDBKeyRange: null };
    }

    const Dexie = Dexie$1;
    props(Dexie, {
        ...fullNameExceptions,
        delete(databaseName) {
            const db = new Dexie(databaseName, { addons: [] });
            return db.delete();
        },
        exists(name) {
            return new Dexie(name, { addons: [] }).open().then(db => {
                db.close();
                return true;
            }).catch('NoSuchDatabaseError', () => false);
        },
        getDatabaseNames(cb) {
            try {
                return getDatabaseNames(Dexie.dependencies).then(cb);
            }
            catch (_a) {
                return rejection(new exceptions.MissingAPI());
            }
        },
        defineClass() {
            function Class(content) {
                extend(this, content);
            }
            return Class;
        },
        ignoreTransaction(scopeFunc) {
            return PSD.trans ?
                usePSD(PSD.transless, scopeFunc) :
                scopeFunc();
        },
        vip,
        async: function (generatorFn) {
            return function () {
                try {
                    var rv = awaitIterator(generatorFn.apply(this, arguments));
                    if (!rv || typeof rv.then !== 'function')
                        return DexiePromise.resolve(rv);
                    return rv;
                }
                catch (e) {
                    return rejection(e);
                }
            };
        },
        spawn: function (generatorFn, args, thiz) {
            try {
                var rv = awaitIterator(generatorFn.apply(thiz, args || []));
                if (!rv || typeof rv.then !== 'function')
                    return DexiePromise.resolve(rv);
                return rv;
            }
            catch (e) {
                return rejection(e);
            }
        },
        currentTransaction: {
            get: () => PSD.trans || null
        },
        waitFor: function (promiseOrFunction, optionalTimeout) {
            const promise = DexiePromise.resolve(typeof promiseOrFunction === 'function' ?
                Dexie.ignoreTransaction(promiseOrFunction) :
                promiseOrFunction)
                .timeout(optionalTimeout || 60000);
            return PSD.trans ?
                PSD.trans.waitFor(promise) :
                promise;
        },
        Promise: DexiePromise,
        debug: {
            get: () => debug,
            set: value => {
                setDebug(value, value === 'dexie' ? () => true : dexieStackFrameFilter);
            }
        },
        derive: derive,
        extend: extend,
        props: props,
        override: override,
        Events: Events,
        on: globalEvents,
        liveQuery,
        extendObservabilitySet,
        getByKeyPath: getByKeyPath,
        setByKeyPath: setByKeyPath,
        delByKeyPath: delByKeyPath,
        shallowClone: shallowClone,
        deepClone: deepClone,
        getObjectDiff: getObjectDiff,
        cmp,
        asap: asap$1,
        minKey: minKey,
        addons: [],
        connections: connections,
        errnames: errnames,
        dependencies: domDeps,
        semVer: DEXIE_VERSION,
        version: DEXIE_VERSION.split('.')
            .map(n => parseInt(n))
            .reduce((p, c, i) => p + (c / Math.pow(10, i * 2))),
    });
    Dexie.maxKey = getMaxKey(Dexie.dependencies.IDBKeyRange);

    if (typeof dispatchEvent !== 'undefined' && typeof addEventListener !== 'undefined') {
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, updatedParts => {
            if (!propagatingLocally) {
                let event;
                if (isIEOrEdge) {
                    event = document.createEvent('CustomEvent');
                    event.initCustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, true, true, updatedParts);
                }
                else {
                    event = new CustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, {
                        detail: updatedParts
                    });
                }
                propagatingLocally = true;
                dispatchEvent(event);
                propagatingLocally = false;
            }
        });
        addEventListener(STORAGE_MUTATED_DOM_EVENT_NAME, ({ detail }) => {
            if (!propagatingLocally) {
                propagateLocally(detail);
            }
        });
    }
    function propagateLocally(updateParts) {
        let wasMe = propagatingLocally;
        try {
            propagatingLocally = true;
            globalEvents.storagemutated.fire(updateParts);
        }
        finally {
            propagatingLocally = wasMe;
        }
    }
    let propagatingLocally = false;

    if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(STORAGE_MUTATED_DOM_EVENT_NAME);
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, (changedParts) => {
            if (!propagatingLocally) {
                bc.postMessage(changedParts);
            }
        });
        bc.onmessage = (ev) => {
            if (ev.data)
                propagateLocally(ev.data);
        };
    }
    else if (typeof self !== 'undefined' && typeof navigator !== 'undefined') {
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, (changedParts) => {
            try {
                if (!propagatingLocally) {
                    if (typeof localStorage !== 'undefined') {
                        localStorage.setItem(STORAGE_MUTATED_DOM_EVENT_NAME, JSON.stringify({
                            trig: Math.random(),
                            changedParts,
                        }));
                    }
                    if (typeof self['clients'] === 'object') {
                        [...self['clients'].matchAll({ includeUncontrolled: true })].forEach((client) => client.postMessage({
                            type: STORAGE_MUTATED_DOM_EVENT_NAME,
                            changedParts,
                        }));
                    }
                }
            }
            catch (_a) { }
        });
        addEventListener('storage', (ev) => {
            if (ev.key === STORAGE_MUTATED_DOM_EVENT_NAME) {
                const data = JSON.parse(ev.newValue);
                if (data)
                    propagateLocally(data.changedParts);
            }
        });
        const swContainer = self.document && navigator.serviceWorker;
        if (swContainer) {
            swContainer.addEventListener('message', propagateMessageLocally);
        }
    }
    function propagateMessageLocally({ data }) {
        if (data && data.type === STORAGE_MUTATED_DOM_EVENT_NAME) {
            propagateLocally(data.changedParts);
        }
    }

    DexiePromise.rejectionMapper = mapError;
    setDebug(debug, dexieStackFrameFilter);

    // core/textures/KTX2Worker.bundle.txt?raw
    var KTX2Worker_bundle_default = '(() => {\n  var __create = Object.create;\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __getProtoOf = Object.getPrototypeOf;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __reExport = (target, module, copyDefault, desc) => {\n    if (module && typeof module === "object" || typeof module === "function") {\n      for (let key of __getOwnPropNames(module))\n        if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))\n          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });\n    }\n    return target;\n  };\n  var __toESM = (module, isNodeMode) => {\n    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", !isNodeMode && module && module.__esModule ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);\n  };\n\n  // (disabled):../../node_modules/@loaders.gl/worker-utils/dist/esm/lib/node/require-utils.node\n  var require_require_utils = __commonJS({\n    "(disabled):../../node_modules/@loaders.gl/worker-utils/dist/esm/lib/node/require-utils.node"() {\n    }\n  });\n\n  // ../../node_modules/@loaders.gl/textures/dist/esm/lib/utils/version.js\n  var VERSION = true ? "3.1.4" : "latest";\n\n  // ../../node_modules/@loaders.gl/worker-utils/dist/esm/lib/env-utils/assert.js\n  function assert(condition, message) {\n    if (!condition) {\n      throw new Error(message || "loaders.gl assertion failed.");\n    }\n  }\n\n  // ../../node_modules/@loaders.gl/worker-utils/dist/esm/lib/env-utils/globals.js\n  var globals = {\n    self: typeof self !== "undefined" && self,\n    window: typeof window !== "undefined" && window,\n    global: typeof global !== "undefined" && global,\n    document: typeof document !== "undefined" && document\n  };\n  var self_ = globals.self || globals.window || globals.global || {};\n  var window_ = globals.window || globals.self || globals.global || {};\n  var global_ = globals.global || globals.self || globals.window || {};\n  var document_ = globals.document || {};\n  var isBrowser = typeof process !== "object" || String(process) !== "[object process]" || process.browser;\n  var isWorker = typeof importScripts === "function";\n  var isMobile = typeof window !== "undefined" && typeof window.orientation !== "undefined";\n  var matches = typeof process !== "undefined" && process.version && /v([0-9]*)/.exec(process.version);\n  var nodeVersion = matches && parseFloat(matches[1]) || 0;\n\n  // ../../node_modules/@loaders.gl/worker-utils/dist/esm/lib/library-utils/library-utils.js\n  var node = __toESM(require_require_utils());\n  var VERSION2 = true ? "3.1.4" : LATEST;\n  var loadLibraryPromises = {};\n  async function loadLibrary(libraryUrl, moduleName = null, options = {}) {\n    if (moduleName) {\n      libraryUrl = getLibraryUrl(libraryUrl, moduleName, options);\n    }\n    loadLibraryPromises[libraryUrl] = loadLibraryPromises[libraryUrl] || loadLibraryFromFile(libraryUrl);\n    return await loadLibraryPromises[libraryUrl];\n  }\n  function getLibraryUrl(library, moduleName, options) {\n    if (library.startsWith("http")) {\n      return library;\n    }\n    const modules = options.modules || {};\n    if (modules[library]) {\n      return modules[library];\n    }\n    if (!isBrowser) {\n      return "modules/".concat(moduleName, "/dist/libs/").concat(library);\n    }\n    if (options.CDN) {\n      assert(options.CDN.startsWith("http"));\n      return "".concat(options.CDN, "/").concat(moduleName, "@").concat(VERSION2, "/dist/libs/").concat(library);\n    }\n    if (isWorker) {\n      return "../src/libs/".concat(library);\n    }\n    return "modules/".concat(moduleName, "/src/libs/").concat(library);\n  }\n  async function loadLibraryFromFile(libraryUrl) {\n    if (libraryUrl.endsWith("wasm")) {\n      const response2 = await fetch(libraryUrl);\n      return await response2.arrayBuffer();\n    }\n    if (!isBrowser) {\n      try {\n        return node && node.requireFromFile && await node.requireFromFile(libraryUrl);\n      } catch {\n        return null;\n      }\n    }\n    if (isWorker) {\n      return importScripts(libraryUrl);\n    }\n    const response = await fetch(libraryUrl);\n    const scriptSource = await response.text();\n    return loadLibraryFromString(scriptSource, libraryUrl);\n  }\n  function loadLibraryFromString(scriptSource, id) {\n    if (!isBrowser) {\n      return node.requireFromString && node.requireFromString(scriptSource, id);\n    }\n    if (isWorker) {\n      eval.call(global_, scriptSource);\n      return null;\n    }\n    const script = document.createElement("script");\n    script.id = id;\n    try {\n      script.appendChild(document.createTextNode(scriptSource));\n    } catch (e) {\n      script.text = scriptSource;\n    }\n    document.body.appendChild(script);\n    return null;\n  }\n\n  // ../../node_modules/@loaders.gl/textures/dist/esm/lib/parsers/basis-module-loader.js\n  var VERSION3 = true ? "3.1.4" : "latest";\n  var BASIS_CDN_ENCODER_WASM = "https://unpkg.com/@loaders.gl/textures@".concat(VERSION3, "/dist/libs/basis_encoder.wasm");\n  var BASIS_CDN_ENCODER_JS = "https://unpkg.com/@loaders.gl/textures@".concat(VERSION3, "/dist/libs/basis_encoder.js");\n  var loadBasisEncoderPromise;\n  async function loadBasisEncoderModule(options) {\n    const modules = options.modules || {};\n    if (modules.basisEncoder) {\n      return modules.basisEncoder;\n    }\n    loadBasisEncoderPromise = loadBasisEncoderPromise || loadBasisEncoder(options);\n    return await loadBasisEncoderPromise;\n  }\n  async function loadBasisEncoder(options) {\n    let BASIS_ENCODER = null;\n    let wasmBinary = null;\n    [BASIS_ENCODER, wasmBinary] = await Promise.all([await loadLibrary(BASIS_CDN_ENCODER_JS, "textures", options), await loadLibrary(BASIS_CDN_ENCODER_WASM, "textures", options)]);\n    BASIS_ENCODER = BASIS_ENCODER || globalThis.BASIS;\n    return await initializeBasisEncoderModule(BASIS_ENCODER, wasmBinary);\n  }\n  function initializeBasisEncoderModule(BasisEncoderModule, wasmBinary) {\n    const options = {};\n    if (wasmBinary) {\n      options.wasmBinary = wasmBinary;\n    }\n    return new Promise((resolve) => {\n      BasisEncoderModule(options).then((module) => {\n        const {\n          BasisFile,\n          KTX2File,\n          initializeBasis,\n          BasisEncoder\n        } = module;\n        initializeBasis();\n        resolve({\n          BasisFile,\n          KTX2File,\n          BasisEncoder\n        });\n      });\n    });\n  }\n\n  // ../../node_modules/@loaders.gl/textures/dist/esm/lib/encoders/encode-ktx2-basis-texture.js\n  async function encodeKTX2BasisTexture(image, options = {}) {\n    const {\n      useSRGB = false,\n      qualityLevel = 10,\n      encodeUASTC = false,\n      mipmaps = false\n    } = options;\n    const {\n      BasisEncoder\n    } = await loadBasisEncoderModule(options);\n    const basisEncoder = new BasisEncoder();\n    try {\n      const basisFileData = new Uint8Array(image.width * image.height * 4);\n      basisEncoder.setCreateKTX2File(true);\n      basisEncoder.setKTX2UASTCSupercompression(true);\n      basisEncoder.setKTX2SRGBTransferFunc(true);\n      basisEncoder.setSliceSourceImage(0, image.data, image.width, image.height, false);\n      basisEncoder.setPerceptual(useSRGB);\n      basisEncoder.setMipSRGB(useSRGB);\n      basisEncoder.setQualityLevel(qualityLevel);\n      basisEncoder.setUASTC(encodeUASTC);\n      basisEncoder.setMipGen(mipmaps);\n      const numOutputBytes = basisEncoder.encode(basisFileData);\n      const actualKTX2FileData = basisFileData.subarray(0, numOutputBytes).buffer;\n      return actualKTX2FileData;\n    } catch (error) {\n      console.error("Basis Universal Supercompressed GPU Texture encoder Error: ", error);\n      throw error;\n    } finally {\n      basisEncoder.delete();\n    }\n  }\n\n  // ../../node_modules/@loaders.gl/textures/dist/esm/ktx2-basis-universal-texture-writer.js\n  var KTX2BasisUniversalTextureWriter = {\n    name: "Basis Universal Supercompressed GPU Texture",\n    id: "ktx2-basis-supercompressed-texture",\n    module: "textures",\n    version: VERSION,\n    extensions: ["ktx2"],\n    options: {\n      useSRGB: false,\n      qualityLevel: 10,\n      encodeUASTC: false,\n      mipmaps: false\n    },\n    encode: encodeKTX2BasisTexture\n  };\n\n  // core/textures/KTX2Worker.ts\n  var worker = self;\n  worker.onmessage = async (msg) => {\n    try {\n      const texture = await KTX2BasisUniversalTextureWriter.encode(msg.data, {\n        useSRGB: true,\n        encodeUASTC: true,\n        mipmaps: true\n      });\n      const response = { texture };\n      worker.postMessage(response, [texture]);\n    } catch (err) {\n      worker.postMessage({ error: err.message });\n    }\n  };\n})();\n';

    // core/WorkerPool.ts
    var WorkerPool = class {
      pool;
      queue = [];
      workers = [];
      workersResolve = [];
      workerStatus = 0;
      workerCreator;
      constructor(pool = 4) {
        this.pool = pool;
      }
      _initWorker(workerId) {
        if (!this.workers[workerId]) {
          const worker = this.workerCreator();
          worker.addEventListener("message", this._onMessage.bind(this, workerId));
          this.workers[workerId] = worker;
        }
      }
      _getIdleWorker() {
        for (let i = 0; i < this.pool; i++)
          if (!(this.workerStatus & 1 << i))
            return i;
        return -1;
      }
      _onMessage(workerId, msg) {
        const resolve = this.workersResolve[workerId];
        resolve && resolve(msg);
        if (this.queue.length) {
          const { resolve: resolve2, msg: msg2, transfer } = this.queue.shift();
          this.workersResolve[workerId] = resolve2;
          this.workers[workerId].postMessage(msg2, transfer);
        } else {
          this.workerStatus ^= 1 << workerId;
        }
      }
      setWorkerCreator(workerCreator) {
        this.workerCreator = workerCreator;
      }
      setWorkerLimit(pool) {
        this.pool = pool;
      }
      postMessage(msg, transfer) {
        return new Promise((resolve) => {
          const workerId = this._getIdleWorker();
          if (workerId !== -1) {
            this._initWorker(workerId);
            this.workerStatus |= 1 << workerId;
            this.workersResolve[workerId] = resolve;
            this.workers[workerId].postMessage(msg, transfer);
          } else {
            this.queue.push({ resolve, msg, transfer });
          }
        });
      }
      dispose() {
        this.workers.forEach((worker) => worker.terminate());
        this.workersResolve.length = 0;
        this.workers.length = 0;
        this.queue.length = 0;
        this.workerStatus = 0;
      }
    };

    // core/textures/KTX2Encoder.ts
    var workerBlob = new Blob([KTX2Worker_bundle_default], { type: "text/javascript" });
    var workerURL = URL.createObjectURL(workerBlob);
    var KTX2Encoder = class {
      pool = new WorkerPool(1);
      constructor() {
        this.pool.setWorkerCreator(() => new Worker(workerURL));
      }
      async encode(imageData) {
        const responseMessage = await this.pool.postMessage(imageData, [imageData.data.buffer]);
        if (responseMessage.data.error)
          throw new Error(responseMessage.data.error);
        if (!responseMessage.data.texture)
          throw new Error("Encoding failed");
        return responseMessage.data.texture;
      }
    };

    // Based on https://github.com/cburgmer/xmlserializer 
    function removeInvalidCharacters(content) {
        // See http://www.w3.org/TR/xml/#NT-Char for valid XML 1.0 characters
        return content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    }
    function serializeAttributeValue(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    function serializeTextContent(content) {
        return content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    function serializeAttribute(name, value) {
        return ' ' + name + '="' + serializeAttributeValue(value) + '"';
    }
    function serializeNamespace(node, isRootNode) {
        const nodeHasXmlnsAttr = node.hasAttribute('xmlns');
        // Serialize the namespace as an xmlns attribute whenever the element
        // doesn't already have one and the inherited namespace does not match
        // the element's namespace.
        if (!nodeHasXmlnsAttr &&
            (isRootNode ||
                node.namespaceURI !== node.parentElement.namespaceURI)) {
            return ' xmlns="' + node.namespaceURI + '"';
        }
        else {
            return '';
        }
    }
    async function serializeChildren(node, options) {
        let output = [];
        for (const n of node.childNodes)
            output.push(nodeTreeToXHTML(n, options));
        return Promise.all(output).then(output => output.join(''));
    }
    async function serializeTag(node, options) {
        const tagName = node.tagName.toLowerCase();
        let output = '<' + tagName;
        output += serializeNamespace(node, options.depth === 0);
        const childrenHTML = serializeChildren(node, options);
        for (const attr of node.attributes) {
            if (attr.name === 'src') {
                if (node.nodeName === 'IMG') {
                    output += serializeAttribute(attr.name, await WebRenderer.getDataURL(attr.value));
                }
                else {
                    output += serializeAttribute('data-src', attr.value);
                }
            }
            else {
                output += serializeAttribute(attr.name, attr.value);
            }
        }
        if (node.childNodes.length > 0) {
            options.depth++;
            output += '>';
            output += await childrenHTML;
            output += '</' + tagName + '>';
            options.depth--;
        }
        else {
            output += '/>';
        }
        return output;
    }
    function serializeText(node) {
        var text = node.nodeValue || '';
        return serializeTextContent(text);
    }
    function serializeCDATA(node) {
        return '<![CDATA[' + node.nodeValue + ']]>';
    }
    async function nodeTreeToXHTML(node, options) {
        const replaced = options.replacer?.(options.target, node);
        if (typeof replaced === 'string') {
            return replaced;
        }
        else if (node.nodeName === '#document' ||
            node.nodeName === '#document-fragment') {
            return serializeChildren(node, options);
        }
        else if (node.tagName) {
            return serializeTag(node, options);
        }
        else if (node.nodeName === '#text') {
            return serializeText(node);
        }
        else if (node.nodeName === '#comment') ;
        else if (node.nodeName === '#cdata-section') {
            return serializeCDATA(node);
        }
        return '';
    }
    async function serializeToString(node, replacer = serializationReplacer) {
        return removeInvalidCharacters(await nodeTreeToXHTML(node, { depth: 0, target: node, replacer }));
    }
    const serializationReplacer = (target, node) => {
        if (target === node)
            return;
        const element = node;
        const tagName = element.tagName?.toLowerCase();
        if (tagName === 'style' || tagName === 'link')
            return '';
        const layer = WebRenderer.layers.get(element);
        if (layer) {
            layer.manager.updateDOMMetrics(layer);
            const bounds = layer.domMetrics.bounds;
            let attributes = '';
            // in order to increase our cache hits, don't serialize nested layers
            // instead, replace nested layers with an invisible placerholder that is the same width/height
            // downsides of this are that we lose subpixel precision. To avoid any rendering issues,
            // each sublayer should have explictly defined sizes (no fit-content or auto sizing). 
            const extraStyle = `box-sizing:border-box;max-width:${bounds.width}px;max-height:${bounds.height}px;min-width:${bounds.width}px;min-height:${bounds.height}px;visibility:hidden`;
            let addedStyle = false;
            for (const attr of layer.element.attributes) {
                if (attr.name === 'src')
                    continue;
                if (attr.name == 'style') {
                    attributes += serializeAttribute(attr.name, attr.value + ';' + extraStyle);
                    addedStyle = true;
                }
                else {
                    attributes += serializeAttribute(attr.name, attr.value);
                }
            }
            if (!addedStyle) {
                attributes += serializeAttribute('style', extraStyle);
            }
            const tag = element.tagName.toLowerCase();
            return `<${tag} ${attributes}></${tag}>`;
        }
    };
    // Get all parents of the embeded html as these can effect the resulting styles
    function getParentsHTML(layer, fullWidth, fullHeight, pixelRatio) {
        const opens = [];
        const closes = [];
        layer.manager.updateDOMMetrics(layer);
        const metrics = layer.domMetrics;
        let parent = layer.element.parentElement;
        if (!parent)
            parent = document.documentElement;
        do {
            let tag = parent.tagName.toLowerCase();
            let attributes = ' ';
            let style = '';
            for (const a of parent.attributes) {
                const value = serializeAttributeValue(a.value);
                if (a.name === 'style') {
                    style = value;
                    continue;
                }
                attributes += `${a.name}="${value}" `;
            }
            const open = '<' +
                tag +
                (tag === 'html'
                    ? ` ${WebRenderer.RENDERING_DOCUMENT_ATTRIBUTE}="" xmlns="http://www.w3.org/1999/xhtml"
                    style="${getPixelRatioStyling(pixelRatio)} --x-width:${metrics.bounds.width}px; --x-height:${metrics.bounds.height}px; --x-inline-top:${metrics.border.top + metrics.margin.top + metrics.padding.top}px; ${style} width:${fullWidth}px; height:${fullHeight}px;" `
                    : ` style="${style}" ${WebRenderer.RENDERING_PARENT_ATTRIBUTE}="" `) +
                attributes +
                ' >';
            opens.unshift(open);
            const close = '</' + tag + '>';
            closes.push(close);
            if (tag == 'html')
                break;
        } while ((parent = parent !== document.documentElement ? parent.parentElement || document.documentElement : null));
        return [opens.join(''), closes.join('')];
    }
    /**
     * Get cross-compatible rasterization styles for scaling up web content
     *
     * When rasterising an image w/ SVG data url into a Canvas;
     * Chrome scales the SVG web content before rasterizing (pretty)
     * Safari scales the SVG web content *after* rasterizing (not pretty)
     * Same result if using `transform: scale(x)` inside the SVG web content
     *
     * Solution: use `zoom:x` instead of `transform: scale(x)`,
     * as this allows Safari and Chrome to correctly scale up the web content before rasterizing it.
     *
     * BUT: Firefox does not support zoom style :(
     * Thankfully, Firefox rasterizes properly with `transform: scale(x)`
     *
     * Since Safari is the odd one out, we'll test for that.
     *
     */
    function getPixelRatioStyling(pixelRatio) {
        const isSafari = isSafariRegex.test(navigator.userAgent);
        if (isSafari)
            return `zoom:${pixelRatio}; `;
        return `transform: scale(${pixelRatio}); transform-origin: top left; `;
    }
    const isSafariRegex = /^((?!chrome|android).)*safari/i;

    const byteToHex = new Array(0xff);
    for (let n = 0; n <= 0xff; ++n) {
        const hexOctet = n.toString(16).padStart(2, "0");
        byteToHex[n] = hexOctet;
    }
    function byteArrayToHex(byteArray) {
        const l = byteArray.length;
        let hex = '';
        for (let i = 0; i < l; ++i)
            hex += byteToHex[byteArray[i]];
        return hex;
    }
    function bufferToHex(arrayBuffer) {
        return byteArrayToHex(new Uint8Array(arrayBuffer));
    }

    var decoder;
    try {
    	decoder = new TextDecoder();
    } catch(error) {}
    var src;
    var srcEnd;
    var position$1 = 0;
    var currentUnpackr = {};
    var currentStructures;
    var srcString;
    var srcStringStart = 0;
    var srcStringEnd = 0;
    var bundledStrings$1;
    var referenceMap;
    var currentExtensions = [];
    var dataView;
    var defaultOptions = {
    	useRecords: false,
    	mapsAsObjects: true
    };
    class C1Type {}
    const C1 = new C1Type();
    C1.name = 'MessagePack 0xC1';
    var sequentialMode = false;

    class Unpackr {
    	constructor(options) {
    		if (options) {
    			if (options.useRecords === false && options.mapsAsObjects === undefined)
    				options.mapsAsObjects = true;
    			if (options.structures)
    				options.structures.sharedLength = options.structures.length;
    			else if (options.getStructures) {
    				(options.structures = []).uninitialized = true; // this is what we use to denote an uninitialized structures
    				options.structures.sharedLength = 0;
    			}
    		}
    		Object.assign(this, options);
    	}
    	unpack(source, end) {
    		if (src) {
    			// re-entrant execution, save the state and restore it after we do this unpack
    			return saveState(() => {
    				clearSource();
    				return this ? this.unpack(source, end) : Unpackr.prototype.unpack.call(defaultOptions, source, end)
    			})
    		}
    		srcEnd = end > -1 ? end : source.length;
    		position$1 = 0;
    		srcStringEnd = 0;
    		srcString = null;
    		bundledStrings$1 = null;
    		src = source;
    		// this provides cached access to the data view for a buffer if it is getting reused, which is a recommend
    		// technique for getting data from a database where it can be copied into an existing buffer instead of creating
    		// new ones
    		try {
    			dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
    		} catch(error) {
    			// if it doesn't have a buffer, maybe it is the wrong type of object
    			src = null;
    			if (source instanceof Uint8Array)
    				throw error
    			throw new Error('Source must be a Uint8Array or Buffer but was a ' + ((source && typeof source == 'object') ? source.constructor.name : typeof source))
    		}
    		if (this instanceof Unpackr) {
    			currentUnpackr = this;
    			if (this.structures) {
    				currentStructures = this.structures;
    				return checkedRead()
    			} else if (!currentStructures || currentStructures.length > 0) {
    				currentStructures = [];
    			}
    		} else {
    			currentUnpackr = defaultOptions;
    			if (!currentStructures || currentStructures.length > 0)
    				currentStructures = [];
    		}
    		return checkedRead()
    	}
    	unpackMultiple(source, forEach) {
    		let values, lastPosition = 0;
    		try {
    			sequentialMode = true;
    			let size = source.length;
    			let value = this ? this.unpack(source, size) : defaultUnpackr.unpack(source, size);
    			if (forEach) {
    				forEach(value);
    				while(position$1 < size) {
    					lastPosition = position$1;
    					if (forEach(checkedRead()) === false) {
    						return
    					}
    				}
    			}
    			else {
    				values = [ value ];
    				while(position$1 < size) {
    					lastPosition = position$1;
    					values.push(checkedRead());
    				}
    				return values
    			}
    		} catch(error) {
    			error.lastPosition = lastPosition;
    			error.values = values;
    			throw error
    		} finally {
    			sequentialMode = false;
    			clearSource();
    		}
    	}
    	_mergeStructures(loadedStructures, existingStructures) {
    		loadedStructures = loadedStructures || [];
    		for (let i = 0, l = loadedStructures.length; i < l; i++) {
    			let structure = loadedStructures[i];
    			if (structure) {
    				structure.isShared = true;
    				if (i >= 32)
    					structure.highByte = (i - 32) >> 5;
    			}
    		}
    		loadedStructures.sharedLength = loadedStructures.length;
    		for (let id in existingStructures || []) {
    			if (id >= 0) {
    				let structure = loadedStructures[id];
    				let existing = existingStructures[id];
    				if (existing) {
    					if (structure)
    						(loadedStructures.restoreStructures || (loadedStructures.restoreStructures = []))[id] = structure;
    					loadedStructures[id] = existing;
    				}
    			}
    		}
    		return this.structures = loadedStructures
    	}
    	decode(source, end) {
    		return this.unpack(source, end)
    	}
    }
    function checkedRead() {
    	try {
    		if (!currentUnpackr.trusted && !sequentialMode) {
    			let sharedLength = currentStructures.sharedLength || 0;
    			if (sharedLength < currentStructures.length)
    				currentStructures.length = sharedLength;
    		}
    		let result = read();
    		if (bundledStrings$1) // bundled strings to skip past
    			position$1 = bundledStrings$1.postBundlePosition;

    		if (position$1 == srcEnd) {
    			// finished reading this source, cleanup references
    			if (currentStructures.restoreStructures)
    				restoreStructures();
    			currentStructures = null;
    			src = null;
    			if (referenceMap)
    				referenceMap = null;
    		} else if (position$1 > srcEnd) {
    			// over read
    			let error = new Error('Unexpected end of MessagePack data');
    			error.incomplete = true;
    			throw error
    		} else if (!sequentialMode) {
    			throw new Error('Data read, but end of buffer not reached')
    		}
    		// else more to read, but we are reading sequentially, so don't clear source yet
    		return result
    	} catch(error) {
    		if (currentStructures.restoreStructures)
    			restoreStructures();
    		clearSource();
    		if (error instanceof RangeError || error.message.startsWith('Unexpected end of buffer')) {
    			error.incomplete = true;
    		}
    		throw error
    	}
    }

    function restoreStructures() {
    	for (let id in currentStructures.restoreStructures) {
    		currentStructures[id] = currentStructures.restoreStructures[id];
    	}
    	currentStructures.restoreStructures = null;
    }

    function read() {
    	let token = src[position$1++];
    	if (token < 0xa0) {
    		if (token < 0x80) {
    			if (token < 0x40)
    				return token
    			else {
    				let structure = currentStructures[token & 0x3f] ||
    					currentUnpackr.getStructures && loadStructures()[token & 0x3f];
    				if (structure) {
    					if (!structure.read) {
    						structure.read = createStructureReader(structure, token & 0x3f);
    					}
    					return structure.read()
    				} else
    					return token
    			}
    		} else if (token < 0x90) {
    			// map
    			token -= 0x80;
    			if (currentUnpackr.mapsAsObjects) {
    				let object = {};
    				for (let i = 0; i < token; i++) {
    					object[readKey()] = read();
    				}
    				return object
    			} else {
    				let map = new Map();
    				for (let i = 0; i < token; i++) {
    					map.set(read(), read());
    				}
    				return map
    			}
    		} else {
    			token -= 0x90;
    			let array = new Array(token);
    			for (let i = 0; i < token; i++) {
    				array[i] = read();
    			}
    			return array
    		}
    	} else if (token < 0xc0) {
    		// fixstr
    		let length = token - 0xa0;
    		if (srcStringEnd >= position$1) {
    			return srcString.slice(position$1 - srcStringStart, (position$1 += length) - srcStringStart)
    		}
    		if (srcStringEnd == 0 && srcEnd < 140) {
    			// for small blocks, avoiding the overhead of the extract call is helpful
    			let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
    			if (string != null)
    				return string
    		}
    		return readFixedString(length)
    	} else {
    		let value;
    		switch (token) {
    			case 0xc0: return null
    			case 0xc1:
    				if (bundledStrings$1) {
    					value = read(); // followed by the length of the string in characters (not bytes!)
    					if (value > 0)
    						return bundledStrings$1[1].slice(bundledStrings$1.position1, bundledStrings$1.position1 += value)
    					else
    						return bundledStrings$1[0].slice(bundledStrings$1.position0, bundledStrings$1.position0 -= value)
    				}
    				return C1; // "never-used", return special object to denote that
    			case 0xc2: return false
    			case 0xc3: return true
    			case 0xc4:
    				// bin 8
    				return readBin(src[position$1++])
    			case 0xc5:
    				// bin 16
    				value = dataView.getUint16(position$1);
    				position$1 += 2;
    				return readBin(value)
    			case 0xc6:
    				// bin 32
    				value = dataView.getUint32(position$1);
    				position$1 += 4;
    				return readBin(value)
    			case 0xc7:
    				// ext 8
    				return readExt(src[position$1++])
    			case 0xc8:
    				// ext 16
    				value = dataView.getUint16(position$1);
    				position$1 += 2;
    				return readExt(value)
    			case 0xc9:
    				// ext 32
    				value = dataView.getUint32(position$1);
    				position$1 += 4;
    				return readExt(value)
    			case 0xca:
    				value = dataView.getFloat32(position$1);
    				if (currentUnpackr.useFloat32 > 2) {
    					// this does rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
    					let multiplier = mult10[((src[position$1] & 0x7f) << 1) | (src[position$1 + 1] >> 7)];
    					position$1 += 4;
    					return ((multiplier * value + (value > 0 ? 0.5 : -0.5)) >> 0) / multiplier
    				}
    				position$1 += 4;
    				return value
    			case 0xcb:
    				value = dataView.getFloat64(position$1);
    				position$1 += 8;
    				return value
    			// uint handlers
    			case 0xcc:
    				return src[position$1++]
    			case 0xcd:
    				value = dataView.getUint16(position$1);
    				position$1 += 2;
    				return value
    			case 0xce:
    				value = dataView.getUint32(position$1);
    				position$1 += 4;
    				return value
    			case 0xcf:
    				if (currentUnpackr.int64AsNumber) {
    					value = dataView.getUint32(position$1) * 0x100000000;
    					value += dataView.getUint32(position$1 + 4);
    				} else
    					value = dataView.getBigUint64(position$1);
    				position$1 += 8;
    				return value

    			// int handlers
    			case 0xd0:
    				return dataView.getInt8(position$1++)
    			case 0xd1:
    				value = dataView.getInt16(position$1);
    				position$1 += 2;
    				return value
    			case 0xd2:
    				value = dataView.getInt32(position$1);
    				position$1 += 4;
    				return value
    			case 0xd3:
    				if (currentUnpackr.int64AsNumber) {
    					value = dataView.getInt32(position$1) * 0x100000000;
    					value += dataView.getUint32(position$1 + 4);
    				} else
    					value = dataView.getBigInt64(position$1);
    				position$1 += 8;
    				return value

    			case 0xd4:
    				// fixext 1
    				value = src[position$1++];
    				if (value == 0x72) {
    					return recordDefinition(src[position$1++] & 0x3f)
    				} else {
    					let extension = currentExtensions[value];
    					if (extension) {
    						if (extension.read) {
    							position$1++; // skip filler byte
    							return extension.read(read())
    						} else if (extension.noBuffer) {
    							position$1++; // skip filler byte
    							return extension()
    						} else
    							return extension(src.subarray(position$1, ++position$1))
    					} else
    						throw new Error('Unknown extension ' + value)
    				}
    			case 0xd5:
    				// fixext 2
    				value = src[position$1];
    				if (value == 0x72) {
    					position$1++;
    					return recordDefinition(src[position$1++] & 0x3f, src[position$1++])
    				} else
    					return readExt(2)
    			case 0xd6:
    				// fixext 4
    				return readExt(4)
    			case 0xd7:
    				// fixext 8
    				return readExt(8)
    			case 0xd8:
    				// fixext 16
    				return readExt(16)
    			case 0xd9:
    			// str 8
    				value = src[position$1++];
    				if (srcStringEnd >= position$1) {
    					return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart)
    				}
    				return readString8(value)
    			case 0xda:
    			// str 16
    				value = dataView.getUint16(position$1);
    				position$1 += 2;
    				if (srcStringEnd >= position$1) {
    					return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart)
    				}
    				return readString16(value)
    			case 0xdb:
    			// str 32
    				value = dataView.getUint32(position$1);
    				position$1 += 4;
    				if (srcStringEnd >= position$1) {
    					return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart)
    				}
    				return readString32(value)
    			case 0xdc:
    			// array 16
    				value = dataView.getUint16(position$1);
    				position$1 += 2;
    				return readArray(value)
    			case 0xdd:
    			// array 32
    				value = dataView.getUint32(position$1);
    				position$1 += 4;
    				return readArray(value)
    			case 0xde:
    			// map 16
    				value = dataView.getUint16(position$1);
    				position$1 += 2;
    				return readMap(value)
    			case 0xdf:
    			// map 32
    				value = dataView.getUint32(position$1);
    				position$1 += 4;
    				return readMap(value)
    			default: // negative int
    				if (token >= 0xe0)
    					return token - 0x100
    				if (token === undefined) {
    					let error = new Error('Unexpected end of MessagePack data');
    					error.incomplete = true;
    					throw error
    				}
    				throw new Error('Unknown MessagePack token ' + token)

    		}
    	}
    }
    const validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
    function createStructureReader(structure, firstId) {
    	function readObject() {
    		// This initial function is quick to instantiate, but runs slower. After several iterations pay the cost to build the faster function
    		if (readObject.count++ > 2) {
    			let readObject = structure.read = (new Function('r', 'return function(){return {' + structure.map(key => validName.test(key) ? key + ':r()' : ('[' + JSON.stringify(key) + ']:r()')).join(',') + '}}'))(read);
    			if (structure.highByte === 0)
    				structure.read = createSecondByteReader(firstId, structure.read);
    			return readObject() // second byte is already read, if there is one so immediately read object
    		}
    		let object = {};
    		for (let i = 0, l = structure.length; i < l; i++) {
    			let key = structure[i];
    			object[key] = read();
    		}
    		return object
    	}
    	readObject.count = 0;
    	if (structure.highByte === 0) {
    		return createSecondByteReader(firstId, readObject)
    	}
    	return readObject
    }

    const createSecondByteReader = (firstId, read0) => {
    	return function() {
    		let highByte = src[position$1++];
    		if (highByte === 0)
    			return read0()
    		let id = firstId < 32 ? -(firstId + (highByte << 5)) : firstId + (highByte << 5);
    		let structure = currentStructures[id] || loadStructures()[id];
    		if (!structure) {
    			throw new Error('Record id is not defined for ' + id)
    		}
    		if (!structure.read)
    			structure.read = createStructureReader(structure, firstId);
    		return structure.read()
    	}
    };

    function loadStructures() {
    	let loadedStructures = saveState(() => {
    		// save the state in case getStructures modifies our buffer
    		src = null;
    		return currentUnpackr.getStructures()
    	});
    	return currentStructures = currentUnpackr._mergeStructures(loadedStructures, currentStructures)
    }

    var readFixedString = readStringJS;
    var readString8 = readStringJS;
    var readString16 = readStringJS;
    var readString32 = readStringJS;
    function readStringJS(length) {
    	let result;
    	if (length < 16) {
    		if (result = shortStringInJS(length))
    			return result
    	}
    	if (length > 64 && decoder)
    		return decoder.decode(src.subarray(position$1, position$1 += length))
    	const end = position$1 + length;
    	const units = [];
    	result = '';
    	while (position$1 < end) {
    		const byte1 = src[position$1++];
    		if ((byte1 & 0x80) === 0) {
    			// 1 byte
    			units.push(byte1);
    		} else if ((byte1 & 0xe0) === 0xc0) {
    			// 2 bytes
    			const byte2 = src[position$1++] & 0x3f;
    			units.push(((byte1 & 0x1f) << 6) | byte2);
    		} else if ((byte1 & 0xf0) === 0xe0) {
    			// 3 bytes
    			const byte2 = src[position$1++] & 0x3f;
    			const byte3 = src[position$1++] & 0x3f;
    			units.push(((byte1 & 0x1f) << 12) | (byte2 << 6) | byte3);
    		} else if ((byte1 & 0xf8) === 0xf0) {
    			// 4 bytes
    			const byte2 = src[position$1++] & 0x3f;
    			const byte3 = src[position$1++] & 0x3f;
    			const byte4 = src[position$1++] & 0x3f;
    			let unit = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0c) | (byte3 << 0x06) | byte4;
    			if (unit > 0xffff) {
    				unit -= 0x10000;
    				units.push(((unit >>> 10) & 0x3ff) | 0xd800);
    				unit = 0xdc00 | (unit & 0x3ff);
    			}
    			units.push(unit);
    		} else {
    			units.push(byte1);
    		}

    		if (units.length >= 0x1000) {
    			result += fromCharCode.apply(String, units);
    			units.length = 0;
    		}
    	}

    	if (units.length > 0) {
    		result += fromCharCode.apply(String, units);
    	}

    	return result
    }

    function readArray(length) {
    	let array = new Array(length);
    	for (let i = 0; i < length; i++) {
    		array[i] = read();
    	}
    	return array
    }

    function readMap(length) {
    	if (currentUnpackr.mapsAsObjects) {
    		let object = {};
    		for (let i = 0; i < length; i++) {
    			object[readKey()] = read();
    		}
    		return object
    	} else {
    		let map = new Map();
    		for (let i = 0; i < length; i++) {
    			map.set(read(), read());
    		}
    		return map
    	}
    }

    var fromCharCode = String.fromCharCode;
    function longStringInJS(length) {
    	let start = position$1;
    	let bytes = new Array(length);
    	for (let i = 0; i < length; i++) {
    		const byte = src[position$1++];
    		if ((byte & 0x80) > 0) {
    			position$1 = start;
        			return
        		}
        		bytes[i] = byte;
        	}
        	return fromCharCode.apply(String, bytes)
    }
    function shortStringInJS(length) {
    	if (length < 4) {
    		if (length < 2) {
    			if (length === 0)
    				return ''
    			else {
    				let a = src[position$1++];
    				if ((a & 0x80) > 1) {
    					position$1 -= 1;
    					return
    				}
    				return fromCharCode(a)
    			}
    		} else {
    			let a = src[position$1++];
    			let b = src[position$1++];
    			if ((a & 0x80) > 0 || (b & 0x80) > 0) {
    				position$1 -= 2;
    				return
    			}
    			if (length < 3)
    				return fromCharCode(a, b)
    			let c = src[position$1++];
    			if ((c & 0x80) > 0) {
    				position$1 -= 3;
    				return
    			}
    			return fromCharCode(a, b, c)
    		}
    	} else {
    		let a = src[position$1++];
    		let b = src[position$1++];
    		let c = src[position$1++];
    		let d = src[position$1++];
    		if ((a & 0x80) > 0 || (b & 0x80) > 0 || (c & 0x80) > 0 || (d & 0x80) > 0) {
    			position$1 -= 4;
    			return
    		}
    		if (length < 6) {
    			if (length === 4)
    				return fromCharCode(a, b, c, d)
    			else {
    				let e = src[position$1++];
    				if ((e & 0x80) > 0) {
    					position$1 -= 5;
    					return
    				}
    				return fromCharCode(a, b, c, d, e)
    			}
    		} else if (length < 8) {
    			let e = src[position$1++];
    			let f = src[position$1++];
    			if ((e & 0x80) > 0 || (f & 0x80) > 0) {
    				position$1 -= 6;
    				return
    			}
    			if (length < 7)
    				return fromCharCode(a, b, c, d, e, f)
    			let g = src[position$1++];
    			if ((g & 0x80) > 0) {
    				position$1 -= 7;
    				return
    			}
    			return fromCharCode(a, b, c, d, e, f, g)
    		} else {
    			let e = src[position$1++];
    			let f = src[position$1++];
    			let g = src[position$1++];
    			let h = src[position$1++];
    			if ((e & 0x80) > 0 || (f & 0x80) > 0 || (g & 0x80) > 0 || (h & 0x80) > 0) {
    				position$1 -= 8;
    				return
    			}
    			if (length < 10) {
    				if (length === 8)
    					return fromCharCode(a, b, c, d, e, f, g, h)
    				else {
    					let i = src[position$1++];
    					if ((i & 0x80) > 0) {
    						position$1 -= 9;
    						return
    					}
    					return fromCharCode(a, b, c, d, e, f, g, h, i)
    				}
    			} else if (length < 12) {
    				let i = src[position$1++];
    				let j = src[position$1++];
    				if ((i & 0x80) > 0 || (j & 0x80) > 0) {
    					position$1 -= 10;
    					return
    				}
    				if (length < 11)
    					return fromCharCode(a, b, c, d, e, f, g, h, i, j)
    				let k = src[position$1++];
    				if ((k & 0x80) > 0) {
    					position$1 -= 11;
    					return
    				}
    				return fromCharCode(a, b, c, d, e, f, g, h, i, j, k)
    			} else {
    				let i = src[position$1++];
    				let j = src[position$1++];
    				let k = src[position$1++];
    				let l = src[position$1++];
    				if ((i & 0x80) > 0 || (j & 0x80) > 0 || (k & 0x80) > 0 || (l & 0x80) > 0) {
    					position$1 -= 12;
    					return
    				}
    				if (length < 14) {
    					if (length === 12)
    						return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l)
    					else {
    						let m = src[position$1++];
    						if ((m & 0x80) > 0) {
    							position$1 -= 13;
    							return
    						}
    						return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m)
    					}
    				} else {
    					let m = src[position$1++];
    					let n = src[position$1++];
    					if ((m & 0x80) > 0 || (n & 0x80) > 0) {
    						position$1 -= 14;
    						return
    					}
    					if (length < 15)
    						return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    					let o = src[position$1++];
    					if ((o & 0x80) > 0) {
    						position$1 -= 15;
    						return
    					}
    					return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    				}
    			}
    		}
    	}
    }

    function readOnlyJSString() {
    	let token = src[position$1++];
    	let length;
    	if (token < 0xc0) {
    		// fixstr
    		length = token - 0xa0;
    	} else {
    		switch(token) {
    			case 0xd9:
    			// str 8
    				length = src[position$1++];
    				break
    			case 0xda:
    			// str 16
    				length = dataView.getUint16(position$1);
    				position$1 += 2;
    				break
    			case 0xdb:
    			// str 32
    				length = dataView.getUint32(position$1);
    				position$1 += 4;
    				break
    			default:
    				throw new Error('Expected string')
    		}
    	}
    	return readStringJS(length)
    }


    function readBin(length) {
    	return currentUnpackr.copyBuffers ?
    		// specifically use the copying slice (not the node one)
    		Uint8Array.prototype.slice.call(src, position$1, position$1 += length) :
    		src.subarray(position$1, position$1 += length)
    }
    function readExt(length) {
    	let type = src[position$1++];
    	if (currentExtensions[type]) {
    		return currentExtensions[type](src.subarray(position$1, position$1 += length))
    	}
    	else
    		throw new Error('Unknown extension type ' + type)
    }

    var keyCache = new Array(4096);
    function readKey() {
    	let length = src[position$1++];
    	if (length >= 0xa0 && length < 0xc0) {
    		// fixstr, potentially use key cache
    		length = length - 0xa0;
    		if (srcStringEnd >= position$1) // if it has been extracted, must use it (and faster anyway)
    			return srcString.slice(position$1 - srcStringStart, (position$1 += length) - srcStringStart)
    		else if (!(srcStringEnd == 0 && srcEnd < 180))
    			return readFixedString(length)
    	} else { // not cacheable, go back and do a standard read
    		position$1--;
    		return read()
    	}
    	let key = ((length << 5) ^ (length > 1 ? dataView.getUint16(position$1) : length > 0 ? src[position$1] : 0)) & 0xfff;
    	let entry = keyCache[key];
    	let checkPosition = position$1;
    	let end = position$1 + length - 3;
    	let chunk;
    	let i = 0;
    	if (entry && entry.bytes == length) {
    		while (checkPosition < end) {
    			chunk = dataView.getUint32(checkPosition);
    			if (chunk != entry[i++]) {
    				checkPosition = 0x70000000;
    				break
    			}
    			checkPosition += 4;
    		}
    		end += 3;
    		while (checkPosition < end) {
    			chunk = src[checkPosition++];
    			if (chunk != entry[i++]) {
    				checkPosition = 0x70000000;
    				break
    			}
    		}
    		if (checkPosition === end) {
    			position$1 = checkPosition;
    			return entry.string
    		}
    		end -= 3;
    		checkPosition = position$1;
    	}
    	entry = [];
    	keyCache[key] = entry;
    	entry.bytes = length;
    	while (checkPosition < end) {
    		chunk = dataView.getUint32(checkPosition);
    		entry.push(chunk);
    		checkPosition += 4;
    	}
    	end += 3;
    	while (checkPosition < end) {
    		chunk = src[checkPosition++];
    		entry.push(chunk);
    	}
    	// for small blocks, avoiding the overhead of the extract call is helpful
    	let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
    	if (string != null)
    		return entry.string = string
    	return entry.string = readFixedString(length)
    }

    // the registration of the record definition extension (as "r")
    const recordDefinition = (id, highByte) => {
    	var structure = read();
    	let firstByte = id;
    	if (highByte !== undefined) {
    		id = id < 32 ? -((highByte << 5) + id) : ((highByte << 5) + id);
    		structure.highByte = highByte;
    	}
    	let existingStructure = currentStructures[id];
    	if (existingStructure && existingStructure.isShared) {
    		(currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
    	}
    	currentStructures[id] = structure;
    	structure.read = createStructureReader(structure, firstByte);
    	return structure.read()
    };
    var glbl = typeof self == 'object' ? self : global;
    currentExtensions[0] = () => {}; // notepack defines extension 0 to mean undefined, so use that as the default here
    currentExtensions[0].noBuffer = true;

    currentExtensions[0x65] = () => {
    	let data = read();
    	return (glbl[data[0]] || Error)(data[1])
    };

    currentExtensions[0x69] = (data) => {
    	// id extension (for structured clones)
    	let id = dataView.getUint32(position$1 - 4);
    	if (!referenceMap)
    		referenceMap = new Map();
    	let token = src[position$1];
    	let target;
    	// TODO: handle Maps, Sets, and other types that can cycle; this is complicated, because you potentially need to read
    	// ahead past references to record structure definitions
    	if (token >= 0x90 && token < 0xa0 || token == 0xdc || token == 0xdd)
    		target = [];
    	else
    		target = {};

    	let refEntry = { target }; // a placeholder object
    	referenceMap.set(id, refEntry);
    	let targetProperties = read(); // read the next value as the target object to id
    	if (refEntry.used) // there is a cycle, so we have to assign properties to original target
    		return Object.assign(target, targetProperties)
    	refEntry.target = targetProperties; // the placeholder wasn't used, replace with the deserialized one
    	return targetProperties // no cycle, can just use the returned read object
    };

    currentExtensions[0x70] = (data) => {
    	// pointer extension (for structured clones)
    	let id = dataView.getUint32(position$1 - 4);
    	let refEntry = referenceMap.get(id);
    	refEntry.used = true;
    	return refEntry.target
    };

    currentExtensions[0x73] = () => new Set(read());

    const typedArrays = ['Int8','Uint8','Uint8Clamped','Int16','Uint16','Int32','Uint32','Float32','Float64','BigInt64','BigUint64'].map(type => type + 'Array');

    currentExtensions[0x74] = (data) => {
    	let typeCode = data[0];
    	let typedArrayName = typedArrays[typeCode];
    	if (!typedArrayName)
    		throw new Error('Could not find typed array for code ' + typeCode)
    	// we have to always slice/copy here to get a new ArrayBuffer that is word/byte aligned
    	return new glbl[typedArrayName](Uint8Array.prototype.slice.call(data, 1).buffer)
    };
    currentExtensions[0x78] = () => {
    	let data = read();
    	return new RegExp(data[0], data[1])
    };
    const TEMP_BUNDLE = [];
    currentExtensions[0x62] = (data) => {
    	let dataSize = (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];
    	let dataPosition = position$1;
    	position$1 += dataSize - data.length;
    	bundledStrings$1 = TEMP_BUNDLE;
    	bundledStrings$1 = [readOnlyJSString(), readOnlyJSString()];
    	bundledStrings$1.position0 = 0;
    	bundledStrings$1.position1 = 0;
    	bundledStrings$1.postBundlePosition = position$1;
    	position$1 = dataPosition;
    	return read()
    };

    currentExtensions[0xff] = (data) => {
    	// 32-bit date extension
    	if (data.length == 4)
    		return new Date((data[0] * 0x1000000 + (data[1] << 16) + (data[2] << 8) + data[3]) * 1000)
    	else if (data.length == 8)
    		return new Date(
    			((data[0] << 22) + (data[1] << 14) + (data[2] << 6) + (data[3] >> 2)) / 1000000 +
    			((data[3] & 0x3) * 0x100000000 + data[4] * 0x1000000 + (data[5] << 16) + (data[6] << 8) + data[7]) * 1000)
    	else if (data.length == 12)// TODO: Implement support for negative
    		return new Date(
    			((data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3]) / 1000000 +
    			(((data[4] & 0x80) ? -0x1000000000000 : 0) + data[6] * 0x10000000000 + data[7] * 0x100000000 + data[8] * 0x1000000 + (data[9] << 16) + (data[10] << 8) + data[11]) * 1000)
    	else
    		return new Date('invalid')
    }; // notepack defines extension 0 to mean undefined, so use that as the default here
    // registration of bulk record definition?
    // currentExtensions[0x52] = () =>

    function saveState(callback) {
    	let savedSrcEnd = srcEnd;
    	let savedPosition = position$1;
    	let savedSrcStringStart = srcStringStart;
    	let savedSrcStringEnd = srcStringEnd;
    	let savedSrcString = srcString;
    	let savedReferenceMap = referenceMap;
    	let savedBundledStrings = bundledStrings$1;

    	// TODO: We may need to revisit this if we do more external calls to user code (since it could be slow)
    	let savedSrc = new Uint8Array(src.slice(0, srcEnd)); // we copy the data in case it changes while external data is processed
    	let savedStructures = currentStructures;
    	let savedStructuresContents = currentStructures.slice(0, currentStructures.length);
    	let savedPackr = currentUnpackr;
    	let savedSequentialMode = sequentialMode;
    	let value = callback();
    	srcEnd = savedSrcEnd;
    	position$1 = savedPosition;
    	srcStringStart = savedSrcStringStart;
    	srcStringEnd = savedSrcStringEnd;
    	srcString = savedSrcString;
    	referenceMap = savedReferenceMap;
    	bundledStrings$1 = savedBundledStrings;
    	src = savedSrc;
    	sequentialMode = savedSequentialMode;
    	currentStructures = savedStructures;
    	currentStructures.splice(0, currentStructures.length, ...savedStructuresContents);
    	currentUnpackr = savedPackr;
    	dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
    	return value
    }
    function clearSource() {
    	src = null;
    	referenceMap = null;
    	currentStructures = null;
    }

    const mult10 = new Array(147); // this is a table matching binary exponents to the multiplier to determine significant digit rounding
    for (let i = 0; i < 256; i++) {
    	mult10[i] = +('1e' + Math.floor(45.15 - i * 0.30103));
    }
    var defaultUnpackr = new Unpackr({ useRecords: false });
    defaultUnpackr.unpack;
    defaultUnpackr.unpackMultiple;
    defaultUnpackr.unpack;
    let f32Array = new Float32Array(1);
    new Uint8Array(f32Array.buffer, 0, 4);

    let textEncoder;
    try {
    	textEncoder = new TextEncoder();
    } catch (error) {}
    let extensions, extensionClasses;
    const hasNodeBuffer = typeof Buffer !== 'undefined';
    const ByteArrayAllocate = hasNodeBuffer ? Buffer.allocUnsafeSlow : Uint8Array;
    const ByteArray = hasNodeBuffer ? Buffer : Uint8Array;
    const MAX_BUFFER_SIZE = hasNodeBuffer ? 0x100000000 : 0x7fd00000;
    let target, keysTarget;
    let targetView;
    let position = 0;
    let safeEnd;
    let bundledStrings = null;
    const MAX_BUNDLE_SIZE = 0xf000;
    const hasNonLatin = /[\u0080-\uFFFF]/;
    const RECORD_SYMBOL = Symbol('record-id');
    class Packr extends Unpackr {
    	constructor(options) {
    		super(options);
    		this.offset = 0;
    		let start;
    		let hasSharedUpdate;
    		let structures;
    		let referenceMap;
    		let lastSharedStructuresLength = 0;
    		let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string, position, maxBytes) {
    			return target.utf8Write(string, position, maxBytes)
    		} : (textEncoder && textEncoder.encodeInto) ?
    			function(string, position) {
    				return textEncoder.encodeInto(string, target.subarray(position)).written
    			} : false;

    		let packr = this;
    		if (!options)
    			options = {};
    		let isSequential = options && options.sequential;
    		let hasSharedStructures = options.structures || options.saveStructures;
    		let maxSharedStructures = options.maxSharedStructures;
    		if (maxSharedStructures == null)
    			maxSharedStructures = hasSharedStructures ? 32 : 0;
    		if (maxSharedStructures > 8160)
    			throw new Error('Maximum maxSharedStructure is 8160')
    		let maxOwnStructures = options.maxOwnStructures;
    		if (maxOwnStructures == null)
    			maxOwnStructures = hasSharedStructures ? 32 : 64;
    		if (!this.structures && options.useRecords != false)
    			this.structures = [];
    		// two byte record ids for shared structures
    		let useTwoByteRecords = maxSharedStructures > 32 || (maxOwnStructures + maxSharedStructures > 64);		
    		let sharedLimitId = maxSharedStructures + 0x40;
    		let maxStructureId = maxSharedStructures + maxOwnStructures + 0x40;
    		if (maxStructureId > 8256) {
    			throw new Error('Maximum maxSharedStructure + maxOwnStructure is 8192')
    		}
    		let recordIdsToRemove = [];
    		let transitionsCount = 0;
    		let serializationsSinceTransitionRebuild = 0;

    		this.pack = this.encode = function(value, encodeOptions) {
    			if (!target) {
    				target = new ByteArrayAllocate(8192);
    				targetView = new DataView(target.buffer, 0, 8192);
    				position = 0;
    			}
    			safeEnd = target.length - 10;
    			if (safeEnd - position < 0x800) {
    				// don't start too close to the end, 
    				target = new ByteArrayAllocate(target.length);
    				targetView = new DataView(target.buffer, 0, target.length);
    				safeEnd = target.length - 10;
    				position = 0;
    			} else
    				position = (position + 7) & 0x7ffffff8; // Word align to make any future copying of this buffer faster
    			start = position;
    			referenceMap = packr.structuredClone ? new Map() : null;
    			if (packr.bundleStrings && typeof value !== 'string') {
    				bundledStrings = [];
    				bundledStrings.size = Infinity; // force a new bundle start on first string
    			} else
    				bundledStrings = null;
    			structures = packr.structures;
    			if (structures) {
    				if (structures.uninitialized)
    					structures = packr._mergeStructures(packr.getStructures());
    				let sharedLength = structures.sharedLength || 0;
    				if (sharedLength > maxSharedStructures) {
    					//if (maxSharedStructures <= 32 && structures.sharedLength > 32) // TODO: could support this, but would need to update the limit ids
    					throw new Error('Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to ' + structures.sharedLength)
    				}
    				if (!structures.transitions) {
    					// rebuild our structure transitions
    					structures.transitions = Object.create(null);
    					for (let i = 0; i < sharedLength; i++) {
    						let keys = structures[i];
    						if (!keys)
    							continue
    						let nextTransition, transition = structures.transitions;
    						for (let j = 0, l = keys.length; j < l; j++) {
    							let key = keys[j];
    							nextTransition = transition[key];
    							if (!nextTransition) {
    								nextTransition = transition[key] = Object.create(null);
    							}
    							transition = nextTransition;
    						}
    						transition[RECORD_SYMBOL] = i + 0x40;
    					}
    					lastSharedStructuresLength = sharedLength;
    				}
    				if (!isSequential) {
    					structures.nextId = sharedLength + 0x40;
    				}
    			}
    			if (hasSharedUpdate)
    				hasSharedUpdate = false;
    			try {
    				pack(value);
    				if (bundledStrings) {
    					writeBundles(start, pack);
    				}
    				packr.offset = position; // update the offset so next serialization doesn't write over our buffer, but can continue writing to same buffer sequentially
    				if (referenceMap && referenceMap.idsToInsert) {
    					position += referenceMap.idsToInsert.length * 6;
    					if (position > safeEnd)
    						makeRoom(position);
    					packr.offset = position;
    					let serialized = insertIds(target.subarray(start, position), referenceMap.idsToInsert);
    					referenceMap = null;
    					return serialized
    				}
    				if (encodeOptions & REUSE_BUFFER_MODE) {
    					target.start = start;
    					target.end = position;
    					return target
    				}
    				return target.subarray(start, position) // position can change if we call pack again in saveStructures, so we get the buffer now
    			} finally {
    				if (structures) {
    					if (serializationsSinceTransitionRebuild < 10)
    						serializationsSinceTransitionRebuild++;
    					let sharedLength = structures.sharedLength || maxSharedStructures;
    					if (structures.length > sharedLength)
    						structures.length = sharedLength;
    					if (transitionsCount > 10000) {
    						// force a rebuild occasionally after a lot of transitions so it can get cleaned up
    						structures.transitions = null;
    						serializationsSinceTransitionRebuild = 0;
    						transitionsCount = 0;
    						if (recordIdsToRemove.length > 0)
    							recordIdsToRemove = [];
    					} else if (recordIdsToRemove.length > 0 && !isSequential) {
    						for (let i = 0, l = recordIdsToRemove.length; i < l; i++) {
    							recordIdsToRemove[i][RECORD_SYMBOL] = 0;
    						}
    						recordIdsToRemove = [];
    					}
    					if (hasSharedUpdate && packr.saveStructures) {
    						// we can't rely on start/end with REUSE_BUFFER_MODE since they will (probably) change when we save
    						let returnBuffer = target.subarray(start, position);
    						if (packr.saveStructures(structures, lastSharedStructuresLength) === false) {
    							// get updated structures and try again if the update failed
    							packr._mergeStructures(packr.getStructures());
    							return packr.pack(value)
    						}
    						lastSharedStructuresLength = sharedLength;
    						return returnBuffer
    					}
    				}
    				if (encodeOptions & RESET_BUFFER_MODE)
    					position = start;
    			}
    		};
    		const pack = (value) => {
    			if (position > safeEnd)
    				target = makeRoom(position);

    			var type = typeof value;
    			var length;
    			if (type === 'string') {
    				let strLength = value.length;
    				if (bundledStrings && strLength >= 4 && strLength < 0x1000) {
    					if ((bundledStrings.size += strLength) > MAX_BUNDLE_SIZE) {
    						let extStart;
    						let maxBytes = (bundledStrings[0] ? bundledStrings[0].length * 3 + bundledStrings[1].length : 0) + 10;
    						if (position + maxBytes > safeEnd)
    							target = makeRoom(position + maxBytes);
    						if (bundledStrings.position) { // here we use the 0x62 extension to write the last bundle and reserve sapce for the reference pointer to the next/current bundle
    							target[position] = 0xc8; // ext 16
    							position += 3; // reserve for the writing bundle size
    							target[position++] = 0x62; // 'b'
    							extStart = position - start;
    							position += 4; // reserve for writing bundle reference
    							writeBundles(start, pack); // write the last bundles
    							targetView.setUint16(extStart + start - 3, position - start - extStart);
    						} else { // here we use the 0x62 extension just to reserve the space for the reference pointer to the bundle (will be updated once the bundle is written)
    							target[position++] = 0xd6; // fixext 4
    							target[position++] = 0x62; // 'b'
    							extStart = position - start;
    							position += 4; // reserve for writing bundle reference
    						}
    						bundledStrings = ['', '']; // create new ones
    						bundledStrings.size = 0;
    						bundledStrings.position = extStart;
    					}
    					let twoByte = hasNonLatin.test(value);
    					bundledStrings[twoByte ? 0 : 1] += value;
    					target[position++] = 0xc1;
    					pack(twoByte ? -strLength : strLength);
    					return
    				}
    				let headerSize;
    				// first we estimate the header size, so we can write to the correct location
    				if (strLength < 0x20) {
    					headerSize = 1;
    				} else if (strLength < 0x100) {
    					headerSize = 2;
    				} else if (strLength < 0x10000) {
    					headerSize = 3;
    				} else {
    					headerSize = 5;
    				}
    				let maxBytes = strLength * 3;
    				if (position + maxBytes > safeEnd)
    					target = makeRoom(position + maxBytes);

    				if (strLength < 0x40 || !encodeUtf8) {
    					let i, c1, c2, strPosition = position + headerSize;
    					for (i = 0; i < strLength; i++) {
    						c1 = value.charCodeAt(i);
    						if (c1 < 0x80) {
    							target[strPosition++] = c1;
    						} else if (c1 < 0x800) {
    							target[strPosition++] = c1 >> 6 | 0xc0;
    							target[strPosition++] = c1 & 0x3f | 0x80;
    						} else if (
    							(c1 & 0xfc00) === 0xd800 &&
    							((c2 = value.charCodeAt(i + 1)) & 0xfc00) === 0xdc00
    						) {
    							c1 = 0x10000 + ((c1 & 0x03ff) << 10) + (c2 & 0x03ff);
    							i++;
    							target[strPosition++] = c1 >> 18 | 0xf0;
    							target[strPosition++] = c1 >> 12 & 0x3f | 0x80;
    							target[strPosition++] = c1 >> 6 & 0x3f | 0x80;
    							target[strPosition++] = c1 & 0x3f | 0x80;
    						} else {
    							target[strPosition++] = c1 >> 12 | 0xe0;
    							target[strPosition++] = c1 >> 6 & 0x3f | 0x80;
    							target[strPosition++] = c1 & 0x3f | 0x80;
    						}
    					}
    					length = strPosition - position - headerSize;
    				} else {
    					length = encodeUtf8(value, position + headerSize, maxBytes);
    				}

    				if (length < 0x20) {
    					target[position++] = 0xa0 | length;
    				} else if (length < 0x100) {
    					if (headerSize < 2) {
    						target.copyWithin(position + 2, position + 1, position + 1 + length);
    					}
    					target[position++] = 0xd9;
    					target[position++] = length;
    				} else if (length < 0x10000) {
    					if (headerSize < 3) {
    						target.copyWithin(position + 3, position + 2, position + 2 + length);
    					}
    					target[position++] = 0xda;
    					target[position++] = length >> 8;
    					target[position++] = length & 0xff;
    				} else {
    					if (headerSize < 5) {
    						target.copyWithin(position + 5, position + 3, position + 3 + length);
    					}
    					target[position++] = 0xdb;
    					targetView.setUint32(position, length);
    					position += 4;
    				}
    				position += length;
    			} else if (type === 'number') {
    				if (value >>> 0 === value) {// positive integer, 32-bit or less
    					// positive uint
    					if (value < 0x40) {
    						target[position++] = value;
    					} else if (value < 0x100) {
    						target[position++] = 0xcc;
    						target[position++] = value;
    					} else if (value < 0x10000) {
    						target[position++] = 0xcd;
    						target[position++] = value >> 8;
    						target[position++] = value & 0xff;
    					} else {
    						target[position++] = 0xce;
    						targetView.setUint32(position, value);
    						position += 4;
    					}
    				} else if (value >> 0 === value) { // negative integer
    					if (value >= -0x20) {
    						target[position++] = 0x100 + value;
    					} else if (value >= -0x80) {
    						target[position++] = 0xd0;
    						target[position++] = value + 0x100;
    					} else if (value >= -0x8000) {
    						target[position++] = 0xd1;
    						targetView.setInt16(position, value);
    						position += 2;
    					} else {
    						target[position++] = 0xd2;
    						targetView.setInt32(position, value);
    						position += 4;
    					}
    				} else {
    					let useFloat32;
    					if ((useFloat32 = this.useFloat32) > 0 && value < 0x100000000 && value >= -0x80000000) {
    						target[position++] = 0xca;
    						targetView.setFloat32(position, value);
    						let xShifted;
    						if (useFloat32 < 4 ||
    								// this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
    								((xShifted = value * mult10[((target[position] & 0x7f) << 1) | (target[position + 1] >> 7)]) >> 0) === xShifted) {
    							position += 4;
    							return
    						} else
    							position--; // move back into position for writing a double
    					}
    					target[position++] = 0xcb;
    					targetView.setFloat64(position, value);
    					position += 8;
    				}
    			} else if (type === 'object') {
    				if (!value)
    					target[position++] = 0xc0;
    				else {
    					if (referenceMap) {
    						let referee = referenceMap.get(value);
    						if (referee) {
    							if (!referee.id) {
    								let idsToInsert = referenceMap.idsToInsert || (referenceMap.idsToInsert = []);
    								referee.id = idsToInsert.push(referee);
    							}
    							target[position++] = 0xd6; // fixext 4
    							target[position++] = 0x70; // "p" for pointer
    							targetView.setUint32(position, referee.id);
    							position += 4;
    							return
    						} else 
    							referenceMap.set(value, { offset: position - start });
    					}
    					let constructor = value.constructor;
    					if (constructor === Object) {
    						writeObject(value, true);
    					} else if (constructor === Array) {
    						length = value.length;
    						if (length < 0x10) {
    							target[position++] = 0x90 | length;
    						} else if (length < 0x10000) {
    							target[position++] = 0xdc;
    							target[position++] = length >> 8;
    							target[position++] = length & 0xff;
    						} else {
    							target[position++] = 0xdd;
    							targetView.setUint32(position, length);
    							position += 4;
    						}
    						for (let i = 0; i < length; i++) {
    							pack(value[i]);
    						}
    					} else if (constructor === Map) {
    						length = value.size;
    						if (length < 0x10) {
    							target[position++] = 0x80 | length;
    						} else if (length < 0x10000) {
    							target[position++] = 0xde;
    							target[position++] = length >> 8;
    							target[position++] = length & 0xff;
    						} else {
    							target[position++] = 0xdf;
    							targetView.setUint32(position, length);
    							position += 4;
    						}
    						for (let [ key, entryValue ] of value) {
    							pack(key);
    							pack(entryValue);
    						}
    					} else {	
    						for (let i = 0, l = extensions.length; i < l; i++) {
    							let extensionClass = extensionClasses[i];
    							if (value instanceof extensionClass) {
    								let extension = extensions[i];
    								if (extension.write) {
    									if (extension.type) {
    										target[position++] = 0xd4; // one byte "tag" extension
    										target[position++] = extension.type;
    										target[position++] = 0;
    									}
    									pack(extension.write.call(this, value));
    									return
    								}
    								let currentTarget = target;
    								let currentTargetView = targetView;
    								let currentPosition = position;
    								target = null;
    								let result;
    								try {
    									result = extension.pack.call(this, value, (size) => {
    										// restore target and use it
    										target = currentTarget;
    										currentTarget = null;
    										position += size;
    										if (position > safeEnd)
    											makeRoom(position);
    										return {
    											target, targetView, position: position - size
    										}
    									}, pack);
    								} finally {
    									// restore current target information (unless already restored)
    									if (currentTarget) {
    										target = currentTarget;
    										targetView = currentTargetView;
    										position = currentPosition;
    										safeEnd = target.length - 10;
    									}
    								}
    								if (result) {
    									if (result.length + position > safeEnd)
    										makeRoom(result.length + position);
    									position = writeExtensionData(result, target, position, extension.type);
    								}
    								return
    							}
    						}
    						// no extension found, write as object
    						writeObject(value, !value.hasOwnProperty); // if it doesn't have hasOwnProperty, don't do hasOwnProperty checks
    					}
    				}
    			} else if (type === 'boolean') {
    				target[position++] = value ? 0xc3 : 0xc2;
    			} else if (type === 'bigint') {
    				if (value < (BigInt(1)<<BigInt(63)) && value >= -(BigInt(1)<<BigInt(63))) {
    					// use a signed int as long as it fits
    					target[position++] = 0xd3;
    					targetView.setBigInt64(position, value);
    				} else if (value < (BigInt(1)<<BigInt(64)) && value > 0) {
    					// if we can fit an unsigned int, use that
    					target[position++] = 0xcf;
    					targetView.setBigUint64(position, value);
    				} else {
    					// overflow
    					if (this.largeBigIntToFloat) {
    						target[position++] = 0xcb;
    						targetView.setFloat64(position, Number(value));
    					} else {
    						throw new RangeError(value + ' was too large to fit in MessagePack 64-bit integer format, set largeBigIntToFloat to convert to float-64')
    					}
    				}
    				position += 8;
    			} else if (type === 'undefined') {
    				if (this.encodeUndefinedAsNil)
    					target[position++] = 0xc0;
    				else {
    					target[position++] = 0xd4; // a number of implementations use fixext1 with type 0, data 0 to denote undefined, so we follow suite
    					target[position++] = 0;
    					target[position++] = 0;
    				}
    			} else if (type === 'function') {
    				pack(this.writeFunction && this.writeFunction()); // if there is a writeFunction, use it, otherwise just encode as undefined
    			} else {
    				throw new Error('Unknown type: ' + type)
    			}
    		};

    		const writeObject = this.useRecords === false ? this.variableMapSize ? (object) => {
    			// this method is slightly slower, but generates "preferred serialization" (optimally small for smaller objects)
    			let keys = Object.keys(object);
    			let length = keys.length;
    			if (length < 0x10) {
    				target[position++] = 0x80 | length;
    			} else if (length < 0x10000) {
    				target[position++] = 0xde;
    				target[position++] = length >> 8;
    				target[position++] = length & 0xff;
    			} else {
    				target[position++] = 0xdf;
    				targetView.setUint32(position, length);
    				position += 4;
    			}
    			let key;
    			for (let i = 0; i < length; i++) {
    				pack(key = keys[i]);
    				pack(object[key]);
    			}
    		} :
    		(object, safePrototype) => {
    			target[position++] = 0xde; // always using map 16, so we can preallocate and set the length afterwards
    			let objectOffset = position - start;
    			position += 2;
    			let size = 0;
    			for (let key in object) {
    				if (safePrototype || object.hasOwnProperty(key)) {
    					pack(key);
    					pack(object[key]);
    					size++;
    				}
    			}
    			target[objectOffset++ + start] = size >> 8;
    			target[objectOffset + start] = size & 0xff;
    		} :
    		(options.progressiveRecords && !useTwoByteRecords) ?  // this is about 2% faster for highly stable structures, since it only requires one for-in loop (but much more expensive when new structure needs to be written)
    		(object, safePrototype) => {
    			let nextTransition, transition = structures.transitions || (structures.transitions = Object.create(null));
    			let objectOffset = position++ - start;
    			let wroteKeys;
    			for (let key in object) {
    				if (safePrototype || object.hasOwnProperty(key)) {
    					nextTransition = transition[key];
    					if (nextTransition)
    						transition = nextTransition;
    					else {
    						// record doesn't exist, create full new record and insert it
    						let keys = Object.keys(object);
    						let lastTransition = transition;
    						transition = structures.transitions;
    						let newTransitions = 0;
    						for (let i = 0, l = keys.length; i < l; i++) {
    							let key = keys[i];
    							nextTransition = transition[key];
    							if (!nextTransition) {
    								nextTransition = transition[key] = Object.create(null);
    								newTransitions++;
    							}
    							transition = nextTransition;
    						}
    						if (objectOffset + start + 1 == position) {
    							// first key, so we don't need to insert, we can just write record directly
    							position--;
    							newRecord(transition, keys, newTransitions);
    						} else // otherwise we need to insert the record, moving existing data after the record
    							insertNewRecord(transition, keys, objectOffset, newTransitions);
    						wroteKeys = true;
    						transition = lastTransition[key];
    					}
    					pack(object[key]);
    				}
    			}
    			if (!wroteKeys) {
    				let recordId = transition[RECORD_SYMBOL];
    				if (recordId)
    					target[objectOffset + start] = recordId;
    				else
    					insertNewRecord(transition, Object.keys(object), objectOffset, 0);
    			}
    		} :
    		(object, safePrototype) => {
    			let nextTransition, transition = structures.transitions || (structures.transitions = Object.create(null));
    			let newTransitions = 0;
    			for (let key in object) if (safePrototype || object.hasOwnProperty(key)) {
    				nextTransition = transition[key];
    				if (!nextTransition) {
    					nextTransition = transition[key] = Object.create(null);
    					newTransitions++;
    				}
    				transition = nextTransition;
    			}
    			let recordId = transition[RECORD_SYMBOL];
    			if (recordId) {
    				if (recordId >= 0x60 && useTwoByteRecords) {
    					target[position++] = ((recordId -= 0x60) & 0x1f) + 0x60;
    					target[position++] = recordId >> 5;
    				} else
    					target[position++] = recordId;
    			} else {
    				newRecord(transition, transition.__keys__ || Object.keys(object), newTransitions);
    			}
    			// now write the values
    			for (let key in object)
    				if (safePrototype || object.hasOwnProperty(key))
    					pack(object[key]);
    		};
    		const makeRoom = (end) => {
    			let newSize;
    			if (end > 0x1000000) {
    				// special handling for really large buffers
    				if ((end - start) > MAX_BUFFER_SIZE)
    					throw new Error('Packed buffer would be larger than maximum buffer size')
    				newSize = Math.min(MAX_BUFFER_SIZE,
    					Math.round(Math.max((end - start) * (end > 0x4000000 ? 1.25 : 2), 0x400000) / 0x1000) * 0x1000);
    			} else // faster handling for smaller buffers
    				newSize = ((Math.max((end - start) << 2, target.length - 1) >> 12) + 1) << 12;
    			let newBuffer = new ByteArrayAllocate(newSize);
    			targetView = new DataView(newBuffer.buffer, 0, newSize);
    			if (target.copy)
    				target.copy(newBuffer, 0, start, end);
    			else
    				newBuffer.set(target.slice(start, end));
    			position -= start;
    			start = 0;
    			safeEnd = newBuffer.length - 10;
    			return target = newBuffer
    		};
    		const newRecord = (transition, keys, newTransitions) => {
    			let recordId = structures.nextId;
    			if (!recordId)
    				recordId = 0x40;
    			if (recordId < sharedLimitId && this.shouldShareStructure && !this.shouldShareStructure(keys)) {
    				recordId = structures.nextOwnId;
    				if (!(recordId < maxStructureId))
    					recordId = sharedLimitId;
    				structures.nextOwnId = recordId + 1;
    			} else {
    				if (recordId >= maxStructureId)// cycle back around
    					recordId = sharedLimitId;
    				structures.nextId = recordId + 1;
    			}
    			let highByte = keys.highByte = recordId >= 0x60 && useTwoByteRecords ? (recordId - 0x60) >> 5 : -1;
    			transition[RECORD_SYMBOL] = recordId;
    			transition.__keys__ = keys;
    			structures[recordId - 0x40] = keys;

    			if (recordId < sharedLimitId) {
    				keys.isShared = true;
    				structures.sharedLength = recordId - 0x3f;
    				hasSharedUpdate = true;
    				if (highByte >= 0) {
    					target[position++] = (recordId & 0x1f) + 0x60;
    					target[position++] = highByte;
    				} else {
    					target[position++] = recordId;
    				}
    			} else {
    				if (highByte >= 0) {
    					target[position++] = 0xd5; // fixext 2
    					target[position++] = 0x72; // "r" record defintion extension type
    					target[position++] = (recordId & 0x1f) + 0x60;
    					target[position++] = highByte;
    				} else {
    					target[position++] = 0xd4; // fixext 1
    					target[position++] = 0x72; // "r" record defintion extension type
    					target[position++] = recordId;
    				}

    				if (newTransitions)
    					transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
    				// record the removal of the id, we can maintain our shared structure
    				if (recordIdsToRemove.length >= maxOwnStructures)
    					recordIdsToRemove.shift()[RECORD_SYMBOL] = 0; // we are cycling back through, and have to remove old ones
    				recordIdsToRemove.push(transition);
    				pack(keys);
    			}
    		};
    		const insertNewRecord = (transition, keys, insertionOffset, newTransitions) => {
    			let mainTarget = target;
    			let mainPosition = position;
    			let mainSafeEnd = safeEnd;
    			let mainStart = start;
    			target = keysTarget;
    			position = 0;
    			start = 0;
    			if (!target)
    				keysTarget = target = new ByteArrayAllocate(8192);
    			safeEnd = target.length - 10;
    			newRecord(transition, keys, newTransitions);
    			keysTarget = target;
    			let keysPosition = position;
    			target = mainTarget;
    			position = mainPosition;
    			safeEnd = mainSafeEnd;
    			start = mainStart;
    			if (keysPosition > 1) {
    				let newEnd = position + keysPosition - 1;
    				if (newEnd > safeEnd)
    					makeRoom(newEnd);
    				let insertionPosition = insertionOffset + start;
    				target.copyWithin(insertionPosition + keysPosition, insertionPosition + 1, position);
    				target.set(keysTarget.slice(0, keysPosition), insertionPosition);
    				position = newEnd;
    			} else {
    				target[insertionOffset + start] = keysTarget[0];
    			}
    		};
    	}
    	useBuffer(buffer) {
    		// this means we are finished using our own buffer and we can write over it safely
    		target = buffer;
    		targetView = new DataView(target.buffer, target.byteOffset, target.byteLength);
    		position = 0;
    	}
    	clearSharedData() {
    		if (this.structures)
    			this.structures = [];
    	}
    }

    extensionClasses = [ Date, Set, Error, RegExp, ArrayBuffer, Object.getPrototypeOf(Uint8Array.prototype).constructor /*TypedArray*/, C1Type ];
    extensions = [{
    	pack(date, allocateForWrite, pack) {
    		let seconds = date.getTime() / 1000;
    		if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 0x100000000) {
    			// Timestamp 32
    			let { target, targetView, position} = allocateForWrite(6);
    			target[position++] = 0xd6;
    			target[position++] = 0xff;
    			targetView.setUint32(position, seconds);
    		} else if (seconds > 0 && seconds < 0x400000000) {
    			// Timestamp 64
    			let { target, targetView, position} = allocateForWrite(10);
    			target[position++] = 0xd7;
    			target[position++] = 0xff;
    			targetView.setUint32(position, date.getMilliseconds() * 4000000 + ((seconds / 1000 / 0x100000000) >> 0));
    			targetView.setUint32(position + 4, seconds);
    		} else if (isNaN(seconds)) {
    			if (this.onInvalidDate) {
    				allocateForWrite(0);
    				return pack(this.onInvalidDate())
    			}
    			// Intentionally invalid timestamp
    			let { target, targetView, position} = allocateForWrite(3);
    			target[position++] = 0xd4;
    			target[position++] = 0xff;
    			target[position++] = 0xff;
    		} else {
    			// Timestamp 96
    			let { target, targetView, position} = allocateForWrite(15);
    			target[position++] = 0xc7;
    			target[position++] = 12;
    			target[position++] = 0xff;
    			targetView.setUint32(position, date.getMilliseconds() * 1000000);
    			targetView.setBigInt64(position + 4, BigInt(Math.floor(seconds)));
    		}
    	}
    }, {
    	pack(set, allocateForWrite, pack) {
    		let array = Array.from(set);
    		let { target, position} = allocateForWrite(this.structuredClone ? 3 : 0);
    		if (this.structuredClone) {
    			target[position++] = 0xd4;
    			target[position++] = 0x73; // 's' for Set
    			target[position++] = 0;
    		}
    		pack(array);
    	}
    }, {
    	pack(error, allocateForWrite, pack) {
    		let { target, position} = allocateForWrite(this.structuredClone ? 3 : 0);
    		if (this.structuredClone) {
    			target[position++] = 0xd4;
    			target[position++] = 0x65; // 'e' for error
    			target[position++] = 0;
    		}
    		pack([ error.name, error.message ]);
    	}
    }, {
    	pack(regex, allocateForWrite, pack) {
    		let { target, position} = allocateForWrite(this.structuredClone ? 3 : 0);
    		if (this.structuredClone) {
    			target[position++] = 0xd4;
    			target[position++] = 0x78; // 'x' for regeXp
    			target[position++] = 0;
    		}
    		pack([ regex.source, regex.flags ]);
    	}
    }, {
    	pack(arrayBuffer, allocateForWrite) {
    		if (this.structuredClone)
    			writeExtBuffer(arrayBuffer, 0x10, allocateForWrite);
    		else
    			writeBuffer(hasNodeBuffer ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer), allocateForWrite);
    	}
    }, {
    	pack(typedArray, allocateForWrite) {
    		let constructor = typedArray.constructor;
    		if (constructor !== ByteArray && this.structuredClone)
    			writeExtBuffer(typedArray, typedArrays.indexOf(constructor.name), allocateForWrite);
    		else
    			writeBuffer(typedArray, allocateForWrite);
    	}
    }, {
    	pack(c1, allocateForWrite) { // specific 0xC1 object
    		let { target, position} = allocateForWrite(1);
    		target[position] = 0xc1;
    	}
    }];

    function writeExtBuffer(typedArray, type, allocateForWrite, encode) {
    	let length = typedArray.byteLength;
    	if (length + 1 < 0x100) {
    		var { target, position } = allocateForWrite(4 + length);
    		target[position++] = 0xc7;
    		target[position++] = length + 1;
    	} else if (length + 1 < 0x10000) {
    		var { target, position } = allocateForWrite(5 + length);
    		target[position++] = 0xc8;
    		target[position++] = (length + 1) >> 8;
    		target[position++] = (length + 1) & 0xff;
    	} else {
    		var { target, position, targetView } = allocateForWrite(7 + length);
    		target[position++] = 0xc9;
    		targetView.setUint32(position, length + 1); // plus one for the type byte
    		position += 4;
    	}
    	target[position++] = 0x74; // "t" for typed array
    	target[position++] = type;
    	target.set(new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength), position);
    }
    function writeBuffer(buffer, allocateForWrite) {
    	let length = buffer.byteLength;
    	var target, position;
    	if (length < 0x100) {
    		var { target, position } = allocateForWrite(length + 2);
    		target[position++] = 0xc4;
    		target[position++] = length;
    	} else if (length < 0x10000) {
    		var { target, position } = allocateForWrite(length + 3);
    		target[position++] = 0xc5;
    		target[position++] = length >> 8;
    		target[position++] = length & 0xff;
    	} else {
    		var { target, position, targetView } = allocateForWrite(length + 5);
    		target[position++] = 0xc6;
    		targetView.setUint32(position, length);
    		position += 4;
    	}
    	target.set(buffer, position);
    }

    function writeExtensionData(result, target, position, type) {
    	let length = result.length;
    	switch (length) {
    		case 1:
    			target[position++] = 0xd4;
    			break
    		case 2:
    			target[position++] = 0xd5;
    			break
    		case 4:
    			target[position++] = 0xd6;
    			break
    		case 8:
    			target[position++] = 0xd7;
    			break
    		case 16:
    			target[position++] = 0xd8;
    			break
    		default:
    			if (length < 0x100) {
    				target[position++] = 0xc7;
    				target[position++] = length;
    			} else if (length < 0x10000) {
    				target[position++] = 0xc8;
    				target[position++] = length >> 8;
    				target[position++] = length & 0xff;
    			} else {
    				target[position++] = 0xc9;
    				target[position++] = length >> 24;
    				target[position++] = (length >> 16) & 0xff;
    				target[position++] = (length >> 8) & 0xff;
    				target[position++] = length & 0xff;
    			}
    	}
    	target[position++] = type;
    	target.set(result, position);
    	position += length;
    	return position
    }

    function insertIds(serialized, idsToInsert) {
    	// insert the ids that need to be referenced for structured clones
    	let nextId;
    	let distanceToMove = idsToInsert.length * 6;
    	let lastEnd = serialized.length - distanceToMove;
    	idsToInsert.sort((a, b) => a.offset > b.offset ? 1 : -1);
    	while (nextId = idsToInsert.pop()) {
    		let offset = nextId.offset;
    		let id = nextId.id;
    		serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
    		distanceToMove -= 6;
    		let position = offset + distanceToMove;
    		serialized[position++] = 0xd6;
    		serialized[position++] = 0x69; // 'i'
    		serialized[position++] = id >> 24;
    		serialized[position++] = (id >> 16) & 0xff;
    		serialized[position++] = (id >> 8) & 0xff;
    		serialized[position++] = id & 0xff;
    		lastEnd = offset;
    	}
    	return serialized
    }

    function writeBundles(start, pack) {
    	targetView.setUint32(bundledStrings.position + start, position - bundledStrings.position - start);
    	let writeStrings = bundledStrings;
    	bundledStrings = null;
    	pack(writeStrings[0]);
    	pack(writeStrings[1]);
    }

    let defaultPackr = new Packr({ useRecords: false });
    defaultPackr.pack;
    defaultPackr.pack;
    const REUSE_BUFFER_MODE = 512;
    const RESET_BUFFER_MODE = 1024;

    // DEFLATE is a complex format; to read this code, you should probably check the RFC first:
    // https://tools.ietf.org/html/rfc1951
    // You may also wish to take a look at the guide I made about this program:
    // https://gist.github.com/101arrowz/253f31eb5abc3d9275ab943003ffecad
    // Some of the following code is similar to that of UZIP.js:
    // https://github.com/photopea/UZIP.js
    // However, the vast majority of the codebase has diverged from UZIP.js to increase performance and reduce bundle size.
    // Sometimes 0 will appear where -1 would be more appropriate. This is because using a uint
    // is better for memory in most engines (I *think*).
    var ch2 = {};
    var wk = (function (c, id, msg, transfer, cb) {
        var w = new Worker(ch2[id] || (ch2[id] = URL.createObjectURL(new Blob([
            c + ';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})'
        ], { type: 'text/javascript' }))));
        w.onmessage = function (e) {
            var d = e.data, ed = d.$e$;
            if (ed) {
                var err = new Error(ed[0]);
                err['code'] = ed[1];
                err.stack = ed[2];
                cb(err, null);
            }
            else
                cb(null, d);
        };
        w.postMessage(msg, transfer);
        return w;
    });

    // aliases for shorter compressed code (most minifers don't do this)
    var u8 = Uint8Array, u16 = Uint16Array, u32 = Uint32Array;
    // fixed length extra bits
    var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */ 0, 0, /* impossible */ 0]);
    // fixed distance extra bits
    // see fleb note
    var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */ 0, 0]);
    // code length index map
    var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
    // get base, reverse index map from extra bits
    var freb = function (eb, start) {
        var b = new u16(31);
        for (var i = 0; i < 31; ++i) {
            b[i] = start += 1 << eb[i - 1];
        }
        // numbers here are at max 18 bits
        var r = new u32(b[30]);
        for (var i = 1; i < 30; ++i) {
            for (var j = b[i]; j < b[i + 1]; ++j) {
                r[j] = ((j - b[i]) << 5) | i;
            }
        }
        return [b, r];
    };
    var _a = freb(fleb, 2), fl = _a[0], revfl = _a[1];
    // we can ignore the fact that the other numbers are wrong; they never happen anyway
    fl[28] = 258, revfl[258] = 28;
    var _b = freb(fdeb, 0), fd = _b[0], revfd = _b[1];
    // map of value to reverse (assuming 16 bits)
    var rev = new u16(32768);
    for (var i = 0; i < 32768; ++i) {
        // reverse table algorithm from SO
        var x = ((i & 0xAAAA) >>> 1) | ((i & 0x5555) << 1);
        x = ((x & 0xCCCC) >>> 2) | ((x & 0x3333) << 2);
        x = ((x & 0xF0F0) >>> 4) | ((x & 0x0F0F) << 4);
        rev[i] = (((x & 0xFF00) >>> 8) | ((x & 0x00FF) << 8)) >>> 1;
    }
    // create huffman tree from u8 "map": index -> code length for code index
    // mb (max bits) must be at most 15
    // TODO: optimize/split up?
    var hMap = (function (cd, mb, r) {
        var s = cd.length;
        // index
        var i = 0;
        // u16 "map": index -> # of codes with bit length = index
        var l = new u16(mb);
        // length of cd must be 288 (total # of codes)
        for (; i < s; ++i) {
            if (cd[i])
                ++l[cd[i] - 1];
        }
        // u16 "map": index -> minimum code for bit length = index
        var le = new u16(mb);
        for (i = 0; i < mb; ++i) {
            le[i] = (le[i - 1] + l[i - 1]) << 1;
        }
        var co;
        if (r) {
            // u16 "map": index -> number of actual bits, symbol for code
            co = new u16(1 << mb);
            // bits to remove for reverser
            var rvb = 15 - mb;
            for (i = 0; i < s; ++i) {
                // ignore 0 lengths
                if (cd[i]) {
                    // num encoding both symbol and bits read
                    var sv = (i << 4) | cd[i];
                    // free bits
                    var r_1 = mb - cd[i];
                    // start value
                    var v = le[cd[i] - 1]++ << r_1;
                    // m is end value
                    for (var m = v | ((1 << r_1) - 1); v <= m; ++v) {
                        // every 16 bit value starting with the code yields the same result
                        co[rev[v] >>> rvb] = sv;
                    }
                }
            }
        }
        else {
            co = new u16(s);
            for (i = 0; i < s; ++i) {
                if (cd[i]) {
                    co[i] = rev[le[cd[i] - 1]++] >>> (15 - cd[i]);
                }
            }
        }
        return co;
    });
    // fixed length tree
    var flt = new u8(288);
    for (var i = 0; i < 144; ++i)
        flt[i] = 8;
    for (var i = 144; i < 256; ++i)
        flt[i] = 9;
    for (var i = 256; i < 280; ++i)
        flt[i] = 7;
    for (var i = 280; i < 288; ++i)
        flt[i] = 8;
    // fixed distance tree
    var fdt = new u8(32);
    for (var i = 0; i < 32; ++i)
        fdt[i] = 5;
    // fixed length map
    var flm = /*#__PURE__*/ hMap(flt, 9, 0), flrm = /*#__PURE__*/ hMap(flt, 9, 1);
    // fixed distance map
    var fdm = /*#__PURE__*/ hMap(fdt, 5, 0), fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
    // find max of array
    var max = function (a) {
        var m = a[0];
        for (var i = 1; i < a.length; ++i) {
            if (a[i] > m)
                m = a[i];
        }
        return m;
    };
    // read d, starting at bit p and mask with m
    var bits = function (d, p, m) {
        var o = (p / 8) | 0;
        return ((d[o] | (d[o + 1] << 8)) >> (p & 7)) & m;
    };
    // read d, starting at bit p continuing for at least 16 bits
    var bits16 = function (d, p) {
        var o = (p / 8) | 0;
        return ((d[o] | (d[o + 1] << 8) | (d[o + 2] << 16)) >> (p & 7));
    };
    // get end of byte
    var shft = function (p) { return ((p + 7) / 8) | 0; };
    // typed array slice - allows garbage collector to free original reference,
    // while being more compatible than .slice
    var slc = function (v, s, e) {
        if (s == null || s < 0)
            s = 0;
        if (e == null || e > v.length)
            e = v.length;
        // can't use .constructor in case user-supplied
        var n = new (v.BYTES_PER_ELEMENT == 2 ? u16 : v.BYTES_PER_ELEMENT == 4 ? u32 : u8)(e - s);
        n.set(v.subarray(s, e));
        return n;
    };
    // error codes
    var ec = [
        'unexpected EOF',
        'invalid block type',
        'invalid length/literal',
        'invalid distance',
        'stream finished',
        'no stream handler',
        ,
        'no callback',
        'invalid UTF-8 data',
        'extra field too long',
        'date not in range 1980-2099',
        'filename too long',
        'stream finishing',
        'invalid zip data'
        // determined by unknown compression method
    ];
    var err = function (ind, msg, nt) {
        var e = new Error(msg || ec[ind]);
        e.code = ind;
        if (Error.captureStackTrace)
            Error.captureStackTrace(e, err);
        if (!nt)
            throw e;
        return e;
    };
    // expands raw DEFLATE data
    var inflt = function (dat, buf, st) {
        // source length
        var sl = dat.length;
        if (!sl || (st && st.f && !st.l))
            return buf || new u8(0);
        // have to estimate size
        var noBuf = !buf || st;
        // no state
        var noSt = !st || st.i;
        if (!st)
            st = {};
        // Assumes roughly 33% compression ratio average
        if (!buf)
            buf = new u8(sl * 3);
        // ensure buffer can fit at least l elements
        var cbuf = function (l) {
            var bl = buf.length;
            // need to increase size to fit
            if (l > bl) {
                // Double or set to necessary, whichever is greater
                var nbuf = new u8(Math.max(bl * 2, l));
                nbuf.set(buf);
                buf = nbuf;
            }
        };
        //  last chunk         bitpos           bytes
        var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
        // total bits
        var tbts = sl * 8;
        do {
            if (!lm) {
                // BFINAL - this is only 1 when last chunk is next
                final = bits(dat, pos, 1);
                // type: 0 = no compression, 1 = fixed huffman, 2 = dynamic huffman
                var type = bits(dat, pos + 1, 3);
                pos += 3;
                if (!type) {
                    // go to end of byte boundary
                    var s = shft(pos) + 4, l = dat[s - 4] | (dat[s - 3] << 8), t = s + l;
                    if (t > sl) {
                        if (noSt)
                            err(0);
                        break;
                    }
                    // ensure size
                    if (noBuf)
                        cbuf(bt + l);
                    // Copy over uncompressed data
                    buf.set(dat.subarray(s, t), bt);
                    // Get new bitpos, update byte count
                    st.b = bt += l, st.p = pos = t * 8, st.f = final;
                    continue;
                }
                else if (type == 1)
                    lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
                else if (type == 2) {
                    //  literal                            lengths
                    var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
                    var tl = hLit + bits(dat, pos + 5, 31) + 1;
                    pos += 14;
                    // length+distance tree
                    var ldt = new u8(tl);
                    // code length tree
                    var clt = new u8(19);
                    for (var i = 0; i < hcLen; ++i) {
                        // use index map to get real code
                        clt[clim[i]] = bits(dat, pos + i * 3, 7);
                    }
                    pos += hcLen * 3;
                    // code lengths bits
                    var clb = max(clt), clbmsk = (1 << clb) - 1;
                    // code lengths map
                    var clm = hMap(clt, clb, 1);
                    for (var i = 0; i < tl;) {
                        var r = clm[bits(dat, pos, clbmsk)];
                        // bits read
                        pos += r & 15;
                        // symbol
                        var s = r >>> 4;
                        // code length to copy
                        if (s < 16) {
                            ldt[i++] = s;
                        }
                        else {
                            //  copy   count
                            var c = 0, n = 0;
                            if (s == 16)
                                n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
                            else if (s == 17)
                                n = 3 + bits(dat, pos, 7), pos += 3;
                            else if (s == 18)
                                n = 11 + bits(dat, pos, 127), pos += 7;
                            while (n--)
                                ldt[i++] = c;
                        }
                    }
                    //    length tree                 distance tree
                    var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
                    // max length bits
                    lbt = max(lt);
                    // max dist bits
                    dbt = max(dt);
                    lm = hMap(lt, lbt, 1);
                    dm = hMap(dt, dbt, 1);
                }
                else
                    err(1);
                if (pos > tbts) {
                    if (noSt)
                        err(0);
                    break;
                }
            }
            // Make sure the buffer can hold this + the largest possible addition
            // Maximum chunk size (practically, theoretically infinite) is 2^17;
            if (noBuf)
                cbuf(bt + 131072);
            var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
            var lpos = pos;
            for (;; lpos = pos) {
                // bits read, code
                var c = lm[bits16(dat, pos) & lms], sym = c >>> 4;
                pos += c & 15;
                if (pos > tbts) {
                    if (noSt)
                        err(0);
                    break;
                }
                if (!c)
                    err(2);
                if (sym < 256)
                    buf[bt++] = sym;
                else if (sym == 256) {
                    lpos = pos, lm = null;
                    break;
                }
                else {
                    var add = sym - 254;
                    // no extra bits needed if less
                    if (sym > 264) {
                        // index
                        var i = sym - 257, b = fleb[i];
                        add = bits(dat, pos, (1 << b) - 1) + fl[i];
                        pos += b;
                    }
                    // dist
                    var d = dm[bits16(dat, pos) & dms], dsym = d >>> 4;
                    if (!d)
                        err(3);
                    pos += d & 15;
                    var dt = fd[dsym];
                    if (dsym > 3) {
                        var b = fdeb[dsym];
                        dt += bits16(dat, pos) & ((1 << b) - 1), pos += b;
                    }
                    if (pos > tbts) {
                        if (noSt)
                            err(0);
                        break;
                    }
                    if (noBuf)
                        cbuf(bt + 131072);
                    var end = bt + add;
                    for (; bt < end; bt += 4) {
                        buf[bt] = buf[bt - dt];
                        buf[bt + 1] = buf[bt + 1 - dt];
                        buf[bt + 2] = buf[bt + 2 - dt];
                        buf[bt + 3] = buf[bt + 3 - dt];
                    }
                    bt = end;
                }
            }
            st.l = lm, st.p = lpos, st.b = bt, st.f = final;
            if (lm)
                final = 1, st.m = lbt, st.d = dm, st.n = dbt;
        } while (!final);
        return bt == buf.length ? buf : slc(buf, 0, bt);
    };
    // starting at p, write the minimum number of bits that can hold v to d
    var wbits = function (d, p, v) {
        v <<= p & 7;
        var o = (p / 8) | 0;
        d[o] |= v;
        d[o + 1] |= v >>> 8;
    };
    // starting at p, write the minimum number of bits (>8) that can hold v to d
    var wbits16 = function (d, p, v) {
        v <<= p & 7;
        var o = (p / 8) | 0;
        d[o] |= v;
        d[o + 1] |= v >>> 8;
        d[o + 2] |= v >>> 16;
    };
    // creates code lengths from a frequency table
    var hTree = function (d, mb) {
        // Need extra info to make a tree
        var t = [];
        for (var i = 0; i < d.length; ++i) {
            if (d[i])
                t.push({ s: i, f: d[i] });
        }
        var s = t.length;
        var t2 = t.slice();
        if (!s)
            return [et, 0];
        if (s == 1) {
            var v = new u8(t[0].s + 1);
            v[t[0].s] = 1;
            return [v, 1];
        }
        t.sort(function (a, b) { return a.f - b.f; });
        // after i2 reaches last ind, will be stopped
        // freq must be greater than largest possible number of symbols
        t.push({ s: -1, f: 25001 });
        var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
        t[0] = { s: -1, f: l.f + r.f, l: l, r: r };
        // efficient algorithm from UZIP.js
        // i0 is lookbehind, i2 is lookahead - after processing two low-freq
        // symbols that combined have high freq, will start processing i2 (high-freq,
        // non-composite) symbols instead
        // see https://reddit.com/r/photopea/comments/ikekht/uzipjs_questions/
        while (i1 != s - 1) {
            l = t[t[i0].f < t[i2].f ? i0++ : i2++];
            r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
            t[i1++] = { s: -1, f: l.f + r.f, l: l, r: r };
        }
        var maxSym = t2[0].s;
        for (var i = 1; i < s; ++i) {
            if (t2[i].s > maxSym)
                maxSym = t2[i].s;
        }
        // code lengths
        var tr = new u16(maxSym + 1);
        // max bits in tree
        var mbt = ln(t[i1 - 1], tr, 0);
        if (mbt > mb) {
            // more algorithms from UZIP.js
            // TODO: find out how this code works (debt)
            //  ind    debt
            var i = 0, dt = 0;
            //    left            cost
            var lft = mbt - mb, cst = 1 << lft;
            t2.sort(function (a, b) { return tr[b.s] - tr[a.s] || a.f - b.f; });
            for (; i < s; ++i) {
                var i2_1 = t2[i].s;
                if (tr[i2_1] > mb) {
                    dt += cst - (1 << (mbt - tr[i2_1]));
                    tr[i2_1] = mb;
                }
                else
                    break;
            }
            dt >>>= lft;
            while (dt > 0) {
                var i2_2 = t2[i].s;
                if (tr[i2_2] < mb)
                    dt -= 1 << (mb - tr[i2_2]++ - 1);
                else
                    ++i;
            }
            for (; i >= 0 && dt; --i) {
                var i2_3 = t2[i].s;
                if (tr[i2_3] == mb) {
                    --tr[i2_3];
                    ++dt;
                }
            }
            mbt = mb;
        }
        return [new u8(tr), mbt];
    };
    // get the max length and assign length codes
    var ln = function (n, l, d) {
        return n.s == -1
            ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1))
            : (l[n.s] = d);
    };
    // length codes generation
    var lc = function (c) {
        var s = c.length;
        // Note that the semicolon was intentional
        while (s && !c[--s])
            ;
        var cl = new u16(++s);
        //  ind      num         streak
        var cli = 0, cln = c[0], cls = 1;
        var w = function (v) { cl[cli++] = v; };
        for (var i = 1; i <= s; ++i) {
            if (c[i] == cln && i != s)
                ++cls;
            else {
                if (!cln && cls > 2) {
                    for (; cls > 138; cls -= 138)
                        w(32754);
                    if (cls > 2) {
                        w(cls > 10 ? ((cls - 11) << 5) | 28690 : ((cls - 3) << 5) | 12305);
                        cls = 0;
                    }
                }
                else if (cls > 3) {
                    w(cln), --cls;
                    for (; cls > 6; cls -= 6)
                        w(8304);
                    if (cls > 2)
                        w(((cls - 3) << 5) | 8208), cls = 0;
                }
                while (cls--)
                    w(cln);
                cls = 1;
                cln = c[i];
            }
        }
        return [cl.subarray(0, cli), s];
    };
    // calculate the length of output from tree, code lengths
    var clen = function (cf, cl) {
        var l = 0;
        for (var i = 0; i < cl.length; ++i)
            l += cf[i] * cl[i];
        return l;
    };
    // writes a fixed block
    // returns the new bit pos
    var wfblk = function (out, pos, dat) {
        // no need to write 00 as type: TypedArray defaults to 0
        var s = dat.length;
        var o = shft(pos + 2);
        out[o] = s & 255;
        out[o + 1] = s >>> 8;
        out[o + 2] = out[o] ^ 255;
        out[o + 3] = out[o + 1] ^ 255;
        for (var i = 0; i < s; ++i)
            out[o + i + 4] = dat[i];
        return (o + 4 + s) * 8;
    };
    // writes a block
    var wblk = function (dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
        wbits(out, p++, final);
        ++lf[256];
        var _a = hTree(lf, 15), dlt = _a[0], mlb = _a[1];
        var _b = hTree(df, 15), ddt = _b[0], mdb = _b[1];
        var _c = lc(dlt), lclt = _c[0], nlc = _c[1];
        var _d = lc(ddt), lcdt = _d[0], ndc = _d[1];
        var lcfreq = new u16(19);
        for (var i = 0; i < lclt.length; ++i)
            lcfreq[lclt[i] & 31]++;
        for (var i = 0; i < lcdt.length; ++i)
            lcfreq[lcdt[i] & 31]++;
        var _e = hTree(lcfreq, 7), lct = _e[0], mlcb = _e[1];
        var nlcc = 19;
        for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
            ;
        var flen = (bl + 5) << 3;
        var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
        var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + (2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18]);
        if (flen <= ftlen && flen <= dtlen)
            return wfblk(out, p, dat.subarray(bs, bs + bl));
        var lm, ll, dm, dl;
        wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
        if (dtlen < ftlen) {
            lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
            var llm = hMap(lct, mlcb, 0);
            wbits(out, p, nlc - 257);
            wbits(out, p + 5, ndc - 1);
            wbits(out, p + 10, nlcc - 4);
            p += 14;
            for (var i = 0; i < nlcc; ++i)
                wbits(out, p + 3 * i, lct[clim[i]]);
            p += 3 * nlcc;
            var lcts = [lclt, lcdt];
            for (var it = 0; it < 2; ++it) {
                var clct = lcts[it];
                for (var i = 0; i < clct.length; ++i) {
                    var len = clct[i] & 31;
                    wbits(out, p, llm[len]), p += lct[len];
                    if (len > 15)
                        wbits(out, p, (clct[i] >>> 5) & 127), p += clct[i] >>> 12;
                }
            }
        }
        else {
            lm = flm, ll = flt, dm = fdm, dl = fdt;
        }
        for (var i = 0; i < li; ++i) {
            if (syms[i] > 255) {
                var len = (syms[i] >>> 18) & 31;
                wbits16(out, p, lm[len + 257]), p += ll[len + 257];
                if (len > 7)
                    wbits(out, p, (syms[i] >>> 23) & 31), p += fleb[len];
                var dst = syms[i] & 31;
                wbits16(out, p, dm[dst]), p += dl[dst];
                if (dst > 3)
                    wbits16(out, p, (syms[i] >>> 5) & 8191), p += fdeb[dst];
            }
            else {
                wbits16(out, p, lm[syms[i]]), p += ll[syms[i]];
            }
        }
        wbits16(out, p, lm[256]);
        return p + ll[256];
    };
    // deflate options (nice << 13) | chain
    var deo = /*#__PURE__*/ new u32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
    // empty
    var et = /*#__PURE__*/ new u8(0);
    // compresses data into a raw DEFLATE buffer
    var dflt = function (dat, lvl, plvl, pre, post, lst) {
        var s = dat.length;
        var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7000)) + post);
        // writing to this writes to the output buffer
        var w = o.subarray(pre, o.length - post);
        var pos = 0;
        if (!lvl || s < 8) {
            for (var i = 0; i <= s; i += 65535) {
                // end
                var e = i + 65535;
                if (e >= s) {
                    // write final block
                    w[pos >> 3] = lst;
                }
                pos = wfblk(w, pos + 1, dat.subarray(i, e));
            }
        }
        else {
            var opt = deo[lvl - 1];
            var n = opt >>> 13, c = opt & 8191;
            var msk_1 = (1 << plvl) - 1;
            //    prev 2-byte val map    curr 2-byte val map
            var prev = new u16(32768), head = new u16(msk_1 + 1);
            var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
            var hsh = function (i) { return (dat[i] ^ (dat[i + 1] << bs1_1) ^ (dat[i + 2] << bs2_1)) & msk_1; };
            // 24576 is an arbitrary number of maximum symbols per block
            // 424 buffer for last block
            var syms = new u32(25000);
            // length/literal freq   distance freq
            var lf = new u16(288), df = new u16(32);
            //  l/lcnt  exbits  index  l/lind  waitdx  bitpos
            var lc_1 = 0, eb = 0, i = 0, li = 0, wi = 0, bs = 0;
            for (; i < s; ++i) {
                // hash value
                // deopt when i > s - 3 - at end, deopt acceptable
                var hv = hsh(i);
                // index mod 32768    previous index mod
                var imod = i & 32767, pimod = head[hv];
                prev[imod] = pimod;
                head[hv] = imod;
                // We always should modify head and prev, but only add symbols if
                // this data is not yet processed ("wait" for wait index)
                if (wi <= i) {
                    // bytes remaining
                    var rem = s - i;
                    if ((lc_1 > 7000 || li > 24576) && rem > 423) {
                        pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
                        li = lc_1 = eb = 0, bs = i;
                        for (var j = 0; j < 286; ++j)
                            lf[j] = 0;
                        for (var j = 0; j < 30; ++j)
                            df[j] = 0;
                    }
                    //  len    dist   chain
                    var l = 2, d = 0, ch_1 = c, dif = (imod - pimod) & 32767;
                    if (rem > 2 && hv == hsh(i - dif)) {
                        var maxn = Math.min(n, rem) - 1;
                        var maxd = Math.min(32767, i);
                        // max possible length
                        // not capped at dif because decompressors implement "rolling" index population
                        var ml = Math.min(258, rem);
                        while (dif <= maxd && --ch_1 && imod != pimod) {
                            if (dat[i + l] == dat[i + l - dif]) {
                                var nl = 0;
                                for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                                    ;
                                if (nl > l) {
                                    l = nl, d = dif;
                                    // break out early when we reach "nice" (we are satisfied enough)
                                    if (nl > maxn)
                                        break;
                                    // now, find the rarest 2-byte sequence within this
                                    // length of literals and search for that instead.
                                    // Much faster than just using the start
                                    var mmd = Math.min(dif, nl - 2);
                                    var md = 0;
                                    for (var j = 0; j < mmd; ++j) {
                                        var ti = (i - dif + j + 32768) & 32767;
                                        var pti = prev[ti];
                                        var cd = (ti - pti + 32768) & 32767;
                                        if (cd > md)
                                            md = cd, pimod = ti;
                                    }
                                }
                            }
                            // check the previous match
                            imod = pimod, pimod = prev[imod];
                            dif += (imod - pimod + 32768) & 32767;
                        }
                    }
                    // d will be nonzero only when a match was found
                    if (d) {
                        // store both dist and len data in one Uint32
                        // Make sure this is recognized as a len/dist with 28th bit (2^28)
                        syms[li++] = 268435456 | (revfl[l] << 18) | revfd[d];
                        var lin = revfl[l] & 31, din = revfd[d] & 31;
                        eb += fleb[lin] + fdeb[din];
                        ++lf[257 + lin];
                        ++df[din];
                        wi = i + l;
                        ++lc_1;
                    }
                    else {
                        syms[li++] = dat[i];
                        ++lf[dat[i]];
                    }
                }
            }
            pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
            // this is the easiest way to avoid needing to maintain state
            if (!lst && pos & 7)
                pos = wfblk(w, pos + 1, et);
        }
        return slc(o, 0, pre + shft(pos) + post);
    };
    // CRC32 table
    var crct = /*#__PURE__*/ (function () {
        var t = new Int32Array(256);
        for (var i = 0; i < 256; ++i) {
            var c = i, k = 9;
            while (--k)
                c = ((c & 1) && -306674912) ^ (c >>> 1);
            t[i] = c;
        }
        return t;
    })();
    // CRC32
    var crc = function () {
        var c = -1;
        return {
            p: function (d) {
                // closures have awful performance
                var cr = c;
                for (var i = 0; i < d.length; ++i)
                    cr = crct[(cr & 255) ^ d[i]] ^ (cr >>> 8);
                c = cr;
            },
            d: function () { return ~c; }
        };
    };
    // deflate with opts
    var dopt = function (dat, opt, pre, post, st) {
        return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : (12 + opt.mem), pre, post, !st);
    };
    // Walmart object spread
    var mrg = function (a, b) {
        var o = {};
        for (var k in a)
            o[k] = a[k];
        for (var k in b)
            o[k] = b[k];
        return o;
    };
    // worker clone
    // This is possibly the craziest part of the entire codebase, despite how simple it may seem.
    // The only parameter to this function is a closure that returns an array of variables outside of the function scope.
    // We're going to try to figure out the variable names used in the closure as strings because that is crucial for workerization.
    // We will return an object mapping of true variable name to value (basically, the current scope as a JS object).
    // The reason we can't just use the original variable names is minifiers mangling the toplevel scope.
    // This took me three weeks to figure out how to do.
    var wcln = function (fn, fnStr, td) {
        var dt = fn();
        var st = fn.toString();
        var ks = st.slice(st.indexOf('[') + 1, st.lastIndexOf(']')).replace(/\s+/g, '').split(',');
        for (var i = 0; i < dt.length; ++i) {
            var v = dt[i], k = ks[i];
            if (typeof v == 'function') {
                fnStr += ';' + k + '=';
                var st_1 = v.toString();
                if (v.prototype) {
                    // for global objects
                    if (st_1.indexOf('[native code]') != -1) {
                        var spInd = st_1.indexOf(' ', 8) + 1;
                        fnStr += st_1.slice(spInd, st_1.indexOf('(', spInd));
                    }
                    else {
                        fnStr += st_1;
                        for (var t in v.prototype)
                            fnStr += ';' + k + '.prototype.' + t + '=' + v.prototype[t].toString();
                    }
                }
                else
                    fnStr += st_1;
            }
            else
                td[k] = v;
        }
        return [fnStr, td];
    };
    var ch = [];
    // clone bufs
    var cbfs = function (v) {
        var tl = [];
        for (var k in v) {
            if (v[k].buffer) {
                tl.push((v[k] = new v[k].constructor(v[k])).buffer);
            }
        }
        return tl;
    };
    // use a worker to execute code
    var wrkr = function (fns, init, id, cb) {
        var _a;
        if (!ch[id]) {
            var fnStr = '', td_1 = {}, m = fns.length - 1;
            for (var i = 0; i < m; ++i)
                _a = wcln(fns[i], fnStr, td_1), fnStr = _a[0], td_1 = _a[1];
            ch[id] = wcln(fns[m], fnStr, td_1);
        }
        var td = mrg({}, ch[id][1]);
        return wk(ch[id][0] + ';onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=' + init.toString() + '}', id, td, cbfs(td), cb);
    };
    // base async inflate fn
    var bInflt = function () { return [u8, u16, u32, fleb, fdeb, clim, fl, fd, flrm, fdrm, rev, ec, hMap, max, bits, bits16, shft, slc, err, inflt, inflateSync, pbf, gu8]; };
    var bDflt = function () { return [u8, u16, u32, fleb, fdeb, clim, revfl, revfd, flm, flt, fdm, fdt, rev, deo, et, hMap, wbits, wbits16, hTree, ln, lc, clen, wfblk, wblk, shft, slc, dflt, dopt, deflateSync, pbf]; };
    // gzip extra
    var gze = function () { return [gzh, gzhl, wbytes, crc, crct]; };
    // gunzip extra
    var guze = function () { return [gzs, gzl]; };
    // unzlib extra
    var zule = function () { return [zlv]; };
    // post buf
    var pbf = function (msg) { return postMessage(msg, [msg.buffer]); };
    // get u8
    var gu8 = function (o) { return o && o.size && new u8(o.size); };
    // async helper
    var cbify = function (dat, opts, fns, init, id, cb) {
        var w = wrkr(fns, init, id, function (err, dat) {
            w.terminate();
            cb(err, dat);
        });
        w.postMessage([dat, opts], opts.consume ? [dat.buffer] : []);
        return function () { w.terminate(); };
    };
    // write bytes
    var wbytes = function (d, b, v) {
        for (; v; ++b)
            d[b] = v, v >>>= 8;
    };
    // gzip header
    var gzh = function (c, o) {
        var fn = o.filename;
        c[0] = 31, c[1] = 139, c[2] = 8, c[8] = o.level < 2 ? 4 : o.level == 9 ? 2 : 0, c[9] = 3; // assume Unix
        if (o.mtime != 0)
            wbytes(c, 4, Math.floor(new Date(o.mtime || Date.now()) / 1000));
        if (fn) {
            c[3] = 8;
            for (var i = 0; i <= fn.length; ++i)
                c[i + 10] = fn.charCodeAt(i);
        }
    };
    // gzip footer: -8 to -4 = CRC, -4 to -0 is length
    // gzip start
    var gzs = function (d) {
        if (d[0] != 31 || d[1] != 139 || d[2] != 8)
            err(6, 'invalid gzip data');
        var flg = d[3];
        var st = 10;
        if (flg & 4)
            st += d[10] | (d[11] << 8) + 2;
        for (var zs = (flg >> 3 & 1) + (flg >> 4 & 1); zs > 0; zs -= !d[st++])
            ;
        return st + (flg & 2);
    };
    // gzip length
    var gzl = function (d) {
        var l = d.length;
        return ((d[l - 4] | d[l - 3] << 8 | d[l - 2] << 16) | (d[l - 1] << 24)) >>> 0;
    };
    // gzip header length
    var gzhl = function (o) { return 10 + ((o.filename && (o.filename.length + 1)) || 0); };
    // zlib valid
    var zlv = function (d) {
        if ((d[0] & 15) != 8 || (d[0] >>> 4) > 7 || ((d[0] << 8 | d[1]) % 31))
            err(6, 'invalid zlib data');
        if (d[1] & 32)
            err(6, 'invalid zlib data: preset dictionaries not supported');
    };
    /**
     * Compresses data with DEFLATE without any wrapper
     * @param data The data to compress
     * @param opts The compression options
     * @returns The deflated version of the data
     */
    function deflateSync(data, opts) {
        return dopt(data, opts || {}, 0, 0);
    }
    function inflate(data, opts, cb) {
        if (!cb)
            cb = opts, opts = {};
        if (typeof cb != 'function')
            err(7);
        return cbify(data, opts, [
            bInflt
        ], function (ev) { return pbf(inflateSync(ev.data[0], gu8(ev.data[1]))); }, 1, cb);
    }
    /**
     * Expands DEFLATE data with no wrapper
     * @param data The data to decompress
     * @param out Where to write the data. Saves memory if you know the decompressed size and provide an output buffer of that length.
     * @returns The decompressed version of the data
     */
    function inflateSync(data, out) {
        return inflt(data, out);
    }
    function gzip(data, opts, cb) {
        if (!cb)
            cb = opts, opts = {};
        if (typeof cb != 'function')
            err(7);
        return cbify(data, opts, [
            bDflt,
            gze,
            function () { return [gzipSync]; }
        ], function (ev) { return pbf(gzipSync(ev.data[0], ev.data[1])); }, 2, cb);
    }
    /**
     * Compresses data with GZIP
     * @param data The data to compress
     * @param opts The compression options
     * @returns The gzipped version of the data
     */
    function gzipSync(data, opts) {
        if (!opts)
            opts = {};
        var c = crc(), l = data.length;
        c.p(data);
        var d = dopt(data, opts, gzhl(opts), 8), s = d.length;
        return gzh(d, opts), wbytes(d, s - 8, c.d()), wbytes(d, s - 4, l), d;
    }
    function gunzip(data, opts, cb) {
        if (!cb)
            cb = opts, opts = {};
        if (typeof cb != 'function')
            err(7);
        return cbify(data, opts, [
            bInflt,
            guze,
            function () { return [gunzipSync]; }
        ], function (ev) { return pbf(gunzipSync(ev.data[0])); }, 3, cb);
    }
    /**
     * Expands GZIP data
     * @param data The data to decompress
     * @param out Where to write the data. GZIP already encodes the output size, so providing this doesn't save memory.
     * @returns The decompressed version of the data
     */
    function gunzipSync(data, out) {
        return inflt(data.subarray(gzs(data), -8), out || new u8(gzl(data)));
    }
    function unzlib(data, opts, cb) {
        if (!cb)
            cb = opts, opts = {};
        if (typeof cb != 'function')
            err(7);
        return cbify(data, opts, [
            bInflt,
            zule,
            function () { return [unzlibSync]; }
        ], function (ev) { return pbf(unzlibSync(ev.data[0], gu8(ev.data[1]))); }, 5, cb);
    }
    /**
     * Expands Zlib data
     * @param data The data to decompress
     * @param out Where to write the data. Saves memory if you know the decompressed size and provide an output buffer of that length.
     * @returns The decompressed version of the data
     */
    function unzlibSync(data, out) {
        return inflt((zlv(data), data.subarray(2, -4)), out);
    }
    function decompress(data, opts, cb) {
        if (!cb)
            cb = opts, opts = {};
        if (typeof cb != 'function')
            err(7);
        return (data[0] == 31 && data[1] == 139 && data[2] == 8)
            ? gunzip(data, opts, cb)
            : ((data[0] & 15) != 8 || (data[0] >> 4) > 7 || ((data[0] << 8 | data[1]) % 31))
                ? inflate(data, opts, cb)
                : unzlib(data, opts, cb);
    }
    // text decoder
    var td = typeof TextDecoder != 'undefined' && /*#__PURE__*/ new TextDecoder();
    // text decoder stream
    var tds = 0;
    try {
        td.decode(et, { stream: true });
        tds = 1;
    }
    catch (e) { }

    class LayerStore extends Dexie$1 {
        states;
        textures;
        constructor(name) {
            super(name);
            this.version(3).stores({
                states: '&hash',
                textures: '&hash, timestamp'
            });
        }
    }
    function nearestPowerOf2(n) {
        return 1 << 31 - Math.clz32(n);
    }
    function nextPowerOf2(n) {
        return nearestPowerOf2((n - 1) * 2);
    }
    class WebLayerManagerBase {
        MINIMUM_RENDER_ATTEMPTS = 3;
        WebRenderer = WebRenderer;
        autosave = true;
        autosaveDelay = 10 * 1000;
        _autosaveTimer;
        pixelsPerMeter = 1000;
        store;
        serializeQueue = [];
        rasterizeQueue = [];
        optimizeQueue = [];
        textEncoder = new TextEncoder();
        ktx2Encoder = new KTX2Encoder();
        _unsavedTextureData = new Map();
        _stateData = new Map();
        _textureData = new Map();
        _imagePool = [];
        constructor(name = "ethereal-web-store") {
            this.store = new LayerStore(name);
        }
        saveStore() {
            const stateData = Array.from(this._stateData.entries())
                .filter(([k, v]) => typeof k === 'string')
                .map(([k, v]) => ({ hash: k, textureHash: v.texture?.hash }));
            const textureData = Array.from(this._unsavedTextureData.values());
            this._unsavedTextureData.clear();
            return this.loadIntoStore({
                stateData,
                textureData
            });
        }
        _packr = new Packr({ structuredClone: true });
        _unpackr = new Unpackr({ structuredClone: true });
        async importCache(url) {
            const response = await fetch(url);
            const zipped = await response.arrayBuffer();
            const buffer = await new Promise((resolve, reject) => {
                decompress(new Uint8Array(zipped), { consume: true }, (err, data) => {
                    if (err)
                        return reject(err);
                    resolve(data);
                });
            });
            const data = this._unpackr.unpack(buffer);
            return this.loadIntoStore(data);
        }
        async exportCache(states) {
            const stateData = states ?
                await this.store.states.bulkGet(states) :
                await this.store.states.toArray();
            const textureData = await this.store.textures.bulkGet(stateData
                .map((v) => v.textureHash)
                .filter((v) => typeof v === 'string'));
            const data = { stateData, textureData };
            const buffer = this._packr.pack(data);
            return new Promise((resolve, reject) => {
                gzip(buffer, { consume: true }, (err, data) => {
                    if (err)
                        return reject(err);
                    resolve(new Blob([data.buffer]));
                });
            });
        }
        async loadIntoStore(data) {
            return Promise.all([
                this.store.states.bulkPut(data.stateData),
                this.store.textures.bulkPut(data.textureData)
            ]);
        }
        getLayerState(hash) {
            let data = this._stateData.get(hash);
            if (!data) {
                data = {
                    bounds: new Bounds,
                    margin: new Edges,
                    padding: new Edges,
                    border: new Edges,
                    fullWidth: 0,
                    fullHeight: 0,
                    renderAttempts: 0,
                    textureWidth: 32,
                    textureHeight: 32,
                    pixelRatio: 1,
                    texture: undefined,
                    pseudo: {
                        hover: false,
                        active: false,
                        focus: false,
                        target: false
                    }
                };
                this._stateData.set(hash, data);
            }
            return data;
        }
        getTextureState(textureHash) {
            let data = this._textureData.get(textureHash);
            if (!data) {
                data = {
                    hash: textureHash,
                    canvas: undefined,
                    ktx2Url: undefined,
                };
                this._textureData.set(textureHash, data);
            }
            return data;
        }
        _statesRequestedFromStore = new Set();
        _texturesRequestedFromStore = new Set();
        async requestStoredData(hash) {
            const stateData = this.getLayerState(hash);
            if (typeof hash !== 'string')
                return stateData;
            if (!this._statesRequestedFromStore.has(hash)) {
                this._statesRequestedFromStore.add(hash);
                const state = await this.store.states.get(hash);
                if (state?.textureHash) {
                    stateData.texture = this.getTextureState(state.textureHash);
                }
            }
            const textureData = stateData.texture;
            if (textureData && textureData.hash && !textureData.canvas && !textureData.ktx2Url &&
                !this._texturesRequestedFromStore.has(textureData?.hash)) {
                this._texturesRequestedFromStore.add(textureData.hash);
                const storedTexture = await this.store.textures.get(textureData.hash);
                if (storedTexture?.texture && !textureData.canvas) {
                    const data = await new Promise((resolve, reject) => {
                        decompress(storedTexture.texture, { consume: true }, (err, data) => {
                            if (err)
                                return reject(err);
                            resolve(data);
                        });
                    });
                    if (!textureData.canvas) {
                        textureData.ktx2Url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/ktx2' }));
                    }
                }
            }
            return stateData;
        }
        async compressTexture(textureHash) {
            const data = this._textureData.get(textureHash);
            const canvas = data?.canvas;
            if (!canvas)
                throw new Error('Missing texture canvas');
            const imageData = this.getImageData(canvas);
            const ktx2Texture = await this.ktx2Encoder.encode(imageData);
            const textureData = this._unsavedTextureData.get(textureHash) ||
                { hash: textureHash, timestamp: Date.now(), texture: undefined };
            data.ktx2Url = URL.createObjectURL(new Blob([ktx2Texture], { type: 'image/ktx2' }));
            const bufferData = await new Promise((resolve, reject) => {
                gzip(new Uint8Array(ktx2Texture), { consume: true }, (err, bufferData) => {
                    if (err)
                        return reject(err);
                    resolve(bufferData);
                });
            });
            textureData.texture = bufferData;
            this._unsavedTextureData.set(textureHash, textureData);
        }
        tasksPending = false;
        serializePendingCount = 0;
        rasterizePendingCount = 0;
        MAX_SERIALIZE_TASK_COUNT = 10;
        MAX_RASTERIZE_TASK_COUNT = 10;
        scheduleTasksIfNeeded() {
            if (this.tasksPending ||
                (this.serializeQueue.length === 0 && this.rasterizeQueue.length === 0))
                return;
            this.tasksPending = true;
            setTimeout(this._runTasks, 1);
        }
        _runTasks = () => {
            const serializeQueue = this.serializeQueue;
            const rasterizeQueue = this.rasterizeQueue;
            // console.log("serialize task size", serializeQueue.length, serializeQueue)
            // console.log("rasterize task size", rasterizeQueue.length, rasterizeQueue)
            while (serializeQueue.length > 0 && this.serializePendingCount < this.MAX_SERIALIZE_TASK_COUNT) {
                this.serializePendingCount++;
                const { layer, resolve } = serializeQueue.shift();
                this.serialize(layer).then((val) => {
                    this.serializePendingCount--;
                    resolve(val);
                });
            }
            while (rasterizeQueue.length > 0 && this.rasterizePendingCount < this.MAX_RASTERIZE_TASK_COUNT) {
                this.rasterizePendingCount++;
                const { hash, svgUrl: url, resolve } = rasterizeQueue.shift();
                this.rasterize(hash, url).finally(() => {
                    this.rasterizePendingCount--;
                    resolve(undefined);
                    if (this._autosaveTimer)
                        clearTimeout(this._autosaveTimer);
                    if (this.autosave)
                        this._autosaveTimer = setTimeout(() => { this.saveStore(); }, this.autosaveDelay);
                });
            }
            this.tasksPending = false;
        };
        addToSerializeQueue(layer) {
            const inQueue = this.serializeQueue.find((v) => v.layer === layer);
            if (inQueue)
                return inQueue.promise;
            let resolve;
            const promise = new Promise((r) => { resolve = r; });
            this.serializeQueue.push({ layer, resolve, promise });
            return promise;
        }
        updateDOMMetrics(layer) {
            const metrics = layer.domMetrics;
            getBounds(layer.element, metrics.bounds, layer.parentLayer?.element);
            getMargin(layer.element, metrics.margin);
            getPadding(layer.element, metrics.padding);
            getBorder(layer.element, metrics.border);
        }
        async serialize(layer) {
            this.updateDOMMetrics(layer);
            const layerElement = layer.element;
            const metrics = layer.domMetrics;
            const { top, left, width, height } = metrics.bounds;
            const { top: marginTop, left: marginLeft, bottom: marginBottom, right: marginRight } = metrics.margin;
            // add margins
            const fullWidth = width + Math.max(marginLeft, 0) + Math.max(marginRight, 0);
            const fullHeight = height + Math.max(marginTop, 0) + Math.max(marginBottom, 0);
            const pixelRatio = layer.pixelRatio ||
                parseFloat(layer.element.getAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE)) ||
                window.devicePixelRatio;
            const textureWidth = Math.max(nextPowerOf2(fullWidth * pixelRatio), 32);
            const textureHeight = Math.max(nextPowerOf2(fullHeight * pixelRatio), 32);
            const result = {};
            let svgDoc;
            if (layer.isMediaElement) {
                result.stateKey = layerElement;
            }
            else {
                // create svg markup
                const layerAttribute = WebRenderer.attributeHTML(WebRenderer.LAYER_ATTRIBUTE, '');
                const computedStyle = getComputedStyle(layerElement);
                const needsInlineBlock = computedStyle.display === 'inline';
                WebRenderer.updateInputAttributes(layerElement);
                const parentsHTML = getParentsHTML(layer, fullWidth, fullHeight, pixelRatio);
                const svgCSS = await WebRenderer.getAllEmbeddedStyles(layerElement);
                let layerHTML = await serializeToString(layerElement);
                layerHTML = layerHTML.replace(layerAttribute, `${layerAttribute} ${WebRenderer.RENDERING_ATTRIBUTE}="" ` +
                    `${needsInlineBlock ? `${WebRenderer.RENDERING_INLINE_ATTRIBUTE}="" ` : ' '} ` +
                    WebRenderer.getPsuedoAttributes(layer.desiredPseudoState));
                svgDoc =
                    '<svg width="' +
                        textureWidth +
                        '" height="' +
                        textureHeight +
                        '" xmlns="http://www.w3.org/2000/svg"><defs><style type="text/css"><![CDATA[\n' +
                        svgCSS.join('\n') +
                        ']]></style></defs><foreignObject x="0" y="0" width="' +
                        fullWidth * pixelRatio +
                        '" height="' +
                        fullHeight * pixelRatio +
                        '">' +
                        parentsHTML[0] +
                        layerHTML +
                        parentsHTML[1] +
                        '</foreignObject></svg>';
                // @ts-ignore
                layer._svgDoc = svgDoc;
                const stateHashBuffer = await crypto.subtle.digest('SHA-1', this.textEncoder.encode(svgDoc));
                const stateHash = bufferToHex(stateHashBuffer) +
                    '?w=' + fullWidth +
                    ';h=' + fullHeight +
                    ';tw=' + textureWidth +
                    ';th=' + textureHeight;
                result.stateKey = stateHash;
            }
            // update the layer state data
            const data = await this.requestStoredData(result.stateKey);
            data.bounds.left = left;
            data.bounds.top = top;
            data.bounds.width = width;
            data.bounds.height = height;
            data.margin.left = marginLeft;
            data.margin.top = marginTop;
            data.margin.right = marginRight;
            data.margin.bottom = marginBottom;
            data.fullWidth = fullWidth;
            data.fullHeight = fullHeight;
            data.pixelRatio = pixelRatio;
            data.textureWidth = textureWidth;
            data.textureHeight = textureHeight;
            layer.desiredDOMStateKey = result.stateKey;
            if (typeof result.stateKey === 'string')
                layer.allStateHashes.add(result.stateKey);
            result.needsRasterize = !layer.isMediaElement && fullWidth * fullHeight > 0 && !data.texture?.hash;
            result.svgUrl = (result.needsRasterize && svgDoc) ? 'data:image/svg+xml;utf8,' + encodeURIComponent(svgDoc) : undefined;
            return result;
        }
        async rasterize(stateHash, svgUrl) {
            const stateData = this.getLayerState(stateHash);
            const svgImage = this._imagePool.pop() || new Image();
            const { fullWidth, fullHeight, textureWidth, textureHeight, pixelRatio } = stateData;
            await new Promise((resolve, reject) => {
                svgImage.onload = () => {
                    resolve();
                };
                svgImage.onerror = (error) => {
                    reject(error);
                };
                svgImage.width = textureWidth;
                svgImage.height = textureHeight;
                svgImage.src = svgUrl;
            });
            if (!svgImage.complete || svgImage.currentSrc !== svgUrl) {
                throw new Error('Rasterization Failed');
            }
            await svgImage.decode();
            const sourceWidth = Math.floor(fullWidth * pixelRatio);
            const sourceHeight = Math.floor(fullHeight * pixelRatio);
            const hashCanvas = await this.rasterizeToCanvas(svgImage, sourceWidth, sourceHeight, 30, 30);
            const hashData = this.getImageData(hashCanvas);
            const textureHashBuffer = await crypto.subtle.digest('SHA-1', hashData.data);
            const textureHash = bufferToHex(textureHashBuffer) +
                '?w=' + textureWidth +
                ';h=' + textureHeight;
            const previousCanvasHash = stateData.texture?.hash;
            // stateData.texture.hash = textureHash
            if (previousCanvasHash !== textureHash) {
                stateData.renderAttempts = 0;
            }
            stateData.renderAttempts++;
            stateData.texture = this.getTextureState(textureHash);
            const hasTexture = stateData.texture.canvas || stateData.texture.ktx2Url;
            if (stateData.renderAttempts > this.MINIMUM_RENDER_ATTEMPTS && hasTexture) {
                return;
            }
            // in case the svg image wasn't finished loading, we should try again a few times
            setTimeout(() => this.addToRasterizeQueue(stateHash, svgUrl), (500 + Math.random() * 1000) * 2 ^ stateData.renderAttempts);
            if (stateData.texture.canvas)
                return;
            stateData.texture.canvas = await this.rasterizeToCanvas(svgImage, sourceWidth, sourceHeight, textureWidth, textureHeight);
            try {
                await this.compressTexture(textureHash);
            }
            finally {
                this._imagePool.push(svgImage);
            }
        }
        async rasterizeToCanvas(svgImage, sourceWidth, sourceHeight, textureWidth, textureHeight, canvas) {
            canvas = canvas || document.createElement('canvas');
            canvas.width = textureWidth;
            canvas.height = textureHeight;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            // createImageBitmap non-blocking api would be nice, but causes chrome to taint the canvas, 
            // and Safari treats the svg size strangely
            // const imageBitmap = await createImageBitmap(svgImage, 0,0, sourceWidth * devicePixelRatio, sourceHeight * devicePixelRatio, {
            //     resizeWidth: textureWidth,
            //     resizeHeight: textureHeight,
            //     resizeQuality: 'high'
            // })
            // ctx.drawImage(imageBitmap, 0, 0, sourceWidth, sourceHeight, 0, 0, textureWidth, textureHeight)
            ctx.drawImage(svgImage, 0, 0, sourceWidth, sourceHeight, 0, 0, textureWidth, textureHeight);
            return canvas;
        }
        getImageData(canvas) {
            return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        }
        addToRasterizeQueue(hash, url) {
            const inQueue = this.rasterizeQueue.find((v) => v.hash === hash);
            if (inQueue)
                return inQueue.promise;
            let resolve;
            const promise = new Promise((r) => { resolve = r; });
            this.rasterizeQueue.push({ hash, svgUrl: url, resolve, promise });
            return promise;
        }
        optimizeImageData(stateHash) {
        }
        addToOptimizeQueue(hash) {
        }
    }

    class WebLayerManager extends WebLayerManagerBase {
        static DEFAULT_TRANSCODER_PATH = `https://unpkg.com/@loaders.gl/textures@3.1.7/dist/libs/`;
        static initialize(renderer) {
            WebLayerManager.instance = new WebLayerManager();
            WebLayerManager.instance.renderer = renderer;
            WebLayerManager.instance.ktx2Loader.detectSupport(renderer);
        }
        static instance;
        constructor() {
            super();
            this.ktx2Loader.setTranscoderPath(WebLayerManager.DEFAULT_TRANSCODER_PATH);
        }
        renderer;
        textureEncoding = three.sRGBEncoding;
        ktx2Loader = new KTX2Loader;
        texturesByHash = new Map();
        layersByElement = new WeakMap();
        layersByMesh = new WeakMap();
        getTexture(textureHash) {
            const textureData = this.getTextureState(textureHash);
            if (!this.texturesByHash.has(textureHash)) {
                this.texturesByHash.set(textureHash, {});
            }
            this._loadCompressedTextureIfNecessary(textureData);
            this._loadCanvasTextureIfNecessary(textureData);
            return this.texturesByHash.get(textureHash);
        }
        _compressedTexturePromise = new Map();
        _loadCompressedTextureIfNecessary(textureData) {
            const ktx2Url = textureData.ktx2Url;
            if (!ktx2Url)
                return;
            if (!this._compressedTexturePromise.has(textureData.hash)) {
                new Promise((resolve) => {
                    this._compressedTexturePromise.set(textureData.hash, resolve);
                    this.ktx2Loader.loadAsync(ktx2Url).then((t) => {
                        t.wrapS = three.ClampToEdgeWrapping;
                        t.wrapT = three.ClampToEdgeWrapping;
                        t.minFilter = three.LinearFilter;
                        t.encoding = this.textureEncoding;
                        this.texturesByHash.get(textureData.hash).compressedTexture = t;
                    }).finally(() => {
                        resolve(undefined);
                    });
                });
            }
        }
        _canvasTexturePromise = new Map();
        _loadCanvasTextureIfNecessary(textureData) {
            const threeTextureData = this.texturesByHash.get(textureData.hash);
            if (threeTextureData.compressedTexture) {
                threeTextureData.canvasTexture?.dispose();
                threeTextureData.canvasTexture = undefined;
                return;
            }
            const canvas = textureData.canvas;
            if (!canvas)
                return;
            if (!threeTextureData.canvasTexture && !threeTextureData.compressedTexture) {
                const t = new three.CanvasTexture(canvas);
                t.wrapS = three.ClampToEdgeWrapping;
                t.wrapT = three.ClampToEdgeWrapping;
                t.minFilter = three.LinearFilter;
                t.encoding = this.textureEncoding;
                t.flipY = false;
                threeTextureData.canvasTexture = t;
            }
        }
    }

    const scratchVector = new three.Vector3();
    const scratchVector2 = new three.Vector3();
    const scratchBounds2 = new Bounds();
    /**
     * Transform a DOM tree into 3D layers.
     *
     * When an instance is created, a `xr-layer` is set on the
     * the passed DOM element to match this instance's Object3D id.
     * If the passed DOM element has an `id` attribute, this instance's Object3D name
     * will be set to match the element id.
     *
     * Child WebLayer3D instances can be specified with an `xr-layer` attribute,
     * which will be set when the child WebLayer3D instance is created automatically.
     * The attribute can be specified added in HTML or dynamically:
     *  - `<div xr-layer></div>`
     *
     * Additionally, the pixel ratio can be adjusted on each layer, individually:
     *  - `<div xr-layer xr-pixel-ratio="0.5"></div>`
     *
     * Default dimensions: 1px = 0.001 world dimensions = 1mm (assuming meters)
     *     e.g., 500px width means 0.5meters
     */
    class WebContainer3D extends three.Object3D {
        // static computeNaturalDistance(
        //   projection: THREE.Matrix4 | THREE.Camera,
        //   renderer: THREE.WebGLRenderer
        // ) {
        //   let projectionMatrix = projection as  THREE.Matrix4
        //   if ((projection as THREE.Camera).isCamera) {
        //     projectionMatrix = (projection as THREE.Camera).projectionMatrix
        //   }
        //   const pixelRatio = renderer.getPixelRatio()
        //   const widthPixels = renderer.domElement.width / pixelRatio
        //   const width = WebLayer3D.DEFAULT_PIXELS_PER_UNIT * widthPixels
        //   const horizontalFOV = getFovs(projectionMatrix).horizontal
        //   const naturalDistance = width / 2 / Math.tan(horizontalFOV / 2)
        //   return naturalDistance
        // }
        containerElement;
        options;
        rootLayer;
        raycaster = new three.Raycaster();
        _interactionRays = [];
        _hitIntersections = [];
        constructor(elementOrHTML, options = {}) {
            super();
            if (!options.manager)
                options.manager = WebLayerManager.instance;
            this.options = options;
            const element = typeof elementOrHTML === 'string' ? toDOM(elementOrHTML) : elementOrHTML;
            this.containerElement = WebRenderer.createLayerTree(element, options, (event, { target }) => {
                if (event === 'layercreated') {
                    const layer = target.layer || new WebLayer3D(target, this);
                    if (target === element) {
                        layer[ON_BEFORE_UPDATE] = () => this._updateInteractions();
                        this.rootLayer = layer;
                        this.add(layer);
                    }
                    else
                        layer.parentWebLayer?.add(layer);
                    this.options.onLayerCreate?.(layer);
                }
                else if (event === 'layermoved') {
                    const layer = this.options.manager.layersByElement.get(target);
                    layer.parentWebLayer?.add(layer);
                }
            });
            // @ts-ignore
            this.containerElement['container'] = this;
            this.refresh();
            this.update();
        }
        get manager() {
            return this.options.manager;
        }
        /**
         * A list of Rays to be used for interaction.
         * Can only be set on a root WebLayer3D instance.
         */
        get interactionRays() {
            return this._interactionRays;
        }
        set interactionRays(rays) {
            this._interactionRays = rays;
        }
        /**
         * Update all layers until they are rasterized and textures have been uploaded to the GPU
         */
        async updateUntilReady() {
            const intervalHandle = setInterval(() => {
                this.update();
            }, 20);
            this.rootLayer.setNeedsRefresh(true);
            await this.rootLayer.refresh(true);
            clearInterval(intervalHandle);
        }
        /**
         * Update all layers, recursively
         */
        update() {
            this.rootLayer.update(true);
        }
        /**
         * Refresh all layers, recursively
         */
        refresh() {
            this.rootLayer.refresh(true);
        }
        /**
         * Run a query selector on the root layer
         * @param selector
         * @deprecated
         */
        querySelector(selector) {
            return this.rootLayer.querySelector(selector);
        }
        /** Get the content mesh of the root layer
         * @deprecated
        */
        get contentMesh() {
            return this.rootLayer.contentMesh;
        }
        _previousHoverLayers = new Set();
        _contentMeshes = [];
        _prepareHitTest = (layer) => {
            if (layer.desiredPseudoStates.hover)
                this._previousHoverLayers.add(layer);
            layer.cursor.visible = false;
            layer.desiredPseudoStates.hover = false;
            if (layer.contentMesh.visible)
                this._contentMeshes.push(layer.contentMesh);
        };
        // private _intersectionGetGroupOrder(i:Intersection) {
        //   let o = i.object as THREE.Group&THREE.Object3D
        //   while (o.parent && !o.isGroup) {
        //     o = o.parent as THREE.Group&THREE.Object3D
        //   }
        //   i.groupOrder = o.renderOrder
        // }
        _intersectionSort(a, b) {
            const aLayer = a.object.parent;
            const bLayer = b.object.parent;
            if (aLayer.depth !== bLayer.depth) {
                return bLayer.depth - aLayer.depth;
            }
            return bLayer.index - aLayer.index;
        }
        _updateInteractions() {
            // this.updateWorldMatrix(true, true)
            const prevHover = this._previousHoverLayers;
            prevHover.clear();
            this._contentMeshes.length = 0;
            this.rootLayer.traverseLayersPreOrder(this._prepareHitTest);
            for (const ray of this._interactionRays) {
                if ('isObject3D' in ray && ray.isObject3D) {
                    this.raycaster.ray.set(ray.getWorldPosition(scratchVector), ray.getWorldDirection(scratchVector2).negate());
                }
                else
                    this.raycaster.ray.copy(ray);
                this._hitIntersections.length = 0;
                const intersections = this.raycaster.intersectObjects(this._contentMeshes, false, this._hitIntersections);
                // intersections.forEach(this._intersectionGetGroupOrder)
                intersections.sort(this._intersectionSort);
                const intersection = intersections[0];
                if (intersection) {
                    const layer = intersection.object.parent;
                    layer.cursor.position.copy(intersection.point);
                    layer.cursor.visible = true;
                    layer.desiredPseudoStates.hover = true;
                    if (!prevHover.has(layer)) {
                        layer.setNeedsRefresh();
                    }
                }
            }
            for (const layer of prevHover) {
                if (!layer.desiredPseudoStates.hover) {
                    layer.setNeedsRefresh();
                }
            }
        }
        /**
         * Perform hit test with ray, or with -Z direction of an Object3D
         * @param ray
         */
        hitTest(ray) {
            const raycaster = this.raycaster;
            const intersections = this._hitIntersections;
            const meshMap = this.options.manager.layersByMesh;
            if ('isObject3D' in ray && ray.isObject3D) {
                this.raycaster.ray.set(ray.getWorldPosition(scratchVector), ray.getWorldDirection(scratchVector2).negate());
            }
            else {
                this.raycaster.ray.copy(ray);
            }
            intersections.length = 0;
            raycaster.intersectObject(this, true, intersections);
            // intersections.forEach(this._intersectionGetGroupOrder)
            intersections.sort(this._intersectionSort);
            for (const intersection of intersections) {
                const layer = meshMap.get(intersection.object);
                if (!layer)
                    continue;
                const bounds = layer.bounds;
                const margin = layer.margin;
                const fullWidth = bounds.width + margin.left + margin.right;
                const fullHeight = bounds.height + margin.top + margin.bottom;
                if (fullWidth * fullHeight === 0)
                    continue;
                let target = layer.element;
                const clientX = (intersection.uv.x * fullWidth) - margin.left;
                const clientY = (intersection.uv.y * fullHeight) - margin.top;
                traverseChildElements(layer.element, el => {
                    if (!target.contains(el))
                        return false;
                    const elementBoundingRect = getBounds(el, scratchBounds2, layer.element);
                    const offsetLeft = elementBoundingRect.left - bounds.left;
                    const offsetTop = elementBoundingRect.top - bounds.top;
                    const { width, height } = elementBoundingRect;
                    const offsetRight = offsetLeft + width;
                    const offsetBottom = offsetTop + height;
                    if (clientX > offsetLeft &&
                        clientX < offsetRight &&
                        clientY > offsetTop &&
                        clientY < offsetBottom) {
                        target = el;
                        return true;
                    }
                    return false; // stop traversal down this path
                });
                return { layer, intersection, target };
            }
            return undefined;
        }
        /**
         * Remove all DOM elements, remove from scene, and dispose layer resources
         */
        destroy() {
            this.containerElement.remove();
            this.removeFromParent();
            this.rootLayer.dispose();
        }
        /**
         * Export the cache data for this
         */
        async downloadCache(filter) {
            await this.manager.saveStore();
            const states = new Set();
            this.rootLayer.traverseLayersPreOrder((layer) => {
                if (filter) {
                    if (!filter(layer))
                        return;
                }
                for (const hash of layer.allStateHashes)
                    states.add(hash);
            });
            const blob = await this.manager.exportCache(Array.from(states));
            downloadBlob(blob, 'web.' + this.rootLayer.element.id + '.cache');
        }
    }

    class VueApp {
        takeOwnership;
        setSharedData;
        width;
        height;
        vueApp;
        vueRoot;
        constructor(App, width, height, createOptions = {}) {
            this.takeOwnership = this.takeOwnershipProto.bind(this);
            this.setSharedData = this.setSharedDataProto.bind(this);
            this.width = width;
            this.height = height;
            this.vueApp = createApp(App, createOptions);
        }
        // dummy functions, just to let us use the same
        // data store with hubs and the web testing setup
        takeOwnershipProto() {
            return true;
        }
        setSharedDataProto(object) {
            return true;
        }
    }

    //import { EtherealLayoutSystem } from "ethereal";
    // create init method for ethereal
    //import * as ethereal from 'ethereal'
    // import { createPrinter, ThisExpression, ThrowStatement } from "node_modules/typescript/lib/typescript";
    // import { create } from "mathjs";
    function initializeEthereal() {
        HubsApp$1u.initializeEthereal();
    }
    //THREE.Object3D.DefaultMatrixAutoUpdate = true;
    function systemTick(time, deltaTime) {
        HubsApp$1u.systemTick(time, deltaTime);
    }
    class HubsApp$1u extends VueApp {
        //static system: ethereal.EtherealLayoutSystem;
        //static etherealCamera = new THREE.PerspectiveCamera()
        //static playerCamera: THREE.PerspectiveCamera;
        isEthereal;
        isInteractive;
        isNetworked;
        isStatic;
        updateTime;
        raycaster;
        tempV = new THREE.Vector3();
        size;
        //takeOwnership:  () => boolean
        //setSharedData: (object: {}) => boolean
        //width: number
        //height: number
        //vueApp: App
        //vueRoot: ComponentPublicInstance | undefined 
        webLayer3D;
        needsUpdate = false;
        headDiv;
        readyPromise = null;
        static initializeEthereal() {
            let scene = window.APP.scene;
            WebLayerManager.initialize(scene.renderer);
            // WebLayerManager.instance.MAX_RASTERIZE_TASK_COUNT = 25;
            // WebLayerManager.instance.MAX_SERIALIZE_TASK_COUNT = 25;
            // this.etherealCamera.matrixAutoUpdate = true;
            //this.etherealCamera.visible = false;
            //scene.setObject3D("etherealCamera", this.etherealCamera)
            // this.playerCamera = (document.getElementById("viewing-camera") as Entity).getObject3D("camera") as THREE.PerspectiveCamera;
            // just in case "viewing-camera" isn't set up yet ... which it 
            // should be, but just to be careful
            // this.system = ethereal.createLayoutSystem(this.playerCamera ? this.playerCamera : scene.camera)
            // window.ethSystem = this.system
            // can customize easing etc
            // system.transition.duration = 1.5
            // system.transition.delay = 0
            // system.transition.maxWait = 4
            // system.transition.easing = ethereal.easing.easeOut
        }
        static systemTick(time, deltaTime) {
            window.APP.scene;
            // if (!this.playerCamera) {
            //     this.playerCamera = (document.getElementById("viewing-camera") as Entity).getObject3D("camera") as THREE.PerspectiveCamera;
            // }
            // if (!this.playerCamera) return;
            // copyCamera(this.playerCamera, this.etherealCamera)
            // if (this.etherealCamera != this.system.viewNode) {
            //     this.system.viewNode = this.etherealCamera
            // }
            // scene.renderer.getSize(HubsApp.system.viewResolution)
            // this.system.viewFrustum.setFromPerspectiveProjectionMatrix(this.etherealCamera.projectionMatrix)
            // // tick method for ethereal
            // this.system.update(deltaTime, time)
        }
        constructor(App, width, height, params = {}, createOptions = {}) {
            if (params.width && params.height && params.width > 0 && params.height > 0) {
                // reset both
                width = params.width;
                height = params.height;
            }
            else if ((params.width && params.width > 0) || (params.height && params.height > 0)) {
                // set one and scale the other
                if (params.width && params.width > 0) {
                    height = (params.width / width) * height;
                    width = params.width;
                }
                if (params.height && params.height > 0) {
                    width = (params.height / height) * height;
                    height = params.height;
                }
            }
            super(App, width, height, createOptions);
            this.isEthereal = false;
            this.vueApp.provide('params', params);
            this.isInteractive = false;
            this.isNetworked = false;
            this.isStatic = true;
            this.updateTime = 100;
            this.raycaster = new THREE.Raycaster();
            this.size = { width: width / 1000, height: height / 1000 };
            this.headDiv = document.createElement("div");
        }
        mount(useEthereal) {
            this.isEthereal = useEthereal === true;
            this.vueRoot = this.vueApp.mount(this.headDiv);
            var style = "";
            this.width > 0 ? style = "width: " + this.width + "px; " : style = "width: fit-content; ";
            this.height > 0 ? style = style + "height: " + this.height + "px;" : style = style + "height: fit-content;";
            console.log("setting style: ", style);
            this.vueRoot.$el.setAttribute("style", style);
            // // add a link to the shared css
            let l = document.createElement("link");
            l.setAttribute("href", "https://resources.realitymedia.digital/vue-apps/dist/hubs.css");
            l.setAttribute("rel", "stylesheet");
            l.setAttribute("crossorigin", "anonymous");
            this.vueRoot.$el.insertBefore(l, this.vueRoot.$el.firstChild);
            // move this into method
            this.webLayer3D = new WebContainer3D(this.vueRoot?.$el, {
                autoRefresh: true,
                onLayerCreate: useEthereal ?
                    (layer) => {
                        layer.desiredPseudoStates.hover = true;
                        // const adapter = HubsApp.system.getAdapter(layer)
                        // adapter.opacity.enabled = true
                        // adapter.onUpdate = () => layer.update()
                    } :
                    (layer) => { layer.desiredPseudoStates.hover = true; },
                onLayerPaint: (layer) => {
                    if (this.isStatic) {
                        this.needsUpdate = true;
                    }
                },
                //textureEncoding: THREE.sRGBEncoding,
                renderOrderOffset: 0
            });
            // make sure the CSS has been loaded before we do 
            // anything else
            const createOnLoadPromise = (htmlElement) => new Promise((resolve) => {
                htmlElement.onload = resolve;
            });
            this.readyPromise = createOnLoadPromise(l).then(() => {
                let rect = this.vueRoot?.$el.getBoundingClientRect();
                console.log("mounted has rect: ", rect);
                this.height = this.height > 0 ? this.height : Math.ceil(rect.height * 1.0);
                this.width = this.width > 0 ? this.width : Math.ceil(rect.width * 1.0);
                this.size = { width: this.width / 1000, height: this.height / 1000 };
                style = "width: " + this.width + "px; height: " + this.height + "px;";
                console.log("setting style: ", style);
                this.vueRoot?.$el.setAttribute("style", style);
                this.webLayer3D?.rootLayer.setNeedsRefresh();
            });
        }
        async waitForReady() {
            this.webLayer3D?.rootLayer.setNeedsRefresh();
            await this.readyPromise;
            await this.webLayer3D?.updateUntilReady().then(() => {
                this.webLayer3D?.rootLayer.setNeedsRefresh();
            }).catch((err) => {
                console.error("WebLayerUpdate failed: ", err);
            });
        }
        setNetworkMethods(takeOwnership, setSharedData) {
            this.takeOwnership = takeOwnership;
            this.setSharedData = setSharedData;
        }
        // dummy functions, just to avoid errors if they get called before
        // networking is initialized, or called when networked is false
        // takeOwnershipProto(): boolean {
        //     return true;
        // }
        // setSharedDataProto(object: {}) {
        //     return true;
        // }
        // receive data updates.  should be overridden by subclasses, also requests
        // update next tick
        updateSharedData(dataObject) {
            this.needsUpdate = true;
        }
        getSize() {
            // if (!this.compStyles) {
            //     this.compStyles = window.getComputedStyle(this.vueRoot.$el);
            // }
            // var width = this.compStyles.getPropertyValue('width')
            // width = width && width.length > 0 ? parseFloat(width) / 1000: 1
            // var height = this.compStyles.getPropertyValue('height')
            // height = height && height.length > 0 ? parseFloat(height) / 1000: 1
            // this.size = { width: width, height: height}
            console.log("div size: {" + this.size.width + ", " + this.size.height + "}");
            return this.size;
        }
        // receive data updates.  should be overridden by subclasses
        getSharedData(dataObject) {
            throw new Error("getSharedData should be overridden by subclasses");
        }
        // override to check for your own 3D objects that aren't webLayers
        clicked(evt) {
            if (!this.isInteractive) {
                return;
            }
            const obj = evt.object3D;
            const dir = this.webLayer3D.getWorldDirection(new THREE.Vector3()).negate();
            this.tempV.copy(obj.position);
            this.tempV.addScaledVector(dir, -0.1);
            this.raycaster.ray.set(this.tempV, dir);
            const hit = this.webLayer3D.hitTest(this.raycaster.ray);
            if (hit) {
                hit.target.click();
                hit.target.focus();
                console.log('hit', hit.target, hit.layer);
            }
        }
        dragStart(evt) {
            // nothing here ... subclass should override
        }
        dragEnd(evt) {
            // nothing here ... subclass should override
        }
        play() {
            // if we can figure out how to pause, then restart here
        }
        pause() {
            // perhaps figure out how to pause the Vue component?
        }
        destroy() {
            //  clean up weblayer
            // if (this.vueRoot && this.vueRoot.$el) {
            //     let parent = this.vueRoot.$el.parentElement
            //     parent ? parent.removeChild(this.vueRoot.$el) : null
            // }
            // if (this.headDiv) {
            //     let parent = this.headDiv.parentElement
            //     parent ? parent.removeChild(this.headDiv) : null
            // }
            if (this.webLayer3D) {
                // let parent = (this.webLayer3D.rootLayer.element.getRootNode() as ShadowRoot).host;
                // parent ? parent.remove() : null
                // this.webLayer3D.removeFromParent()
                // this.webLayer3D.rootLayer.dispose()
                this.webLayer3D.destroy();
                // this.webLayer3D = null
            }
            this.vueApp.unmount();
            // this.vueRoot = null
            // this.vueApp = null
        }
        tick(time) {
            if (this.isEthereal) ;
            else {
                var needsUpdate = this.needsUpdate;
                this.needsUpdate = false;
                // if (this.isStatic && this.updateTime < time) {
                //     needsUpdate = true
                //     // wait a bit and do it again.  May get rid of this some day, we'll see
                //     this.updateTime = Math.random() * 2000 + 1000;
                // }
                // if (!this.isStatic) {
                this.updateTime = time;
                needsUpdate = true;
                // }
                if (needsUpdate) {
                    this.webLayer3D.update();
                }
            }
        }
    }

    class Store$2 {
        _state;
        state;
        app;
        constructor(app) {
            this._state = reactive({
                count: 0
            });
            this.app = app;
            this.state = readonly(this._state);
        }
        increment() {
            if (this.app.takeOwnership()) {
                this._state.count++;
                this.app.setSharedData(this.state);
            }
        }
        updateSharedData(dataObject) {
            // need to update the elements within the state, because otherwise
            // the data won't flow to the components
            this._state.count = dataObject.count;
        }
    }

    class HubsApp$1t extends HubsApp$1u {
        shared;
        constructor(params = {}) {
            super(script$1w, 400, 300, params);
            // create our shared data object that will
            // share data between vue and hubs
            this.shared = new Store$2(this);
            this.vueApp.provide('shared', this.shared);
            this.isInteractive = true;
            this.isNetworked = true;
            this.isStatic = false;
        }
        updateSharedData(dataObject) {
            super.updateSharedData(dataObject);
            this.shared.updateSharedData(dataObject);
        }
        getSharedData() {
            return this.shared.state;
        }
    }
    var init$1t = function (params = {}) {
        let app = new HubsApp$1t(params);
        app.mount();
        return app;
    };

    const _withScopeId$2 = n => (pushScopeId("data-v-0b72a6b4"),n=n(),popScopeId(),n);
    const _hoisted_1$1t = {
      "xr-layer": "",
      class: "fade"
    };
    const _hoisted_2$1q = /*#__PURE__*/ _withScopeId$2(() => /*#__PURE__*/createBaseVNode("p", null, [
      /*#__PURE__*/createBaseVNode("a", {
        "xr-layer": "",
        href: "https://vitejs.dev/guide/features.html",
        target: "_blank"
      }, " Vite Documentation and Then Some! "),
      /*#__PURE__*/createBaseVNode("a", {
        "xr-layer": "",
        href: "https://v3.vuejs.org/",
        target: "_blank"
      }, "Vue 3 Documentation")
    ], -1 /* HOISTED */));


    var script$1v = {
      props: {
      msg: String
    },
      setup(__props) {



    const shared = inject('shared');

    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock(Fragment, null, [
        createBaseVNode("h1", _hoisted_1$1t, toDisplayString(__props.msg), 1 /* TEXT */),
        _hoisted_2$1q,
        createBaseVNode("button", {
          "xr-layer": "",
          onClick: _cache[0] || (_cache[0] = (...args) => (unref(shared).increment && unref(shared).increment(...args)))
        }, "count is: " + toDisplayString(unref(shared).state.count), 1 /* TEXT */)
      ], 64 /* STABLE_FRAGMENT */))
    }
    }

    };

    script$1v.__scopeId = "data-v-0b72a6b4";

    const _withScopeId$1 = n => (pushScopeId("data-v-214c13a8"),n=n(),popScopeId(),n);
    const _hoisted_1$1s = { id: "room" };
    const _hoisted_2$1p = /*#__PURE__*/ _withScopeId$1(() => /*#__PURE__*/createBaseVNode("img", {
      "xr-layer": "",
      alt: "Vue logo",
      src: _imports_0$E
    }, null, -1 /* HOISTED */));
    const _hoisted_3$L = /*#__PURE__*/createTextVNode(" Edit code in ");
    const _hoisted_4$E = /*#__PURE__*/ _withScopeId$1(() => /*#__PURE__*/createBaseVNode("code", null, "src/apps", -1 /* HOISTED */));
    const _hoisted_5$q = /*#__PURE__*/createTextVNode(" to test hot module replacement while running project as \"npm run dev\". ");
    const _hoisted_6$g = [
      _hoisted_3$L,
      _hoisted_4$E,
      _hoisted_5$q
    ];


    var script$1u = {
      setup(__props) {

    const shared = inject('shared');

    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$1s, [
          _hoisted_2$1p,
          createVNode(script$1v, { msg: "Vue Component with Local Button Count" }),
          createBaseVNode("p", {
            id: "edit",
            class: normalizeClass({ upclose: unref(shared).state.close }),
            "xr-layer": ""
          }, _hoisted_6$g, 2 /* CLASS */)
        ])
      ]))
    }
    }

    };

    script$1u.__scopeId = "data-v-214c13a8";

    class Store$1 {
        _state;
        state;
        app;
        constructor(app) {
            this._state = reactive({
                close: false
            });
            this.app = app;
            this.state = readonly(this._state);
        }
        setClose(c) {
            if (this._state.close != c) {
                this._state.close = c;
            }
        }
    }

    class HubsApp$1s extends HubsApp$1u {
        shared;
        constructor(params = {}) {
            super(script$1u, 500, 500, params);
            this.isInteractive = true;
            this.shared = new Store$1(this);
            this.vueApp.provide('shared', this.shared);
        }
        docs;
        boundsSize = new THREE.Vector3();
        bounds = new THREE.Box3();
        mount() {
            super.mount(true); // use ethereal
            this.docs = this.webLayer3D.querySelector('#edit');
            if (!this.docs) {
                console.warn("Vue app needs #edit div");
                return;
            }
            // let adapter = HubsApp.system.getAdapter(this.docs) 
            // adapter.onUpdate = () => {
            //     this.bounds = adapter.metrics.target.visualBounds
            //     this.bounds.getSize(this.boundsSize)
            //     var size = Math.sqrt(this.boundsSize.x * this.boundsSize.x + this.boundsSize.y * this.boundsSize.y)
            //     if (this.shared.state.close) {
            //         this.shared.setClose (size < 210)
            //     } else {
            //         this.shared.setClose (size < 190)
            //     }
            //     this.docs!.update()
            // }
        }
    }
    var init$1s = function (params = {}) {
        let app = new HubsApp$1s(params);
        app.mount();
        return app;
    };

    const _withScopeId = n => (pushScopeId("data-v-6e9d9acd"),n=n(),popScopeId(),n);
    const _hoisted_1$1r = { id: "room" };
    const _hoisted_2$1o = { class: "titleStyle" };
    const _hoisted_3$K = /*#__PURE__*/ _withScopeId(() => /*#__PURE__*/createBaseVNode("div", null, null, -1 /* HOISTED */));
    const _hoisted_4$D = /*#__PURE__*/createTextVNode("Click to swap objects: ");
    const _hoisted_5$p = /*#__PURE__*/ _withScopeId(() => /*#__PURE__*/createBaseVNode("div", null, null, -1 /* HOISTED */));
    const _hoisted_6$f = { "xr-layer": "" };
    const _hoisted_7$b = /*#__PURE__*/createTextVNode("Click to make larger: ");
    const _hoisted_8$6 = { "xr-layer": "" };
    const _hoisted_9$5 = /*#__PURE__*/createTextVNode("Click to make smaller: ");


    var script$1t = {
      setup(__props) {

    let params = inject("params");
    var title = params && params.parameter1 ? params.parameter1 : "Example Control Panel";
    var help = params && params.parameter2 ? params.parameter2 : "Click the buttons to switch objects or change the color of an object";
    const shared = inject('shared');


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$1r, [
          createBaseVNode("div", _hoisted_2$1o, toDisplayString(unref(title)), 1 /* TEXT */),
          createBaseVNode("div", null, toDisplayString(unref(help)), 1 /* TEXT */),
          _hoisted_3$K,
          createBaseVNode("div", null, [
            _hoisted_4$D,
            createBaseVNode("button", {
              "xr-layer": "",
              onClick: _cache[0] || (_cache[0] = (...args) => (unref(shared).nextObject && unref(shared).nextObject(...args)))
            }, "Swap Objects")
          ]),
          createBaseVNode("div", null, "Current object is: " + toDisplayString(unref(shared).getName()), 1 /* TEXT */),
          _hoisted_5$p,
          createBaseVNode("div", _hoisted_6$f, [
            _hoisted_7$b,
            createBaseVNode("span", {
              class: "fakeButton",
              onClick: _cache[1] || (_cache[1] = (...args) => (unref(shared).larger && unref(shared).larger(...args)))
            }, "Larger")
          ]),
          createBaseVNode("div", _hoisted_8$6, [
            _hoisted_9$5,
            createBaseVNode("span", {
              class: "fakeButton",
              onClick: _cache[2] || (_cache[2] = (...args) => (unref(shared).smaller && unref(shared).smaller(...args)))
            }, "Smaller")
          ])
        ])
      ]))
    }
    }

    };

    script$1t.__scopeId = "data-v-6e9d9acd";

    class Store {
        _state;
        state;
        app;
        objects;
        constructor(app) {
            this._state = reactive({
                object: -1,
                size: { x: 1, y: 1, z: 1 }
            });
            this.app = app;
            this.state = readonly(this._state);
            this.objects = [];
            if (window.AFRAME) {
                let scene = window.AFRAME.scenes[0].object3D;
                for (let i = 1; i < 11; i++) {
                    let o = scene.getObjectByName("TestObject" + i);
                    if (o) {
                        o.visible = false;
                        this.objects.push(o);
                    }
                }
            }
            if (this.objects.length > 0) {
                this._state.object = 0;
                this._copyVec3(this.objects[0].scale, this._state.size);
                this.objects[0].visible = true;
            }
            else {
                this._state.object = -1;
            }
        }
        _copyVec3(from, to) {
            to.x = from.x;
            to.y = from.y;
            to.z = from.z;
        }
        _nextObject() {
            if (this._state.object == -1)
                return -1;
            this.objects[this._state.object].visible = false;
            this._state.object++;
            if (this._state.object >= this.objects.length) {
                this._state.object = 0;
            }
            this.objects[this._state.object].visible = true;
            this._copyVec3(this.objects[this._state.object].scale, this._state.size);
            // update the portals when the object changes, just to demonstrate this
            // is possible.  Probably don't want to do this very often, since we don't need
            // or want the portals to reflect the up-to-date state of the scene
            if (window.AFRAME) {
                let scene = window.AFRAME.scenes[0];
                //@ts-ignore
                scene.emit('updatePortals');
            }
        }
        _updateSize(size) {
            if (this._state.object >= 0) {
                this._copyVec3(size, this._state.size);
                // @ts-ignore
                this.objects[this._state.object].scale.copy(this._state.size);
                this.objects[this._state.object].updateMatrix();
            }
        }
        _larger() {
            if (this._state.object >= 0) {
                this.objects[this._state.object].scale.multiplyScalar(1.1);
                this.objects[this._state.object].updateMatrix();
                this._copyVec3(this.objects[this._state.object].scale, this._state.size);
            }
        }
        _smaller() {
            if (this._state.object >= 0) {
                this.objects[this._state.object].scale.multiplyScalar(1 / 1.1);
                this.objects[this._state.object].updateMatrix();
                this._copyVec3(this.objects[this._state.object].scale, this._state.size);
            }
        }
        // external routines called from vue
        nextObject() {
            if (this.app.takeOwnership()) {
                this._nextObject();
                this.app.setSharedData(this.state);
            }
        }
        larger() {
            if (this.app.takeOwnership()) {
                this._larger();
                this.app.setSharedData(this.state);
            }
        }
        smaller() {
            if (this.app.takeOwnership()) {
                this._smaller();
                this.app.setSharedData(this.state);
            }
        }
        getName() {
            if (this._state.object >= 0) {
                return this.objects[this._state.object].name;
            }
            else {
                return "NO OBJECTS";
            }
        }
        updateSharedData(dataObject) {
            // need to update the elements within the state, because otherwise
            // the data won't flow to the components
            if (this._state.object != dataObject.object) {
                this.objects[this._state.object].visible = false;
                this.objects[dataObject.object].visible = true;
                this._state.object = dataObject.object;
            }
            this._updateSize(dataObject.size);
        }
    }

    class HubsApp$1r extends HubsApp$1u {
        shared;
        constructor(params = {}) {
            super(script$1t, 400, 225, params);
            // create our shared data object that will
            // share data between vue and hubs
            this.shared = new Store(this);
            this.vueApp.provide('shared', this.shared);
            this.isInteractive = true;
            this.isNetworked = true;
            this.isStatic = false;
        }
        updateSharedData(dataObject) {
            super.updateSharedData(dataObject);
            this.shared.updateSharedData(dataObject);
        }
        getSharedData() {
            return this.shared.state;
        }
    }
    var init$1r = function (params = {}) {
        let app = new HubsApp$1r(params);
        app.mount();
        return app;
    };

    var script$1s = {
      props: {
      msg: String
    },
      setup(__props) {



    reactive({ count: 0 });

    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("h2", null, toDisplayString(__props.msg), 1 /* TEXT */))
    }
    }

    };

    const _hoisted_1$1q = {
      id: "room",
      class: "darkwall"
    };


    var script$1r = {
      setup(__props) {

    let params = inject("params");
    var mesg = params && params.message ? params.message : "PORTAL TITLE";

    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1q, [
        createVNode(script$1s, { msg: unref(mesg) }, null, 8 /* PROPS */, ["msg"])
      ]))
    }
    }

    };

    class HubsApp$1q extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1r, width, height, params);
        }
    }
    var init$1q = function (params = {}) {
        let app = new HubsApp$1q(300, 100, params);
        app.mount();
        return app;
    };

    var script$1q = {
      props: {
      msg: String
    },
      setup(__props) {



    reactive({ count: 0 });

    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("h4", null, toDisplayString(__props.msg), 1 /* TEXT */))
    }
    }

    };

    const _hoisted_1$1p = {
      id: "room",
      class: "darkwall"
    };


    var script$1p = {
      setup(__props) {

    let params = inject("params");
    var mesg = params && params.message ? params.message : "PORTAL SUBTITLE";

    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1p, [
        createVNode(script$1q, { msg: unref(mesg) }, null, 8 /* PROPS */, ["msg"])
      ]))
    }
    }

    };

    class HubsApp$1p extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1p, width, height, params);
        }
    }
    var init$1p = function (params = {}) {
        let app = new HubsApp$1p(300, 100, params);
        app.mount();
        return app;
    };

    const _hoisted_1$1o = { class: "titleStyle" };



    var script$1o = {
      setup(__props) {

    let params = inject("params");
    var title = params && params.text ? params.text : "Text not set for GraphLabel";
    var color = params && params.color ? "color: " + params.color + ";" : "color: red;";
    var size = params && params.size ? "font-size: " + params.size + "em;" : "font-size: 2em;";
    var style = color + size;

    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", {
          id: "room",
          class: "darkwall",
          style: normalizeStyle(unref(style))
        }, [
          createCommentVNode("<Title v-bind:msg=\"title\" />"),
          createBaseVNode("div", _hoisted_1$1o, toDisplayString(unref(title)), 1 /* TEXT */)
        ], 4 /* STYLE */)
      ]))
    }
    }

    };

    class HubsApp$1o extends HubsApp$1u {
        params;
        constructor(width, height, params = {}) {
            super(script$1o, width, height, params);
            this.params = params;
            //  this.isInteractive = true;
        }
        // change the label of the node
        async setLabel(text, color) {
            this.params.text = text;
            this.params.color = color;
            // return a promise that resolves when the label is set
            // and updated
            return this.waitForReady();
        }
    }
    var init$1o = function (params = {}) {
        let app = new HubsApp$1o(0, 0, params);
        app.mount();
        return app;
    };

    var _imports_0$D = "https://resources.realitymedia.digital/vue-apps/dist/38d6d7a1e02fc2f9.png";

    const _hoisted_1$1n = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1n = /*#__PURE__*/createBaseVNode("img", {
      src: _imports_0$D,
      width: "250"
    }, null, -1 /* HOISTED */);
    const _hoisted_3$J = /*#__PURE__*/createBaseVNode("div", { class: "displaytext" }, "AR allows us to extend our physical reality; VR creates for us a different reality.", -1 /* HOISTED */);

    var script$1n = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1n, [
        createVNode(script$1s, { msg: "Reality Media" }),
        _hoisted_2$1n,
        _hoisted_3$J
      ]))
    }
    }

    };

    class HubsApp$1n extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1n, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$1n = function (params = {}) {
        let app = new HubsApp$1n(300, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$C = "https://resources.realitymedia.digital/vue-apps/dist/7af7b95b35fd7616.jpg";

    const _hoisted_1$1m = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1m = { class: "spacer" };
    const _hoisted_3$I = /*#__PURE__*/createBaseVNode("img", {
      src: _imports_0$C,
      width: "250"
    }, null, -1 /* HOISTED */);
    const _hoisted_4$C = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, " Each reality medium mediates and remediates. It offers a new representation of the world that we implicitly compare to our experience of the world in itself, but also through other media.", -1 /* HOISTED */);
    const _hoisted_5$o = /*#__PURE__*/createBaseVNode("p", null, [
      /*#__PURE__*/createBaseVNode("a", {
        href: "https://realitymedia.digital",
        target: "_blank"
      }, " Start at the reality media site. "),
      /*#__PURE__*/createTextVNode(" | ")
    ], -1 /* HOISTED */);

    var script$1m = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1m, [
        createBaseVNode("div", _hoisted_2$1m, [
          createVNode(script$1s, { msg: "AR & VR as reality media" }),
          _hoisted_3$I,
          _hoisted_4$C
        ]),
        _hoisted_5$o
      ]))
    }
    }

    };

    class HubsApp$1m extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1m, width, height, params);
            this.isInteractive = true;
        }
    }
    var init$1m = function (params = {}) {
        let app = new HubsApp$1m(300, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$B = "https://resources.realitymedia.digital/vue-apps/dist/7ab3d86afd48dbfb.jpg";

    const _hoisted_1$1l = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1l = /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
      /*#__PURE__*/createBaseVNode("img", {
        src: _imports_0$B,
        width: "250"
      }),
      /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "Film became one of the most important reality media of the twentieth century, and in some ways, it is a forerunner of virtual reality.")
    ], -1 /* HOISTED */);

    var script$1l = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1l, [
        createVNode(script$1s, { msg: "The LaCiotat Effect" }),
        _hoisted_2$1l
      ]))
    }
    }

    };

    class HubsApp$1l extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1l, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$1l = function (params = {}) {
        let app = new HubsApp$1l(300, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$A = "https://resources.realitymedia.digital/vue-apps/dist/91fdfa811e752dc8.jpg";

    const _hoisted_1$1k = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1k = { class: "spacer" };
    const _hoisted_3$H = /*#__PURE__*/createBaseVNode("img", {
      src: _imports_0$A,
      width: "200"
    }, null, -1 /* HOISTED */);
    const _hoisted_4$B = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "3-D computer graphics help to construct the visual realities of AR and VR, that is photorealism. The uncanny valley.", -1 /* HOISTED */);

    var script$1k = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1k, [
        createBaseVNode("div", _hoisted_2$1k, [
          createVNode(script$1s, { msg: "3-D Graphics & Tracking" }),
          _hoisted_3$H,
          _hoisted_4$B
        ])
      ]))
    }
    }

    };

    class HubsApp$1k extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1k, width, height, params);
            // this.isInteractive = true;
        }
    }
    var init$1k = function (params = {}) {
        let app = new HubsApp$1k(300, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$1j = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1j = /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
      /*#__PURE__*/createCommentVNode("<img src=\"../../assets/images/parthenon.png\" width=\"250\">"),
      /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "Presence in VR is usually conceived of as forgetting that the medium is there. The idea is that if the user can be enticed into behaving as if she were not aware of all the complex technology, then she feels presence.")
    ], -1 /* HOISTED */);

    var script$1j = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1j, [
        createVNode(script$1s, { msg: "Presence" }),
        _hoisted_2$1j
      ]))
    }
    }

    };

    class HubsApp$1j extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1j, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$1j = function (params = {}) {
        let app = new HubsApp$1j(300, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$z = "https://resources.realitymedia.digital/vue-apps/dist/dc05c04546a69e64.png";

    const _hoisted_1$1i = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1i = /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
      /*#__PURE__*/createBaseVNode("img", {
        src: _imports_0$z,
        width: "250"
      }),
      /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "Reality media applications often function as additions to established genres. Most current AR and VR applications behave like applications or artifacts that we know from earlier media.")
    ], -1 /* HOISTED */);

    var script$1i = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1i, [
        createVNode(script$1s, { msg: "Genres" }),
        _hoisted_2$1i
      ]))
    }
    }

    };

    class HubsApp$1i extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1i, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$1i = function (params = {}) {
        let app = new HubsApp$1i(300, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$1h = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1h = /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
      /*#__PURE__*/createBaseVNode("img", {
        src: _imports_0$z,
        width: "250"
      }),
      /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "VR will continue to construct special realities, apart from the everyday. VR worlds will continue to be metaphoric worlds.")
    ], -1 /* HOISTED */);

    var script$1h = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1h, [
        createVNode(script$1s, { msg: "The Future of AR & VR" }),
        _hoisted_2$1h
      ]))
    }
    }

    };

    class HubsApp$1h extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1h, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$1h = function (params = {}) {
        let app = new HubsApp$1h(300, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$1g = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1g = /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
      /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "Pervasive, always-on AR applications have the potential to provide companies or government authorities even more information and with more precision than our current mobile applications do, both by aggregating our habits as consumers and by identifying us as individuals.")
    ], -1 /* HOISTED */);

    var script$1g = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1g, [
        createVNode(script$1s, { msg: "Privacy and Public Space" }),
        _hoisted_2$1g
      ]))
    }
    }

    };

    class HubsApp$1g extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1g, width, height, params);
            //   this.isInteractive = true;
        }
    }
    var init$1g = function (params = {}) {
        let app = new HubsApp$1g(300, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$1f = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1f = /*#__PURE__*/createBaseVNode("div", { class: "postertitle" }, "AR & VR as reality media", -1 /* HOISTED */);
    const _hoisted_3$G = /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
      /*#__PURE__*/createBaseVNode("div", { class: "flushleft" }, [
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Some of the key differences between “classic” VR and AR"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Extended reality (XR) and the immersive web "),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Where AR and VR fit on Milgram and Kishino’s virtuality continuum")
      ])
    ], -1 /* HOISTED */);
    const _hoisted_4$A = [
      _hoisted_2$1f,
      _hoisted_3$G
    ];

    var script$1f = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1f, _hoisted_4$A))
    }
    }

    };

    class HubsApp$1f extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1f, width, height, params);
            // this.isInteractive = true;
        }
    }
    var init$1f = function (params = {}) {
        let app = new HubsApp$1f(300, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$1e = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1e = /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
      /*#__PURE__*/createBaseVNode("div", { class: "flushleft" }, [
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Some of the key differences between “classic” VR and AR"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Extended reality (XR) and the immersive web "),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Where AR and VR fit on Milgram and Kishino’s virtuality continuum")
      ])
    ], -1 /* HOISTED */);

    var script$1e = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1e, [
        createVNode(script$1s, { msg: "The History of Reality Media" }),
        _hoisted_2$1e
      ]))
    }
    }

    };

    class HubsApp$1e extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1e, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$1e = function (params = {}) {
        let app = new HubsApp$1e(300, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$1d = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1d = /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
      /*#__PURE__*/createBaseVNode("div", { class: "flushleft" }, [
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Some of the key differences between “classic” VR and AR"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Extended reality (XR) and the immersive web "),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Where AR and VR fit on Milgram and Kishino’s virtuality continuum")
      ])
    ], -1 /* HOISTED */);

    var script$1d = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1d, [
        createVNode(script$1s, { msg: "3-D & Tracking" }),
        _hoisted_2$1d
      ]))
    }
    }

    };

    class HubsApp$1d extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1d, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$1d = function (params = {}) {
        let app = new HubsApp$1d(300, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$1c = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1c = /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
      /*#__PURE__*/createBaseVNode("div", { class: "flushleft" }, [
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Some of the key differences between “classic” VR and AR"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Extended reality (XR) and the immersive web "),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Where AR and VR fit on Milgram and Kishino’s virtuality continuum")
      ])
    ], -1 /* HOISTED */);

    var script$1c = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1c, [
        createVNode(script$1s, { msg: "Presence" }),
        _hoisted_2$1c
      ]))
    }
    }

    };

    class HubsApp$1c extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1c, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$1c = function (params = {}) {
        let app = new HubsApp$1c(300, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$1b = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1b = /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
      /*#__PURE__*/createBaseVNode("div", { class: "flushleft" }, [
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Some of the key differences between “classic” VR and AR"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Extended reality (XR) and the immersive web "),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Where AR and VR fit on Milgram and Kishino’s virtuality continuum")
      ])
    ], -1 /* HOISTED */);

    var script$1b = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1b, [
        createVNode(script$1s, { msg: "Genres" }),
        _hoisted_2$1b
      ]))
    }
    }

    };

    class HubsApp$1b extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1b, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$1b = function (params = {}) {
        let app = new HubsApp$1b(300, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$1a = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1a = /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
      /*#__PURE__*/createBaseVNode("div", { class: "flushleft" }, [
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Some of the key differences between “classic” VR and AR"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Extended reality (XR) and the immersive web "),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Where AR and VR fit on Milgram and Kishino’s virtuality continuum")
      ])
    ], -1 /* HOISTED */);

    var script$1a = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$1a, [
        createVNode(script$1s, { msg: "Future" }),
        _hoisted_2$1a
      ]))
    }
    }

    };

    class HubsApp$1a extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1a, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$1a = function (params = {}) {
        let app = new HubsApp$1a(300, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$19 = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$19 = /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
      /*#__PURE__*/createBaseVNode("div", { class: "flushleft" }, [
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Some of the key differences between “classic” VR and AR"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Extended reality (XR) and the immersive web "),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("h3", null, " Where AR and VR fit on Milgram and Kishino’s virtuality continuum")
      ])
    ], -1 /* HOISTED */);

    var script$19 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$19, [
        createVNode(script$1s, { msg: "Privacy" }),
        _hoisted_2$19
      ]))
    }
    }

    };

    class HubsApp$19 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$19, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$19 = function (params = {}) {
        let app = new HubsApp$19(300, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$y = "https://resources.realitymedia.digital/vue-apps/dist/190994370aebe395.png";

    const _hoisted_1$18 = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$18 = { class: "spacer" };
    const _hoisted_3$F = /*#__PURE__*/createBaseVNode("img", {
      src: _imports_0$y,
      width: "400"
    }, null, -1 /* HOISTED */);
    const _hoisted_4$z = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$n = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_6$e = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" First person shooter games such as "),
      /*#__PURE__*/createBaseVNode("a", {
        href: "https://www.half-life.com/en/alyx/",
        target: "_blank"
      }, "HalfLife: Alyx "),
      /*#__PURE__*/createTextVNode(" have long used 3-D graphics to create an immersive experience for millions of players. And for decades, players on computers and game consoles have yearned for true VR so that they could fall through the screen into the worlds on the other side.")
    ], -1 /* HOISTED */);

    var script$18 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$18, [
          createBaseVNode("div", _hoisted_2$18, [
            _hoisted_3$F,
            _hoisted_4$z,
            _hoisted_5$n,
            createVNode(script$1s, { msg: "HalfLife: Alyx" }),
            _hoisted_6$e
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$18 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$18, width, height, params);
            this.isInteractive = true;
        }
    }
    var init$18 = function (params = {}) {
        let app = new HubsApp$18(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$17 = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$17 = { class: "spacer" };
    const _hoisted_3$E = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "Pokemon Go (2016) is perhaps still the best-known AR game. The Pokemon franchise was already decades old, and this was certainly part of the answer for the AR game’s surprising impact. It was the first Pokemon game on a mobile phone and the first free Pokemon game on any platform. ", -1 /* HOISTED */);

    var script$17 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$17, [
        createBaseVNode("div", _hoisted_2$17, [
          createVNode(script$1s, { msg: "Pokemon Go" }),
          _hoisted_3$E
        ])
      ]))
    }
    }

    };

    class HubsApp$17 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$17, width, height, params);
            //     this.isInteractive = true;
        }
    }
    var init$17 = function (params = {}) {
        let app = new HubsApp$17(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$16 = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$16 = { class: "spacer" };
    const _hoisted_3$D = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "Beat Saber is a VR rhythm game with a little Star Wars thrown in. The player uses lightsabers to keep the beat. ", -1 /* HOISTED */);

    var script$16 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$16, [
        createBaseVNode("div", _hoisted_2$16, [
          createVNode(script$1s, { msg: "Beat Saber" }),
          _hoisted_3$D
        ])
      ]))
    }
    }

    };

    class HubsApp$16 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$16, width, height, params);
            // this.isInteractive = true;
        }
    }
    var init$16 = function (params = {}) {
        let app = new HubsApp$16(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$15 = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$15 = { class: "spacer" };
    const _hoisted_3$C = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "In this AR version of the transmedia franchise GPS is used to determine your location in the world. Your location and the zombies appear in an enhanced Google Maps map on the phone screen. ", -1 /* HOISTED */);

    var script$15 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$15, [
        createBaseVNode("div", _hoisted_2$15, [
          createVNode(script$1s, { msg: "Walking Dead: Our World" }),
          _hoisted_3$C
        ])
      ]))
    }
    }

    };

    class HubsApp$15 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$15, width, height, params);
            // this.isInteractive = true;
        }
    }
    var init$15 = function (params = {}) {
        let app = new HubsApp$15(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$14 = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$14 = { class: "spacer" };
    const _hoisted_3$B = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "Like video games and 360-degree video, VR art emphasizes immersion as the feature that makes the experience unique, as in a VR work by Christian Lemmerz entitled La Apparizione (2017). ", -1 /* HOISTED */);

    var script$14 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$14, [
        createBaseVNode("div", _hoisted_2$14, [
          createVNode(script$1s, { msg: "La Apparizione" }),
          _hoisted_3$B
        ])
      ]))
    }
    }

    };

    class HubsApp$14 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$14, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$14 = function (params = {}) {
        let app = new HubsApp$14(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$13 = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$13 = { class: "spacer" };
    const _hoisted_3$A = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "Minecraft VR is a fully immersive, headset version of the sandbox game that already runs on computers, game consoles, and mobile devices. It is called a \"sandbox game\" because it provides an independent environment in which players can make their own structures and objects out of virtual, LEGO-like blocks. ", -1 /* HOISTED */);

    var script$13 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$13, [
        createBaseVNode("div", _hoisted_2$13, [
          createVNode(script$1s, { msg: "Minecraft VR" }),
          _hoisted_3$A
        ])
      ]))
    }
    }

    };

    class HubsApp$13 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$13, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$13 = function (params = {}) {
        let app = new HubsApp$13(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$12 = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$12 = { class: "spacer headline" };

    var script$12 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$12, [
        createBaseVNode("div", _hoisted_2$12, [
          createVNode(script$1s, { msg: "AR & VR GAMES" })
        ])
      ]))
    }
    }

    };

    class HubsApp$12 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$12, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$12 = function (params = {}) {
        let app = new HubsApp$12(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$11 = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$11 = { class: "spacer headline" };

    var script$11 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$11, [
        createBaseVNode("div", _hoisted_2$11, [
          createVNode(script$1s, { msg: "AR & VR ART" })
        ])
      ]))
    }
    }

    };

    class HubsApp$11 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$11, width, height, params);
            //        this.isInteractive = true;
        }
    }
    var init$11 = function (params = {}) {
        let app = new HubsApp$11(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$x = "https://resources.realitymedia.digital/vue-apps/dist/842e2fa7f9a085a4.jpg";

    const _hoisted_1$10 = {
      id: "room",
      class: "lightwall"
    };
    const _hoisted_2$10 = /*#__PURE__*/createBaseVNode("div", {
      class: "headline squareoff",
      style: {"color":"white"}
    }, "15th century", -1 /* HOISTED */);
    const _hoisted_3$z = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$y = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$m = { class: "spacer-side" };
    const _hoisted_6$d = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_7$a = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, " Linear perspective is a system developed by architects and painters to create an illusion of depth on a flat surface. Around 1425, Italian Renaissance architect Filippo Brunelleschi demonstrated how it could make painting as realistic. Using the technique of parallel lines converging in a single vanishing point and a mirror, he painted the Florence Baptistry. ", -1 /* HOISTED */);
    const _hoisted_8$5 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_9$4 = /*#__PURE__*/createBaseVNode("div", { "xr-layer": "" }, [
      /*#__PURE__*/createBaseVNode("img", {
        class: "centerImg",
        height: "200",
        src: _imports_0$x
      })
    ], -1 /* HOISTED */);

    var script$10 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$10, [
          _hoisted_2$10,
          _hoisted_3$z,
          _hoisted_4$y,
          createBaseVNode("div", _hoisted_5$m, [
            createVNode(script$1s, { msg: "Linear Perspective" }),
            _hoisted_6$d,
            _hoisted_7$a,
            _hoisted_8$5,
            _hoisted_9$4
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$10 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$10, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$10 = function (params = {}) {
        let app = new HubsApp$10(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$w = "https://resources.realitymedia.digital/vue-apps/dist/c183715eb8f7f487.jpg";

    const _hoisted_1$$ = {
      id: "room",
      class: "lightwall"
    };
    const _hoisted_2$$ = /*#__PURE__*/createBaseVNode("div", {
      class: "headline squareoff",
      style: {"color":"white"}
    }, "18th century", -1 /* HOISTED */);
    const _hoisted_3$y = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$x = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$l = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_6$c = { class: "spacer-side" };
    const _hoisted_7$9 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_8$4 = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" The panorama conceived by artist Robert Barker was one of the ways to represent reality at the end of the 18th century. Barker used perspective painting to create a panorama on a canvas stretched around the cylindrical surface. Viewers stood in the middle and experienced the scene in either direction. "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);
    const _hoisted_9$3 = /*#__PURE__*/createBaseVNode("div", { "xr-layer": "" }, [
      /*#__PURE__*/createBaseVNode("img", {
        class: "centerImg",
        height: "90",
        src: _imports_0$w
      })
    ], -1 /* HOISTED */);
    const _hoisted_10$2 = /*#__PURE__*/createBaseVNode("div", { style: {"fontSize":"0.8em","padding-left":"40px","padding-top":"6px"} }, "Robert Barker and Henry Aston Barker, Panorama of London from the Roof of Albion Mills, 1972", -1 /* HOISTED */);

    var script$$ = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$$, [
          _hoisted_2$$,
          _hoisted_3$y,
          _hoisted_4$x,
          _hoisted_5$l,
          createBaseVNode("div", _hoisted_6$c, [
            createVNode(script$1s, { msg: "Panorama" }),
            _hoisted_7$9,
            _hoisted_8$4
          ]),
          _hoisted_9$3
        ]),
        _hoisted_10$2
      ]))
    }
    }

    };

    class HubsApp$$ extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$$, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$$ = function (params = {}) {
        let app = new HubsApp$$(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$_ = {
      id: "room",
      class: "lightwall"
    };
    const _hoisted_2$_ = { class: "spacer-side" };
    const _hoisted_3$x = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$w = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" The forerunner of the camera, camera obscura is a darkened room with a small hole that admitted light to project the inverted image of the outside scene onto the opposite wall. This image was ephemeral until the development of modern chemistry that made another medium possible. "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);

    var script$_ = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$_, [
          createBaseVNode("div", _hoisted_2$_, [
            createVNode(script$1s, { msg: "Camera Obscura" }),
            _hoisted_3$x,
            _hoisted_4$w
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$_ extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$_, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$_ = function (params = {}) {
        let app = new HubsApp$_(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$v = "https://resources.realitymedia.digital/vue-apps/dist/a1f9e309ab742d3c.jpg";

    const _hoisted_1$Z = {
      id: "room",
      class: "lightwall"
    };
    const _hoisted_2$Z = /*#__PURE__*/createBaseVNode("div", {
      class: "headline squareoff",
      style: {"color":"white"}
    }, "19th century", -1 /* HOISTED */);
    const _hoisted_3$w = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$v = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$k = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_6$b = { class: "spacer-side" };
    const _hoisted_7$8 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_8$3 = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" Photography developed through mechanizing the process of linear perspective. "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);
    const _hoisted_9$2 = /*#__PURE__*/createBaseVNode("div", { "xr-layer": "" }, [
      /*#__PURE__*/createBaseVNode("img", {
        class: "centerImg",
        height: "90",
        src: _imports_0$v
      })
    ], -1 /* HOISTED */);
    const _hoisted_10$1 = /*#__PURE__*/createBaseVNode("div", { style: {"fontSize":"0.8em","padding-left":"40px","padding-top":"6px"} }, "An early flat photographic panorama of Philadelphia in 1913. Haines Photo Co., Copyright Claimant", -1 /* HOISTED */);

    var script$Z = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$Z, [
          _hoisted_2$Z,
          _hoisted_3$w,
          _hoisted_4$v,
          _hoisted_5$k,
          createBaseVNode("div", _hoisted_6$b, [
            createVNode(script$1s, { msg: "Photography" }),
            _hoisted_7$8,
            _hoisted_8$3
          ]),
          _hoisted_9$2
        ]),
        _hoisted_10$1
      ]))
    }
    }

    };

    class HubsApp$Z extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$Z, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$Z = function (params = {}) {
        let app = new HubsApp$Z(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$u = "https://resources.realitymedia.digital/vue-apps/dist/dac383453d7a7a6b.jpg";

    const _hoisted_1$Y = {
      id: "room",
      class: "lightwall"
    };
    const _hoisted_2$Y = { class: "spacer-side" };
    const _hoisted_3$v = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$u = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" In the 1980s, the Lumière brothers created cinématographe, which is one of the first motion picture apparatus. With this device, they made 'The Arrival of a Train at La Ciotat Station'. "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);
    const _hoisted_5$j = /*#__PURE__*/createBaseVNode("div", { "xr-layer": "" }, [
      /*#__PURE__*/createBaseVNode("img", {
        class: "centerImg",
        height: "200",
        src: _imports_0$u
      })
    ], -1 /* HOISTED */);

    var script$Y = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$Y, [
          createBaseVNode("div", _hoisted_2$Y, [
            createVNode(script$1s, { msg: "Film" }),
            _hoisted_3$v,
            _hoisted_4$u
          ]),
          _hoisted_5$j
        ])
      ]))
    }
    }

    };

    class HubsApp$Y extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$Y, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$Y = function (params = {}) {
        let app = new HubsApp$Y(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$X = {
      id: "room",
      class: "lightwall"
    };
    const _hoisted_2$X = { class: "spacer-side" };
    const _hoisted_3$u = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$t = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" It was the liveness that validated television's special claim to being a reality medium. "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);

    var script$X = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", _hoisted_1$X, [
        createBaseVNode("div", _hoisted_2$X, [
          createVNode(script$1s, { msg: "TV" }),
          _hoisted_3$u,
          _hoisted_4$t
        ])
      ]))
    }
    }

    };

    class HubsApp$X extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$X, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$X = function (params = {}) {
        let app = new HubsApp$X(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$t = "https://resources.realitymedia.digital/vue-apps/dist/e914cb55b6a820ca.jpg";

    const _hoisted_1$W = {
      id: "room",
      class: "lightwall"
    };
    const _hoisted_2$W = /*#__PURE__*/createBaseVNode("div", {
      class: "headline squareoff",
      style: {"color":"white"}
    }, "18th century", -1 /* HOISTED */);
    const _hoisted_3$t = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$s = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$i = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_6$a = { class: "spacer-side" };
    const _hoisted_7$7 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_8$2 = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" Equirectangular Projection "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);
    const _hoisted_9$1 = /*#__PURE__*/createBaseVNode("div", { "xr-layer": "" }, [
      /*#__PURE__*/createBaseVNode("img", {
        class: "centerImg",
        height: "270",
        src: _imports_0$t
      })
    ], -1 /* HOISTED */);

    var script$W = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$W, [
          _hoisted_2$W,
          _hoisted_3$t,
          _hoisted_4$s,
          _hoisted_5$i,
          createBaseVNode("div", _hoisted_6$a, [
            createVNode(script$1s, { msg: "Equirectangular Projection" }),
            _hoisted_7$7,
            _hoisted_8$2
          ]),
          _hoisted_9$1
        ])
      ]))
    }
    }

    };

    class HubsApp$W extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$W, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$W = function (params = {}) {
        let app = new HubsApp$W(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$V = {
      id: "room",
      class: "lightwall"
    };
    const _hoisted_2$V = { class: "spacer-side" };
    const _hoisted_3$s = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$r = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" Sensorama "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);

    var script$V = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$V, [
          createBaseVNode("div", _hoisted_2$V, [
            createVNode(script$1s, { msg: "Sensorama" }),
            _hoisted_3$s,
            _hoisted_4$r
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$V extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$V, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$V = function (params = {}) {
        let app = new HubsApp$V(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$U = {
      id: "room",
      class: "lightwall"
    };
    const _hoisted_2$U = { class: "spacer-side" };
    const _hoisted_3$r = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$q = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" Immersive Rides "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);

    var script$U = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$U, [
          createBaseVNode("div", _hoisted_2$U, [
            createVNode(script$1s, { msg: "Immersive Rides" }),
            _hoisted_3$r,
            _hoisted_4$q
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$U extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$U, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$U = function (params = {}) {
        let app = new HubsApp$U(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$T = {
      id: "room",
      class: "lightwall"
    };
    const _hoisted_2$T = { class: "spacer-side" };
    const _hoisted_3$q = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$p = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" Theaters "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);

    var script$T = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$T, [
          createBaseVNode("div", _hoisted_2$T, [
            createVNode(script$1s, { msg: "Theaters" }),
            _hoisted_3$q,
            _hoisted_4$p
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$T extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$T, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$T = function (params = {}) {
        let app = new HubsApp$T(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$S = {
      id: "room",
      class: "lightwall"
    };
    const _hoisted_2$S = { class: "spacer-side" };
    const _hoisted_3$p = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$o = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" VR "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);

    var script$S = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$S, [
          createBaseVNode("div", _hoisted_2$S, [
            createVNode(script$1s, { msg: "Virtual Reality" }),
            _hoisted_3$p,
            _hoisted_4$o
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$S extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$S, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$S = function (params = {}) {
        let app = new HubsApp$S(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$R = {
      id: "room",
      class: "lightwall"
    };
    const _hoisted_2$R = { class: "spacer-side" };
    const _hoisted_3$o = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$n = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" AR "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);

    var script$R = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$R, [
          createBaseVNode("div", _hoisted_2$R, [
            createVNode(script$1s, { msg: "Augmented Reality" }),
            _hoisted_3$o,
            _hoisted_4$n
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$R extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$R, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$R = function (params = {}) {
        let app = new HubsApp$R(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$Q = {
      id: "room",
      class: "lightwall"
    };
    const _hoisted_2$Q = { class: "spacer-side" };
    const _hoisted_3$n = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$m = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" Google Street View "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);

    var script$Q = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$Q, [
          createBaseVNode("div", _hoisted_2$Q, [
            createVNode(script$1s, { msg: "Google Street View" }),
            _hoisted_3$n,
            _hoisted_4$m
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$Q extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$Q, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$Q = function (params = {}) {
        let app = new HubsApp$Q(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$P = /*#__PURE__*/createStaticVNode("<div id=\"room\" class=\"darkwall\"><div class=\"spacer-side\"><br><br><!-- &lt;Title msg=&quot;Aura&quot; /&gt; --><div class=\"headline\">Aura</div><br><br><div class=\"squareoff\"><p>In 1930s, Walter Benjamin introduced the concept of <em>aura</em> in The Work of Art in the Age of Mechanical Reproduction. Aura is the <em>here and now</em> that work possesses because of its unique history of production and transmissinowon. </p><br><p>AR applications are not perfect reproductive technologies, as some draw on the physical and cultural uniquesness, <em>the here and now</em> of particular places </p></div></div></div>", 1);
    const _hoisted_2$P = [
      _hoisted_1$P
    ];

    var script$P = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$P))
    }
    }

    };

    class HubsApp$P extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$P, width, height, params);
            //   this.isInteractive = true;
        }
    }
    var init$P = function (params = {}) {
        let app = new HubsApp$P(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$O = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "spacer-side" }, [
        /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
          /*#__PURE__*/createTextVNode(" \"These definitions circle around one core idea: that presence is a kind of absence, "),
          /*#__PURE__*/createBaseVNode("span", { class: "keyPoint" }, "the absence of mediation."),
          /*#__PURE__*/createTextVNode(" Presence as transportation, immersion, or realism all come down to the user's forgetting that the medium is there.\" ")
        ])
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$O = [
      _hoisted_1$O
    ];

    var script$O = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$O))
    }
    }

    };

    class HubsApp$O extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$O, width, height, params);
            //   this.isInteractive = true;
        }
    }
    var init$O = function (params = {}) {
        let app = new HubsApp$O(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$N = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$N = { class: "spacer-side" };
    const _hoisted_3$m = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$l = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$h = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "\"Casa Batlló, one of the masterpieces of Antoni Gaudí, can be experienced with the mobile AR, which visualizes the reconstructed interior and the design inspirations through 3D animations.\"", -1 /* HOISTED */);

    var script$N = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$N, [
          createBaseVNode("div", _hoisted_2$N, [
            createVNode(script$1s, { msg: "Gaudí's Casa Batlló with AR" }),
            _hoisted_3$m,
            _hoisted_4$l,
            _hoisted_5$h
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$N extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$N, width, height, params);
            //   this.isInteractive = true;
        }
    }
    var init$N = function (params = {}) {
        let app = new HubsApp$N(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$s = "https://resources.realitymedia.digital/vue-apps/dist/740518294e513122.jpg";

    const _hoisted_1$M = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("img", {
        "xr-layer": "",
        src: _imports_0$s,
        height: "326"
      })
    ], -1 /* HOISTED */);
    const _hoisted_2$M = [
      _hoisted_1$M
    ];

    var script$M = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$M))
    }
    }

    };

    class HubsApp$M extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$M, width, height, params);
            //   this.isInteractive = true;
        }
    }
    var init$M = function (params = {}) {
        let app = new HubsApp$M(600, 326, params);
        app.mount();
        return app;
    };

    const _hoisted_1$L = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$L = { class: "spacer-side" };
    const _hoisted_3$l = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createTextVNode(" The term cybersickness, or visually induced motion sickness, has been coined to describe symptoms including headache, nausea, eye strain, dizziness, fatigue, or even vomiting that may occur during or after exposure to a virtual environment. Cybersickness is visceral evidence that VR is not the medium to end all media. Cybersickness reminds the susceptible user of the medium in a powerful way. Nausea replaces astonishment. ")
    ], -1 /* HOISTED */);

    var script$L = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$L, [
          createBaseVNode("div", _hoisted_2$L, [
            createVNode(script$1s, { msg: "Cybersickness and the negation of presence" }),
            _hoisted_3$l
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$L extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$L, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$L = function (params = {}) {
        let app = new HubsApp$L(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$r = "https://resources.realitymedia.digital/vue-apps/dist/d3e564df2f84bc31.jpg";

    const _hoisted_1$K = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("img", {
        "xr-layer": "",
        src: _imports_0$r,
        height: "326"
      })
    ], -1 /* HOISTED */);
    const _hoisted_2$K = [
      _hoisted_1$K
    ];

    var script$K = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$K))
    }
    }

    };

    class HubsApp$K extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$K, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$K = function (params = {}) {
        let app = new HubsApp$K(600, 326, params);
        app.mount();
        return app;
    };

    const _hoisted_1$J = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$J = { class: "spacer-side" };
    const _hoisted_3$k = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$k = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$g = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_6$9 = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "Researchers have long pursued the idea of emotional reactions such as empathy as a test of presence. VR is understood as getting us closer to the authentic or the real. But forgetting the medium is not necessary for a sense of presence. Presence can be understood in a more nuanced way as a liminal zone between forgetting and acknowledging VR as a medium. ", -1 /* HOISTED */);

    var script$J = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$J, [
          createBaseVNode("div", _hoisted_2$J, [
            _hoisted_3$k,
            _hoisted_4$k,
            createVNode(script$1s, { msg: "Presence and Empathy" }),
            _hoisted_5$g,
            _hoisted_6$9
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$J extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$J, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$J = function (params = {}) {
        let app = new HubsApp$J(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$q = "https://resources.realitymedia.digital/vue-apps/dist/25ecf05f66df0777.jpg";

    const _hoisted_1$I = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "full" }, [
        /*#__PURE__*/createBaseVNode("img", {
          "xr-layer": "",
          src: _imports_0$q,
          height: "475"
        })
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$I = [
      _hoisted_1$I
    ];

    var script$I = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$I))
    }
    }

    };

    class HubsApp$I extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$I, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$I = function (params = {}) {
        let app = new HubsApp$I(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_1$1 = "https://resources.realitymedia.digital/vue-apps/dist/d1938b14fe1c27f4.png";

    var _imports_1 = "https://resources.realitymedia.digital/vue-apps/dist/aeb1fd379616a132.png";

    const _hoisted_1$H = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
        /*#__PURE__*/createBaseVNode("div", {
          class: "largerText",
          style: {"font-weight":"bold","text-align":"left"}
        }, "1. What is Presence?"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("div", { style: {"float":"right"} }, [
          /*#__PURE__*/createBaseVNode("img", {
            "xr-layer": "",
            src: _imports_1$1,
            width: "50",
            height: "50"
          })
        ]),
        /*#__PURE__*/createBaseVNode("div", {
          class: "postertitle",
          style: {"text-align":"left"}
        }, "2. Manifestations of Presence"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("div", { style: {"float":"right"} }, [
          /*#__PURE__*/createBaseVNode("img", {
            "xr-layer": "",
            src: _imports_1,
            width: "50",
            height: "50"
          })
        ]),
        /*#__PURE__*/createBaseVNode("div", {
          class: "postertitle",
          style: {"text-align":"left"}
        }, "3. Aura, Place and Space ")
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$H = [
      _hoisted_1$H
    ];

    var script$H = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$H))
    }
    }

    };

    class HubsApp$H extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$H, width, height, params);
            //     this.isInteractive = true;
        }
    }
    var init$H = function (params = {}) {
        let app = new HubsApp$H(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$p = "https://resources.realitymedia.digital/vue-apps/dist/46d7793fa7ab24ad.png";

    const _hoisted_1$G = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
        /*#__PURE__*/createBaseVNode("div", { style: {"font-size":"2.4rem","font-weight":"bold","text-align":"left"} }, "2. Manifestations of Presence"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("div", { style: {"float":"right"} }, [
          /*#__PURE__*/createBaseVNode("img", {
            "xr-layer": "",
            src: _imports_0$p,
            width: "50",
            height: "50"
          })
        ]),
        /*#__PURE__*/createBaseVNode("div", {
          class: "postertitle",
          style: {"text-align":"left"}
        }, "1. What is Presence?"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("div", { style: {"float":"right"} }, [
          /*#__PURE__*/createBaseVNode("img", {
            "xr-layer": "",
            src: _imports_1$1,
            width: "50",
            height: "50"
          })
        ]),
        /*#__PURE__*/createBaseVNode("div", {
          class: "postertitle",
          style: {"text-align":"left"}
        }, "3. Aura, Place and Space ")
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$G = [
      _hoisted_1$G
    ];

    var script$G = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$G))
    }
    }

    };

    class HubsApp$G extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$G, width, height, params);
            //     this.isInteractive = true;
        }
    }
    var init$G = function (params = {}) {
        let app = new HubsApp$G(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$o = "https://resources.realitymedia.digital/vue-apps/dist/f89cb4e350469b14.png";

    const _hoisted_1$F = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
        /*#__PURE__*/createBaseVNode("div", {
          class: "largerText",
          style: {"font-size":"2.8rem","font-weight":"bold","text-align":"left"}
        }, "3. Aura, Place and Space "),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("div", { style: {"float":"right"} }, [
          /*#__PURE__*/createBaseVNode("img", {
            "xr-layer": "",
            src: _imports_0$o,
            width: "50",
            height: "50"
          })
        ]),
        /*#__PURE__*/createBaseVNode("div", {
          class: "postertitle",
          style: {"text-align":"left"}
        }, "1. What is Presence?"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("div", { style: {"float":"right"} }, [
          /*#__PURE__*/createBaseVNode("img", {
            "xr-layer": "",
            src: _imports_1$1,
            width: "50",
            height: "50"
          })
        ]),
        /*#__PURE__*/createBaseVNode("div", {
          class: "postertitle",
          style: {"text-align":"left"}
        }, "2. Manifestations of Presence")
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$F = [
      _hoisted_1$F
    ];

    var script$F = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$F))
    }
    }

    };

    class HubsApp$F extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$F, width, height, params);
            //     this.isInteractive = true;
        }
    }
    var init$F = function (params = {}) {
        let app = new HubsApp$F(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$n = "https://resources.realitymedia.digital/vue-apps/dist/4905757374923259.png";

    const _hoisted_1$E = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$E = { class: "spacer-side" };
    const _hoisted_3$j = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$j = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$f = /*#__PURE__*/createBaseVNode("div", { style: {"float":"left","margin":"10px"} }, [
      /*#__PURE__*/createBaseVNode("img", {
        src: _imports_0$n,
        width: "20",
        height: "20"
      })
    ], -1 /* HOISTED */);
    const _hoisted_6$8 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_7$6 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_8$1 = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode("360"),
      /*#__PURE__*/createBaseVNode("span", null, "°"),
      /*#__PURE__*/createTextVNode(" film Clouds Over Sidra created by Chris Milk and Gabo Arora shows the life of Syrian refugees in Za'atari camp in Jordan. The camera follows 12-year old Sidra in her everyday life, allowing the users to be present with Sidra. ")
    ], -1 /* HOISTED */);
    const _hoisted_9 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_10 = /*#__PURE__*/createBaseVNode("blockquote", { class: "squareoff" }, "\"When you’re inside of the headset . . . you see full 360 degrees, in all directions. And when you’re sitting there in her room, watching her, you're not watching it through a television screen, you’re not watching it through a window, you’re sitting there with her. When you look down, you're sitting on the same ground that she’s sitting on. And because of that, you feel her humanity in a deeper way. You empathize with her in a deeper way. (Milk 2015)\"", -1 /* HOISTED */);

    var script$E = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$E, [
          createBaseVNode("div", _hoisted_2$E, [
            _hoisted_3$j,
            _hoisted_4$j,
            _hoisted_5$f,
            createVNode(script$1s, { msg: "Ultimate Empathy Machine" }),
            _hoisted_6$8,
            _hoisted_7$6,
            _hoisted_8$1,
            _hoisted_9,
            _hoisted_10
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$E extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$E, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$E = function (params = {}) {
        let app = new HubsApp$E(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$m = "https://resources.realitymedia.digital/vue-apps/dist/883881c7af4ee295.jpg";

    const _hoisted_1$D = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("img", {
        "xr-layer": "",
        src: _imports_0$m,
        height: "326"
      })
    ], -1 /* HOISTED */);
    const _hoisted_2$D = [
      _hoisted_1$D
    ];

    var script$D = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$D))
    }
    }

    };

    class HubsApp$D extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$D, width, height, params);
            //   this.isInteractive = true;
        }
    }
    var init$D = function (params = {}) {
        let app = new HubsApp$D(600, 326, params);
        app.mount();
        return app;
    };

    var _imports_0$l = "https://resources.realitymedia.digital/vue-apps/dist/d0da198fc94f906c.png";

    const _hoisted_1$C = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$C = { class: "spacer-side" };
    const _hoisted_3$i = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$i = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$e = /*#__PURE__*/createBaseVNode("div", { style: {"float":"right","margin":"10px"} }, [
      /*#__PURE__*/createBaseVNode("img", {
        src: _imports_0$l,
        width: "20",
        height: "20"
      })
    ], -1 /* HOISTED */);
    const _hoisted_6$7 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_7$5 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_8 = /*#__PURE__*/createBaseVNode("div", { "xr-layer": "" }, [
      /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
        /*#__PURE__*/createTextVNode("Nonnie de la Peña's "),
        /*#__PURE__*/createBaseVNode("a", {
          href: "https://embed.ted.com/talks/nonny_de_la_pena_the_future_of_news_virtual_reality",
          class: "alink",
          target: "_blank"
        }, "Ted Talk"),
        /*#__PURE__*/createTextVNode(" called 'The future of news?'' introduces a new form of journalism where Virtual Reality technology is used to put audience inside the stories. In her work, she created VR stories about imprisonment in Guantanamo and hunger in Los Angeles to induce empathy in the audience.")
      ])
    ], -1 /* HOISTED */);

    var script$C = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$C, [
          createBaseVNode("div", _hoisted_2$C, [
            _hoisted_3$i,
            _hoisted_4$i,
            _hoisted_5$e,
            createVNode(script$1s, { msg: "The future of news?" }),
            _hoisted_6$7,
            _hoisted_7$5,
            _hoisted_8
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$C extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$C, width, height, params);
            this.isInteractive = true;
        }
    }
    var init$C = function (params = {}) {
        let app = new HubsApp$C(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$k = "https://resources.realitymedia.digital/vue-apps/dist/801aa52e4d0113bc.jpg";

    const _hoisted_1$B = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("img", {
        "xr-layer": "",
        src: _imports_0$k,
        height: "326"
      })
    ], -1 /* HOISTED */);
    const _hoisted_2$B = [
      _hoisted_1$B
    ];

    var script$B = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$B))
    }
    }

    };

    class HubsApp$B extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$B, width, height, params);
            //   this.isInteractive = true;
        }
    }
    var init$B = function (params = {}) {
        let app = new HubsApp$B(600, 326, params);
        app.mount();
        return app;
    };

    var _imports_0$j = "https://resources.realitymedia.digital/vue-apps/dist/2176dc66f5a02546.png";

    const _hoisted_1$A = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$A = { class: "spacer-side" };
    const _hoisted_3$h = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$h = /*#__PURE__*/createBaseVNode("div", { style: {"float":"right","margin":"10px 0 0 15px"} }, [
      /*#__PURE__*/createBaseVNode("img", {
        "xr-layer": "",
        height: "225",
        src: _imports_0$j
      })
    ], -1 /* HOISTED */);
    const _hoisted_5$d = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "The Pit experiments were conducted by researchers at the University of North Carolina in the early 2000s, to establish empirical evidence of presence in virtual reality. They constructed a physical set, complete with platforms and walls, that matched the virtual scene. The subjects were asked to perform simple tasks that involved walking to the edge of a virtual pit. Researchers measured their physiological reactions to see if they experienced signs of fear, such as an accelerated heart beat. Pass through the portal to experience a replica of one version of their Pit Room yourself. ", -1 /* HOISTED */);

    var script$A = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$A, [
          createBaseVNode("div", _hoisted_2$A, [
            createVNode(script$1s, { msg: "Pit Experiement" }),
            _hoisted_3$h,
            _hoisted_4$h,
            _hoisted_5$d
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$A extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$A, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$A = function (params = {}) {
        let app = new HubsApp$A(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$i = "https://resources.realitymedia.digital/vue-apps/dist/1099517326626f39.jpg";

    const _hoisted_1$z = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$z = { class: "spacer-side" };
    const _hoisted_3$g = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$g = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createBaseVNode("div", { style: {"float":"right","margin":"0 0 0 15px"} }, [
        /*#__PURE__*/createBaseVNode("img", {
          "xr-layer": "",
          src: _imports_0$i,
          height: "400"
        })
      ]),
      /*#__PURE__*/createTextVNode(" This experiment was inspired by the VR \"pit\" experiment described on the wall to your left. The subjects wore AR headsets instead of VR ones. They could see the room around them, but the pit itself was still virtual. Would the subjects would feel the same measurable anxiety in AR as in VR? The subjects filled out a questionnaire after the experience and indicated that they did have a feeling of presence, but in this case, unlike in the VR experiment, the physiological data (heart rate etc.) did not indicate a response. "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createTextVNode(" Gandy, Maribeth, et al. 2010. “Experiences with an AR Evaluation Test Bed: Presence, Performance, and Physiological Measurement.” In 2010 IEEE International Symposium on Mixed and Augmented Reality, 127–36. Seoul, Korea (South): IEEE. https://doi.org/10.1109/ISMAR.2010.5643560. ")
    ], -1 /* HOISTED */);

    var script$z = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$z, [
          createBaseVNode("div", _hoisted_2$z, [
            createVNode(script$1s, { msg: "Presence in AR" }),
            _hoisted_3$g,
            _hoisted_4$g
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$z extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$z, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$z = function (params = {}) {
        let app = new HubsApp$z(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$y = /*#__PURE__*/createStaticVNode("<div id=\"room\" class=\"darkwall\"><div class=\"spacer-side\"><div class=\"postertitle\">Presence</div><div class=\"squareoff\">Presence is a kind of absence, the absence of mediation. If the users can forget that the medium is there, then they feel presence. <br><br> To look further, Lombard and Ditton&#39;s classification of presence is useful. They grouped definitions of presence into two categories, which are <br><br><div class=\"keyPoint\"> (1) individual perception of the world <br> (2) social interaction and engagement with others</div><br><br> The first category includes presence as transportation, as immersion and as realism. </div><br><br><div class=\"squareoff\" style=\"font-style:italic;\">&quot;VR and AR cannot deceive their users into believing that they are having a non-mediated experience. But that is not necessary for a sense of presence.&quot;</div></div></div>", 1);
    const _hoisted_2$y = [
      _hoisted_1$y
    ];

    var script$y = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$y))
    }
    }

    };

    class HubsApp$y extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$y, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$y = function (params = {}) {
        let app = new HubsApp$y(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$x = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$x = { class: "spacer-side" };
    const _hoisted_3$f = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$f = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$c = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_6$6 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_7$4 = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode("Treehugger: Wawona VR experience transports the users to the red giant Sequoia trees from the Sequoia National Park. It provides a sense of intimacy with the tree - with its bark, with the cells that make up its being. The vividness of the work illustrates "),
      /*#__PURE__*/createBaseVNode("em", null, "presence"),
      /*#__PURE__*/createTextVNode(". ")
    ], -1 /* HOISTED */);

    var script$x = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$x, [
          createBaseVNode("div", _hoisted_2$x, [
            _hoisted_3$f,
            _hoisted_4$f,
            createVNode(script$1s, { msg: "Treehugger: Wawona" }),
            _hoisted_5$c,
            _hoisted_6$6,
            _hoisted_7$4,
            createCommentVNode(" In this experience, users find themselves on the threshold of forgetting that we are having a VR experience. Being on that threshold is a sence of presence in a reality medium. ")
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$x extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$x, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$x = function (params = {}) {
        let app = new HubsApp$x(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$h = "https://resources.realitymedia.digital/vue-apps/dist/900c5c33cb50b0df.png";

    const _hoisted_1$w = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("img", {
        "xr-layer": "",
        src: _imports_0$h,
        height: "350"
      }),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("div", null, "Reality media have always been about presence. The legend of La Ciotat is a myth of presence, which you can explore in the gallery entitled \"What are Reality Media?\"")
    ], -1 /* HOISTED */);
    const _hoisted_2$w = [
      _hoisted_1$w
    ];

    var script$w = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$w))
    }
    }

    };

    class HubsApp$w extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$w, width, height, params);
            //   this.isInteractive = true;
        }
    }
    var init$w = function (params = {}) {
        let app = new HubsApp$w(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$g = "https://resources.realitymedia.digital/vue-apps/dist/89c91ebefe9504d1.png";

    const _hoisted_1$v = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("img", {
        "xr-layer": "",
        src: _imports_0$g,
        height: "475"
      })
    ], -1 /* HOISTED */);
    const _hoisted_2$v = [
      _hoisted_1$v
    ];

    var script$v = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$v))
    }
    }

    };

    class HubsApp$v extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$v, width, height, params);
            //    this.isInteractive = true;
        }
    }
    var init$v = function (params = {}) {
        let app = new HubsApp$v(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$u = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createCommentVNode(" <Title msg=\"The future of news?\" /> "),
        /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "Parthenon model explanation")
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$u = [
      _hoisted_1$u
    ];

    var script$u = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$u))
    }
    }

    };

    class HubsApp$u extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$u, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$u = function (params = {}) {
        let app = new HubsApp$u(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$f = "https://resources.realitymedia.digital/vue-apps/dist/495ecc58771c118d.jpg";

    const _hoisted_1$t = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("img", {
        "xr-layer": "",
        src: _imports_0$f,
        height: "326"
      })
    ], -1 /* HOISTED */);
    const _hoisted_2$t = [
      _hoisted_1$t
    ];

    var script$t = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$t))
    }
    }

    };

    class HubsApp$t extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$t, width, height, params);
            //   this.isInteractive = true;
        }
    }
    var init$t = function (params = {}) {
        let app = new HubsApp$t(600, 326, params);
        app.mount();
        return app;
    };

    const _hoisted_1$s = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$s = { class: "spacer-side" };
    const _hoisted_3$e = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$e = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$b = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, "The Franklin Institute in Philadelphia offered a mobile AR experience for their Terracotta Warrior exhibition. The app allowed visitors to use their smartphones to scan items and view various AR content to learn more about the history behind the clay soldiers.", -1 /* HOISTED */);

    var script$s = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$s, [
          createBaseVNode("div", _hoisted_2$s, [
            createVNode(script$1s, { msg: "Terracotta Warriors AR" }),
            _hoisted_3$e,
            _hoisted_4$e,
            _hoisted_5$b
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$s extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$s, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$s = function (params = {}) {
        let app = new HubsApp$s(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$r = { id: "room" };
    const _hoisted_2$r = { class: "spacer-side" };
    const _hoisted_3$d = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$d = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$a = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode("The experiments in the Pit Room required subjects to walk along the edges of the virtual pit while carrying an object (a book or a colored block). The physical room was designed to copy the virtual room: the subjects walked on actual wooden board, which they could feel through flimsy slippers that they were wearing. (This is called \"passive haptics.\") The subjects's heart rate, skin conductance, and skin temperature were monitored for changes. The goal was to establish empirical measures for the subjective feeling of presence. Changes in heart rate proved to be the best physical measure of presence, and the passive haptics were particularly effective. This version of the Pit model was provided by Rick Skarbez, and was used in one of the final sequence of experiments for the Pit researcher. "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("div", { class: "oblique" }, "R. Skarbez, F. P. Brooks and M. C. Whitton, \"Immersion and Coherence: Research Agenda and Early Results,\" in IEEE Transactions on Visualization and Computer Graphics, vol. 27, no. 10, pp. 3839-3850, 1 Oct. 2021, doi: 10.1109/TVCG.2020.2983701."),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);

    var script$r = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$r, [
          createBaseVNode("div", _hoisted_2$r, [
            _hoisted_3$d,
            createVNode(script$1s, { msg: "Pit Experiment" }),
            _hoisted_4$d,
            _hoisted_5$a
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$r extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$r, width, height, params);
        }
    }
    var init$r = function (params = {}) {
        let app = new HubsApp$r(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$q = { id: "room" };
    const _hoisted_2$q = { class: "spacer-side" };
    const _hoisted_3$c = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$c = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$9 = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createTextVNode(" To get a sense of what the experiment was like, you should visit this room in a head-worn VR display and walk around the pit instead of teleporting or using the controller to move. Note that the lack of \"passive haptics\" (the physical set used in the UNC experiment) will diminish the sense of vertigo that you feel compared to the participants in the original experiment. "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createTextVNode(" At each of the two locations marked with the red and blue arrows on the floor, stand on the arrow facing in the indicated direction, pick up a ball with your controller, and try to drop it on the target. (Head-Mounted Display devices such as Oculus Quests are recommended for this experiment.) ")
    ], -1 /* HOISTED */);
    const _hoisted_6$5 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_7$3 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);

    var script$q = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$q, [
          createBaseVNode("div", _hoisted_2$q, [
            _hoisted_3$c,
            createVNode(script$1s, { msg: "Instructions" }),
            _hoisted_4$c,
            _hoisted_5$9,
            _hoisted_6$5,
            _hoisted_7$3
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$q extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$q, width, height, params);
        }
    }
    var init$q = function (params = {}) {
        let app = new HubsApp$q(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$e = "https://resources.realitymedia.digital/vue-apps/dist/7e96bd7e1d27893a.jpg";

    const _hoisted_1$p = /*#__PURE__*/createBaseVNode("div", { id: "room" }, [
      /*#__PURE__*/createBaseVNode("div", { class: "spacer-side" }, [
        /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("div", { "xr-layer": "" }, [
            /*#__PURE__*/createBaseVNode("img", {
              class: "centerImg",
              height: "300",
              src: _imports_0$e
            })
          ]),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createTextVNode(" A view of the original Pit model. Shows a side view of the virtual environment. Subjects start in the Training Room and later enter the Pit Room. "),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("div", { class: "oblique" }, "Meehan, Michael, Brent Insko, Mary Whitton, and Frederick P Brooks. 2002. (Figure 1 in “Physiological Measures of Presence in Stressful Virtual Environments.” ACM Transactions on Graphics 21 (3): 645–52.)"),
          /*#__PURE__*/createBaseVNode("br")
        ])
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$p = [
      _hoisted_1$p
    ];

    var script$p = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$p))
    }
    }

    };

    class HubsApp$p extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$p, width, height, params);
        }
    }
    var init$p = function (params = {}) {
        let app = new HubsApp$p(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$d = "https://resources.realitymedia.digital/vue-apps/dist/64b90ca959e54ae2.jpg";

    const _hoisted_1$o = /*#__PURE__*/createBaseVNode("div", { id: "room" }, [
      /*#__PURE__*/createBaseVNode("div", { class: "spacer-side" }, [
        /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("div", { "xr-layer": "" }, [
            /*#__PURE__*/createBaseVNode("img", {
              class: "centerImg",
              height: "270",
              src: _imports_0$d
            })
          ]),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createTextVNode(" A subject wearing HMD and physiological monitoring equipment. Subjects also took their shoes off to better feel the edges of the platform. (Fig 3 in Meehan et al.) "),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("br")
        ])
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$o = [
      _hoisted_1$o
    ];

    var script$o = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$o))
    }
    }

    };

    class HubsApp$o extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$o, width, height, params);
        }
    }
    var init$o = function (params = {}) {
        let app = new HubsApp$o(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$n = /*#__PURE__*/createBaseVNode("div", { id: "room" }, [
      /*#__PURE__*/createBaseVNode("div", { class: "spacer-side" }, [
        /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createTextVNode(" We hypothesized that to the degree that a VE seems real, it would evoke physiological responses similar to those evoked by the corresponding real environment, and that greater presence would evoke a greater response. To examine this, we conducted three experiments, the results of which support the use of physiological reaction as a reliable, valid, sensitive, and objective presence measure. "),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("div", { class: "oblique" }, "Meehan, Michael, Brent Insko, Mary Whitton, and Frederick P Brooks. 2002. “Physiological Measures of Presence in Stressful Virtual Environments.” ACM Transactions on Graphics 21 (3): 645–52."),
          /*#__PURE__*/createBaseVNode("br")
        ])
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$n = [
      _hoisted_1$n
    ];

    var script$n = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$n))
    }
    }

    };

    class HubsApp$n extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$n, width, height, params);
        }
    }
    var init$n = function (params = {}) {
        let app = new HubsApp$n(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$m = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$m = { class: "spacer" };
    const _hoisted_3$b = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$b = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$8 = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createBaseVNode("i", null, "Reality Media"),
      /*#__PURE__*/createTextVNode(" is a project encompassing three writing spaces, three technologies for representing ideas: print, the web, and immersive VR. The printed page is a writing space with a tradition dating back to the fifteenth century (in Europe, much earlier in China). Obviously the web has a far shorter tradition, beginning around 1990. But in the thirty year since Tim Berners-Lee launched the first web server, the web has grown to rival print for many kinds of communication. The technologies for creating 3D graphic spaces in VR (and AR) actually predate the web. But only in the past 10 years have AR and VR become widely available media. The goal of RealityMedia is to demonstrate the potential range of AR and VR as communicative forms. ")
    ], -1 /* HOISTED */);

    var script$m = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$m, [
          createBaseVNode("div", _hoisted_2$m, [
            createVNode(script$1s, { msg: "Welcome to Reality Media!" }),
            _hoisted_3$b,
            _hoisted_4$b,
            _hoisted_5$8
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$m extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$m, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$m = function (params = {}) {
        let app = new HubsApp$m(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$c = "https://resources.realitymedia.digital/vue-apps/dist/3fb3b645bd6f6de6.jpg";

    const _hoisted_1$l = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$l = { class: "spacer" };
    const _hoisted_3$a = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$a = /*#__PURE__*/createBaseVNode("div", { style: {"float":"left","margin-right":"20px"} }, [
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("img", {
        "xr-layer": "",
        src: _imports_0$c,
        height: "383"
      })
    ], -1 /* HOISTED */);
    const _hoisted_5$7 = /*#__PURE__*/createStaticVNode("<div class=\"squareoff\"><div style=\"margin-left:30px;\">Published by <a href=\"https://mitpress.mit.edu/books/reality-media\" class=\"alink\">MIT Press</a></div><div class=\"oblique\">By Jay David Bolter, Maria Engberg and Blair MacIntyre</div><br><div class=\"quote\">How augmented reality and virtual reality are taking their places in contemporary media culture alongside film and television.</div></div>", 1);

    var script$l = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$l, [
          createBaseVNode("div", _hoisted_2$l, [
            createVNode(script$1s, { msg: "Reality Media" }),
            _hoisted_3$a,
            _hoisted_4$a,
            _hoisted_5$7
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$l extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$l, width, height, params);
            this.isInteractive = true;
        }
    }
    var init$l = function (params = {}) {
        let app = new HubsApp$l(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$k = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$k = { class: "spacer" };
    const _hoisted_3$9 = /*#__PURE__*/createBaseVNode("div", { "xr-layer": "" }, [
      /*#__PURE__*/createBaseVNode("div", {
        class: "squareoff",
        style: {"width":"380px"}
      }, [
        /*#__PURE__*/createTextVNode("Published by "),
        /*#__PURE__*/createBaseVNode("a", {
          href: "https://mitpress.mit.edu/books/reality-media",
          class: "alink"
        }, "MIT Press")
      ])
    ], -1 /* HOISTED */);
    const _hoisted_4$9 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$6 = /*#__PURE__*/createBaseVNode("div", { class: "oblique squareoff" }, "By Jay David Bolter, Maria Engberg and Blair MacIntyre", -1 /* HOISTED */);
    const _hoisted_6$4 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_7$2 = /*#__PURE__*/createBaseVNode("div", { class: "squareoff quote" }, "\"How augmented reality and virtual reality are taking their places in contemporary media culture alongside film and television.\" ", -1 /* HOISTED */);

    var script$k = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$k, [
          createBaseVNode("div", _hoisted_2$k, [
            createVNode(script$1s, { msg: "Book: Reality Media" }),
            _hoisted_3$9,
            _hoisted_4$9,
            _hoisted_5$6,
            _hoisted_6$4,
            _hoisted_7$2
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$k extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$k, width, height, params);
            this.isInteractive = true;
        }
    }
    var init$k = function (params = {}) {
        let app = new HubsApp$k(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$b = "https://resources.realitymedia.digital/vue-apps/dist/ab7985c65467fc96.jpg";

    const _hoisted_1$j = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$j = { class: "spacer" };
    const _hoisted_3$8 = /*#__PURE__*/createBaseVNode("img", {
      "xr-layer": "",
      src: _imports_0$b,
      height: "212"
    }, null, -1 /* HOISTED */);
    const _hoisted_4$8 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$5 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_6$3 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_7$1 = /*#__PURE__*/createBaseVNode("div", {
      "xr-layer": "",
      class: "squareoff"
    }, [
      /*#__PURE__*/createBaseVNode("em", null, "Realitymedia"),
      /*#__PURE__*/createTextVNode(" is built on top of Mozilla's open-source platform. An extensive guide to using Mozilla Hubs is available "),
      /*#__PURE__*/createBaseVNode("a", {
        href: "https://hubs.mozilla.com/docs/intro-hubs.html",
        target: "blank",
        class: "alink"
      }, "in the Hubs user documentation."),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createTextVNode(" Here are the highlights: "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createTextVNode(" Before entering, you are in the room's lobby. From here, you can see and hear what's going on inside the room, but you can only interact with others using text chat. "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br")
    ], -1 /* HOISTED */);

    var script$j = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$j, [
          createBaseVNode("div", _hoisted_2$j, [
            _hoisted_3$8,
            _hoisted_4$8,
            _hoisted_5$5,
            createVNode(script$1s, { msg: "The Hubs Platform" }),
            _hoisted_6$3,
            _hoisted_7$1
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$j extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$j, width, height, params);
            this.isInteractive = true;
        }
    }
    var init$j = function (params = {}) {
        let app = new HubsApp$j(600, 500, params);
        app.mount();
        return app;
    };

    const _hoisted_1$i = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
        /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("div", { class: "keyPoint" }, "To enter the room:"),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createTextVNode(" - On a desktop or mobile device, follow the prompts to select a name/avatar and enable the mic. "),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createTextVNode(" - On a VR headset, if you opened the URL on your desktop or smartphone, choose \"Enter on Standalone VR\" to create a code that makes it easy to open on your standalone headset. Open the browser in your VR headset, navigate to hubs.link and enter the code. "),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("div", { "xr-layer": "" }, [
            /*#__PURE__*/createBaseVNode("div", { class: "keyPoint" }, "To navigate in Hubs:"),
            /*#__PURE__*/createBaseVNode("br"),
            /*#__PURE__*/createTextVNode(" - On desktop use your WASD or arrow keys to move around. You can also press your right mouse button to teleport to a different location. Rotate your view using the Q and E keys, or hold down your left mouse button and drag. "),
            /*#__PURE__*/createBaseVNode("br"),
            /*#__PURE__*/createTextVNode(" - For VR and mobile controls, see the "),
            /*#__PURE__*/createBaseVNode("a", {
              href: "https://hubs.mozilla.com/docs/hubs-controls.html",
              target: "blank",
              class: "alink"
            }, "list of Hubs controls.")
          ])
        ])
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$i = [
      _hoisted_1$i
    ];

    var script$i = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$i))
    }
    }

    };

    class HubsApp$i extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$i, width, height, params);
            this.isInteractive = true;
        }
    }
    var init$i = function (params = {}) {
        let app = new HubsApp$i(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$a = "https://resources.realitymedia.digital/vue-apps/dist/b15807fada17de90.jpg";

    const _hoisted_1$h = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$h = { class: "spacer" };
    const _hoisted_3$7 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$7 = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, " The figure below indicates how to mute your microphone, take photos, share your screen, create media objects, and so on: ", -1 /* HOISTED */);
    const _hoisted_5$4 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_6$2 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_7 = /*#__PURE__*/createBaseVNode("img", {
      "xr-layer": "",
      src: _imports_0$a,
      height: "212"
    }, null, -1 /* HOISTED */);

    var script$h = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$h, [
          createBaseVNode("div", _hoisted_2$h, [
            createVNode(script$1s, { msg: "Features in Hubs" }),
            _hoisted_3$7,
            _hoisted_4$7,
            _hoisted_5$4,
            _hoisted_6$2,
            _hoisted_7
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$h extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$h, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$h = function (params = {}) {
        let app = new HubsApp$h(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$g = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$g = { class: "spacer" };
    const _hoisted_3$6 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$6 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);

    var script$g = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$g, [
          createBaseVNode("div", _hoisted_2$g, [
            createVNode(script$1s, { msg: "Standing on the Audio Pads will start the narration about the room or the sound of the video clip." }),
            _hoisted_3$6,
            _hoisted_4$6
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$g extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$g, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$g = function (params = {}) {
        let app = new HubsApp$g(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$9 = "https://resources.realitymedia.digital/vue-apps/dist/e7b4a0e2c07730f2.png";

    const _hoisted_1$f = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$f = { class: "spacer" };
    const _hoisted_3$5 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$5 = /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
      /*#__PURE__*/createBaseVNode("div", { class: "keyPoint" }, "Visit the exhibit with friends"),
      /*#__PURE__*/createTextVNode(" Sharing the URL of the room you are currently in will allow others to join your experience. "),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createBaseVNode("div", { class: "keyPoint" }, "Favorite your room"),
      /*#__PURE__*/createBaseVNode("img", {
        "xr-layer": "",
        src: _imports_0$9,
        height: "212"
      }),
      /*#__PURE__*/createBaseVNode("br"),
      /*#__PURE__*/createTextVNode(" Set your room as a favorite under the 'more' menu. Then, you can easily revisit the room from the list in the 'favorite rooms'. ")
    ], -1 /* HOISTED */);

    var script$f = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$f, [
          createBaseVNode("div", _hoisted_2$f, [
            createVNode(script$1s, { msg: "Other ways to use the room" }),
            _hoisted_3$5,
            _hoisted_4$5
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$f extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$f, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$f = function (params = {}) {
        let app = new HubsApp$f(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$8 = "https://resources.realitymedia.digital/vue-apps/dist/74d2e9fda186b0d5.png";

    const _hoisted_1$e = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("div", { class: "keyPoint" }, "Here is a map, which you will also find posted through the galleries"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("img", {
          "xr-layer": "",
          src: _imports_0$8,
          height: "400"
        })
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$e = [
      _hoisted_1$e
    ];

    var script$e = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$e))
    }
    }

    };

    class HubsApp$e extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$e, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$e = function (params = {}) {
        let app = new HubsApp$e(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$d = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "spacer" }, [
        /*#__PURE__*/createBaseVNode("div", { class: "squareoff" }, [
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createBaseVNode("br"),
          /*#__PURE__*/createTextVNode(" Each gallery in this “immersive book” corresponds to one or more chapters in the printed book and illustrates the themes of the printed chapter(s). (See the map on the far wall for the names/themes of the galleries.) For example, the gallery entitled “Presence” illustrates both presence and the related concept of aura and how computer scientists as well as filmmakers and designers have tried to evoke these reactions in visitors to their immersive applications. ")
        ])
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$d = [
      _hoisted_1$d
    ];

    var script$d = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$d))
    }
    }

    };

    class HubsApp$d extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$d, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$d = function (params = {}) {
        let app = new HubsApp$d(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$7 = "https://resources.realitymedia.digital/vue-apps/dist/6e7583d490ba2d6b.jpg";

    const _hoisted_1$c = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { "xr-layer": "" }, [
        /*#__PURE__*/createBaseVNode("a", {
          href: "https://realitymedia.digital/",
          target: "blank",
          class: "alink",
          style: {"fontSize":"1.5em"}
        }, "Click here to return back to the website"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("br"),
        /*#__PURE__*/createBaseVNode("img", {
          src: _imports_0$7,
          height: "400"
        })
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$c = [
      _hoisted_1$c
    ];

    var script$c = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$c))
    }
    }

    };

    class HubsApp$c extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$c, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$c = function () {
        let app = new HubsApp$c(600, 475);
        app.mount();
        return app;
    };

    const _hoisted_1$b = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$b = { class: "spacer" };
    const _hoisted_3$4 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$4 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);

    var script$b = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$b, [
          createBaseVNode("div", _hoisted_2$b, [
            _hoisted_3$4,
            _hoisted_4$4,
            createVNode(script$1s, { msg: "Back to the main exhibition" })
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$b extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$b, width, height, params);
            // this.isInteractive = true;
        }
    }
    var init$b = function (params = {}) {
        let app = new HubsApp$b(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$6 = "https://resources.realitymedia.digital/vue-apps/dist/38c52ab18d2fb9be.jpg";

    const _hoisted_1$a = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "full" }, [
        /*#__PURE__*/createBaseVNode("img", {
          "xr-layer": "",
          src: _imports_0$6
        })
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$a = [
      _hoisted_1$a
    ];

    var script$a = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$a))
    }
    }

    };

    class HubsApp$a extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$a, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$a = function (params = {}) {
        let app = new HubsApp$a(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$5 = "https://resources.realitymedia.digital/vue-apps/dist/ad1619da8b86e952.jpg";

    const _hoisted_1$9 = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "full" }, [
        /*#__PURE__*/createBaseVNode("img", {
          "xr-layer": "",
          src: _imports_0$5
        })
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$9 = [
      _hoisted_1$9
    ];

    var script$9 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$9))
    }
    }

    };

    class HubsApp$9 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$9, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$9 = function (params = {}) {
        let app = new HubsApp$9(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$4 = "https://resources.realitymedia.digital/vue-apps/dist/bf97de75e3d23199.jpg";

    const _hoisted_1$8 = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "full" }, [
        /*#__PURE__*/createBaseVNode("img", {
          "xr-layer": "",
          src: _imports_0$4
        })
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$8 = [
      _hoisted_1$8
    ];

    var script$8 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$8))
    }
    }

    };

    class HubsApp$8 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$8, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$8 = function (params = {}) {
        let app = new HubsApp$8(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$3 = "https://resources.realitymedia.digital/vue-apps/dist/19a105959cf918f7.jpg";

    const _hoisted_1$7 = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "full" }, [
        /*#__PURE__*/createBaseVNode("img", {
          "xr-layer": "",
          src: _imports_0$3
        })
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$7 = [
      _hoisted_1$7
    ];

    var script$7 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$7))
    }
    }

    };

    class HubsApp$7 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$7, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$7 = function (params = {}) {
        let app = new HubsApp$7(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$2 = "https://resources.realitymedia.digital/vue-apps/dist/beb846faed9d3054.jpg";

    const _hoisted_1$6 = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "full" }, [
        /*#__PURE__*/createBaseVNode("img", {
          "xr-layer": "",
          src: _imports_0$2
        })
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$6 = [
      _hoisted_1$6
    ];

    var script$6 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$6))
    }
    }

    };

    class HubsApp$6 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$6, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$6 = function (params = {}) {
        let app = new HubsApp$6(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0$1 = "https://resources.realitymedia.digital/vue-apps/dist/940850748d9451b6.jpg";

    const _hoisted_1$5 = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "full" }, [
        /*#__PURE__*/createBaseVNode("img", {
          "xr-layer": "",
          src: _imports_0$1
        })
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$5 = [
      _hoisted_1$5
    ];

    var script$5 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$5))
    }
    }

    };

    class HubsApp$5 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$5, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$5 = function (params = {}) {
        let app = new HubsApp$5(600, 475, params);
        app.mount();
        return app;
    };

    var _imports_0 = "https://resources.realitymedia.digital/vue-apps/dist/ef9917791d7b00b0.jpg";

    const _hoisted_1$4 = /*#__PURE__*/createBaseVNode("div", {
      id: "room",
      class: "darkwall"
    }, [
      /*#__PURE__*/createBaseVNode("div", { class: "full" }, [
        /*#__PURE__*/createBaseVNode("img", {
          "xr-layer": "",
          src: _imports_0
        })
      ])
    ], -1 /* HOISTED */);
    const _hoisted_2$4 = [
      _hoisted_1$4
    ];

    var script$4 = {
      setup(__props) {


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, _hoisted_2$4))
    }
    }

    };

    class HubsApp$4 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$4, width, height, params);
            //this.isInteractive = true;
        }
    }
    var init$4 = function (params = {}) {
        let app = new HubsApp$4(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$3 = { id: "room" };
    const _hoisted_2$3 = { class: "spacer" };
    const _hoisted_3$3 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$3 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_5$3 = { class: "squareoff" };



    var script$3 = {
      setup(__props) {

    let params = inject("params");
    var title = params && params.parameter1 ? params.parameter1 : "How to Use the Audio Pads";
    var body = params && params.parameter2 ? params.parameter2 : "start the narrations about the room you are currently in";


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$3, [
          createBaseVNode("div", _hoisted_2$3, [
            createVNode(script$1s, { msg: unref(title) }, null, 8 /* PROPS */, ["msg"]),
            _hoisted_3$3,
            _hoisted_4$3,
            createBaseVNode("div", _hoisted_5$3, "Standing on the Audio Pads will " + toDisplayString(unref(body)), 1 /* TEXT */)
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$3 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$3, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$3 = function (params = {}) {
        let app = new HubsApp$3(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$2 = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$2 = { class: "spacer-side" };
    const _hoisted_3$2 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$2 = { class: "squareoff labelTitle" };
    const _hoisted_5$2 = { class: "squareoff" };
    const _hoisted_6$1 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);



    var script$2 = {
      setup(__props) {

    let params = inject("params");
    var title = params && params.parameter1 ? params.parameter1 : " ";
    var body = params && params.parameter2 ? params.parameter2 : " ";


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$2, [
          createBaseVNode("div", _hoisted_2$2, [
            _hoisted_3$2,
            createCommentVNode("<Title v-bind:msg=\"title\" />"),
            createBaseVNode("div", _hoisted_4$2, toDisplayString(unref(title)), 1 /* TEXT */),
            createBaseVNode("div", _hoisted_5$2, toDisplayString(unref(body)), 1 /* TEXT */),
            _hoisted_6$1
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$2 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$2, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$2 = function (params = {}) {
        let app = new HubsApp$2(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1$1 = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2$1 = { class: "spacer-side" };
    const _hoisted_3$1 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4$1 = { class: "squareoff labelLgTitle" };
    const _hoisted_5$1 = { class: "squareoff labelLgBody" };
    const _hoisted_6 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);



    var script$1 = {
      setup(__props) {

    let params = inject("params");
    var title = params && params.parameter1 ? params.parameter1 : " ";
    var body = params && params.parameter2 ? params.parameter2 : " ";


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$1, [
          createBaseVNode("div", _hoisted_2$1, [
            _hoisted_3$1,
            createCommentVNode("<Title v-bind:msg=\"title\" />"),
            createBaseVNode("div", _hoisted_4$1, toDisplayString(unref(title)), 1 /* TEXT */),
            createBaseVNode("div", _hoisted_5$1, toDisplayString(unref(body)), 1 /* TEXT */),
            _hoisted_6
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp$1 extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script$1, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init$1 = function (params = {}) {
        let app = new HubsApp$1(600, 475, params);
        app.mount();
        return app;
    };

    const _hoisted_1 = {
      id: "room",
      class: "darkwall"
    };
    const _hoisted_2 = { class: "spacer-side" };
    const _hoisted_3 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);
    const _hoisted_4 = { class: "squareoff titleStyle" };
    const _hoisted_5 = /*#__PURE__*/createBaseVNode("br", null, null, -1 /* HOISTED */);



    var script = {
      setup(__props) {

    let params = inject("params");
    var title = params && params.parameter1 ? params.parameter1 : " ";


    return (_ctx, _cache) => {
      return (openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1, [
          createBaseVNode("div", _hoisted_2, [
            _hoisted_3,
            createCommentVNode("<Title v-bind:msg=\"title\" />"),
            createBaseVNode("div", _hoisted_4, toDisplayString(unref(title)), 1 /* TEXT */),
            _hoisted_5
          ])
        ])
      ]))
    }
    }

    };

    class HubsApp extends HubsApp$1u {
        constructor(width, height, params = {}) {
            super(script, width, height, params);
            //  this.isInteractive = true;
        }
    }
    var init = function (params = {}) {
        let app = new HubsApp(600, 475, params);
        app.mount();
        return app;
    };

    exports.AR = init$R;
    exports.ARVR_monolith = init$a;
    exports.Absence_Mediation = init$O;
    exports.Alyx = init$18;
    exports.Apparizione = init$14;
    exports.ArtBanner = init$11;
    exports.AudioPad = init$3;
    exports.AudioText = init$g;
    exports.Aura = init$P;
    exports.Back = init$c;
    exports.BeatSaber = init$16;
    exports.CameraObscura = init$_;
    exports.Center1 = init$1m;
    exports.Center2 = init$1l;
    exports.Center3 = init$1k;
    exports.Center4 = init$1j;
    exports.Center5 = init$1i;
    exports.Center6 = init$1h;
    exports.Center7 = init$1g;
    exports.Empathy = init$J;
    exports.Equirectangular = init$W;
    exports.Exit = init$b;
    exports.Film = init$Y;
    exports.Future_monolith = init$4;
    exports.GamesBanner = init$12;
    exports.Gaudi = init$N;
    exports.Gaudi_pic = init$M;
    exports.Genres_monolith = init$6;
    exports.GoogleStreetView = init$Q;
    exports.GraphLabel = init$1o;
    exports.Graphics_monolith = init$8;
    exports.History_monolith = init$9;
    exports.HubsFeatures = init$h;
    exports.HubsPlatform = init$j;
    exports.HubsPlatform2 = init$i;
    exports.ImmersiveRides = init$U;
    exports.Label = init$2;
    exports.Label_lg = init$1;
    exports.Laciotat = init$w;
    exports.LinearPerspective = init$10;
    exports.Mainmap_black = init$I;
    exports.Map = init$1n;
    exports.Milk = init$E;
    exports.Milk_pic = init$D;
    exports.Minecraft = init$13;
    exports.MitPress = init$l;
    exports.MitText = init$k;
    exports.Monolith1 = init$1f;
    exports.Monolith2 = init$1e;
    exports.Monolith3 = init$1d;
    exports.Monolith4 = init$1c;
    exports.Monolith5 = init$1b;
    exports.Monolith6 = init$1a;
    exports.Monolith7 = init$19;
    exports.Nonnie = init$C;
    exports.Nonnie_pic = init$B;
    exports.Overview = init$d;
    exports.Panorama = init$$;
    exports.Parthenon = init$u;
    exports.Photography = init$Z;
    exports.Pit = init$r;
    exports.PitInstruction = init$q;
    exports.Pit_AR = init$z;
    exports.Pit_Experiment = init$A;
    exports.PlaceandSpace = init$v;
    exports.Pokemon = init$17;
    exports.PortalSubtitle = init$1p;
    exports.PortalTitle = init$1q;
    exports.Presence = init$y;
    exports.Presence_map = init$H;
    exports.Presence_map2 = init$G;
    exports.Presence_map3 = init$F;
    exports.Presence_monolith = init$7;
    exports.Privacy_monolith = init$5;
    exports.Sensorama = init$V;
    exports.Sharing = init$f;
    exports.TV = init$X;
    exports.Terracotta = init$s;
    exports.TerracottaPic = init$t;
    exports.Theaters = init$T;
    exports.Title = init;
    exports.Treehugger = init$x;
    exports.VR = init$S;
    exports.WalkingDead = init$15;
    exports.Welcome = init$m;
    exports.cybersickness = init$L;
    exports.cybersickness_pic = init$K;
    exports.hubsTest1 = init$1t;
    exports.hubsTest2 = init$1s;
    exports.hubsTest3 = init$1r;
    exports.initializeEthereal = initializeEthereal;
    exports.pitSign1 = init$p;
    exports.pitSign2 = init$o;
    exports.pitSign3 = init$n;
    exports.rotundaMap = init$e;
    exports.systemTick = systemTick;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, THREE);