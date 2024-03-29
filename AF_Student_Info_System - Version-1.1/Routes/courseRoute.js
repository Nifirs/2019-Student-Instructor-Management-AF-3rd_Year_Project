const cors = require("cors");
const express = require("express");
const path = require("path");
var app = express();

const exphbs = require("express-handlebars");
const nodemailer = require("nodemailer");

require("dotenv").config(); //gmail email and username security

//view engine setup
app.engine("handlebars", exphbs());
app.set("view Engine", "handlebars");

//static folder
app.use("/public", express.static(path.join(__dirname, "public")));

const courseRoute1 = express.Router();
courseRoute1.use(cors());
let instructor_course = require("../models/Course");

courseRoute1.route("/").get(function(req, res) {
  instructor_course.find(function(err, AF_PROJECT) {
    if (err) {
      console.log(err);
    } else {
      res.json(AF_PROJECT);
    }
  });
});

courseRoute1.route("/:id").get(function(req, res) {
  let id = req.params.id;
  instructor_course.findById(id, function(err, resv) {
    res.json(resv);
  });
});

courseRoute1.route("/add").post(function(req, res) {
  let res1 = new instructor_course(req.body);
  res1
    .save()
    .then(res1 => {
      res.status(200).json({ res1: "Course added successfully" });
    })
    .catch(err => {
      res, status(400).send("adding fail");
    });

  const email = req.body.instructor_email;
  const output = `<p>You have a new course request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Course Name: ${req.body.course_name}</li>
      <li>Instructor Name: ${req.body.instructor_name}</li>
      <li>Instructor Email: ${req.body.instructor_email}</li>
      <li>Message: ${req.body.message}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>`;
  var smtpTransport = require("nodemailer-smtp-transport");

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport(
    smtpTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "techgang.afsis@gmail.com", // generated ethereal user
        pass: "techgang@9596" // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false
      }
    })
  );

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"TechGang-SIS Course Message" <techgang.afsis@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "AF SIS-PROJECT", // Subject line
    text: "You are assigned to a Course", // plain text body
    html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }

    console.log("contact", { msg: "Email has been sent" });
  });
});

courseRoute1.route("/update/:id").post(function(req, res) {
  instructor_course.findById(req.params.id, function(err, res1) {
    if (!res1) res.status(404).send("data not found");
    else res1.course_name = req.body.course_name;
    res1.instructor_name = req.body.instructor_name;
    res1.instructor_email = req.body.instructor_email;
    res1.message = req.body.message;

    res1
      .save()
      .then(res1 => {
        res.json("Course updated");
      })
      .catch(err => {
        res.status(400).send("Impossible to update");
      });
  });
});
courseRoute1.route("/delete/:id").get(function(req, res) {
  instructor_course.findById(req.params.id, function(err, res1) {
    if (!res1) res.status(404).send("data not found");
    else
      res1
        .delete()
        .then(res1 => {
          res.json("Course deleted");
        })
        .catch(err => {
          res.status(400).send("Impossible to delete");
        });
  });
});

module.exports = courseRoute1;
