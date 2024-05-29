function createTree(codes) {
    let root = { value: "" };
    for (let char in codes) {
      let node = root;
      for (let bit of codes[char]) {
        if (bit === "0") {
          if (!node.left) {
            node.left = { value: "" };
          }
          node = node.left;
        } else {
          if (!node.right) {
            node.right = { value: "" };
          }
          node = node.right;
        }
      }
      node.value = char;
    }
    return root;
  }
  
  function shannonFanoEncoding(input) {
    let freq = {};
    for (let char of input) {
      if (char in freq) {
        freq[char]++;
      } else {
        freq[char] = 1;
      }
    }
  
    let sortedChars = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
    let codes = {};
  
    function shannonFano(min, max, code) {
      if (min === max) {
        codes[sortedChars[min]] = code;
        return;
      }
      let mid = min;
      let total = 0;
      for (let i = min; i <= max; i++) {
        total += freq[sortedChars[i]];
      }
      let half = total / 2;
      let current = 0;
      while (mid < max && current + freq[sortedChars[mid]] < half) {
        current += freq[sortedChars[mid]];
        mid++;
      }
      shannonFano(min, mid, code + "0");
      shannonFano(mid + 1, max, code + "1");
    }
  
    shannonFano(0, sortedChars.length - 1, "");
  
    let encoded = "";
    for (let char of input) {
      encoded += codes[char];
    }
    let tree = createTree(codes);
  
    return { encoded, codes, tree };
  }
  
  function encode() {
    let input = document.getElementById("input-encode").value.trim();
    if (input.length == 0) return;
    let { encoded, tree } = shannonFanoEncoding(input);
  
    document.getElementById("output-string").value = encoded;
    document.getElementById("tree").innerHTML = "";
  
    let treeElement = createTreeElement(tree);
    document.getElementById("tree").appendChild(treeElement);
  }
  
  function decode() {
    let input = document.getElementById("input-decode").value.trim();
    let decoded = "";
    if (input.length == 0) return;
    let { codes } = shannonFanoEncoding(input);
  
    let code = "";
    for (let char of input) {
      code += char;
      if (code in codes) {
        decoded += codes[code];
        code = "";
      }
    }
  
    document.getElementById("output-string").value = decoded;
  }
  
  function createTreeElement(node, prefix = "") {
    if (node) {
      let el = document.createElement("div");
      el.textContent = prefix + node.value;
      el.appendChild(createTreeElement(node.left, prefix + "L: "));
      el.appendChild(createTreeElement(node.right, prefix + "R: "));
      return el;
    } else {
      return document.createElement("div"); // Retorna um div vazio se o nó for null
    }
  }
  