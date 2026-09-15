export const accessCodeGeneratedTemplate = (
  accessCode: string,
  maskedNin: string,
) => ({
  subject: "Your access code for the Ikot Ekpene Job & Support Registration Portal",
  htmlBody: `<div style="background:#f4f8f5;padding:40px 20px;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbe7df;">
    <div style="background:linear-gradient(135deg,#00371e,#00572f,#007a44);padding:30px 24px;text-align:center;">
      <h2 style="margin:0;color:#ffffff;font-size:28px;">Access Code Generated</h2>
      <p style="margin:10px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
        Ikot Ekpene Job & Support Registration Portal
      </p>
    </div>

    <div style="padding:32px 24px;">
      <p style="font-size:16px;color:#333333;">Hello,</p>

      <p style="font-size:15px;line-height:1.7;color:#555555;">
        Your payment was received for the application linked to NIN ending in <strong>${maskedNin}</strong>.
        Use the access code below together with this NIN whenever you want to start or resume your application.
      </p>

      <div style="background:#fff6ed;border:1px solid #ffd7b0;padding:20px;border-radius:16px;margin:24px 0;text-align:center;">
        <p style="margin:0;color:#c96a12;font-size:12px;text-transform:uppercase;font-weight:bold;letter-spacing:1px;">
          Access Code
        </p>
        <p style="margin:12px 0 0;font-size:32px;font-weight:bold;color:#ec7913;letter-spacing:4px;">
          ${accessCode}
        </p>
      </div>

      <div style="background:#f4f8f5;border:1px solid #d5e6db;padding:18px;border-radius:16px;margin:24px 0;">
        <p style="margin:0 0 10px;color:#00572f;font-size:13px;font-weight:bold;">
          Important Information
        </p>

        <ul style="padding-left:18px;margin:0;color:#555555;font-size:14px;line-height:1.8;">
          <li>Your access code will expire after 72 hours.</li>
          <li>You can use it as many times as you need until it expires, to start or resume your application.</li>
          <li>Please save it somewhere safe — it will only be shown once on the portal.</li>
          <li>If it expires before you finish, you will need to pay again for a new one.</li>
        </ul>
      </div>

      <div style="margin-top:30px;text-align:center;color:#777777;font-size:14px;">
        Thank You
      </div>

      <div style="margin-top:10px;text-align:center;color:#00371e;font-size:15px;font-weight:bold;">
        Ikot Ekpene Local Government
      </div>
    </div>
  </div>
</div>`,
});
