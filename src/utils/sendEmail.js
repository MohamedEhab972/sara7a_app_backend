import nodemailer from "nodemailer";
import { env } from "../../config/env.service.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GOOGLE_EMAIL,
    pass: env.GOOGLE_PASSWORD,
  },
});

export default transporter;

/** @param {{ to: string, subject: string, text: string }} options */
export const sendEmail = ({ to, subject, text }) => {
  const mailOptions = {
    from: `From Mr.<${env.GOOGLE_EMAIL}>`,
    to,
    subject,
    text,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  console.log("email sent");
};
