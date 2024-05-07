import { emailSender, type Email } from "wasp/server/email";
import type { Context } from '../types';

const emailToSend: Email = {
  to: '',
  subject: 'Your QAGPT subscription is about to expire',
  text: "Hey There! This is just a reminder that your subscription for https://CoverLetterGPT.xyz is expiring in just two weeks. If you have any questions or concerns regarding your subscription, please don't hesitate to reach out. Thanks again for your support and good luck with your job search! -Vince from CoverLetterGPT",
  html: `<html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>QAGPT Subscription Expiration Notice</title>
          </head>
          <body>
            <p>Hey There!</p>
            
            <p>This is just a reminder that your subscription for https://CoverLetterGPT.xyz is expiring in just two weeks.</p>
            
            <p>If you have any questions or concerns regarding your subscription, please don't hesitate to reach out.</p>
            
            <p>Thanks again for your support and good luck with your job search!</p>
            <p>-Vince from QAGPT</p>
          </body>
        </html>`,
};

export async function sendExpirationNotice(_args: unknown, context: Context) {
  const currentDate = new Date();
  const twoWeeksFromNow = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000);

  console.log('Starting CRON JOB: \n\nSending expiration notices...');

  const users = await context.entities.User.findMany({
    where: {
      datePaid: {
        equals: twoWeeksFromNow,
      },
      notifyPaymentExpires: true,
    },
  });

  console.log('Sending expiration notices to users: ', users.length);

  if (users.length === 0) {
    console.log('No users to send expiration notices to.');
    return;
  }
  await Promise.allSettled(
    users.map(async (user) => {
      if (user.email) {
        try {
          emailToSend.to = user.email;
          await emailSender.send(emailToSend);
        } catch (error) {
          console.error('Error sending expiration notice to user: ', user.id, error);
        }
      }
    })
  );
}
