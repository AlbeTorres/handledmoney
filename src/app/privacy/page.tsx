import Footer from '@/components/Footer'
import Header from '@/components/Header'

const APP_NAME = 'FinanceApp'
const CONTACT_EMAIL = 'privacy@financeapp.com'
const WEBSITE_URL = 'https://financeapp.com'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className='mx-auto w-full max-w-4xl px-4 md:px-6 py-12 space-y-8'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>Privacy Policy</h1>
          <p className='text-sm text-muted-foreground'>
            {APP_NAME} | Version 1.0 | Last updated: May 16, 2026
          </p>
        </div>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>1. Introduction</h2>
          <p>
            Welcome to {APP_NAME} (&quot;the App&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;). We are committed to protecting your privacy and being transparent about how we collect, use, and safeguard your personal information.
          </p>
          <p>
            {APP_NAME} is a personal finance visualization app that allows users to connect their accounts, log transactions, and view financial indicators and progress toward their financial goals — all in one place. The App is strictly read-only: we do not execute transactions, move funds, or take any action on your behalf.
          </p>
          <p>
            By using the App, you agree to the practices described in this Privacy Policy.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>2. Information We Collect</h2>

          <h3 className='text-lg font-medium'>2.1 Account and Authentication Data</h3>
          <p>When you create an account, we collect:</p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>Name and email address</li>
            <li>Password (stored in encrypted form — never in plain text)</li>
            <li>Profile information you choose to provide</li>
          </ul>
          <p>If you sign in through a third-party provider, we also receive the information they share with us:</p>
          <ul className='list-disc pl-6 space-y-1'>
            <li><strong>Google</strong>: name, email address, profile photo, and account identifier</li>
            <li><strong>Facebook</strong>: name, email address, profile photo, and account identifier</li>
          </ul>

          <h3 className='text-lg font-medium'>2.2 Financial Data (via Plaid)</h3>
          <p>
            To connect your financial institutions, we use Plaid Technologies, Inc. Through Plaid, we may access:
          </p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>A list of bank, investment, or credit accounts you authorize</li>
            <li>Transaction history from linked accounts</li>
            <li>Current and available balances</li>
            <li>Names of linked financial institutions</li>
          </ul>
          <p>
            <strong>Important:</strong> Plaid acts as a secure technical intermediary. We never store your banking credentials. The data we display is provided by Plaid based solely on the permissions you grant. You can review Plaid&apos;s privacy practices at{' '}
            <a href='https://plaid.com/legal/' className='text-primary hover:underline' target='_blank' rel='noopener noreferrer'>https://plaid.com/legal/</a>.
          </p>

          <h3 className='text-lg font-medium'>2.3 Asset and Market Price Data (via Market APIs)</h3>
          <p>
            To display the real-time value of your assets (cryptocurrencies, stocks, ETFs, etc.), we query third-party market price APIs. In this context, we collect:
          </p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>The types and quantities of assets you enter manually (e.g., 0.5 BTC, 10 shares of AAPL)</li>
            <li>The calculated market value of those assets, based on data from third-party price providers</li>
          </ul>
          <p>
            We do not share your personal data with market data providers — we only use their APIs to fetch price quotes.
          </p>

          <h3 className='text-lg font-medium'>2.4 Usage and Technical Data</h3>
          <p>We automatically collect certain information when you use the App:</p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>IP address and device type</li>
            <li>Operating system and browser or app version</li>
            <li>Pages or sections visited and time spent</li>
            <li>Diagnostic data and error logs</li>
          </ul>

          <h3 className='text-lg font-medium'>2.5 Payment Information (via Stripe)</h3>
          <p>
            Subscription and premium plan payments are processed through Stripe, Inc. We do not store your credit or debit card details. Stripe handles all payment information directly and securely in compliance with PCI-DSS standards. You can review Stripe&apos;s privacy policy at{' '}
            <a href='https://stripe.com/privacy' className='text-primary hover:underline' target='_blank' rel='noopener noreferrer'>https://stripe.com/privacy</a>.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>Provide, maintain, and improve the App</li>
            <li>Authenticate your identity and manage your session</li>
            <li>Display your personalized financial indicators and dashboards</li>
            <li>Calculate and visualize the real-time value of your assets</li>
            <li>Process subscription payments</li>
            <li>Send you service notifications and important updates</li>
            <li>Detect and prevent fraud, abuse, or unauthorized activity</li>
            <li>Comply with applicable legal obligations</li>
            <li>Respond to your support requests</li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>4. Legal Basis for Processing</h2>
          <p>We process your personal data on the following legal bases:</p>
          <ul className='list-disc pl-6 space-y-1'>
            <li><strong>Performance of a contract:</strong> to provide the App services in accordance with our Terms of Service.</li>
            <li><strong>Consent:</strong> when you authorize the connection of your financial accounts via Plaid, or when you register using Google or Facebook.</li>
            <li><strong>Legitimate interests:</strong> to improve the App, ensure security, and prevent fraud.</li>
            <li><strong>Legal compliance:</strong> when the law requires us to retain or disclose certain information.</li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>5. Sharing Your Information</h2>
          <p>We do not sell your personal data. We may share it only in the following circumstances:</p>

          <h3 className='text-lg font-medium'>5.1 Service Providers</h3>
          <p>We share data with trusted vendors who help us operate the App:</p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>Plaid Technologies — financial account connectivity</li>
            <li>Stripe, Inc. — payment processing</li>
            <li>Google LLC / Meta Platforms — OAuth authentication</li>
            <li>Cloud infrastructure providers (Amazon Web Services, Cloudflare, Neon, etc.) — hosting and data storage</li>
            <li>Market data API providers — real-time asset pricing</li>
          </ul>
          <p>All service providers are contractually required to protect your information and use it only for the purposes we specify.</p>

          <h3 className='text-lg font-medium'>5.2 Legal Obligations</h3>
          <p>We may disclose your information if required by law, court order, or to protect the legal rights of the App and its users.</p>

          <h3 className='text-lg font-medium'>5.3 Business Transfers</h3>
          <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred. We will notify you before your data becomes subject to a different privacy policy.</p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>6. Data Storage and Security</h2>
          <p>
            Your data is stored on cloud servers provided by reputable vendors (Amazon Web Services, Cloudflare, Neon, and others), located primarily in the United States and/or the European Union, depending on each provider&apos;s configuration.
          </p>
          <p>We implement the following technical and organizational security measures:</p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>Encryption in transit via TLS/HTTPS</li>
            <li>Encryption at rest for sensitive data</li>
            <li>Passwords stored using secure hashing (bcrypt or equivalent)</li>
            <li>Two-factor authentication (where available)</li>
            <li>Restricted internal access to personal data</li>
            <li>Periodic security reviews</li>
          </ul>
          <p>No system is completely immune to breaches. We encourage you to use a strong, unique password and to keep your credentials confidential.</p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>7. Data Retention</h2>
          <p>We retain your personal data for as long as your account is active or as necessary to provide the service. If you delete your account:</p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>We will delete or anonymize your personal data within 30 days, unless a longer retention period is required by law.</li>
            <li>Certain transaction records may be retained for up to 7 years to comply with applicable tax or accounting obligations.</li>
            <li>Security and audit logs may be retained for up to 12 additional months.</li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>8. Your Rights</h2>
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul className='list-disc pl-6 space-y-1'>
            <li><strong>Access:</strong> request a copy of the personal data we hold about you</li>
            <li><strong>Rectification:</strong> correct inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
            <li><strong>Portability:</strong> receive your data in a structured, machine-readable format</li>
            <li><strong>Objection:</strong> object to the processing of your data for certain purposes</li>
            <li><strong>Withdrawal of consent:</strong> you may withdraw consent at any time without affecting the lawfulness of prior processing</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at: <a href={`mailto:${CONTACT_EMAIL}`} className='text-primary hover:underline'>{CONTACT_EMAIL}</a>. We will respond within 30 days.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>9. Cookies and Similar Technologies</h2>
          <p>
            We use cookies and similar technologies (session tokens, local storage) to:
          </p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>Keep you signed in</li>
            <li>Remember your preferences</li>
            <li>Analyze app usage for improvements (aggregated and anonymized data)</li>
          </ul>
          <p>You can manage cookies through your browser or device settings. Disabling certain cookies may affect the functionality of the App.</p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>10. Children&apos;s Privacy</h2>
          <p>
            The App is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you are a parent or guardian and believe your child has provided us with personal data, please contact us and we will delete it promptly.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>11. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. When we do:</p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>We will update the &quot;Last updated&quot; date at the top of this document.</li>
            <li>We will notify you by email or via a prominent notice within the App if the changes are material.</li>
            <li>Your continued use of the App after notification constitutes your acceptance of the updated policy.</li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>12. Contact</h2>
          <p>If you have questions, concerns, or wish to exercise your privacy rights, you can reach us at:</p>
          <ul className='list-none space-y-1'>
            <li>Email: <a href={`mailto:${CONTACT_EMAIL}`} className='text-primary hover:underline'>{CONTACT_EMAIL}</a></li>
            <li>Website: <a href={WEBSITE_URL} className='text-primary hover:underline' target='_blank' rel='noopener noreferrer'>{WEBSITE_URL}</a></li>
          </ul>
          <p className='text-sm text-muted-foreground'>
            &copy; 2026 {APP_NAME}. All rights reserved.
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}
