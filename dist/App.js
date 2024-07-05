/** @returns {void} */
function noop$1() {}

/**
 * @template T
 * @template S
 * @param {T} tar
 * @param {S} src
 * @returns {T & S}
 */
function assign(tar, src) {
	// @ts-ignore
	for (const k in src) tar[k] = src[k];
	return /** @type {T & S} */ (tar);
}

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
function is_function(thing) {
	return typeof thing === 'function';
}

/** @returns {boolean} */
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

/** @returns {boolean} */
function is_empty(obj) {
	return Object.keys(obj).length === 0;
}

function subscribe(store, ...callbacks) {
	if (store == null) {
		for (const callback of callbacks) {
			callback(undefined);
		}
		return noop$1;
	}
	const unsub = store.subscribe(...callbacks);
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}

function create_slot(definition, ctx, $$scope, fn) {
	if (definition) {
		const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
		return definition[0](slot_ctx);
	}
}

function get_slot_context(definition, ctx, $$scope, fn) {
	return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
}

function get_slot_changes(definition, $$scope, dirty, fn) {
	if (definition[2] && fn) {
		const lets = definition[2](fn(dirty));
		if ($$scope.dirty === undefined) {
			return lets;
		}
		if (typeof lets === 'object') {
			const merged = [];
			const len = Math.max($$scope.dirty.length, lets.length);
			for (let i = 0; i < len; i += 1) {
				merged[i] = $$scope.dirty[i] | lets[i];
			}
			return merged;
		}
		return $$scope.dirty | lets;
	}
	return $$scope.dirty;
}

/** @returns {void} */
function update_slot_base(
	slot,
	slot_definition,
	ctx,
	$$scope,
	slot_changes,
	get_slot_context_fn
) {
	if (slot_changes) {
		const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
		slot.p(slot_context, slot_changes);
	}
}

/** @returns {any[] | -1} */
function get_all_dirty_from_scope($$scope) {
	if ($$scope.ctx.length > 32) {
		const dirty = [];
		const length = $$scope.ctx.length / 32;
		for (let i = 0; i < length; i++) {
			dirty[i] = -1;
		}
		return dirty;
	}
	return -1;
}

/** @returns {{}} */
function exclude_internal_props(props) {
	const result = {};
	for (const k in props) if (k[0] !== '$') result[k] = props[k];
	return result;
}

/** @returns {{}} */
function compute_rest_props(props, keys) {
	const rest = {};
	keys = new Set(keys);
	for (const k in props) if (!keys.has(k) && k[0] !== '$') rest[k] = props[k];
	return rest;
}

function action_destroyer(action_result) {
	return action_result && is_function(action_result.destroy) ? action_result.destroy : noop$1;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @returns {void}
 */
function append(target, node) {
	target.appendChild(node);
}

/**
 * @param {Node} target
 * @param {Node} node
 * @param {Node} [anchor]
 * @returns {void}
 */
function insert(target, node, anchor) {
	target.insertBefore(node, anchor || null);
}

/**
 * @param {Node} node
 * @returns {void}
 */
function detach(node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

/**
 * @returns {void} */
function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} name
 * @returns {HTMLElementTagNameMap[K]}
 */
function element(name) {
	return document.createElement(name);
}

/**
 * @template {keyof SVGElementTagNameMap} K
 * @param {K} name
 * @returns {SVGElement}
 */
function svg_element(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

/**
 * @param {string} data
 * @returns {Text}
 */
function text(data) {
	return document.createTextNode(data);
}

/**
 * @returns {Text} */
function space() {
	return text(' ');
}

/**
 * @returns {Text} */
function empty() {
	return text('');
}

/**
 * @param {EventTarget} node
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
 * @returns {() => void}
 */
function listen(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

/**
 * @param {Element} node
 * @param {string} attribute
 * @param {string} [value]
 * @returns {void}
 */
function attr(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}
/**
 * List of attributes that should always be set through the attr method,
 * because updating them through the property setter doesn't work reliably.
 * In the example of `width`/`height`, the problem is that the setter only
 * accepts numeric values, but the attribute can also be set to a string like `50%`.
 * If this list becomes too big, rethink this approach.
 */
const always_set_through_set_attribute = ['width', 'height'];

/**
 * @param {Element & ElementCSSInlineStyle} node
 * @param {{ [x: string]: string }} attributes
 * @returns {void}
 */
function set_attributes(node, attributes) {
	// @ts-ignore
	const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
	for (const key in attributes) {
		if (attributes[key] == null) {
			node.removeAttribute(key);
		} else if (key === 'style') {
			node.style.cssText = attributes[key];
		} else if (key === '__value') {
			/** @type {any} */ (node).value = node[key] = attributes[key];
		} else if (
			descriptors[key] &&
			descriptors[key].set &&
			always_set_through_set_attribute.indexOf(key) === -1
		) {
			node[key] = attributes[key];
		} else {
			attr(node, key, attributes[key]);
		}
	}
}

/**
 * @param {Element & ElementCSSInlineStyle} node
 * @param {{ [x: string]: string }} attributes
 * @returns {void}
 */
function set_svg_attributes(node, attributes) {
	for (const key in attributes) {
		attr(node, key, attributes[key]);
	}
}

/**
 * @param {Record<string, unknown>} data_map
 * @returns {void}
 */
function set_custom_element_data_map(node, data_map) {
	Object.keys(data_map).forEach((key) => {
		set_custom_element_data(node, key, data_map[key]);
	});
}

/**
 * @returns {void} */
function set_custom_element_data(node, prop, value) {
	const lower = prop.toLowerCase(); // for backwards compatibility with existing behavior we do lowercase first
	if (lower in node) {
		node[lower] = typeof node[lower] === 'boolean' && value === '' ? true : value;
	} else if (prop in node) {
		node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
	} else {
		attr(node, prop, value);
	}
}

/**
 * @param {string} tag
 */
function set_dynamic_element_data(tag) {
	return /-/.test(tag) ? set_custom_element_data_map : set_attributes;
}

/**
 * @param {Element} element
 * @returns {ChildNode[]}
 */
function children(element) {
	return Array.from(element.childNodes);
}

/**
 * @returns {void} */
function set_input_value(input, value) {
	input.value = value == null ? '' : value;
}

/**
 * @typedef {Node & {
 * 	claim_order?: number;
 * 	hydrate_init?: true;
 * 	actual_end_child?: NodeEx;
 * 	childNodes: NodeListOf<NodeEx>;
 * }} NodeEx
 */

/** @typedef {ChildNode & NodeEx} ChildNodeEx */

/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

/**
 * @typedef {ChildNodeEx[] & {
 * 	claim_info?: {
 * 		last_index: number;
 * 		total_claimed: number;
 * 	};
 * }} ChildNodeArray
 */

let current_component;

/** @returns {void} */
function set_current_component(component) {
	current_component = component;
}

// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
/**
 * @param component
 * @param event
 * @returns {void}
 */
function bubble(component, event) {
	const callbacks = component.$$.callbacks[event.type];
	if (callbacks) {
		// @ts-ignore
		callbacks.slice().forEach((fn) => fn.call(this, event));
	}
}

const dirty_components = [];
const binding_callbacks = [];

let render_callbacks = [];

const flush_callbacks = [];

const resolved_promise = /* @__PURE__ */ Promise.resolve();

let update_scheduled = false;

/** @returns {void} */
function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}

/** @returns {void} */
function add_render_callback(fn) {
	render_callbacks.push(fn);
}

// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();

let flushidx = 0; // Do *not* move this inside the flush() function

/** @returns {void} */
function flush() {
	// Do not reenter flush while dirty components are updated, as this can
	// result in an infinite loop. Instead, let the inner flush handle it.
	// Reentrancy is ok afterwards for bindings etc.
	if (flushidx !== 0) {
		return;
	}
	const saved_component = current_component;
	do {
		// first, call beforeUpdate functions
		// and update components
		try {
			while (flushidx < dirty_components.length) {
				const component = dirty_components[flushidx];
				flushidx++;
				set_current_component(component);
				update(component.$$);
			}
		} catch (e) {
			// reset dirty state to not end up in a deadlocked state and then rethrow
			dirty_components.length = 0;
			flushidx = 0;
			throw e;
		}
		set_current_component(null);
		dirty_components.length = 0;
		flushidx = 0;
		while (binding_callbacks.length) binding_callbacks.pop()();
		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		for (let i = 0; i < render_callbacks.length; i += 1) {
			const callback = render_callbacks[i];
			if (!seen_callbacks.has(callback)) {
				// ...so guard against infinite loops
				seen_callbacks.add(callback);
				callback();
			}
		}
		render_callbacks.length = 0;
	} while (dirty_components.length);
	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}
	update_scheduled = false;
	seen_callbacks.clear();
	set_current_component(saved_component);
}

/** @returns {void} */
function update($$) {
	if ($$.fragment !== null) {
		$$.update();
		run_all($$.before_update);
		const dirty = $$.dirty;
		$$.dirty = [-1];
		$$.fragment && $$.fragment.p($$.ctx, dirty);
		$$.after_update.forEach(add_render_callback);
	}
}

/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 * @param {Function[]} fns
 * @returns {void}
 */
function flush_render_callbacks(fns) {
	const filtered = [];
	const targets = [];
	render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
	targets.forEach((c) => c());
	render_callbacks = filtered;
}

const outroing = new Set();

/**
 * @type {Outro}
 */
let outros;

/**
 * @returns {void} */
function group_outros() {
	outros = {
		r: 0,
		c: [],
		p: outros // parent group
	};
}

/**
 * @returns {void} */
function check_outros() {
	if (!outros.r) {
		run_all(outros.c);
	}
	outros = outros.p;
}

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} [local]
 * @returns {void}
 */
function transition_in(block, local) {
	if (block && block.i) {
		outroing.delete(block);
		block.i(local);
	}
}

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} local
 * @param {0 | 1} [detach]
 * @param {() => void} [callback]
 * @returns {void}
 */
function transition_out(block, local, detach, callback) {
	if (block && block.o) {
		if (outroing.has(block)) return;
		outroing.add(block);
		outros.c.push(() => {
			outroing.delete(block);
			if (callback) {
				if (detach) block.d(1);
				callback();
			}
		});
		block.o(local);
	} else if (callback) {
		callback();
	}
}

/** @typedef {1} INTRO */
/** @typedef {0} OUTRO */
/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

/**
 * @typedef {Object} Outro
 * @property {number} r
 * @property {Function[]} c
 * @property {Object} p
 */

/**
 * @typedef {Object} PendingProgram
 * @property {number} start
 * @property {INTRO|OUTRO} b
 * @property {Outro} [group]
 */

/**
 * @typedef {Object} Program
 * @property {number} a
 * @property {INTRO|OUTRO} b
 * @property {1|-1} d
 * @property {number} duration
 * @property {number} start
 * @property {number} end
 * @property {Outro} [group]
 */

// general each functions:

function ensure_array_like(array_like_or_iterator) {
	return array_like_or_iterator?.length !== undefined
		? array_like_or_iterator
		: Array.from(array_like_or_iterator);
}

/** @returns {{}} */
function get_spread_update(levels, updates) {
	const update = {};
	const to_null_out = {};
	const accounted_for = { $$scope: 1 };
	let i = levels.length;
	while (i--) {
		const o = levels[i];
		const n = updates[i];
		if (n) {
			for (const key in o) {
				if (!(key in n)) to_null_out[key] = 1;
			}
			for (const key in n) {
				if (!accounted_for[key]) {
					update[key] = n[key];
					accounted_for[key] = 1;
				}
			}
			levels[i] = n;
		} else {
			for (const key in o) {
				accounted_for[key] = 1;
			}
		}
	}
	for (const key in to_null_out) {
		if (!(key in update)) update[key] = undefined;
	}
	return update;
}

function get_spread_object(spread_props) {
	return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}

/** @returns {void} */
function create_component(block) {
	block && block.c();
}

/** @returns {void} */
function mount_component(component, target, anchor) {
	const { fragment, after_update } = component.$$;
	fragment && fragment.m(target, anchor);
	// onMount happens before the initial afterUpdate
	add_render_callback(() => {
		const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
		// if the component was destroyed immediately
		// it will update the `$$.on_destroy` reference to `null`.
		// the destructured on_destroy may still reference to the old array
		if (component.$$.on_destroy) {
			component.$$.on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});
	after_update.forEach(add_render_callback);
}

/** @returns {void} */
function destroy_component(component, detaching) {
	const $$ = component.$$;
	if ($$.fragment !== null) {
		flush_render_callbacks($$.after_update);
		run_all($$.on_destroy);
		$$.fragment && $$.fragment.d(detaching);
		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		$$.on_destroy = $$.fragment = null;
		$$.ctx = [];
	}
}

/** @returns {void} */
function make_dirty(component, i) {
	if (component.$$.dirty[0] === -1) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty.fill(0);
	}
	component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
}

// TODO: Document the other params
/**
 * @param {SvelteComponent} component
 * @param {import('./public.js').ComponentConstructorOptions} options
 *
 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
 * This will be the `add_css` function from the compiled component.
 *
 * @returns {void}
 */
function init(
	component,
	options,
	instance,
	create_fragment,
	not_equal,
	props,
	append_styles = null,
	dirty = [-1]
) {
	const parent_component = current_component;
	set_current_component(component);
	/** @type {import('./private.js').T$$} */
	const $$ = (component.$$ = {
		fragment: null,
		ctx: [],
		// state
		props,
		update: noop$1,
		not_equal,
		bound: blank_object(),
		// lifecycle
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
		// everything else
		callbacks: blank_object(),
		dirty,
		skip_bound: false,
		root: options.target || parent_component.$$.root
	});
	append_styles && append_styles($$.root);
	let ready = false;
	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
				const value = rest.length ? rest[0] : ret;
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
					if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
					if (ready) make_dirty(component, i);
				}
				return ret;
		  })
		: [];
	$$.update();
	ready = true;
	run_all($$.before_update);
	// `false` as a special case of no DOM component
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	if (options.target) {
		if (options.hydrate) {
			// TODO: what is the correct type here?
			// @ts-expect-error
			const nodes = children(options.target);
			$$.fragment && $$.fragment.l(nodes);
			nodes.forEach(detach);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.c();
		}
		if (options.intro) transition_in(component.$$.fragment);
		mount_component(component, options.target, options.anchor);
		flush();
	}
	set_current_component(parent_component);
}

/**
 * Base class for Svelte components. Used when dev=false.
 *
 * @template {Record<string, any>} [Props=any]
 * @template {Record<string, any>} [Events=any]
 */
class SvelteComponent {
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$ = undefined;
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$set = undefined;

	/** @returns {void} */
	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop$1;
	}

	/**
	 * @template {Extract<keyof Events, string>} K
	 * @param {K} type
	 * @param {((e: Events[K]) => void) | null | undefined} callback
	 * @returns {() => void}
	 */
	$on(type, callback) {
		if (!is_function(callback)) {
			return noop$1;
		}
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
		callbacks.push(callback);
		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	/**
	 * @param {Partial<Props>} props
	 * @returns {void}
	 */
	$set(props) {
		if (this.$$set && !is_empty(props)) {
			this.$$.skip_bound = true;
			this.$$set(props);
			this.$$.skip_bound = false;
		}
	}
}

/**
 * @typedef {Object} CustomElementPropDefinition
 * @property {string} [attribute]
 * @property {boolean} [reflect]
 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
 */

// generated during release, do not modify

const PUBLIC_VERSION = '4';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

/**
 * @license lucide-svelte v0.399.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const defaultAttributes = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
};

/* node_modules\lucide-svelte\dist\Icon.svelte generated by Svelte v4.2.18 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[11] = list[i][0];
	child_ctx[12] = list[i][1];
	return child_ctx;
}

// (35:4) <svelte:element this={tag} {...attrs}/>
function create_dynamic_element$1(ctx) {
	let svelte_element;
	let svelte_element_levels = [/*attrs*/ ctx[12]];
	let svelte_element_data = {};

	for (let i = 0; i < svelte_element_levels.length; i += 1) {
		svelte_element_data = assign(svelte_element_data, svelte_element_levels[i]);
	}

	return {
		c() {
			svelte_element = svg_element(/*tag*/ ctx[11]);
			set_svg_attributes(svelte_element, svelte_element_data);
		},
		m(target, anchor) {
			insert(target, svelte_element, anchor);
		},
		p(ctx, dirty) {
			set_svg_attributes(svelte_element, svelte_element_data = get_spread_update(svelte_element_levels, [dirty & /*iconNode*/ 32 && /*attrs*/ ctx[12]]));
		},
		d(detaching) {
			if (detaching) {
				detach(svelte_element);
			}
		}
	};
}

// (34:2) {#each iconNode as [tag, attrs]}
function create_each_block(ctx) {
	let previous_tag = /*tag*/ ctx[11];
	let svelte_element_anchor;
	let svelte_element = /*tag*/ ctx[11] && create_dynamic_element$1(ctx);

	return {
		c() {
			if (svelte_element) svelte_element.c();
			svelte_element_anchor = empty();
		},
		m(target, anchor) {
			if (svelte_element) svelte_element.m(target, anchor);
			insert(target, svelte_element_anchor, anchor);
		},
		p(ctx, dirty) {
			if (/*tag*/ ctx[11]) {
				if (!previous_tag) {
					svelte_element = create_dynamic_element$1(ctx);
					previous_tag = /*tag*/ ctx[11];
					svelte_element.c();
					svelte_element.m(svelte_element_anchor.parentNode, svelte_element_anchor);
				} else if (safe_not_equal(previous_tag, /*tag*/ ctx[11])) {
					svelte_element.d(1);
					svelte_element = create_dynamic_element$1(ctx);
					previous_tag = /*tag*/ ctx[11];
					svelte_element.c();
					svelte_element.m(svelte_element_anchor.parentNode, svelte_element_anchor);
				} else {
					svelte_element.p(ctx, dirty);
				}
			} else if (previous_tag) {
				svelte_element.d(1);
				svelte_element = null;
				previous_tag = /*tag*/ ctx[11];
			}
		},
		d(detaching) {
			if (detaching) {
				detach(svelte_element_anchor);
			}

			if (svelte_element) svelte_element.d(detaching);
		}
	};
}

function create_fragment$3(ctx) {
	let svg;
	let each_1_anchor;
	let svg_stroke_width_value;
	let svg_class_value;
	let current;
	let each_value = ensure_array_like(/*iconNode*/ ctx[5]);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const default_slot_template = /*#slots*/ ctx[10].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

	let svg_levels = [
		defaultAttributes,
		/*$$restProps*/ ctx[7],
		{ width: /*size*/ ctx[2] },
		{ height: /*size*/ ctx[2] },
		{ stroke: /*color*/ ctx[1] },
		{
			"stroke-width": svg_stroke_width_value = /*absoluteStrokeWidth*/ ctx[4]
			? Number(/*strokeWidth*/ ctx[3]) * 24 / Number(/*size*/ ctx[2])
			: /*strokeWidth*/ ctx[3]
		},
		{
			class: svg_class_value = /*mergeClasses*/ ctx[6]('lucide-icon', 'lucide', /*name*/ ctx[0] ? `lucide-${/*name*/ ctx[0]}` : '', /*$$props*/ ctx[8].class)
		}
	];

	let svg_data = {};

	for (let i = 0; i < svg_levels.length; i += 1) {
		svg_data = assign(svg_data, svg_levels[i]);
	}

	return {
		c() {
			svg = svg_element("svg");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
			if (default_slot) default_slot.c();
			set_svg_attributes(svg, svg_data);
		},
		m(target, anchor) {
			insert(target, svg, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(svg, null);
				}
			}

			append(svg, each_1_anchor);

			if (default_slot) {
				default_slot.m(svg, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (dirty & /*iconNode*/ 32) {
				each_value = ensure_array_like(/*iconNode*/ ctx[5]);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(svg, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[9],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
						null
					);
				}
			}

			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
				defaultAttributes,
				dirty & /*$$restProps*/ 128 && /*$$restProps*/ ctx[7],
				(!current || dirty & /*size*/ 4) && { width: /*size*/ ctx[2] },
				(!current || dirty & /*size*/ 4) && { height: /*size*/ ctx[2] },
				(!current || dirty & /*color*/ 2) && { stroke: /*color*/ ctx[1] },
				(!current || dirty & /*absoluteStrokeWidth, strokeWidth, size*/ 28 && svg_stroke_width_value !== (svg_stroke_width_value = /*absoluteStrokeWidth*/ ctx[4]
				? Number(/*strokeWidth*/ ctx[3]) * 24 / Number(/*size*/ ctx[2])
				: /*strokeWidth*/ ctx[3])) && { "stroke-width": svg_stroke_width_value },
				(!current || dirty & /*name, $$props*/ 257 && svg_class_value !== (svg_class_value = /*mergeClasses*/ ctx[6]('lucide-icon', 'lucide', /*name*/ ctx[0] ? `lucide-${/*name*/ ctx[0]}` : '', /*$$props*/ ctx[8].class))) && { class: svg_class_value }
			]));
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) {
				detach(svg);
			}

			destroy_each(each_blocks, detaching);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	const omit_props_names = ["name","color","size","strokeWidth","absoluteStrokeWidth","iconNode"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { name = undefined } = $$props;
	let { color = 'currentColor' } = $$props;
	let { size = 24 } = $$props;
	let { strokeWidth = 2 } = $$props;
	let { absoluteStrokeWidth = false } = $$props;
	let { iconNode = [] } = $$props;

	const mergeClasses = (...classes) => classes.filter((className, index, array) => {
		return Boolean(className) && array.indexOf(className) === index;
	}).join(' ');

	$$self.$$set = $$new_props => {
		$$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		$$invalidate(7, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('name' in $$new_props) $$invalidate(0, name = $$new_props.name);
		if ('color' in $$new_props) $$invalidate(1, color = $$new_props.color);
		if ('size' in $$new_props) $$invalidate(2, size = $$new_props.size);
		if ('strokeWidth' in $$new_props) $$invalidate(3, strokeWidth = $$new_props.strokeWidth);
		if ('absoluteStrokeWidth' in $$new_props) $$invalidate(4, absoluteStrokeWidth = $$new_props.absoluteStrokeWidth);
		if ('iconNode' in $$new_props) $$invalidate(5, iconNode = $$new_props.iconNode);
		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
	};

	$$props = exclude_internal_props($$props);

	return [
		name,
		color,
		size,
		strokeWidth,
		absoluteStrokeWidth,
		iconNode,
		mergeClasses,
		$$restProps,
		$$props,
		$$scope,
		slots
	];
}

class Icon extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
			name: 0,
			color: 1,
			size: 2,
			strokeWidth: 3,
			absoluteStrokeWidth: 4,
			iconNode: 5
		});
	}
}

/* node_modules\lucide-svelte\dist\icons\skull.svelte generated by Svelte v4.2.18 */

function create_default_slot$1(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[2].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

	return {
		c() {
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[3],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
						null
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function create_fragment$2(ctx) {
	let icon;
	let current;
	const icon_spread_levels = [{ name: "skull" }, /*$$props*/ ctx[1], { iconNode: /*iconNode*/ ctx[0] }];

	let icon_props = {
		$$slots: { default: [create_default_slot$1] },
		$$scope: { ctx }
	};

	for (let i = 0; i < icon_spread_levels.length; i += 1) {
		icon_props = assign(icon_props, icon_spread_levels[i]);
	}

	icon = new Icon({ props: icon_props });

	return {
		c() {
			create_component(icon.$$.fragment);
		},
		m(target, anchor) {
			mount_component(icon, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const icon_changes = (dirty & /*$$props, iconNode*/ 3)
			? get_spread_update(icon_spread_levels, [
					icon_spread_levels[0],
					dirty & /*$$props*/ 2 && get_spread_object(/*$$props*/ ctx[1]),
					dirty & /*iconNode*/ 1 && { iconNode: /*iconNode*/ ctx[0] }
				])
			: {};

			if (dirty & /*$$scope*/ 8) {
				icon_changes.$$scope = { dirty, ctx };
			}

			icon.$set(icon_changes);
		},
		i(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(icon, detaching);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;

	const iconNode = [
		["circle", { "cx": "9", "cy": "12", "r": "1" }],
		["circle", { "cx": "15", "cy": "12", "r": "1" }],
		["path", { "d": "M8 20v2h8v-2" }],
		["path", { "d": "m12.5 17-.5-1-.5 1h1z" }],
		[
			"path",
			{
				"d": "M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"
			}
		]
	];

	$$self.$$set = $$new_props => {
		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
	};

	$$props = exclude_internal_props($$props);
	return [iconNode, $$props, slots, $$scope];
}

class Skull extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
	}
}

/**
 * A utility function that converts a style object to a string.
 *
 * @param style - The style object to convert
 * @returns The style object as a string
 */
function styleToString(style) {
    return Object.keys(style).reduce((str, key) => {
        if (style[key] === undefined)
            return str;
        return str + `${key}:${style[key]};`;
    }, '');
}

({
    type: 'hidden',
    'aria-hidden': true,
    hidden: true,
    tabIndex: -1,
    style: styleToString({
        position: 'absolute',
        opacity: 0,
        'pointer-events': 'none',
        margin: 0,
        transform: 'translateX(-100%)',
    }),
});

const subscriber_queue = [];

/**
 * Creates a `Readable` store that allows reading by subscription.
 *
 * https://svelte.dev/docs/svelte-store#readable
 * @template T
 * @param {T} [value] initial value
 * @param {import('./public.js').StartStopNotifier<T>} [start]
 * @returns {import('./public.js').Readable<T>}
 */
function readable(value, start) {
	return {
		subscribe: writable(value, start).subscribe
	};
}

/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 *
 * https://svelte.dev/docs/svelte-store#writable
 * @template T
 * @param {T} [value] initial value
 * @param {import('./public.js').StartStopNotifier<T>} [start]
 * @returns {import('./public.js').Writable<T>}
 */
function writable(value, start = noop$1) {
	/** @type {import('./public.js').Unsubscriber} */
	let stop;
	/** @type {Set<import('./private.js').SubscribeInvalidateTuple<T>>} */
	const subscribers = new Set();
	/** @param {T} new_value
	 * @returns {void}
	 */
	function set(new_value) {
		if (safe_not_equal(value, new_value)) {
			value = new_value;
			if (stop) {
				// store is ready
				const run_queue = !subscriber_queue.length;
				for (const subscriber of subscribers) {
					subscriber[1]();
					subscriber_queue.push(subscriber, value);
				}
				if (run_queue) {
					for (let i = 0; i < subscriber_queue.length; i += 2) {
						subscriber_queue[i][0](subscriber_queue[i + 1]);
					}
					subscriber_queue.length = 0;
				}
			}
		}
	}

	/**
	 * @param {import('./public.js').Updater<T>} fn
	 * @returns {void}
	 */
	function update(fn) {
		set(fn(value));
	}

	/**
	 * @param {import('./public.js').Subscriber<T>} run
	 * @param {import('./private.js').Invalidator<T>} [invalidate]
	 * @returns {import('./public.js').Unsubscriber}
	 */
	function subscribe(run, invalidate = noop$1) {
		/** @type {import('./private.js').SubscribeInvalidateTuple<T>} */
		const subscriber = [run, invalidate];
		subscribers.add(subscriber);
		if (subscribers.size === 1) {
			stop = start(set, update) || noop$1;
		}
		run(value);
		return () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0 && stop) {
				stop();
				stop = null;
			}
		};
	}
	return { set, update, subscribe };
}

/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * https://svelte.dev/docs/svelte-store#derived
 * @template {import('./private.js').Stores} S
 * @template T
 * @overload
 * @param {S} stores - input stores
 * @param {(values: import('./private.js').StoresValues<S>, set: (value: T) => void, update: (fn: import('./public.js').Updater<T>) => void) => import('./public.js').Unsubscriber | void} fn - function callback that aggregates the values
 * @param {T} [initial_value] - initial value
 * @returns {import('./public.js').Readable<T>}
 */

/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * https://svelte.dev/docs/svelte-store#derived
 * @template {import('./private.js').Stores} S
 * @template T
 * @overload
 * @param {S} stores - input stores
 * @param {(values: import('./private.js').StoresValues<S>) => T} fn - function callback that aggregates the values
 * @param {T} [initial_value] - initial value
 * @returns {import('./public.js').Readable<T>}
 */

/**
 * @template {import('./private.js').Stores} S
 * @template T
 * @param {S} stores
 * @param {Function} fn
 * @param {T} [initial_value]
 * @returns {import('./public.js').Readable<T>}
 */
function derived(stores, fn, initial_value) {
	const single = !Array.isArray(stores);
	/** @type {Array<import('./public.js').Readable<any>>} */
	const stores_array = single ? [stores] : stores;
	if (!stores_array.every(Boolean)) {
		throw new Error('derived() expects stores as input, got a falsy value');
	}
	const auto = fn.length < 2;
	return readable(initial_value, (set, update) => {
		let started = false;
		const values = [];
		let pending = 0;
		let cleanup = noop$1;
		const sync = () => {
			if (pending) {
				return;
			}
			cleanup();
			const result = fn(single ? values[0] : values, set, update);
			if (auto) {
				set(result);
			} else {
				cleanup = is_function(result) ? result : noop$1;
			}
		};
		const unsubscribers = stores_array.map((store, i) =>
			subscribe(
				store,
				(value) => {
					values[i] = value;
					pending &= ~(1 << i);
					if (started) {
						sync();
					}
				},
				() => {
					pending |= 1 << i;
				}
			)
		);
		started = true;
		sync();
		return function stop() {
			run_all(unsubscribers);
			cleanup();
			// We need to set this to false because callbacks can still happen despite having unsubscribed:
			// Callbacks might already be placed in the queue which doesn't know it should no longer
			// invoke this derived store.
			started = false;
		};
	});
}

function lightable(value) {
    function subscribe(run) {
        run(value);
        return () => {
            // don't need to unsub from anything
        };
    }
    return { subscribe };
}

const hiddenAction = (obj) => {
    return new Proxy(obj, {
        get(target, prop, receiver) {
            return Reflect.get(target, prop, receiver);
        },
        ownKeys(target) {
            return Reflect.ownKeys(target).filter((key) => key !== 'action');
        },
    });
};
const isFunctionWithParams = (fn) => {
    return typeof fn === 'function';
};
makeElement('empty');
function makeElement(name, args) {
    const { stores, action, returned } = {};
    const derivedStore = (() => {
        if (stores && returned) {
            // If stores are provided, create a derived store from them
            return derived(stores, (values) => {
                const result = returned(values);
                if (isFunctionWithParams(result)) {
                    const fn = (...args) => {
                        return hiddenAction({
                            ...result(...args),
                            [`data-melt-${name}`]: '',
                            action: action ?? noop,
                        });
                    };
                    fn.action = action ?? noop;
                    return fn;
                }
                return hiddenAction({
                    ...result,
                    [`data-melt-${name}`]: '',
                    action: action ?? noop,
                });
            });
        }
        else {
            // If stores are not provided, return a lightable store, for consistency
            const returnedFn = returned;
            const result = returnedFn?.();
            if (isFunctionWithParams(result)) {
                const resultFn = (...args) => {
                    return hiddenAction({
                        ...result(...args),
                        [`data-melt-${name}`]: '',
                        action: action ?? noop,
                    });
                };
                resultFn.action = action ?? noop;
                return lightable(resultFn);
            }
            return lightable(hiddenAction({
                ...result,
                [`data-melt-${name}`]: '',
                action: action ?? noop,
            }));
        }
    })();
    const actionFn = (action ??
        (() => {
            /** noop */
        }));
    actionFn.subscribe = derivedStore.subscribe;
    return actionFn;
}

/**
 * Executes an array of callback functions with the same arguments.
 * @template T The types of the arguments that the callback functions take.
 * @param n array of callback functions to execute.
 * @returns A new function that executes all of the original callback functions with the same arguments.
 */
/**
 * A no operation function (does nothing)
 */
function noop() {
    //
}

function omit(obj, ...keys) {
    const result = {};
    for (const key of Object.keys(obj)) {
        if (!keys.includes(key)) {
            result[key] = obj[key];
        }
    }
    return result;
}

const defaults = {
    isDateDisabled: undefined,
    isDateUnavailable: undefined,
    value: undefined,
    preventDeselect: false,
    numberOfMonths: 1,
    pagedNavigation: false,
    weekStartsOn: 0,
    fixedWeeks: false,
    calendarLabel: 'Event Date',
    locale: 'en',
    minValue: undefined,
    maxValue: undefined,
    disabled: false,
    readonly: false,
    weekdayFormat: 'narrow',
};

({
    isDateDisabled: undefined,
    isDateUnavailable: undefined,
    value: undefined,
    positioning: {
        placement: 'bottom',
    },
    closeOnEscape: true,
    closeOnOutsideClick: true,
    onOutsideClick: undefined,
    preventScroll: false,
    forceVisible: false,
    locale: 'en',
    granularity: undefined,
    disabled: false,
    readonly: false,
    minValue: undefined,
    maxValue: undefined,
    weekdayFormat: 'narrow',
    ...omit(defaults, 'isDateDisabled', 'isDateUnavailable', 'value', 'locale', 'disabled', 'readonly', 'minValue', 'maxValue', 'weekdayFormat'),
});

function builderActions(node, params) {
    const unsubs = [];
    params.builders.forEach((builder) => {
        const act = builder.action(node);
        if (act) {
            unsubs.push(act);
        }
    });
    return {
        destroy: () => {
            unsubs.forEach((unsub) => {
                if (unsub.destroy) {
                    unsub.destroy();
                }
            });
        },
    };
}
// eslint-disable-next-line ts/no-explicit-any
function getAttrs(builders) {
    const attrs = {};
    builders.forEach((builder) => {
        Object.keys(builder).forEach((key) => {
            if (key !== "action") {
                attrs[key] = builder[key];
            }
        });
    });
    return attrs;
}

/* node_modules\bits-ui\dist\bits\button\components\button.svelte generated by Svelte v4.2.18 */

function create_else_block(ctx) {
	let previous_tag = /*href*/ ctx[1] ? "a" : "button";
	let svelte_element_anchor;
	let current;
	let svelte_element = (/*href*/ ctx[1] ? "a" : "button") && create_dynamic_element_1(ctx);

	return {
		c() {
			if (svelte_element) svelte_element.c();
			svelte_element_anchor = empty();
		},
		m(target, anchor) {
			if (svelte_element) svelte_element.m(target, anchor);
			insert(target, svelte_element_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (/*href*/ ctx[1] ? "a" : "button") {
				if (!previous_tag) {
					svelte_element = create_dynamic_element_1(ctx);
					previous_tag = /*href*/ ctx[1] ? "a" : "button";
					svelte_element.c();
					svelte_element.m(svelte_element_anchor.parentNode, svelte_element_anchor);
				} else if (safe_not_equal(previous_tag, /*href*/ ctx[1] ? "a" : "button")) {
					svelte_element.d(1);
					svelte_element = create_dynamic_element_1(ctx);
					previous_tag = /*href*/ ctx[1] ? "a" : "button";
					svelte_element.c();
					svelte_element.m(svelte_element_anchor.parentNode, svelte_element_anchor);
				} else {
					svelte_element.p(ctx, dirty);
				}
			} else if (previous_tag) {
				svelte_element.d(1);
				svelte_element = null;
				previous_tag = /*href*/ ctx[1] ? "a" : "button";
			}
		},
		i(local) {
			if (current) return;
			transition_in(svelte_element, local);
			current = true;
		},
		o(local) {
			transition_out(svelte_element, local);
			current = false;
		},
		d(detaching) {
			if (detaching) {
				detach(svelte_element_anchor);
			}

			if (svelte_element) svelte_element.d(detaching);
		}
	};
}

// (11:0) {#if builders && builders.length}
function create_if_block(ctx) {
	let previous_tag = /*href*/ ctx[1] ? "a" : "button";
	let svelte_element_anchor;
	let current;
	let svelte_element = (/*href*/ ctx[1] ? "a" : "button") && create_dynamic_element(ctx);

	return {
		c() {
			if (svelte_element) svelte_element.c();
			svelte_element_anchor = empty();
		},
		m(target, anchor) {
			if (svelte_element) svelte_element.m(target, anchor);
			insert(target, svelte_element_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (/*href*/ ctx[1] ? "a" : "button") {
				if (!previous_tag) {
					svelte_element = create_dynamic_element(ctx);
					previous_tag = /*href*/ ctx[1] ? "a" : "button";
					svelte_element.c();
					svelte_element.m(svelte_element_anchor.parentNode, svelte_element_anchor);
				} else if (safe_not_equal(previous_tag, /*href*/ ctx[1] ? "a" : "button")) {
					svelte_element.d(1);
					svelte_element = create_dynamic_element(ctx);
					previous_tag = /*href*/ ctx[1] ? "a" : "button";
					svelte_element.c();
					svelte_element.m(svelte_element_anchor.parentNode, svelte_element_anchor);
				} else {
					svelte_element.p(ctx, dirty);
				}
			} else if (previous_tag) {
				svelte_element.d(1);
				svelte_element = null;
				previous_tag = /*href*/ ctx[1] ? "a" : "button";
			}
		},
		i(local) {
			if (current) return;
			transition_in(svelte_element, local);
			current = true;
		},
		o(local) {
			transition_out(svelte_element, local);
			current = false;
		},
		d(detaching) {
			if (detaching) {
				detach(svelte_element_anchor);
			}

			if (svelte_element) svelte_element.d(detaching);
		}
	};
}

// (38:1) <svelte:element   this={href ? "a" : "button"}   bind:this={el}   type={href ? undefined : type}   {href}   on:click   on:change   on:keydown   on:keyup   on:mouseenter   on:mouseleave   on:mousedown   on:pointerdown   on:mouseup   on:pointerup   tabindex="0"   {...$$restProps}   {...attrs}  >
function create_dynamic_element_1(ctx) {
	let svelte_element;
	let svelte_element_type_value;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	let svelte_element_levels = [
		{
			type: svelte_element_type_value = /*href*/ ctx[1] ? undefined : /*type*/ ctx[2]
		},
		{ href: /*href*/ ctx[1] },
		{ tabindex: "0" },
		/*$$restProps*/ ctx[5],
		/*attrs*/ ctx[4]
	];

	let svelte_element_data = {};

	for (let i = 0; i < svelte_element_levels.length; i += 1) {
		svelte_element_data = assign(svelte_element_data, svelte_element_levels[i]);
	}

	return {
		c() {
			svelte_element = element(/*href*/ ctx[1] ? "a" : "button");
			if (default_slot) default_slot.c();
			set_dynamic_element_data(/*href*/ ctx[1] ? "a" : "button")(svelte_element, svelte_element_data);
		},
		m(target, anchor) {
			insert(target, svelte_element, anchor);

			if (default_slot) {
				default_slot.m(svelte_element, null);
			}

			/*svelte_element_binding_1*/ ctx[29](svelte_element);
			current = true;

			if (!mounted) {
				dispose = [
					listen(svelte_element, "click", /*click_handler_1*/ ctx[18]),
					listen(svelte_element, "change", /*change_handler_1*/ ctx[19]),
					listen(svelte_element, "keydown", /*keydown_handler_1*/ ctx[20]),
					listen(svelte_element, "keyup", /*keyup_handler_1*/ ctx[21]),
					listen(svelte_element, "mouseenter", /*mouseenter_handler_1*/ ctx[22]),
					listen(svelte_element, "mouseleave", /*mouseleave_handler_1*/ ctx[23]),
					listen(svelte_element, "mousedown", /*mousedown_handler_1*/ ctx[24]),
					listen(svelte_element, "pointerdown", /*pointerdown_handler_1*/ ctx[25]),
					listen(svelte_element, "mouseup", /*mouseup_handler_1*/ ctx[26]),
					listen(svelte_element, "pointerup", /*pointerup_handler_1*/ ctx[27])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[6],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
						null
					);
				}
			}

			set_dynamic_element_data(/*href*/ ctx[1] ? "a" : "button")(svelte_element, svelte_element_data = get_spread_update(svelte_element_levels, [
				(!current || dirty & /*href, type*/ 6 && svelte_element_type_value !== (svelte_element_type_value = /*href*/ ctx[1] ? undefined : /*type*/ ctx[2])) && { type: svelte_element_type_value },
				(!current || dirty & /*href*/ 2) && { href: /*href*/ ctx[1] },
				{ tabindex: "0" },
				dirty & /*$$restProps*/ 32 && /*$$restProps*/ ctx[5],
				/*attrs*/ ctx[4]
			]));
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) {
				detach(svelte_element);
			}

			if (default_slot) default_slot.d(detaching);
			/*svelte_element_binding_1*/ ctx[29](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (13:1) <svelte:element   this={href ? "a" : "button"}   bind:this={el}   type={href ? undefined : type}   {href}   on:click   on:change   on:keydown   on:keyup   on:mouseenter   on:mouseleave   on:mousedown   on:pointerdown   on:mouseup   on:pointerup   tabindex="0"   use:builderActions={{ builders }}   {...getAttrs(builders)}   {...$$restProps}   {...attrs}  >
function create_dynamic_element(ctx) {
	let svelte_element;
	let svelte_element_type_value;
	let builderActions_action;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	let svelte_element_levels = [
		{
			type: svelte_element_type_value = /*href*/ ctx[1] ? undefined : /*type*/ ctx[2]
		},
		{ href: /*href*/ ctx[1] },
		{ tabindex: "0" },
		getAttrs(/*builders*/ ctx[3]),
		/*$$restProps*/ ctx[5],
		/*attrs*/ ctx[4]
	];

	let svelte_element_data = {};

	for (let i = 0; i < svelte_element_levels.length; i += 1) {
		svelte_element_data = assign(svelte_element_data, svelte_element_levels[i]);
	}

	return {
		c() {
			svelte_element = element(/*href*/ ctx[1] ? "a" : "button");
			if (default_slot) default_slot.c();
			set_dynamic_element_data(/*href*/ ctx[1] ? "a" : "button")(svelte_element, svelte_element_data);
		},
		m(target, anchor) {
			insert(target, svelte_element, anchor);

			if (default_slot) {
				default_slot.m(svelte_element, null);
			}

			/*svelte_element_binding*/ ctx[28](svelte_element);
			current = true;

			if (!mounted) {
				dispose = [
					listen(svelte_element, "click", /*click_handler*/ ctx[8]),
					listen(svelte_element, "change", /*change_handler*/ ctx[9]),
					listen(svelte_element, "keydown", /*keydown_handler*/ ctx[10]),
					listen(svelte_element, "keyup", /*keyup_handler*/ ctx[11]),
					listen(svelte_element, "mouseenter", /*mouseenter_handler*/ ctx[12]),
					listen(svelte_element, "mouseleave", /*mouseleave_handler*/ ctx[13]),
					listen(svelte_element, "mousedown", /*mousedown_handler*/ ctx[14]),
					listen(svelte_element, "pointerdown", /*pointerdown_handler*/ ctx[15]),
					listen(svelte_element, "mouseup", /*mouseup_handler*/ ctx[16]),
					listen(svelte_element, "pointerup", /*pointerup_handler*/ ctx[17]),
					action_destroyer(builderActions_action = builderActions.call(null, svelte_element, { builders: /*builders*/ ctx[3] }))
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[6],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
						null
					);
				}
			}

			set_dynamic_element_data(/*href*/ ctx[1] ? "a" : "button")(svelte_element, svelte_element_data = get_spread_update(svelte_element_levels, [
				(!current || dirty & /*href, type*/ 6 && svelte_element_type_value !== (svelte_element_type_value = /*href*/ ctx[1] ? undefined : /*type*/ ctx[2])) && { type: svelte_element_type_value },
				(!current || dirty & /*href*/ 2) && { href: /*href*/ ctx[1] },
				{ tabindex: "0" },
				dirty & /*builders*/ 8 && getAttrs(/*builders*/ ctx[3]),
				dirty & /*$$restProps*/ 32 && /*$$restProps*/ ctx[5],
				/*attrs*/ ctx[4]
			]));

			if (builderActions_action && is_function(builderActions_action.update) && dirty & /*builders*/ 8) builderActions_action.update.call(null, { builders: /*builders*/ ctx[3] });
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) {
				detach(svelte_element);
			}

			if (default_slot) default_slot.d(detaching);
			/*svelte_element_binding*/ ctx[28](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

function create_fragment$1(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*builders*/ ctx[3] && /*builders*/ ctx[3].length) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) {
				detach(if_block_anchor);
			}

			if_blocks[current_block_type_index].d(detaching);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	const omit_props_names = ["href","type","builders","el"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let { $$slots: slots = {}, $$scope } = $$props;
	let { href = void 0 } = $$props;
	let { type = void 0 } = $$props;
	let { builders = [] } = $$props;
	let { el = void 0 } = $$props;
	const attrs = { "data-button-root": "" };

	function click_handler(event) {
		bubble.call(this, $$self, event);
	}

	function change_handler(event) {
		bubble.call(this, $$self, event);
	}

	function keydown_handler(event) {
		bubble.call(this, $$self, event);
	}

	function keyup_handler(event) {
		bubble.call(this, $$self, event);
	}

	function mouseenter_handler(event) {
		bubble.call(this, $$self, event);
	}

	function mouseleave_handler(event) {
		bubble.call(this, $$self, event);
	}

	function mousedown_handler(event) {
		bubble.call(this, $$self, event);
	}

	function pointerdown_handler(event) {
		bubble.call(this, $$self, event);
	}

	function mouseup_handler(event) {
		bubble.call(this, $$self, event);
	}

	function pointerup_handler(event) {
		bubble.call(this, $$self, event);
	}

	function click_handler_1(event) {
		bubble.call(this, $$self, event);
	}

	function change_handler_1(event) {
		bubble.call(this, $$self, event);
	}

	function keydown_handler_1(event) {
		bubble.call(this, $$self, event);
	}

	function keyup_handler_1(event) {
		bubble.call(this, $$self, event);
	}

	function mouseenter_handler_1(event) {
		bubble.call(this, $$self, event);
	}

	function mouseleave_handler_1(event) {
		bubble.call(this, $$self, event);
	}

	function mousedown_handler_1(event) {
		bubble.call(this, $$self, event);
	}

	function pointerdown_handler_1(event) {
		bubble.call(this, $$self, event);
	}

	function mouseup_handler_1(event) {
		bubble.call(this, $$self, event);
	}

	function pointerup_handler_1(event) {
		bubble.call(this, $$self, event);
	}

	function svelte_element_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			el = $$value;
			$$invalidate(0, el);
		});
	}

	function svelte_element_binding_1($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			el = $$value;
			$$invalidate(0, el);
		});
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
		if ('href' in $$new_props) $$invalidate(1, href = $$new_props.href);
		if ('type' in $$new_props) $$invalidate(2, type = $$new_props.type);
		if ('builders' in $$new_props) $$invalidate(3, builders = $$new_props.builders);
		if ('el' in $$new_props) $$invalidate(0, el = $$new_props.el);
		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
	};

	return [
		el,
		href,
		type,
		builders,
		attrs,
		$$restProps,
		$$scope,
		slots,
		click_handler,
		change_handler,
		keydown_handler,
		keyup_handler,
		mouseenter_handler,
		mouseleave_handler,
		mousedown_handler,
		pointerdown_handler,
		mouseup_handler,
		pointerup_handler,
		click_handler_1,
		change_handler_1,
		keydown_handler_1,
		keyup_handler_1,
		mouseenter_handler_1,
		mouseleave_handler_1,
		mousedown_handler_1,
		pointerdown_handler_1,
		mouseup_handler_1,
		pointerup_handler_1,
		svelte_element_binding,
		svelte_element_binding_1
	];
}

let Button$1 = class Button extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { href: 1, type: 2, builders: 3, el: 0 });
	}
};

var Button = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Root: Button$1
});

/* src\App.svelte generated by Svelte v4.2.18 */

function create_default_slot(ctx) {
	let t;

	return {
		c() {
			t = text("Launch Page");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(t);
			}
		}
	};
}

function create_fragment(ctx) {
	let div;
	let p0;
	let t1;
	let p1;
	let t3;
	let button;
	let t4;
	let input;
	let t5;
	let skull;
	let current;
	let mounted;
	let dispose;

	button = new Button({
			props: {
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			}
		});

	button.$on("click", /*click_handler*/ ctx[1]);
	skull = new Skull({});

	return {
		c() {
			div = element("div");
			p0 = element("p");
			p0.textContent = `${real}`;
			t1 = space();
			p1 = element("p");
			p1.textContent = "ermmm!";
			t3 = space();
			create_component(button.$$.fragment);
			t4 = space();
			input = element("input");
			t5 = space();
			create_component(skull.$$.fragment);
			attr(p0, "class", "text-sm");
			attr(p1, "class", "text-lg");
			attr(input, "type", "text");
			attr(div, "class", "flex justify-center bg-gray-300 rounded-lg px-12");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, p0);
			append(div, t1);
			append(div, p1);
			append(div, t3);
			mount_component(button, div, null);
			append(div, t4);
			append(div, input);
			set_input_value(input, /*text*/ ctx[0]);
			append(div, t5);
			mount_component(skull, div, null);
			current = true;

			if (!mounted) {
				dispose = listen(input, "input", /*input_input_handler*/ ctx[2]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			const button_changes = {};

			if (dirty & /*$$scope*/ 8) {
				button_changes.$$scope = { dirty, ctx };
			}

			button.$set(button_changes);

			if (dirty & /*text*/ 1 && input.value !== /*text*/ ctx[0]) {
				set_input_value(input, /*text*/ ctx[0]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			transition_in(skull.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			transition_out(skull.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_component(button);
			destroy_component(skull);
			mounted = false;
			dispose();
		}
	};
}

let real = "real";

function launchViewer(url) {
	try {
		new URL(url);
		const tab = window.open('about:blank', '_blank');
		if (!tab) return;
		const iframe = tab.document.createElement('iframe');
		const stl = iframe.style;
		stl.border = stl.outline = 'none';
		stl.width = '100vw';
		stl.height = '100vh';
		stl.position = 'fixed';
		stl.left = stl.right = stl.top = stl.bottom = '0';
		iframe.src = url;
		tab.document.body.appendChild(iframe);
	} catch(e) {
		console.log(e);
	}
}

function instance($$self, $$props, $$invalidate) {
	let text = "";
	const click_handler = () => launchViewer(text);

	function input_input_handler() {
		text = this.value;
		$$invalidate(0, text);
	}

	return [text, click_handler, input_input_handler];
}

class App extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

export { App as default };
