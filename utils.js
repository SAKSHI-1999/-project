const csv = require("csvtojson/v2");

module.exports.getEmailFromCSV = async csvFile => {
  const data = await csv().fromFile(csvFile.path);

  const emails = data.map(row => row["Email"]);

  return emails;
};
