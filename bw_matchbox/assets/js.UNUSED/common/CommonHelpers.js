modules.define(
  'CommonHelpers',
  [
    // Required modules...
  ],
  function provide_CommonHelpers(
    provide,
    // Resolved modules...
  ) {
    // Define module...

    const CommonHelpers = {
      /** Compare two arrays with scalar (number, string, boolean) values
       * @param {<number | string | boolean>[]} a1
       * @param {<number | string | boolean>[]} a2
       * @return {boolean}
       */
      compareArrays(a1, a2) {
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
      },

      /** runAsyncCallbacksSequentially -- Run all the promised callbacks sequentially, one after another
       * @param {<() => Promise>[]} callbacks - List of non-empty (!) callbacks
       * @return {Promise}
       */
      runAsyncCallbacksSequentially(callbacks) {
        return new Promise((resolve, reject) => {
          const results = [];
          const doPromise = (cb) => {
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
      },

      /** runPromisesSequentially -- Wait for all the promises sequentially, one after another
       * @param {Promise[]} promises - List of non-empty (!) promises
       * @return {Promise}
       */
      runPromisesSequentially(promises) {
        return new Promise((resolve, reject) => {
          const results = [];
          const doPromise = (promise) => {
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
      },

      /** getErrorText - Return plain text for error.
       * @param {string|error|string[]|error[]} error - Error or errors list.
       * @return {string}
       */
      getErrorText(error) {
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
      },

      /** sortByAmountProperty -- Sort by numeric amount propery helper
       * @param {TDataRecord} a
       * @param {TDataRecord} b
       * @return {-1,0,1}
       */
      sortByAmountProperty(a, b) {
        if (a.amount < b.amount) {
          // Reversed because want ascending order
          return -1;
        }
        if (a.amount > b.amount) {
          return 1;
        }
        return 0;
      },

      /** quoteHtmlAttr -- quote all invalid characters for html
       * @param {string} str
       * @param [{boolean}] preserveCR
       */
      quoteHtmlAttr(str, preserveCR) {
        preserveCR = preserveCR ? '&#13;' : '\n';
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
            .replace(/\r\n/g, preserveCR) // Must be before the next replacement
            .replace(/[\r\n]/g, preserveCR)
        );
      },

      /** htmlToElement -- Create dom node instance from html string
       * @param {string} HTML representing a single element
       * @return {HTMLElement}
       */
      htmlToElement(html) {
        const template = document.createElement('template');
        if (Array.isArray(html)) {
          html = html.join('');
        }
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        const content = template.content;
        return content.firstChild;
      },

      htmlToElements(html) {
        const template = document.createElement('template');
        if (Array.isArray(html)) {
          html = html.join('');
        }
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        const content = template.content;
        return content.children;
      },

      /** updateNodeContent -- Replace all inner dom node content.
       * @param {HTMLElement} node
       * @param {string|HTMLElement|HTMLElement[]} content
       */
      updateNodeContent(node, content) {
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
      },

      /** decodeQuery
       * @param {string | string[]} qs
       * @param {string} sep
       * @param {string} eq
       * @param {any} options
       * @returns {{}}
       */
      decodeQuery(qs, sep, eq, options) {
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
      },

      /** parseQuery -- Parse url query string (in form `?xx=yy&...` or `xx=yy&...`)
       * @param {string} search  - Query string
       * @return {Record<string, string>} query - Query object
       */
      parseQuery(search) {
        if (!search) {
          return {};
        }
        if (search.indexOf('?') === 0) {
          search = search.substring(1);
        }
        return CommonHelpers.decodeQuery(search);
      },

      /** makeQuery
       * @param {Record<string, string | number | boolean>} params
       * @param {{ addQuestionSymbol?: boolean; useEmptyStrings?: boolean; useUndefinedValues?: boolean }} opts
       * @returns {string}
       */
      makeQuery(params, opts = {}) {
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
      },
    };

    provide(CommonHelpers);
  },
);
