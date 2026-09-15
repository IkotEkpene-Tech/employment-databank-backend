export const paymentSuccessfulTemplate = (transactionReference: string) => ({
  subject: "Payment Successful",
  htmlBody: `<div style="background:#f4f8f5;padding:40px 20px;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbe7df;">
    <div style="background:linear-gradient(135deg,#00572f,#007a44);padding:32px 24px;text-align:center;">
      <h2 style="margin:0;color:#ffffff;font-size:28px;">Payment Successful</h2>
    </div>

    <div style="padding:32px 24px;">
      <p style="font-size:16px;color:#333333;">Hello User,</p>

      <p style="font-size:15px;line-height:1.7;color:#555555;">
        Your payment of ₦500 has been received successfully.
      </p>

      <div style="background:#f4f8f5;border:1px solid #d5e6db;padding:20px;border-radius:16px;margin:24px 0;">
        <p style="margin:0 0 8px;color:#00572f;font-size:12px;text-transform:uppercase;font-weight:bold;letter-spacing:1px;">
          Payment Reference
        </p>
        <p style="margin:0;font-size:20px;font-weight:bold;color:#00371e;">${transactionReference}</p>
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
</div>`,
});
