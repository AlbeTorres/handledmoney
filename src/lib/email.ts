export async function sendEmail(
  email: string,
  firstName: string,
  subject: string,
  content: string,
  url?: string,
) {
  const response = await fetch('/api/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, firstName, subject, content, url }),
  })

  if (!response.ok) {
    throw new Error('Failed to send email')
  }

  return response.json()
}
