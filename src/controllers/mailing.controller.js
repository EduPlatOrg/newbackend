import { sendSupportMail } from "../services/mailing.js";

export const supportMail = async (req, res) => {
    const { sender, subject, message } = req.body
    try {
        await sendSupportMail(sender, subject, message)
        res.status(200).json({
            success: true,
            message: 'Email sent.',
        });
    } catch (error) {
        console.log(error, '<--- ERROR');
        res.status(500).json({
            success: false,
            message: 'Error sending suppor email. Please try again.',
        });
    }
}
