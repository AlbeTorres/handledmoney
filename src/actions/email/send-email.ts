'use server'

import { EmailTemplate } from '@/actions/email/components/email-template'
import { Resend } from 'resend'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  return new Resend(apiKey)
}

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
  const resend = getResendClient()

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
