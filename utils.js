let log = console.log;

const NUMBITS = 9;
const MAXASCII = 2 ** (NUMBITS - 1) - 1;

let states = [];
let stateCursor = -1;

function copyToClipboard() {
  let copyText = document.getElementById("output-string");
  navigator.clipboard.writeText(copyText.value);
}

function reduce(numerator, denominator) {
  let a = numerator;
  let b = denominator;
  let c;
  while (b) {
    c = a % b;
    a = b;
    b = c;
  }
  return [numerator / a, denominator / a];
}

Number.prototype.countDecimals = function () {
  if (Math.floor(this.valueOf()) === this.valueOf()) return 0;

  var str = this.toString();
  if (str.indexOf(".") !== -1 && str.indexOf("-") !== -1) {
    return str.split("-")[1] || 0;
  } else if (str.indexOf(".") !== -1) {
    return str.split(".")[1].length || 0;
  }
  return str.split("-")[1] || 0;
};

function createTable(tableData) {
  var table = document.createElement("table");
  var tableBody = document.createElement("tbody");

  if (tableData.length != 0) {
    tableData.forEach(function (rowData) {
      var row = document.createElement("tr");

      rowData.forEach(function (cellData) {
        var cell = document.createElement("td");
        cell.appendChild(document.createTextNode(cellData));
        row.appendChild(cell);
      });

      tableBody.appendChild(row);
    });
  }

  table.appendChild(tableBody);
  document.body.appendChild(table);
  return table;
}

function formatDictionary(dictionary) {
  formatted = [
    ["SÃ­mbolo", "Decimal", "BinÃ¡rio"],
    ["...", "...", "..."],
  ];
  for (let i = 0; i < dictionary.length; i++) {
    let code = MAXASCII + 1 + i;
    formatted.push([dictionary[i], code, code.toString(2)]);
  }
  return formatted;
}

function prevalidateDecodeInput(input) {
  let check_length = input
    .split(" ")
    .every((el, _, __) => el.length == NUMBITS);
  let valid_symbols = " 01";
  let check_symbols = new RegExp("^[s\\" + valid_symbols + "]+$").test(input);
  return check_length && check_symbols;
}

function abortDecoding(message = undefined) {
  document.getElementById("output-string").value = "Entrada invÃ¡lida";
  if (message) document.getElementById("output-string").value += ": " + message;
  document.getElementById("dictionary").outerHTML = "";
  let table = createTable([]);
  table.id = "dictionary";
  let stateTable = document.getElementById("state-table");
  stateTable.rows[1].innerHTML = `<tr></tr>`;
  document.getElementById("btInicio").disabled = true;
  document.getElementById("btAnterior").disabled = true;
  document.getElementById("btProximo").disabled = true;
}

function toASCII(char) {
  return char.charCodeAt(0); // & 0xFF;
}

function fromASCII(num) {
  return String.fromCharCode(num);
}

// positivos apenas
function toBinary(num) {
  return num.toString(2);
}

function fromBinary(str) {
  return parseInt(str, 2);
}

function bitStuffing(code, size = NUMBITS) {
  while (code.length < size) code = "0" + code;
  return code;
}

const ASCIISPACE = bitStuffing(toBinary(toASCII(" ")));

function encodeWord(word) {
  let encodedWord = "";
  for (const char of word) {
    encodedWord += bitStuffing(toBinary(toASCII(char))) + " ";
  }
  return encodedWord;
}

function getWordCode(dictionary, index) {
  return bitStuffing(toBinary(MAXASCII + 1 + index));
}

function resetStateTable() {
  changeStateTable(-stateCursor);
}

function changeStateTable(step) {
  if (stateCursor + step < 0 || stateCursor + step > states.length - 1) return;
  stateCursor += step;
  document.getElementById("btInicio").disabled = stateCursor == 0;
  document.getElementById("btAnterior").disabled = stateCursor == 0;
  document.getElementById("btProximo").disabled =
    stateCursor == states.length - 1;
  stateTable = document.getElementById("state-table");
  stateTable.rows[1].innerHTML = `<tr>
										<td>${states[stateCursor].position}</td>
										<td>"${states[stateCursor].symbol || ""}"</td>
										<td>"${states[stateCursor].word}"</td>
										<td>"${states[stateCursor].output}"</td>
									</tr>`;
  document.getElementById("dictionary").outerHTML = "";
  table = createTable(formatDictionary(states[stateCursor].dictionary));
  table.id = "dictionary";
}

function writeCompressionRate(input, output) {
  let input_size = input.length * 8;
  let output_size = output.replaceAll(" ", "").length;

  let rate = reduce(input_size, output_size);
  let ratio = rate[0] + ":" + rate[1];
  let tooltip_text = "RazÃ£o entre tamanho da entrada e o tamanho da saÃ­da";
  document.getElementById(
    "compression-rate"
  ).innerHTML = `Taxa de compressÃ£o<sup><abbr title="${tooltip_text}"><code>?</code></abbr></sup> : ${ratio}`;

  let saving = 1 - rate[1] / rate[0];

  let reduced = saving >= 0;
  saving = reduced ? saving : -saving;

  let aproximate = saving.countDecimals() > 3;
  saving = aproximate ? saving.toFixed(3) : saving;

  let saving_text = reduced ? "ReduÃ§Ã£o de " : "Aumento de ";
  saving_text += aproximate ? "aproximadamente " : "";

  document.getElementById("space-saving").innerHTML =
    saving_text + saving + "%.";
}

function removeCompressionRate() {
  document.getElementById("compression-rate").innerHTML = "";
  document.getElementById("space-saving").innerHTML = "";
}
