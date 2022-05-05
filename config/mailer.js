const nodemailer = require("nodemailer");
const mailerHtml = require("./mailerHtml");

const mailer = async (name, url, email) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAILER_EMAIL,
      pass: process.env.MAILER_PASSWORD,
    },
  });
  console.log({ name, email, url });

  let info = await transporter.sendMail({
    from: "Sawaal Jawab",
    to: email,
    subject: "[IMP] Verify Your Email",
    html: mailerHtml({ name, url }),
  });
};

module.exports = { mailer };
