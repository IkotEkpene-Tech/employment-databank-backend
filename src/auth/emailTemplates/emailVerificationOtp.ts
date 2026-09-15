export const emailVerificationOtpTemplate = (otp: string) => ({
  subject: "Verify your email address",
  htmlBody: `<div style="background:#f4f8f5;padding:40px 20px;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbe7df;">
    <div style="background:linear-gradient(135deg,#00371e,#00572f,#007a44);padding:30px 24px;text-align:center;">
      <h2 style="margin:0;color:#ffffff;font-size:26px;">Verify Your Email</h2>
      <p style="margin:10px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
        Ikot Ekpene Job & Support Registration Portal
      </p>
    </div>

    <div style="padding:32px 24px;">
      <p style="font-size:16px;color:#333333;">Hello,</p>

      <p style="font-size:15px;line-height:1.7;color:#555555;">
        Use the code below to verify your email address and finish creating your account.
      </p>

      <div style="background:#fff6ed;border:1px solid #ffd7b0;padding:20px;border-radius:16px;margin:24px 0;text-align:center;">
        <p style="margin:0;color:#c96a12;font-size:12px;text-transform:uppercase;font-weight:bold;letter-spacing:1px;">
          Verification Code
        </p>
        <p style="margin:12px 0 0;font-size:32px;font-weight:bold;color:#ec7913;letter-spacing:8px;">
          ${otp}
        </p>
      </div>

      <p style="font-size:13px;line-height:1.7;color:#888888;">
        This code expires in 15 minutes. If you did not create this account, you can ignore this email.
      </p>

      <div style="margin-top:20px;text-align:center;color:#00371e;font-size:15px;font-weight:bold;">
        Ikot Ekpene Local Government
      </div>
    </div>
  </div>
</div>`,
});
