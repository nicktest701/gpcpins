const pLimit = require("p-limit");
const _ = require("lodash");

const { generateArrayVoucher } = require("./generatePDF");
const { generateVoucherTemplate } = require("./generateVoucherTemplate");

const limit = pLimit(5);
const processVouchers = async (transaction) => {
  let chunkSize = 3;

  if (transaction?.info?.type === "waec") {
    chunkSize = 15;
  }

  if (["cinema", "bus"].includes(transaction?.info?.type)) {
    chunkSize = 3;
  }

  try {
    //BREAK vouchers into sizeable chunks
    const chunks = _.chunk(transaction.vouchers, chunkSize);

    //Generate templates in chunk
    const chunkedVouchers = chunks.map((chunk) => {
      const data = {
        ...transaction,
        vouchers: chunk,
      };

      return limit(() => generateVoucherTemplate(data));
    });

    //WAIT for templates to finish
    const template = await Promise.all(chunkedVouchers);

    const result = await generateArrayVoucher(template, transaction?._id);
    // const result = limit(() =>
    //   generateArrayVoucher(template, transaction?._id)
    // );
    if (result) {
      return "done";
    }
  } catch (error) {
   
    throw "An error has occured.Please try again";
  }
};

module.exports = processVouchers;
