

export const registrationCompletedTemplate = (registrationId: string, userName:string) => ({
  subject: "Registration Completed",
  htmlBody: `<div style="background:#f4f8f5;padding:40px 20px;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbe7df;">
    <div style="background:linear-gradient(135deg,#00371e,#00572f,#007a44);padding:32px 24px;text-align:center;">
      <h2 style="margin:0;color:#ffffff;font-size:28px;">Registration Successful</h2>
      <p style="margin:10px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
        Welcome to the Ikot Ekpene Job & Support Registration Portal
      </p>
    </div>

    <div style="padding:32px 24px;">
      <p style="font-size:16px;color:#333333;">Hello ${userName},</p>

      <p style="font-size:15px;line-height:1.7;color:#555555;">
        Your registration has been completed successfully. Below is your user Id, please keep it for future reference.
      </p>

      <div style="background:#f4f8f5;border:1px solid #d5e6db;padding:20px;border-radius:16px;margin:24px 0;">
        <p style="margin:0;color:#00572f;font-size:12px;text-transform:uppercase;font-weight:bold;letter-spacing:1px;">
          User Registration ID:
        </p>
        <p style="margin:10px 0 0;font-size:22px;font-weight:bold;color:#00371e;">${registrationId}</p>
      </div>

      <p style="font-size:15px;line-height:1.7;color:#555555;">
        Thank you for registering. Your application will now be reviewed, and you may be contacted for further steps.
      </p>

      <div style="margin-top:30px;padding-top:20px;border-top:1px solid #eeeeee;">
       <p style="margin-top:30px;text-align:center;">
       Thank You
      </p><br />
        <p style="font-size:13px;color:#777777;line-height:1.6;">
          Ikot Ekpene Local Government Area
        </p>
      </div>
    </div>
  </div>
</div>`,
});
