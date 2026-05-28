import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminSupabase } from '@/lib/supabase';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const FROM = 'SmileProof <hello@smileproof.co.uk>';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const admin = createAdminSupabase();

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: email.trim().toLowerCase(),
    options: { redirectTo: `${SITE}/auth/callback` },
  });

  if (error || !data?.properties?.action_link) {
    console.error('generateLink error:', error);
    return NextResponse.json({ error: 'Could not generate confirmation link' }, { status: 500 });
  }

  const confirmUrl = data.properties.action_link;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: emailError } = await resend.emails.send({
    from: FROM,
    to: email.trim(),
    subject: 'Confirm your SmileProof account',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#07070e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070e;padding:40px 16px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#111119;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:100%;">

        <tr>
          <td style="background:linear-gradient(160deg,#0e0e1a 0%,#09090f 100%);padding:28px 36px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:18px;font-weight:700;color:#edeef5;letter-spacing:-0.02em;">SmileProof</p>
            <p style="margin:4px 0 0;font-size:11px;color:rgba(237,238,245,0.4);letter-spacing:0.08em;text-transform:uppercase;">Practice Intelligence Platform</p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 36px 32px;">
            <p style="margin:0 0 6px;font-size:22px;font-weight:800;color:#edeef5;letter-spacing:-0.02em;">Confirm your email address</p>
            <p style="margin:16px 0 28px;font-size:15px;color:rgba(237,238,245,0.55);line-height:1.65;">
              Click the button below to confirm your email address and activate your SmileProof account. This link expires in 24 hours.
            </p>

            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:#34d399;border-radius:9px;">
                  <a href="${confirmUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#07070e;text-decoration:none;letter-spacing:-0.01em;">
                    Confirm email address →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:rgba(237,238,245,0.28);line-height:1.6;">
              If you didn't create a SmileProof account, you can safely ignore this email.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#0a0a14;padding:16px 36px;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="margin:0;font-size:11px;color:rgba(237,238,245,0.22);">
              SmileProof · <a href="${SITE}" style="color:#34d399;text-decoration:none;">smileproof.co.uk</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (emailError) {
    console.error('Resend error:', emailError);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
