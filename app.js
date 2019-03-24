const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
var multer = require('multer')
const fs = require('fs')
var upload = multer({ dest: 'uploads/' })
require('dotenv').config()
app = express();
var { sendMail } = require('./service/mail')



app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));


app.use(bodyParser.json());



app.get('/', (req, res) => {

  res.render('contact');

  
});

app.post('/send', upload.fields([{ name: 'csv' }, { name: 'attachment' }]), (req, res) => {
  // console.log(req.files.csv[0])
  console.log(req.files)
  if (req.body.type == 'text') isHtml = false
  else isHtml = true

  var attachment = []
  if (req.files && req.files.attachment && req.files.attachment.constructor == Array)
    req.files.attachment.forEach(att => {
      attachment.push({
        contentType: att.mimetype,
        path: path.join(__dirname, att.path),
        filename: att.originalname
      })
    });


  console.log(req.body)
  
  if(req.body.event&&req.body.part){
    allowedPartType=['all','present','absent']

    if(!allowedPartType.includes(req.body.part)) 
      return res.status(400).json({err:'Invalid participant type' });

    require('./service/hades').getPart(req.body.event,req.body.part)
    .then((emails)=>{
      sendMail(emails, req.body.subject, isHtml, req.body.html, req.body.text, attachment).then(() => {
        return res.json({ msg: 'email has been sent' });

      })
      .catch((err) => {
        console.log('got error')
        console.log(err)
        return res.status(400).json({ err: 'email fail' });
      })
    }).catch((e)=>{
      return res.status(400).json({ err: e });
    })
    return console.log(req.body.event,req.body.part)
  }
  
  else if (req.files && req.files.csv && req.files.csv[0])
    fs.readFile(path.join(__dirname, req.files.csv[0].path), "utf8", (err,data) => {
      emails = getEmailFromCSV(data)
      if(emails.length>0){
        sendMail(emails, req.body.subject, isHtml, req.body.html, req.body.text, attachment).then(() => {
          fs.unlinkSync(path.join(__dirname, req.files.csv[0].path))
          return res.json({ msg: 'email has been sent' });
        }).catch(() => {
          fs.unlinkSync(path.join(__dirname, req.files.csv[0].path))
          return res.status(400).json({ err: 'email fail' });
        })
      } else{
        return res.status(404).json({ err: 'No mailid found under email/emails field' });
      }
    })

  else if(req.body.email){
    emails = req.body.email.split(';')
    sendMail(emails, req.body.subject, isHtml, req.body.html, req.body.text, attachment).then(() => {
      return res.json({ msg: 'email has been sent' });
    }).catch(() => {
      return res.status(400).json({ err: 'email fail' });
    })
  }
  else{
    return res.status(404).json({ err: 'No recipients defined' });
  }
})
app.listen(process.env.PORT, () => console.log("server started.."));


function getEmailFromCSV(a){
  let c=[];
  a.split(/\r\n|\n|\r/).forEach(e=>c.push(e.split(',')))
  i=c[0].indexOf("email")
  console.log(c[0],i)
  if(i===-1) i=c[0].indexOf("emails")
  if(i==-1) return []
  
  let emails=[];
  for(let j=1; j<c.length;j++){
    emails.push(c[j][i])
  }
  return emails
}