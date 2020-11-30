let generate = (code, message, data) => {
  let res = { code: code, message: message, data: data };
  return res;
};

module.exports = { generate: generate };
