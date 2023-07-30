// global module variable
// eslint-disable-next-line no-unused-vars
const commonHelpers = {
  numberSorter: function (a, b) {
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
  quoteHtmlAttr: function (str, preserveCR) {
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
  htmlToElement: function (html) {
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  },
};
