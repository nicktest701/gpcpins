const puppeteer = require("puppeteer");

const generateVoucher = async (htmltext, transaction_id) => {
  const browser = await puppeteer.launch({
    headless: "new",
  });

  //page
  const page = await browser.newPage();
  await page.setContent(htmltext, { waitUntil: "domcontentloaded" });
  await page.emulateMediaType("screen");

  //pdf
  await page.pdf({
    path: `vouchers/${transaction_id}.pdf`,
    format: "A4",
    printBackground: true,
    // landscape: true,
    timeout: 0,
  });

  //close browser

  await browser.close();
};

const generatePrepaidReceipt = async (htmltext, transaction_id) => {
  const browser = await puppeteer.launch({
    headless: "new",
  });

  //page
  const page = await browser.newPage();
  await page.setContent(htmltext, { waitUntil: "domcontentloaded" });
  // await page.emulateMediaType('screen');

  //pdf
  await page.pdf({
    path: `receipts/${transaction_id}-prepaid.pdf`,
    format: "A6",
    printBackground: true,
    displayHeaderFooter: true,
    footerTemplate:
      '<small style="font-size:9px;font-style:italic;">Powered by Frebbytech consults(0543772591)</small>',
    // timeout: 0,
  });

  //close browser
  await browser.close();
  return "done";
};

const generateArrayVoucher = async (htmltextArray, transaction_id) => {

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      protocolTimeout: 0
    });

    //page
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    const combined = htmltextArray.join("");
    await page.setContent(combined, {
      waitUntil: "domcontentloaded",

    });

    //pdf
    await page.pdf({
      path: `vouchers/${transaction_id}.pdf`,
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      footerTemplate:
        '<small style="font-size:10px;font-style:italic;">Powered by Frebbytech consults</small>',
      timeout: 0,
      width: "210mm",
      height: "297mm",
    });

    //close browser

    await browser.close();
    return "done";
  } catch (error) {
    console.log(error);
    throw "An error has occured.Couldnt generate vouchers";
  }
};

const generateAgentTransactionRport = async (htmltext, transaction_id) => {
  const browser = await puppeteer.launch({
    headless: "new",
  });

  //page
  const page = await browser.newPage();
  await page.setContent(htmltext, { waitUntil: "domcontentloaded" });
  // await page.emulateMediaType('screen');

  //pdf
  await page.pdf({
    path: `reports/${transaction_id}-report.pdf`,
    format: "A2",
    landscape: true,
    margin: {
      bottom: 1,
      right: 1,
      left: 1,
      top: 1,
    },
    printBackground: true,
    displayHeaderFooter: true,
    footerTemplate:
      '<small style="font-size:12px;font-style:italic;">Powered by Frebbytech consults(0543772591)</small>',
    // timeout: 0,
  });

  //close browser
  await browser.close();
  return "done";
};
const generateTransactionReport = async (htmltext, transaction_id, type) => {
  const browser = await puppeteer.launch({
    headless: "new",
  });

  //page
  const page = await browser.newPage();
  await page.setContent(htmltext, { waitUntil: "domcontentloaded" });
  // await page.emulateMediaType('screen');

  //pdf
  await page.pdf({
    path: `reports/${transaction_id}-${type}.pdf`,
    format: "A2",
    landscape: true,
    margin: {
      bottom: 1,
      right: 1,
      left: 1,
      top: 1,
    },
    printBackground: true,
    displayHeaderFooter: true,
    footerTemplate:
      '<small style="font-size:12px;font-style:italic;">Powered by Frebbytech consults(0543772591)</small>',
    // timeout: 0,
  });

  //close browser
  await browser.close();
  return `${transaction_id}-${type}.pdf`;
};

module.exports = {
  generateTransactionReport,
  generateVoucher,
  generateArrayVoucher,
  generatePrepaidReceipt,
  generateAgentTransactionRport,
};
