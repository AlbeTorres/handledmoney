'use client'
import { sendEmail } from '@/actions/email/send-email'
import { Button } from '../ui/button'

export default function SenderButton() {
  return (
    <Button
      onClick={() =>
        sendEmail({
          email: 'albertocorreoficial@gmail.com',
          firstName: 'Alber',
          subject: 'Test',
          content: 'Test',
          url: 'https://handledmoney.com',
        })
      }
    >
      Send Email
    </Button>
  )
}
