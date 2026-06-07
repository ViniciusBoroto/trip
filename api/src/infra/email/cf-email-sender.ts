import type { EmailSender } from '../../application/auth/ports'

// Shape of the Cloudflare Email Service Workers send_email binding
export interface EmailBinding {
  send(message: {
    to: string
    from: { email: string; name?: string }
    subject: string
    text?: string
    html?: string
  }): Promise<void>
}

export class CfEmailSender implements EmailSender {
  constructor(
    private readonly emailBinding: EmailBinding,
    private readonly fromEmail: string,
  ) {}

  async sendOtp(to: string, code: string): Promise<void> {
    await this.emailBinding.send({
      to,
      from: { email: this.fromEmail, name: 'Trip' },
      subject: 'Your sign-in code',
      text: `Your Trip sign-in code is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, you can safely ignore this email.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="font-size:20px;margin:0 0 8px">Your sign-in code</h2>
          <p style="color:#555;margin:0 0 24px">Enter the code below to sign in to Trip.</p>
          <div style="background:#f4f4f8;border-radius:12px;padding:20px 24px;text-align:center;margin:0 0 24px">
            <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1a1a2e">${code}</span>
          </div>
          <p style="color:#888;font-size:13px;margin:0">Expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    })
  }
}
