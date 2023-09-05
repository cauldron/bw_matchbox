// @ts-check

/** Compare two arrays with scalar (number, string, boolean) values
 * @param {(number | string | boolean)[]} a1
 * @param {(number | string | boolean)[]} a2
 * @return {boolean}
 */
export function compareArrays(a1, a2) {
  if (!a1 || !a1) {
    return a1 === a2;
  }
  if (a1.length !== a2.length) {
    return false;
  }
  // Compare all the items...
  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }
  return true;
}

/** runAsyncCallbacksSequentially -- Run all the promised callbacks sequentially, one after another
 * @param {(() => Promise)[]} callbacks - List of non-empty (!) callbacks
 * @return {Promise}
 */
export function runAsyncCallbacksSequentially(callbacks) {
  return new Promise((resolve, reject) => {
    const results = [];
    const doPromise = (/** @type {() => Promise} */ cb) => {
      if (!cb) {
        // No more callbacks: return results...
        return resolve(results);
      }
      return (
        Promise.resolve(cb())
          .then((res) => {
            // Store result...
            results.push(res);
            // Do next promise...
            return doPromise(callbacks.shift());
          })
          // Reject promise on the first error...
          .catch(reject)
      );
    };
    doPromise(callbacks.shift());
  });
}

/** runPromisesSequentially -- Wait for all the promises sequentially, one after another
 * @param {Promise[]} promises - List of non-empty (!) promises
 * @return {Promise}
 */
export function runPromisesSequentially(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    const doPromise = (/** @type {Promise<any>} */ promise) => {
      if (!promise) {
        // No more promises: return results...
        return resolve(results);
      }
      return (
        promise
          .then((res) => {
            // Store result...
            results.push(res);
            // Do next promise...
            return doPromise(promises.shift());
          })
          // Reject promise on the first error...
          .catch(reject)
      );
    };
    doPromise(promises.shift());
  });
}

/** getErrorText - Return plain text for error.
 * @param {string|Error|string[]|Error[]} error - Error or errors list.
 * @return {string}
 */
export function getErrorText(error) {
  if (!error) {
    return;
  }
  if (Array.isArray(error)) {
    return error.map(this.getErrorText.bind(this)).join('\n');
  }
  if (error instanceof Error) {
    error = error.message;
  } else if (typeof error !== 'string') {
    // TODO?
    error = String(error);
  }
  return error;
}

/** sortByAmountProperty -- Sort by numeric amount propery helper
 * @param {TDataRecord} a
 * @param {TDataRecord} b
 * @return {-1 | 0 | 1}
 */
export function sortByAmountProperty(a, b) {
  if (a.amount < b.amount) {
    // Reversed because want ascending order
    return -1;
  }
  if (a.amount > b.amount) {
    return 1;
  }
  return 0;
}

/** quoteHtmlAttr -- quote all invalid characters for html
 * @param {string} str
 * @param {boolean} [preserveCR]
 */
export function quoteHtmlAttr(str, preserveCR) {
  const crValue = preserveCR ? '&#13;' : '\n';
  return (
    String(str) // Forces the conversion to string
      .replace(/&/g, '&amp;') // This MUST be the 1st replacement
      .replace(/'/g, '&apos;') // The 4 other predefined entities, required
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // You may add other replacements here for HTML only (but it's not
      // necessary). Or for XML, only if the named entities are defined in its
      // DTD.
      .replace(/\r\n/g, crValue) // Must be before the next replacement
      .replace(/[\r\n]/g, crValue)
  );
}

/** htmlToElement -- Create dom node instance from html string
 * @param {string} html - Html representing a single element
 * @return {HTMLElement}
 */
export function htmlToElement(html) {
  const template = document.createElement('template');
  if (Array.isArray(html)) {
    html = html.join('');
  }
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  const content = template.content;
  return /** @type HTMLElement */ (content.firstChild);
}

/**
 * @param {string|string[]} html
 * @return {HTMLCollection}
 */
export function htmlToElements(html) {
  const template = document.createElement('template');
  if (Array.isArray(html)) {
    html = html.join('');
  }
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  const content = template.content;
  return content.children;
}

/** updateNodeContent -- Replace all inner dom node content.
 * @param {Element} node
 * @param {THtmlContent} content
 */
export function updateNodeContent(node, content) {
  if (!node) {
    throw new Error('Undefined node to update content');
  }
  if (typeof content === 'string') {
    // Replace with string content...
    node.innerHTML = content;
  } else if (Array.isArray(content)) {
    // Replace multiple elements...
    node.replaceChildren.apply(node, content);
  } else {
    // Replace single element...
    node.replaceChildren(content);
  }
}

/** decodeQuery
 * @param {string | string[]} qs
 * @param {string} [sep]
 * @param {string} [eq]
 * @param {any} [options]
 * @returns {{}}
 */
export function decodeQuery(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  const obj = {};
  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }
  const regexp = /\+/g;
  qs = qs.split(sep);
  let maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }
  let len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }
  for (let i = 0; i < len; ++i) {
    const x = qs[i].replace(regexp, '%20'),
      idx = x.indexOf(eq);
    let kstr, vstr;
    if (idx >= 0) {
      kstr = x.substring(0, idx);
      vstr = x.substring(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }
    const k = decodeURIComponent(kstr);
    const v = decodeURIComponent(vstr);
    // if (!hasOwnProperty(obj, k)) {
    if (!Object.prototype.hasOwnProperty.call(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }
  return obj;
}

/** parseQuery -- Parse url query string (in form `?xx=yy&...` or `xx=yy&...`)
 * @param {string} search  - Query string
 * @return {Record<string, string>} query - Query object
 */
export function parseQuery(search) {
  if (!search) {
    return {};
  }
  if (search.indexOf('?') === 0) {
    search = search.substring(1);
  }
  return decodeQuery(search);
}

/** makeQuery
 * @param {Record<string, string | number | boolean> | {}} params
 * @param {{ addQuestionSymbol?: boolean; useEmptyStrings?: boolean; useUndefinedValues?: boolean }} opts
 * @returns {string}
 */
export function makeQuery(params, opts = {}) {
  let url = Object.entries(params)
    .map(([id, val]) => {
      const valStr = String(val);
      if (val == undefined && !opts.useUndefinedValues) {
        return undefined;
      }
      if (valStr === '' && !opts.useEmptyStrings) {
        return undefined;
      }
      return encodeURI(id) + '=' + encodeURI(String(val == undefined ? '' : val));
    })
    .filter(Boolean)
    .join('&');
  if (opts.addQuestionSymbol && url) {
    url = '?' + url;
  }
  return url;
}

/** Dynamically load external script
 * @param {string} url
 * @return {Promise}
 */
export function addScript(url) {
  return new Promise((resolve, reject) => {
    // document.write('<script src="' + url + '"></script>');
    const script = document.createElement('script');
    script.setAttribute('src', url);
    script.addEventListener('load', resolve);
    script.addEventListener('error', (event) => {
      const {
        target,
        // srcElement,
      } = event;
      // @ts-ignore
      const { href, baseURI } = target;
      const error = new Error(`Cannot load script resurce by url '${url}'`);
      // eslint-disable-next-line no-console
      console.error('[CommonHelpers:addScript]', {
        error,
        url,
        href,
        baseURI,
        target,
        event,
      });
      // eslint-disable-next-line no-debugger
      debugger;
      reject(error);
    });
    document.head.appendChild(script);
  });
}

/** Dynamically load external css
 * @param {string} url
 * @return {Promise}
 */
export function addCssStyle(url) {
  return new Promise((resolve, reject) => {
    // Try to find exists node...
    const testNode = document.head.querySelector(
      'link[href="' + url + '"], link[data-url="' + url + '"]',
    );
    if (testNode) {
      // Style already found!
      return resolve({ type: 'already-loaded', target: testNode });
    }
    // reject(new Error('test')); // DEBUG: Test errors catching
    const node = document.createElement('link');
    node.setAttribute('href', url);
    node.setAttribute('type', 'text/css');
    node.setAttribute('rel', 'stylesheet');
    node.setAttribute('data-url', url);
    node.addEventListener('load', resolve);
    node.addEventListener('error', (event) => {
      const {
        target,
        // srcElement,
      } = event;
      // @ts-ignore
      const { href, baseURI } = target;
      const error = new Error(`Cannot load css resurce by url '${url}'`);
      // eslint-disable-next-line no-console
      console.error('[CommonHelpers:addCssStyle]', {
        error,
        url,
        href,
        baseURI,
        target,
        event,
      });
      // eslint-disable-next-line no-debugger
      debugger;
      reject(error);
    });
    document.head.appendChild(node);
  });
}

/**
 * @param {HTMLSelectElement} node
 * @param {(string|number)[]} values
 */
export function setMultipleSelectValues(node, values) {
  const strValues = values.map(String);
  const options = Array.from(node.options);
  options.forEach((item) => {
    const { value, selected } = item;
    const isSelected = strValues.includes(value);
    if (isSelected !== selected) {
      item.selected = isSelected;
    }
  });
}

/** Export callbacks from simple object...
 * @param {TSharedHandlers} targetCallbacks
 * @param {object} sourceObject
 * @param {object} [targetObject]
 */
export function exportCallbacksFromObject(targetCallbacks, sourceObject, targetObject) {
  if (!targetCallbacks) {
    const error = new Error('Undefined targetCallbacks');
    // eslint-disable-next-line no-console
    console.error('[CommonHelpers:exportCallbacksFromObject]', error);
    // eslint-disable-next-line no-debugger
    debugger;
    throw error;
  }
  if (!sourceObject) {
    const error = new Error('Undefined sourceObject');
    // eslint-disable-next-line no-console
    console.error('[CommonHelpers:exportCallbacksFromObject]', error);
    // eslint-disable-next-line no-debugger
    debugger;
    throw error;
  }
  if (!targetObject) {
    targetObject = sourceObject;
  }
  // Add all methods as bound handlers...
  const keys = Object.getOwnPropertyNames(sourceObject);
  keys.forEach((key) => {
    const cb = sourceObject[key];
    if (
      cb &&
      typeof cb === 'function' &&
      !key.startsWith('_') &&
      key !== 'start' &&
      key !== 'init' &&
      key !== 'constructor'
    ) {
      if (targetCallbacks[key]) {
        const error = new Error('Doubled handler: ' + key);
        // eslint-disable-next-line no-console
        console.error('[CommonHelpers:exportCallbacksFromObject] init handlers error', error);
        // eslint-disable-next-line no-debugger
        debugger;
        throw error;
      }
      targetCallbacks[key] = cb.bind(targetObject);
    }
  });
}

/** Export callbacks from instance and all the prototypes...
 * @param {TSharedHandlers} targetCallbacks
 * @param {object} sourceObject
 */
export function exportCallbacksFromInstance(targetCallbacks, sourceObject) {
  if (!targetCallbacks) {
    const error = new Error('Undefined targetCallbacks');
    // eslint-disable-next-line no-console
    console.error('[CommonHelpers:exportCallbacksFromInstance]', error);
    // eslint-disable-next-line no-debugger
    debugger;
    throw error;
  }
  if (!sourceObject) {
    const error = new Error('Undefined sourceObject');
    // eslint-disable-next-line no-console
    console.error('[CommonHelpers:exportCallbacksFromInstance]', error);
    // eslint-disable-next-line no-debugger
    debugger;
    throw error;
  }
  const targetObject = sourceObject;
  // Add all methods as bound handlers...
  do {
    const constructorName = sourceObject.constructor.name;
    if (constructorName !== 'Object' && constructorName !== 'Function') {
      exportCallbacksFromObject(targetCallbacks, sourceObject, targetObject);
    }
  } while ((sourceObject = Object.getPrototypeOf(sourceObject)));
}

/** processMultipleRequestErrors
 * @param {Response[]} resList
 * @return {Error[]}
 */
export function processMultipleRequestErrors(resList) {
  return /** @type {Error[]} */ (
    resList
      .map((res) => {
        if (!res.ok) {
          return new Error(`Can't load url '${res.url}': ${res.statusText}, ${res.status}`);
        }
      })
      .filter(Boolean)
  );
}
