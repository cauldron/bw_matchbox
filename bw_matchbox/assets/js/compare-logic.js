// \<\(compareTest\|number_sorter\|shiftRow\|build_row\|build_table\)\>
// \<\(createOneToOneProxyFunc\|createProxyFunc\|replaceWithTarget\|removeRow\|expandRow\|replaceAmountRow\|rescaleAmount\|setNewNumber\|setNumber\|editNumber\|stop\)\>

const compareLogic = {

  compareTest: function compareTest() {
    return 'test';
  },

  number_sorter: function number_sorter (a, b) {
    if (a.amount < b.amount) {
      // Reversed because want ascending order
      return -1;
    }
    if (a.amount > b.amount) {
      return 1;
    }
    return 0;
  },

  shiftRow: function shiftRow (event, row, row_id) {
    // Add row from source to target array
    event.preventDefault();
    row.parentElement.parentElement.classList.add("shift-right");
    var obj = compareData.source_data.find(item => item.row_id == row_id);
    compareData.target_data.push(obj);
    compareLogic.build_table("target-table", compareData.target_data, true);
    compareData.comment += `* Added source exchange of ${obj.amount} ${obj.unit} ${obj.name} in ${obj.location}.\n`;
    row.parentElement.innerHTML = `<i class="fa-solid fa-check"></i>`;
  },

  build_row: function build_row (data, is_target) {
    let a = `<tr>`;
    let c = `<td><a href="${data.url}">${data.name}</a></td><td>${data.location}</td><td>${data.unit}</td></tr>`
    if (is_target) {
      var b = `
  <td row_id="${data.row_id}">
    <span id="row-trash-${data.row_id}" onclick="compareLogic.removeRow(this)"><a><i class="fa-solid fa-trash-can"></i></a></span> | <span onclick="compareLogic.expandRow(this)" input_id="${data.input_id}" amount="${data.amount}"><a><i class="fa-solid fa-diamond fa-spin"></i></a></span>
  </td>
  <td onclick="compareLogic.editNumber(this)" row_id="${data.row_id}"><a>${data.amount_display}</a></td>
    `;
    } else {
      var b = `<td><a onclick="compareLogic.shiftRow(event, this, ${data.row_id})"><i class="fa-solid fa-arrow-right"></i></a></td><td>${data.amount_display}</td>`;
    }
    return a + b + c;
  },

  build_table: function build_table (table_id, data, is_target) {
    data.sort(compareLogic.number_sorter);
    let html_string = "";
    for (const [index, obj] of data.entries()) {
      obj['row_id'] = `${index}`;
      html_string += compareLogic.build_row(obj, is_target);
    };
    var header = `
  <tr>
    <th>Action</th>
    <th>Amount</th>
    <th>Name</th>
    <th>Location</th>
    <th>Unit</th>
  </tr>
    `;
    document.getElementById(table_id).innerHTML = header + html_string;
  },

  createOneToOneProxyFunc: function createOneToOneProxyFunc (event) {
    event.preventDefault();

    var submission_data = {
      exchanges: [{'input_id': compareData.target_id, 'amount': 1.0}],
      source: compareData.source_id,
      comment: "One-to-one proxy",
      name: "Proxy for " + compareData.target_name.replace("Market group for ", "").replace("market group for ", "").replace("Market for ", "").replace("market for ", "").trim()
    };
    var url = "/create-proxy/";
    fetch(
      url,
      {
        method: "POST",
        redirect: 'follow',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(submission_data)
      }
    ).then((response) => {
      if (response.redirected) {
          window.location.href = response.url;
      }
    });
  },

  createProxyFunc: function createProxyFunc (event) {
    event.preventDefault();
    var span = document.getElementById("modal-content-wrapper");
    var name = "Proxy for " + compareData.target_name.replace("Market group for ", "").replace("market group for ", "").replace("Market for ", "").replace("market for ", "").trim();
    var text = `
      <form>
        <label for="proxy-name">Proxy name</label>
        <input class="u-full-width" type="text" id="proxy-name" name="proxy-name" value="${name}">
        <label for="proxy-comment">Comment</label>
        <textarea class="u-full-width" id="proxy-comment" name="proxy-comment">${compareData.comment}</textarea>
        <p><button class="button-primary" id="create-proxy-submit-button">Create Proxy Process</button> | Unit: ${compareData.source_node_unit} | Location: ${compareData.source_node_location}</p>
        <table>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Comment</th>
          </tr>
    `;

    compareData.target_data.forEach( function (item, index) {
      text += `
          <tr input_id=${item.input_id}>
            <td>${item.name}</td>
            <td>${item.amount_display}</td>
            <td><textarea type="text" id="proxy-name-${item.input_id}" name="proxy-name-${item.input_id}"></textarea></td>
          </tr>
      `
    });

    text += `
        </table>
      </form>
    `
    span.innerHTML = text;
    modal.style.display = "block";

    var submit = document.getElementById("create-proxy-submit-button");
    submit.addEventListener("click", async (e) => {
      e.preventDefault();
      var submission_data = {
        exchanges: compareData.target_data,
        source: compareData.source_id,
        comment: document.getElementById("proxy-comment").value,
        name: document.getElementById("proxy-name").value
      };
      var url = "/create-proxy/";
      fetch(
        url,
        {
          method: "POST",
          redirect: 'follow',
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(submission_data)
        }
      ).then((response) => {
        if (response.redirected) {
            window.location.href = response.url;
        }
      });
    });
  },

  replaceWithTarget: function replaceWithTarget(elem) {
    compareData.target_data.push(compareData.target_node);
    compareData.target_data.splice(0, compareData.target_data.length - 1);
    compareData.comment += `* Collapsed input exchanges to target node\n`;
    compareLogic.build_table("target-table", compareData.target_data, true);
    elem.innerHTML = "";
  },

  removeRow: function removeRow(element) {
    var row_id = element.parentElement.getAttribute("row_id");

    function removeValue(obj, index, arr) {
      if (obj.row_id == row_id) {
          compareData.comment += `* Removed exchange of ${obj.amount} ${obj.unit} ${obj.name} from ${obj.location}.\n`;
          arr.splice(index, 1);
          return true;
      }
      return false;
    };
    compareData.target_data.filter(removeValue);
    compareLogic.build_table("target-table", compareData.target_data, true);
  },

  expandRow: function expandRow(element) {
    var url = "/expand/" + element.getAttribute("input_id") + "/" + element.getAttribute("amount") + "/";
    var t = compareData.target_data.find(item => item.input_id == element.getAttribute("input_id"));
    compareData.comment += `* Expanded process inputs of ${t.amount} ${t.unit} from ${t.name} in ${t.location}.\n`;
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
          data.forEach(function (item, index) {
            compareData.target_data.push(item);
          });
          compareData.target_data.sort(compareLogic.number_sorter);
          compareLogic.removeRow(element);
        });
  },

  replaceAmountRow: function replaceAmountRow (elem, target_id) {
    var s = compareData.source_data.find(item => item.row_id == elem.getAttribute("source_id"));
    var t = compareData.target_data.find(item => item.row_id == target_id);
    compareData.comment += `* Used source database amount ${s.amount} ${s.unit} from ${s.name} in ${s.location} instead of ${t.amount} ${t.unit} from ${t.name} in ${t.location}.\n`;
    document.getElementById("number-current-amount").innerText = elem.getAttribute("amount");
  },

  rescaleAmount: function rescaleAmount (target_id) {
    var t = compareData.target_data.find(item => item.row_id == target_id);
    scale = Number(document.getElementById("rescale_number").value);
    node = document.getElementById("number-current-amount")
    if (scale != 1) {
      compareData.comment += `* Rescaled amount ${t.amount} ${t.unit} from ${t.name} in ${t.location} by ${scale}.\n`;
    };
    node.innerText = Number(node.innerText) * scale;
  },

  setNewNumber: function setNewNumber (target_id) {
    var t = compareData.target_data.find(item => item.row_id == target_id);
    new_value = document.getElementById("new_number").value;
    compareData.comment += `* Set manual exchange value of ${new_value} instead of ${t.amount} ${t.unit} for ${t.name} in ${t.location}.\n`;
    document.getElementById("number-current-amount").innerText = new_value;
  },

  setNumber: function setNumber (elem) {
    row_id = elem.getAttribute("row_id");
    current = Number(document.getElementById("number-current-amount").innerText);
    compareData.target_data.forEach(function (item, index) {
      if (item.row_id == row_id) {
        item.amount = current;
        item.amount_display = current.toExponential();
      };
    });
    modal.style.display = "none";
    compareLogic.build_table("target-table", compareData.target_data, true);
  },

  editNumber: function editNumber(td) {
    var row = compareData.target_data.find(item => item.row_id == td.getAttribute("row_id"));
    var span = document.getElementById("modal-content-wrapper");

    var a = `
      <h3>${row.name} | ${row.location} | ${row.unit}</h3>
      <div class="five columns">
        <p>Click on a row to take that value</p>
        <table>
          <tr>
            <th>Amount</th>
            <th>Name</th>
            <th>Unit</th>
          </tr>
    `
    compareData.source_data.forEach(function (item, index) {
      a += `
        <tr amount="${item.amount}" source_id="${item.row_id}" onclick="compareLogic.replaceAmountRow(this, ${row.row_id})">
          <td>${item.amount_display}</td>
          <td>${item.name}</td>
          <td>${item.unit}</td>
        </tr>
      `;
    });

    let b = `
        </table>
      </div>
      <div class="five columns">
        <h4>Original amount: ${row.amount}</h4>
        <h4>Current amount: <span id="number-current-amount">${row.amount}</span></h4>
        <button class="button-primary" id="close-number-editor" row_id="${row.row_id}" onclick="compareLogic.setNumber(this)">Set and close</button>
        <form>
          <div>
            <label>Enter new amount</label>
            <input type="number" id="new_number" value="${row.amount}">
            <button onclick="compareLogic.setNewNumber(${row.row_id})" id="new-number-button">Set</button>
          </div>
          <hr />
          <div>
            <label>Rescale current amount</label>
            <input type="number" id="rescale_number" value="1.0">
            <button onclick="compareLogic.rescaleAmount(${row.row_id})" id="rescale-button">Rescale</button>
          </div>
        </form>
      </div>
    `;

    span.innerHTML = a + b;
    document.getElementById('rescale-button').addEventListener("click", compareLogic.stop, false);
    document.getElementById('new-number-button').addEventListener("click", compareLogic.stop, false);
    document.getElementById('close-number-editor').addEventListener("click", compareLogic.stop, false);
    modal.style.display = "block";
  },

  stop: function stop(event) {
    event.preventDefault();
  },

};

