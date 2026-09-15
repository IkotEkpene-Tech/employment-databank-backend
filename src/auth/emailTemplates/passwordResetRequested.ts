export const passwordResetRequestedTemplate = (resetUrl: string) => ({
  subject: "Reset your password",
  htmlBody: `<div style="background:#f4f8f5;padding:40px 20px;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbe7df;">
    <div style="background:linear-gradient(135deg,#00371e,#00572f,#007a44);padding:30px 24px;text-align:center;">
      <h2 style="margin:0;color:#ffffff;font-size:26px;">Reset Your Password</h2>
      <p style="margin:10px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
        Ikot Ekpene Job & Support Registration Portal
      </p>
    </div>

    <div style="padding:32px 24px;">
      <p style="font-size:16px;color:#333333;">Hello,</p>

      <p style="font-size:15px;line-height:1.7;color:#555555;">
        We received a request to reset the password on your account. Click the button below to choose a new password.
        This link expires in 1 hour.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#00572f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:bold;font-size:15px;">
          Reset my password
        </a>
      </div>

      <p style="font-size:13px;line-height:1.7;color:#888888;">
        If you did not request this, you can safely ignore this email — your password will not be changed.
      </p>

      <div style="margin-top:20px;text-align:center;color:#00371e;font-size:15px;font-weight:bold;">
        Ikot Ekpene Local Government
      </div>
    </div>
  </div>
</div>`,
});
