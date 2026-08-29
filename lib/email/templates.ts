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
