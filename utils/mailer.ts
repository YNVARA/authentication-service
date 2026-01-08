import nodemailer from 'nodemailer';

const mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
//     const result = await mailTransporter.sendMail({
//         from: `"MyApp" <${process.env.SMTP_USER}>`,
//         to,
//         subject,
//         html
//     });

//     return result;
// }

const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    const result = await mailTransporter.sendMail({
        from: `"STYX" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
    });
    return result;
}

export default sendEmail;