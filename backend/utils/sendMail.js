import { Resend } from "resend";

export const sendmail = async (options) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "noreply@yourdomain.com", // 👈 Replace with your verified domain sender
      to: options.email,
      subject: options.subject,
      html: `<p>${options.message}</p>`, // or use HTML templates if you prefer
    });

    console.log("Email sent successfully ✅");
  } catch (error) {
    console.error("Email sending failed ❌", error);
  }
};
