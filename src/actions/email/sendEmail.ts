'use server'

import { EmailTemplate } from '@/components/email/email-template'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  email,
  firstName,
  subject,
  content,
  url,
}: {
  email: string
  firstName: string
  subject: string
  content: string
  url: string
}) {
  const { data, error } = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: [email],
    subject,
    react: EmailTemplate({ firstName, subject, content, url }),
  })

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}
