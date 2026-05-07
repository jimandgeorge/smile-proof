import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
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

  return resend.emails.send({
    from: FROM,
    to,
    subject: `How was your visit to ${practiceName}?`,
    html,
  });
}
