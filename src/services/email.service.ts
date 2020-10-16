import * as nodemailer from 'nodemailer';
import config from '../config/config'
import logger from '../config/logger';

const transport = nodemailer.createTransport(config.email.smtp);

if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

export const EmailService = {

  //! Send an email
  sendEmail: async (to:string, subject:string, text:string) => {
    const msg = { from: config.email.from, to, subject, text };
    await transport.sendMail(msg);
  },

  //! Send reset password email
  sendResetPasswordEmail: async (to: any, token:any) => {
    const subject = 'Reset password';
    // replace this url with the link to the reset password page of your front-end app
    const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
    const text = `Dear user,
    To reset your password, click on this link: ${resetPasswordUrl}
    If you did not request any password resets, then ignore this email.`;
    await EmailService.sendEmail(to, subject, text);
  },
}