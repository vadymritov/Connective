import type { NextApiRequest, NextApiResponse } from "next";
import { mailOptions, transporter } from "../../../services/nodemailer";
import { EmailContent } from "../../../types/types";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = req.body.data;
  if (req.method === "POST") {
    try {
      if (data.email) {
        if (Array.isArray(data.email)) {
          for (var i = 0; i < data.email.length; i++) {
            console.log(data.email[i]);
            mailOptions.to = data.email[i];
            await mailer(data);
          }
        } else {
          mailOptions.to = data.email;
          await mailer(data);
        }
      } else {
        await mailer(data);
      }
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(422).json({ success: false, message: error.message });
    }
  }
};

async function mailer(data: EmailContent) {
  await transporter.sendMail({
    ...mailOptions,
    subject: data.subject,
    text: data.msg.replace(/<[^>]*>?/gm, ""),
    html: data.msg,
  });
}

export default handler;
