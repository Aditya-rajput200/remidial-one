type EmailTemplate = { subject: string; html: string };

function layout(preheader: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#F5F6F2;font-family:Arial,Helvetica,sans-serif;color:#14161A;">
    <span style="display:none;font-size:1px;color:#F5F6F2;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#FFFFFF;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#14161A;padding:20px 28px;">
                <span style="color:#C4EE40;font-weight:700;font-size:16px;">Remedial One</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">${bodyHtml}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#C4EE40;color:#14161A;font-weight:700;font-size:14px;text-decoration:none;border-radius:999px;">${label}</a>`;
}

// Values below come straight from public, unauthenticated form submissions —
// escape before interpolating into HTML so a "<" or "&" in someone's message
// can't break the table layout (this is an internal notification email, not
// a security boundary, but broken markup would still be an unreadable email).
function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function factRow(label: string, value: string): string {
  return `<tr><td style="padding:6px 8px 6px 0;font-size:13px;color:#6B7280;width:130px;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:6px 0;font-size:14px;color:#14161A;">${escapeHtml(value)}</td></tr>`;
}

export function verificationEmail(name: string, link: string): EmailTemplate {
  return {
    subject: "Verify your email — Remedial One",
    html: layout(
      "Confirm your email to activate your Remedial One account.",
      `<p style="font-size:15px;line-height:1.5;">Hi ${name},</p>
       <p style="font-size:15px;line-height:1.5;">Welcome to Remedial One. Confirm your email address to activate your account.</p>
       ${button("Verify email", link)}
       <p style="margin-top:24px;font-size:12px;color:#6B7280;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>`,
    ),
  };
}

export function passwordResetEmail(name: string, link: string): EmailTemplate {
  return {
    subject: "Reset your password — Remedial One",
    html: layout(
      "Reset your Remedial One password.",
      `<p style="font-size:15px;line-height:1.5;">Hi ${name},</p>
       <p style="font-size:15px;line-height:1.5;">We received a request to reset your password. Click below to choose a new one.</p>
       ${button("Reset password", link)}
       <p style="margin-top:24px;font-size:12px;color:#6B7280;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
    ),
  };
}

export function counsellingRequestNotificationEmail(input: {
  parentName: string;
  studentName: string;
  relation: string;
  email: string;
  phone: string;
  classBand?: string;
  focusArea?: string;
  preferredTime?: string;
  message?: string;
  adminUrl: string;
}): EmailTemplate {
  return {
    subject: `New counselling request — ${input.studentName}`,
    html: layout(
      `${input.parentName} requested free counselling for ${input.studentName}.`,
      `<p style="font-size:15px;line-height:1.5;">A new free counselling request came in from the website.</p>
       <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:12px;">
         ${factRow("Parent/guardian", input.parentName)}
         ${factRow("Student", input.studentName)}
         ${factRow("Relation", input.relation)}
         ${factRow("Email", input.email)}
         ${factRow("Phone", input.phone)}
         ${input.classBand ? factRow("Class", input.classBand) : ""}
         ${input.focusArea ? factRow("Focus area", input.focusArea) : ""}
         ${input.preferredTime ? factRow("Preferred time", input.preferredTime) : ""}
         ${input.message ? factRow("Message", input.message) : ""}
       </table>
       ${button("View in admin", input.adminUrl)}`,
    ),
  };
}

export function counsellingRequestConfirmationEmail(input: { parentName: string; studentName: string }): EmailTemplate {
  return {
    subject: "We've got your counselling request — Remedial One",
    html: layout(
      `Thanks for requesting free counselling for ${input.studentName}.`,
      `<p style="font-size:15px;line-height:1.5;">Hi ${input.parentName},</p>
       <p style="font-size:15px;line-height:1.5;">Thanks for requesting a free counselling call for <strong>${input.studentName}</strong>. Our team will reach out shortly to schedule a time.</p>
       <p style="margin-top:24px;font-size:12px;color:#6B7280;">If this wasn't you, you can safely ignore this email.</p>`,
    ),
  };
}

export function contactMessageNotificationEmail(input: {
  name: string;
  email: string;
  reason: string;
  message: string;
  adminUrl: string;
}): EmailTemplate {
  return {
    subject: `New contact message — ${input.name}`,
    html: layout(
      `${input.name} sent a message through the Contact page.`,
      `<p style="font-size:15px;line-height:1.5;">A new message came in from the Contact page.</p>
       <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:12px;">
         ${factRow("Name", input.name)}
         ${factRow("Email", input.email)}
         ${factRow("Reason", input.reason)}
         ${factRow("Message", input.message)}
       </table>
       ${button("View in admin", input.adminUrl)}`,
    ),
  };
}

export function noteSharedEmail(input: {
  studentName: string;
  mentorName: string;
  subjectName: string;
  noteTitle: string;
  downloadUrl: string;
}): EmailTemplate {
  return {
    subject: `${input.mentorName} shared a note with you — ${input.subjectName}`,
    html: layout(
      `${input.mentorName} shared "${input.noteTitle}" with you.`,
      `<p style="font-size:15px;line-height:1.5;">Hi ${input.studentName},</p>
       <p style="font-size:15px;line-height:1.5;"><strong>${input.mentorName}</strong> shared a new note for your <strong>${input.subjectName}</strong> session:</p>
       <p style="font-size:15px;line-height:1.5;font-weight:600;">${input.noteTitle}</p>
       ${button("Download note", input.downloadUrl)}
       <p style="margin-top:24px;font-size:12px;color:#6B7280;">You can find all shared notes in your Resources tab.</p>`,
    ),
  };
}
