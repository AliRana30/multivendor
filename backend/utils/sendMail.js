import { Resend } from "resend";

export const sendmail = async (options) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "noreply@multimarts.vercel.app", 
      to: options.email,
      subject: options.subject,
      html: `<p>${options.message}</p>`,
    });
    console.log("Email sent successfully ✅");
  } catch (error) {
    console.log("Resend key loaded:", !!process.env.RESEND_API_KEY);
    console.error("Email sending failed ❌", error);
  }
};


