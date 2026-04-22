export const transactionCreatedTemplate = (transactionReference: string) => ({
  subject: "Transaction Created",
  htmlBody: `
    <div style="background:#f4f8f5;padding:40px 20px;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbe7df;">
    <div style="background:linear-gradient(135deg,#00371e,#00572f,#007a44);padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:28px;">Ikot Ekpene LGA</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;">
        Job & Support Registration Portal
      </p>
    </div>

    <div style="padding:32px 24px;">
      <p style="font-size:16px;color:#333333;">Hello {{fullName}},</p>

      <p style="font-size:15px;line-height:1.7;color:#555555;">
        A transaction has been created for your registration.
      </p>

      <div style="background:#fff6ed;border:1px solid #ffd7b0;padding:20px;border-radius:16px;margin:24px 0;">
        <p style="margin:0 0 8px;color:#c96a12;font-size:12px;text-transform:uppercase;font-weight:bold;letter-spacing:1px;">
          Transaction Details
        </p>
        <p style="margin:0;font-size:24px;font-weight:bold;color:#ec7913;">₦500</p>
        <p style="margin:12px 0 0;color:#6b4a24;font-size:14px;">Reference Number: ${transactionReference}</p>
      </div>

      <p style="font-size:15px;line-height:1.7;color:#555555;">
        Please keep the reference number for disputes.
      </p>

      <div style="margin-top:30px;text-align:center;">
       Thank You
      </div>

        <div style="margin-top:30px;text-align:center;">
       Ikot Ekpene Local Government
      </div>
    </div>
  </div>
</div>
`,
});
