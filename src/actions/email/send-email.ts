'use server'

import { EmailTemplate } from '@/components/email/email-template'
import { Resend } from 'resend'

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
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
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
