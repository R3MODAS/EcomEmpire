const nodemailer = require("nodemailer")

const mailer = async (email,title,body) => {
    try{
        // create a transporter
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        // send the mail
        const mailResponse = transporter.sendMail({
            from: `StudyNotion | Sharadindu Das`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })

        // return the response
        return mailResponse

    }catch(err){
        console.log(err.message);
    }
}

module.exports = mailer