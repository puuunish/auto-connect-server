const fs = require('fs');
const path = require('path');

const C_DATE_CONNECT = "./source/database/MyJsonConfigConnect.json";
const C_DATE_MSG = './source/database/myJsonMessageConnect.json';

function loadCFGCONNECT() {
  if (!fs.existsSync(C_DATE_CONNECT)) {
    fs.mkdirSync(path.dirname(C_DATE_CONNECT), { recursive: true });
    fs.writeFileSync(C_DATE_CONNECT, JSON.stringify({}, null, 2));
    return {};
  }

  const fileDATA = fs.readFileSync(C_DATE_CONNECT);
  return JSON.parse(fileDATA);
}

function saveCFGCONNECT(configCONNECT) {
  const data = JSON.stringify(configCONNECT, null, 2);
  fs.writeFileSync(C_DATE_CONNECT, data);
}

function loadMSGDATA() {
  try {
    return JSON.parse(fs.readFileSync(C_DATE_MSG, 'utf8'));
  } catch {
    return null;
  }
}

function saveMSGDATA(data) {
  fs.writeFileSync(C_DATE_MSG, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  loadCFGCONNECT,
  saveCFGCONNECT,
  loadMSGDATA,
  saveMSGDATA
};