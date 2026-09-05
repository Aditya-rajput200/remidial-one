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
  phone?: string;
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
         ${input.phone ? factRow("Phone", input.phone) : ""}
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

// ---------------------------------------------------------------------------
// Teacher onboarding (Module 1 / Module 15).
// ---------------------------------------------------------------------------

/** Generic in-app-notification email copy. */
export function notificationEmail(input: {
  name: string;
  title: string;
  body?: string;
  actionUrl?: string;
}): EmailTemplate {
  return {
    subject: `${input.title} — Remedial One`,
    html: layout(input.title, [
      `<p style="font-size:15px;line-height:1.5;">Hi ${escapeHtml(input.name)},</p>`,
      `<p style="font-size:15px;line-height:1.5;">${escapeHtml(input.title)}</p>`,
      input.body ? `<p style="font-size:15px;line-height:1.5;color:#374151;">${escapeHtml(input.body)}</p>` : "",
      input.actionUrl ? button("Open Remedial One", input.actionUrl) : "",
    ].join("")),
  };
}

/** Sent to staff when a teacher lead comes in from the public form. */
export function teacherLeadNotificationEmail(input: {
  name: string;
  email: string;
  phone: string;
  subjects: string;
  adminUrl: string;
}): EmailTemplate {
  return {
    subject: `New teacher lead — ${input.name}`,
    html: layout(
      `${input.name} applied to teach on Remedial One.`,
      `<p style="font-size:15px;line-height:1.5;">A new teacher lead came in from the "Become a Mentor" page.</p>
       <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:12px;">
         ${factRow("Name", input.name)}
         ${factRow("Email", input.email)}
         ${factRow("Phone", input.phone)}
         ${factRow("Subjects", input.subjects)}
       </table>
       ${button("Review in admin", input.adminUrl)}`,
    ),
  };
}

/** The prefilled no-login application link, generated from the admin Leads page. */
export function teacherApplicationLinkEmail(input: { name: string; applicationUrl: string }): EmailTemplate {
  return {
    subject: "Complete your Remedial One teacher application",
    html: layout(
      "Your teacher application form is ready.",
      `<p style="font-size:15px;line-height:1.5;">Hi ${escapeHtml(input.name)},</p>
       <p style="font-size:15px;line-height:1.5;">Thanks for speaking with our team. Use the link below to complete your application — your academic and teaching details, working preference, and documents (Aadhaar, PAN, profile photo). No login needed; your progress is saved as you go.</p>
       ${button("Open your application", input.applicationUrl)}
       <p style="margin-top:24px;font-size:12px;color:#6B7280;">This private link expires in 30 days. If it lapses, ask us for a new one.</p>`,
    ),
  };
}

export function teacherCounselingScheduledEmail(input: { name: string; when: string; mode?: string }): EmailTemplate {
  return {
    subject: "Your Remedial One counseling call is scheduled",
    html: layout(
      "Your counseling call is scheduled.",
      `<p style="font-size:15px;line-height:1.5;">Hi ${escapeHtml(input.name)},</p>
       <p style="font-size:15px;line-height:1.5;">Your onboarding counseling call is scheduled for <strong>${escapeHtml(input.when)}</strong>${input.mode ? ` (${escapeHtml(input.mode)})` : ""}.</p>`,
    ),
  };
}

export function teacherDemoScheduledEmail(input: { name: string; when: string; meetingLink?: string }): EmailTemplate {
  return {
    subject: "Your Remedial One demo class is scheduled",
    html: layout(
      "Your demo class is scheduled.",
      `<p style="font-size:15px;line-height:1.5;">Hi ${escapeHtml(input.name)},</p>
       <p style="font-size:15px;line-height:1.5;">Your demo class is scheduled for <strong>${escapeHtml(input.when)}</strong>.</p>
       ${input.meetingLink ? button("Join the demo", input.meetingLink) : ""}`,
    ),
  };
}

export function teacherApprovedEmail(input: { name: string; setPasswordUrl: string }): EmailTemplate {
  return {
    subject: "You're approved to teach on Remedial One 🎉",
    html: layout(
      "Your teacher application has been approved.",
      `<p style="font-size:15px;line-height:1.5;">Hi ${escapeHtml(input.name)},</p>
       <p style="font-size:15px;line-height:1.5;">Congratulations — your application has been approved. Set a password to sign in; your teacher dashboard is unlocked once you do. Then finish your profile and set your availability to start getting students.</p>
       ${button("Set your password", input.setPasswordUrl)}
       <p style="margin-top:24px;font-size:12px;color:#6B7280;">This link expires in 24 hours. If it lapses, use "Forgot password" on the login page.</p>`,
    ),
  };
}

export function teacherRejectedEmail(input: { name: string; reason: string }): EmailTemplate {
  return {
    subject: "Update on your Remedial One teacher application",
    html: layout(
      "An update on your teacher application.",
      `<p style="font-size:15px;line-height:1.5;">Hi ${escapeHtml(input.name)},</p>
       <p style="font-size:15px;line-height:1.5;">Thank you for your interest in teaching on Remedial One. After review, we're not able to move forward with your application at this time.</p>
       <p style="font-size:15px;line-height:1.5;color:#374151;">${escapeHtml(input.reason)}</p>`,
    ),
  };
}

// Sent when the internal CRM (see Crm/my-app) provisions a student account
// here after a lead is enrolled — see app/api/integrations/crm/students.
export function studentAccountReadyEmail(input: { name: string; setPasswordUrl: string }): EmailTemplate {
  return {
    subject: "Your Remedial One student account is ready",
    html: layout(
      "Set a password to access your student dashboard.",
      `<p style="font-size:15px;line-height:1.5;">Hi ${escapeHtml(input.name)},</p>
       <p style="font-size:15px;line-height:1.5;">Your enrollment is confirmed and your student account is ready. Set a password to sign in and see your sessions, mentor, and progress.</p>
       ${button("Set your password", input.setPasswordUrl)}
       <p style="margin-top:24px;font-size:12px;color:#6B7280;">This link expires in 24 hours. If it lapses, use "Forgot password" on the login page.</p>`,
    ),
  };
}

export function teacherCorrectionEmail(input: { name: string; reason: string; onboardingUrl: string }): EmailTemplate {
  return {
    subject: "Action needed on your Remedial One teacher application",
    html: layout(
      "We need a few changes to your application.",
      `<p style="font-size:15px;line-height:1.5;">Hi ${escapeHtml(input.name)},</p>
       <p style="font-size:15px;line-height:1.5;">Our team reviewed your application and needs a few updates before we can proceed:</p>
       <p style="font-size:15px;line-height:1.5;color:#374151;">${escapeHtml(input.reason)}</p>
       ${button("Update your application", input.onboardingUrl)}`,
    ),
  };
}
