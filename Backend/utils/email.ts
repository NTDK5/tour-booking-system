import nodemailer from 'nodemailer';
import logger from './logger';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'natantamiru18@gmail.com',
        pass: process.env.EMAIL_PASS || 'zwwg qidc wajc mijd',
    },
});

export const sendEmail = async (options: { email: string; subject: string; html: string }) => {
    try {
        await transporter.sendMail({
            from: `"Dorze Tours" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
        });
    } catch (error) {
        logger.error('Email sending failed', error);
        throw new Error('Email could not be sent');
    }
};
