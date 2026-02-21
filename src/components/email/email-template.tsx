interface EmailTemplateProps {
  subject: string
  content: string
  firstName: string
  url?: string
}

export function EmailTemplate({ subject, content, firstName, url }: EmailTemplateProps) {
  return (
    <div>
      <h1>Welcome, {firstName}!</h1>
      <p>{content}</p>
      {url && <a href={url}>{url}</a>}
    </div>
  )
}
