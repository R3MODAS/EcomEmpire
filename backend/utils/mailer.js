const nodemailer = require("nodemailer")

const mailer = async (email,title,body) => {
    try{
        // create a transporter
        const transporter = await nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        // send the mail
        const info = await transporter.sendMail({
            from: "StudyNotion by Sharadindu Das",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })
        return info
    }catch(err){
        console.log(err)
    }
}

module.exports = mailer