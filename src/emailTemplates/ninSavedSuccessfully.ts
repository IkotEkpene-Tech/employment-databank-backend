export const ninSavedTemplate = (Name: string, maskedNin: string) => ({
  subject: "NIN Details Saved",
  htmlBody: `<div style="background:#f4f8f5;padding:40px 20px;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbe7df;">
    <div style="background:#00371e;padding:30px 24px;text-align:center;">
      <h2 style="margin:0;color:#ffffff;font-size:28px;">NIN Saved Successfully</h2>
    </div>

    <div style="padding:32px 24px;">
      <p style="font-size:16px;color:#333333;">Hello ${Name},</p>

      <p style="font-size:15px;line-height:1.7;color:#555555;">
        Your National Identification Number has been saved successfully.
      </p>

      <div style="background:#fff6ed;border:1px solid #ffd7b0;padding:20px;border-radius:16px;margin:24px 0;">
        <p style="margin:0;color:#c96a12;font-size:12px;text-transform:uppercase;font-weight:bold;letter-spacing:1px;">
          Saved NIN
        </p>
        <p style="margin:10px 0 0;font-size:24px;font-weight:bold;color:#ec7913;">${maskedNin}</p>
      </div>

      <p style="font-size:15px;line-height:1.7;color:#555555;">
        You may now proceed to the next stage of your registration.
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
