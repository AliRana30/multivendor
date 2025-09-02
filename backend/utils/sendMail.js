import nodemailer from 'nodemailer'

export const sendmail =async (options)=>{
    const trasnporter = nodemailer.createTransport({
         host : process.env.SMTP_HOST,
         port : process.env.SMTP_PORT,
         service : process.env.SMTP_SERVICE,
         auth:{
            user : process.env.SMTP_MAIL,
            pass : process.env.SMTP_PASSWORD
         }
    })

    const mailoptions = {
        from : process.env.SMTP_MAIL,
        to : options.email,
        subject : options.subject,
        text : options.message
    }

    await trasnporter.sendMail(mailoptions)
}