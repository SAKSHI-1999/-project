const csv = require("csvtojson/v2");
const nodemailer = require("nodemailer");

module.exports.getEmailFromCSV = async csvFile => {
  const data = await csv().fromFile(csvFile.path);

  const emails = data.map(row => row["Email"]);

  return emails;
};

module.exports.sendMail = async ({
  emails,
  message,
  type,
  subject,
  attachments
}) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PWD
    }
  });

  const mailOptions = {
    from: `"Website" <${process.env.SENDER_EMAIL}>`,
    to: emails,
    subject
  };

  if (type === "text") mailOptions["text"] = message;
  else mailOptions["html"] = message;

  if (attachments) mailOptions["attachments"] = attachments;

  await transporter.sendMail(mailOptions);

  const successMsg = "Message sent";
  console.log(successMsg);

  return successMsg;
};
