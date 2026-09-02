import nodemailer from "nodemailer";
import env from "../../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.mail.host,
  port: env.mail.port,
  secure: env.mail.port === 465,

  auth: {
    user: env.mail.user,
    pass: env.mail.password,
  },
});

const sendVerificationEmail = async ({
  email,
  name,
  verificationToken,
}) => {
  const verificationUrl =
    `${env.apiBaseUrl}/api/v1/auth/verify-email` +
    `?token=${encodeURIComponent(verificationToken)}`;

  await transporter.sendMail({
    from: env.mail.from,
    to: email,
    subject: "Verify your HMS account",

    text: `
Hello ${name},

Please verify your HMS account by clicking the following link:

${verificationUrl}

This verification link will expire in 30 minutes.

If you did not create this account, you can safely ignore this email.

Regards,
HMS Team
`.trim(),
  });
};

const sendPasswordResetEmail = async({
email,
name,
resetToken
}) => {
const resetUrl = `${env.apiBaseUrl}/reset-password?token=${encodeURIComponent(
    resetToken
)}`;  
  await transporter.sendMail({
   from: env.mail.from,
   to: email,
   subject: "Reset your HMS password",
   text:
    `Hello ${name},

     We received a request to reset your HMS account password.

     Please use the following link to reset your password:

     ${resetUrl}

     This password reset link will expire in 30 minutes.

     If you did not request a password reset, you can safely ignore this email.


     Regards
     HMS Team`.trim()
    });

};


export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
};