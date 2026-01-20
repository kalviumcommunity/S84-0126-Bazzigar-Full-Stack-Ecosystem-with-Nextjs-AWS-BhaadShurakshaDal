import { NextResponse } from "next/server";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  try {
    const { to, subject, userName } = await req.json();

    const htmlTemplate = `
      <h2>Welcome to Kalvium, ${userName}! 🎉</h2>
      <p>Your account has been successfully created.</p>
      <p>Start learning at 
        <a href="https://app.kalvium.community">
          Kalvium Dashboard
        </a>
      </p>
      <hr />
      <small>This is an automated email. Please do not reply.</small>
    `;

    const emailData = {
      to,
      from: process.env.SENDGRID_SENDER!,
      subject,
      html: htmlTemplate,
    };

    const response = await sendgrid.send(emailData);

    console.log("Email sent successfully");
    console.log("Headers:", response[0].headers);

    return NextResponse.json({
      success: true,
      headers: response[0].headers,
    });
  } catch (error) {
    console.error("Email failed:", error);
    return NextResponse.json(
      { success: false, error },
      { status: 500 }
    );
  }
}
