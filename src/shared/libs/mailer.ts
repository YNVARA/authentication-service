import nodemailer from 'nodemailer';
import { env } from '../../config/env';

const mailTransporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: Number(env.smtp.port),
    secure: false,
    auth: {
        user: env.smtp.username,
        pass: env.smtp.password,
    },
});

export const send_email = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    const result = await mailTransporter.sendMail({
        from: `<${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    });
    return result;
};
