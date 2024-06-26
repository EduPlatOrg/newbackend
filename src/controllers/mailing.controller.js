import { sendSupportMail, sendSupportMailConfirmation } from "../services/mailing.js";

export const supportMail = async (req, res) => {
    const { name, surname, email, subject, message } = req.body
    try {
        await sendSupportMail(name, surname, email, subject, message);
        await sendSupportMailConfirmation(name, surname, email, subject, message);
        res.status(200).json({
            success: true,
            message: 'Email sent.',
        });
    } catch (error) {
        console.log(error, '<--- ERROR');
        res.status(500).json({
            success: false,
            message: 'Error sending support email. Please try again.',
        });
    }
}
