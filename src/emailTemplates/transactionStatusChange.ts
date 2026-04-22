export const transactionStatusChange = (transactionReference: string, transactionStatus:string) => ({
  subject: "Transaction Updated",
  htmlBody: `<div style="background:#f4f8f5;padding:40px 20px;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbe7df;">
    <div style="background:#00572f;padding:28px 24px;text-align:center;">
      <h2 style="margin:0;color:#ffffff;font-size:26px;">Transaction Update</h2>
    </div>

    <div style="padding:32px 24px;">
      <p style="font-size:16px;color:#333333;">Hello User,</p>

      <p style="font-size:15px;line-height:1.7;color:#555555;">
        Your transaction status has been updated.
      </p>

      <div style="background:#f4f8f5;border:1px solid #d5e6db;padding:20px;border-radius:16px;margin:24px 0;text-align:center;">
        <p style="margin:0;color:#666666;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Current Status</p>
        <p style="margin:10px 0 0;font-size:28px;font-weight:bold;color:#00572f;">${transactionStatus}</p>
      </div>

      <p style="font-size:15px;line-height:1.7;color:#555555;">
        Transaction Reference: <strong>${transactionReference}</strong>
      </p>

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
</div>`,
});
