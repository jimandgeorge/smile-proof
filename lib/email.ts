import { Resend } from 'resend';

const FROM = 'SmileProof <hello@smileproof.co.uk>';
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function sendReviewInviteEmail({
  to,
  patientName,
  practiceName,
  practiceSlug,
  token,
}: {
  to: string;
  patientName: string | null;
  practiceName: string;
  practiceSlug: string;
  token: string;
}) {
  const reviewUrl = `${SITE}/practices/${practiceSlug}/review?ref=${token}`;
  const greeting = patientName ? `Hi ${patientName},` : 'Hi,';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;border:1.5px solid #e8e0d4;overflow:hidden;max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1c4535;padding:28px 36px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#f8f5f0;letter-spacing:-0.02em;">SmileProof</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(248,245,240,0.6);letter-spacing:0.04em;text-transform:uppercase;">Verified dental reviews</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 28px;">
            <p style="margin:0 0 8px;font-size:15px;color:#2d2d2d;">${greeting}</p>
            <p style="margin:0 0 20px;font-size:15px;color:#2d2d2d;line-height:1.65;">
              <strong>${practiceName}</strong> would love to hear about your recent experience. It only takes a couple of minutes, and your feedback helps other patients make informed decisions.
            </p>

            <!-- CTA button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="background:#1c4535;border-radius:8px;">
                  <a href="${reviewUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#f8f5f0;text-decoration:none;">
                    Write a review →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
              Your review will be publicly visible on SmileProof. You won't be asked to create an account.<br>
              If you didn't visit ${practiceName} recently, you can ignore this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f5f0;padding:18px 36px;border-top:1px solid #e8e0d4;">
            <p style="margin:0;font-size:11px;color:#aaa;">
              Sent by SmileProof on behalf of ${practiceName} · <a href="${SITE}" style="color:#1c4535;text-decoration:none;">smileproof.co.uk</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: FROM,
    to,
    subject: `How was your visit to ${practiceName}?`,
    html,
  });
}

export async function sendResponseNotificationEmail({
  to,
  reviewerName,
  practiceName,
  practiceSlug,
  reviewTitle,
  reviewBody,
  responseBody,
}: {
  to: string;
  reviewerName: string | null;
  practiceName: string;
  practiceSlug: string;
  reviewTitle: string | null;
  reviewBody: string;
  responseBody: string;
}) {
  const profileUrl = `${SITE}/practices/${practiceSlug}`;
  const greeting = reviewerName ? `Hi ${reviewerName},` : 'Hi,';
  const reviewSnippet = reviewTitle ?? reviewBody.slice(0, 80) + (reviewBody.length > 80 ? '…' : '');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;border:1.5px solid #e8e0d4;overflow:hidden;max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1c4535;padding:28px 36px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#f8f5f0;letter-spacing:-0.02em;">SmileProof</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(248,245,240,0.6);letter-spacing:0.04em;text-transform:uppercase;">Verified dental reviews</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 28px;">
            <p style="margin:0 0 8px;font-size:15px;color:#2d2d2d;">${greeting}</p>
            <p style="margin:0 0 24px;font-size:15px;color:#2d2d2d;line-height:1.65;">
              <strong>${practiceName}</strong> has replied to your review on SmileProof.
            </p>

            <!-- Review snippet -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
              <tr>
                <td style="background:#f8f5f0;border-radius:10px;padding:16px 20px;border-left:3px solid #c8c8be;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.06em;">Your review</p>
                  <p style="margin:0;font-size:14px;color:#555;line-height:1.6;font-style:italic;">&ldquo;${reviewSnippet}&rdquo;</p>
                </td>
              </tr>
            </table>

            <!-- Practice response -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:#e8f0ec;border-radius:10px;padding:16px 20px;border-left:3px solid #1c4535;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#1c4535;text-transform:uppercase;letter-spacing:0.06em;">${practiceName} replied</p>
                  <p style="margin:0;font-size:14px;color:#2d2d2d;line-height:1.6;">${responseBody}</p>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="background:#1c4535;border-radius:8px;">
                  <a href="${profileUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#f8f5f0;text-decoration:none;">
                    View on SmileProof →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
              You received this because you left a review for ${practiceName} on SmileProof.<br>
              <a href="${SITE}" style="color:#1c4535;text-decoration:none;">smileproof.co.uk</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f5f0;padding:18px 36px;border-top:1px solid #e8e0d4;">
            <p style="margin:0;font-size:11px;color:#aaa;">
              SmileProof · Verified dental reviews for UK patients · <a href="${SITE}" style="color:#1c4535;text-decoration:none;">smileproof.co.uk</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${practiceName} replied to your SmileProof review`,
    html,
  });
}

export async function sendNewReviewNotification({
  to,
  practiceName,
  practiceSlug,
  reviewerName,
  ratingOverall,
  reviewTitle,
  reviewBody,
}: {
  to: string;
  practiceName: string;
  practiceSlug: string;
  reviewerName: string | null;
  ratingOverall: number;
  reviewTitle: string | null;
  reviewBody: string;
}) {
  const dashboardUrl = `${SITE}/practices/${practiceSlug}/dashboard`;
  const stars = '★'.repeat(ratingOverall) + '☆'.repeat(5 - ratingOverall);
  const snippet = reviewBody.length > 120 ? reviewBody.slice(0, 120) + '…' : reviewBody;
  const from = reviewerName ?? 'A patient';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;border:1.5px solid #e8e0d4;overflow:hidden;max-width:100%;">
        <tr><td style="background:#1c4535;padding:28px 36px;">
          <p style="margin:0;font-size:18px;font-weight:700;color:#f8f5f0;letter-spacing:-0.02em;">SmileProof</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(248,245,240,0.6);letter-spacing:0.04em;text-transform:uppercase;">Verified dental reviews</p>
        </td></tr>
        <tr><td style="padding:36px 36px 28px;">
          <p style="margin:0 0 16px;font-size:15px;color:#2d2d2d;">Hi,</p>
          <p style="margin:0 0 20px;font-size:15px;color:#2d2d2d;line-height:1.65;">
            <strong>${from}</strong> has left a new review for <strong>${practiceName}</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="background:#f8f5f0;border-radius:10px;padding:16px 20px;border-left:3px solid #1c4535;">
              <p style="margin:0 0 6px;font-size:16px;color:#c8960a;letter-spacing:0.05em;">${stars}</p>
              ${reviewTitle ? `<p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#2d2d2d;">${reviewTitle}</p>` : ''}
              <p style="margin:0;font-size:14px;color:#555;line-height:1.6;font-style:italic;">&ldquo;${snippet}&rdquo;</p>
            </td></tr>
          </table>
          <p style="margin:0 0 24px;font-size:13px;color:#888;line-height:1.6;">
            The review is pending moderation and will appear on your profile once approved.
            You can respond to it from your dashboard.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="background:#1c4535;border-radius:8px;">
              <a href="${dashboardUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#f8f5f0;text-decoration:none;">
                View dashboard →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f8f5f0;padding:18px 36px;border-top:1px solid #e8e0d4;">
          <p style="margin:0;font-size:11px;color:#aaa;">SmileProof · <a href="${SITE}" style="color:#1c4535;text-decoration:none;">smileproof.co.uk</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: FROM,
    to,
    subject: `New review for ${practiceName} on SmileProof`,
    html,
  });
}

export async function sendNewEnquiryNotification({
  to,
  practiceName,
  practiceSlug,
  patientName,
  patientEmail,
  message,
  treatmentInterest,
}: {
  to: string;
  practiceName: string;
  practiceSlug: string;
  patientName: string;
  patientEmail: string;
  message?: string;
  treatmentInterest?: string;
}) {
  const dashboardUrl = `${SITE}/practices/${practiceSlug}/dashboard`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;border:1.5px solid #e8e0d4;overflow:hidden;max-width:100%;">
        <tr><td style="background:#1c4535;padding:28px 36px;">
          <p style="margin:0;font-size:18px;font-weight:700;color:#f8f5f0;letter-spacing:-0.02em;">SmileProof</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(248,245,240,0.6);letter-spacing:0.04em;text-transform:uppercase;">Verified dental reviews</p>
        </td></tr>
        <tr><td style="padding:36px 36px 28px;">
          <p style="margin:0 0 16px;font-size:15px;color:#2d2d2d;">Hi,</p>
          <p style="margin:0 0 20px;font-size:15px;color:#2d2d2d;line-height:1.65;">
            You have a new patient enquiry for <strong>${practiceName}</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="background:#f8f5f0;border-radius:10px;padding:16px 20px;">
              <p style="margin:0 0 10px;font-size:13px;color:#555;"><strong style="color:#2d2d2d;">Name:</strong> ${patientName}</p>
              <p style="margin:0 0 10px;font-size:13px;color:#555;"><strong style="color:#2d2d2d;">Email:</strong> <a href="mailto:${patientEmail}" style="color:#1c4535;">${patientEmail}</a></p>
              ${treatmentInterest ? `<p style="margin:0 0 10px;font-size:13px;color:#555;"><strong style="color:#2d2d2d;">Treatment:</strong> ${treatmentInterest}</p>` : ''}
              ${message ? `<p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#2d2d2d;">Message:</p><p style="margin:0;font-size:14px;color:#555;line-height:1.6;">${message}</p>` : ''}
            </td></tr>
          </table>
          <p style="margin:0 0 24px;font-size:13px;color:#888;">Reply directly to ${patientEmail} to get in touch.</p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="background:#1c4535;border-radius:8px;">
              <a href="${dashboardUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#f8f5f0;text-decoration:none;">
                View all enquiries →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f8f5f0;padding:18px 36px;border-top:1px solid #e8e0d4;">
          <p style="margin:0;font-size:11px;color:#aaa;">SmileProof · <a href="${SITE}" style="color:#1c4535;text-decoration:none;">smileproof.co.uk</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: FROM,
    to,
    subject: `New enquiry from ${patientName} — ${practiceName}`,
    html,
  });
}
