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
       * @param {{ addQuestionSymbol?: boolean; useEmptyValues?: boolean }} opts
       * @returns {string}
       */
      makeQuery(params, opts = {}) {
        let url = Object.entries(params)
          .map(([id, val]) => {
            const valStr = String(val);
            if ((val == undefined || valStr === '') && !opts.useEmptyValues) {
              return undefined;
            }
            return encodeURI(id) + '=' + encodeURI(String(val));
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
