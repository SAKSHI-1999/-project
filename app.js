const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const QRcode = require("qrcode");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

const PORT = process.env.PORT || 3300;

// view engine setup
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const util = require("./utils");

app.get("/", (req, res) => {
  res.render("contact");
});

app.post(
  "/send",
  upload.fields([{ name: "csv" }, { name: "attachment" }]),
  async (req, res) => {
    const { csv: csvFile, attachment: attachments } = req.files;

    let emails;

    /**
     * Check if csv file exists, if yes get emails
     * else get email from email field
     */
    if (csvFile) {
      const file = csvFile[0];

      const fileExtension = file.originalname.substr(
        file.originalname.lastIndexOf(".") + 1
      );

      if (fileExtension === "csv")
        emails = await util.getEmailFromCSV(csvFile[0]);
      else return res.status(400).send({ err: "Invalid csv file" });
    } else {
      emails = req.body.email.split(";");
    }

    res.send({ emails });
  }
);

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}...`);
});
