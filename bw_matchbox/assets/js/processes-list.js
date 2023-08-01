/* --global commonHelpers, processesListConstants */

/* Process list table client code.
 */

// global module variable
// eslint-disable-next-line no-unused-vars
const processesList = {
  /** Start entrypoint */
  start() {
    const search_bar = document.getElementById('query_string');
    search_bar.focus();

    const do_search = function () {
      const qs = encodeURIComponent(document.getElementById('query_string').value);
      if (qs) {
        location.assign("{{ url_for('search') }}?database={{ database }}&q=" + qs);
      }
    };

    search_bar.addEventListener('click', do_search);
    search_bar.addEventListener('keypress', function (event) {
      if (event.key === 'Enter') {
        do_search();
      }
    });
  },
};
