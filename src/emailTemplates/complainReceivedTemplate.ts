export const complaintReceivedTemplate = (
  fullName: string,
  phoneNumber: string,
  nin: string,
  description: string,
  currentPage: string,
  errorEncountered?: string | null,
) => ({
  subject: "New Complaint Received – Ikot Ekpene Registration Portal",
  htmlBody: `<div style="background:#f4f8f5;padding:40px 20px;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbe7df;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#00371e,#00572f,#007a44);padding:30px 24px;text-align:center;">
      <h2 style="margin:0;color:#ffffff;font-size:26px;">New Complaint Received</h2>
      <p style="margin:10px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
        Ikot Ekpene Job &amp; Support Registration Portal
      </p>
    </div>

    <div style="padding:32px 24px;">

      <p style="font-size:15px;line-height:1.7;color:#555555;">
        A new complaint has been submitted on the registration portal. Please review the details below and take the necessary action.
      </p>

      <!-- Status Badge -->
      <div style="text-align:center;margin:20px 0;">
        <span style="display:inline-block;background:#fff6ed;border:1px solid #ffd7b0;color:#ec7913;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;padding:6px 18px;border-radius:20px;">
          Status: Pending
        </span>
      </div>

      <!-- Complainant Details -->
      <div style="background:#f4f8f5;border:1px solid #d5e6db;border-radius:16px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 14px;color:#00572f;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
          Complainant Details
        </p>

        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e0ede5;width:40%;">
              <span style="font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:0.5px;">Full Name</span>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #e0ede5;">
              <span style="font-size:14px;font-weight:600;color:#1a3d2b;">${fullName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e0ede5;">
              <span style="font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:0.5px;">Phone Number</span>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #e0ede5;">
              <span style="font-size:14px;font-weight:600;color:#1a3d2b;">${phoneNumber}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;">
              <span style="font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:0.5px;">NIN</span>
            </td>
            <td style="padding:8px 0;">
              <span style="font-size:14px;font-weight:600;color:#1a3d2b;">${nin}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Complaint Details -->
      <div style="background:#f4f8f5;border:1px solid #d5e6db;border-radius:16px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 14px;color:#00572f;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
          Complaint Details
        </p>

        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e0ede5;width:40%;">
              <span style="font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:0.5px;">Page / Step</span>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #e0ede5;">
              <span style="font-size:14px;font-weight:600;color:#1a3d2b;">${currentPage}</span>
            </td>
          </tr>
          ${errorEncountered ? `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e0ede5;">
              <span style="font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:0.5px;">Error Encountered</span>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #e0ede5;">
              <span style="font-size:14px;font-weight:600;color:#c0392b;">${errorEncountered}</span>
            </td>
          </tr>
          ` : ""}
        </table>
      </div>

      <!-- Description Box -->
      <div style="background:#fff6ed;border:1px solid #ffd7b0;border-radius:16px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 10px;color:#c96a12;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
          Description
        </p>
        <p style="margin:0;font-size:14px;color:#5a3e28;line-height:1.8;">
          ${description}
        </p>
      </div>

      <!-- Timestamp -->
      <div style="background:#f4f8f5;border:1px solid #d5e6db;border-radius:12px;padding:14px 18px;margin:20px 0;text-align:center;">
        <p style="margin:0;font-size:12px;color:#888888;">
          Submitted on &nbsp;
          <strong style="color:#00572f;">${new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</strong>
          &nbsp; at &nbsp;
          <strong style="color:#00572f;">${new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })} UTC</strong>
        </p>
      </div>

      <div style="margin-top:30px;text-align:center;color:#777777;font-size:14px;">
        Please log in to the admin dashboard to resolve this complaint.
      </div>

      <div style="margin-top:10px;text-align:center;color:#00371e;font-size:15px;font-weight:bold;">
        Ikot Ekpene Local Government
      </div>

    </div>
  </div>
</div>`,
});