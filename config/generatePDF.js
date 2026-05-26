const puppeteer = require("puppeteer");

const generateVoucher = async (htmltext, transaction_id) => {
  //page
  const browser = await getBrowser();
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
  //page
  const browser = await getBrowser();
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
      '<small style="font-size:9px;font-style:italic;">Powered by Frebbytech Solutions(0543772591)</small>',
    // timeout: 0,
  });

  //close browser
  await browser.close();
  return "done";
};

const generateArrayVoucher = async (htmltextArray, transaction_id) => {
  try {
    //page
    const browser = await getBrowser();
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
        '<small style="font-size:10px;font-style:italic;">Powered by Frebbytech Solutions</small>',
      timeout: 0,
      width: "210mm",
      height: "297mm",
    });

    //close browser

    await browser.close();
    return "done";
  } catch (error) {
    console.log(error);
    throw "An error has occurred.Couldnt generate vouchers";
  }
};

const generateAgentTransactionRport = async (htmltext, transaction_id) => {
  //page
  const browser = await getBrowser();
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
      '<small style="font-size:12px;font-style:italic;">Powered by Frebbytech Solutions(0543772591)</small>',
    // timeout: 0,
  });

  //close browser
  await browser.close();
  return "done";
};
const generateTransactionReport = async (htmltext, transaction_id, type) => {
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
      '<small style="font-size:12px;font-style:italic;">Powered by Frebbytech Solutions(0543772591)</small>',
    // timeout: 0,
  });

  //close browser
  await browser.close();
  return `${transaction_id}-${type}.pdf`;
};

const getBrowser = async () => {
  const options = {
    headless: "new",
    timeout: 0,
    protocolTimeout: 0,
  };

  if (process.env.NODE_ENV === "production") {
    options.args = [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--single-process",
    ];
  }
  const browser = await puppeteer.launch(options);
  return browser;
};

module.exports = {
  generateTransactionReport,
  generateVoucher,
  generateArrayVoucher,
  generatePrepaidReceipt,
  generateAgentTransactionRport,
};
