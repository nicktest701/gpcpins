const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

const generateVoucherTemplate = async (data) => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(process.cwd(), "/views/", `${data?.info?.type}.ejs`),
      { encoding: "utf8" },
      (err, compiledHtmlText) => {
        if (err) reject(err);

        const compiled = ejs.compile(compiledHtmlText);
        const html = compiled(data);
        resolve(html);
      }
    );
  });
};

const generatePrepaidTemplate = async (data) => {
  // console.log(data)
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(process.cwd(), "/views/", `prepaid.ejs`),
      { encoding: "utf8" },
      (err, compiledHtmlText) => {
        if (err) reject(err);

        const compiled = ejs.compile(compiledHtmlText);
        const html = compiled(data);
        resolve(html);
      }
    );
  });
};

const generateAgentTransactionTemplate = async (data) => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(process.cwd(), "/views/", `agent_transactions.ejs`),
      { encoding: "utf8" },
      (err, compiledHtmlText) => {
        if (err) reject(err);

        const compiled = ejs.compile(compiledHtmlText);
        const html = compiled(data);
        resolve(html);
      }
    );
  });
};
const generateHTMLTemplate = async (data, filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(process.cwd(), "/views/", filename),
      { encoding: "utf8" },
      (err, compiledHtmlText) => {
        if (err) reject(err);

        const compiled = ejs.compile(compiledHtmlText);
        const html = compiled(data);
        resolve(html);
      }
    );
  });
};

module.exports = {
  generateHTMLTemplate,
  generateVoucherTemplate,
  generatePrepaidTemplate,
  generateAgentTransactionTemplate,
};
