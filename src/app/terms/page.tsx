import Footer from '@/components/Footer'
import Header from '@/components/Header'

const APP_NAME = 'FinanceApp'
const CONTACT_EMAIL = 'privacy@financeapp.com'
const WEBSITE_URL = 'https://financeapp.com'

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className='mx-auto w-full max-w-4xl px-4 md:px-6 py-12 space-y-8'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>Terms & Conditions</h1>
          <p className='text-sm text-muted-foreground'>
            {APP_NAME} | Version 1.0 | Last updated: May 17, 2026
          </p>
        </div>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>1. Description of the Service</h2>
          <p>
            {APP_NAME} (&quot;the App&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a personal finance visualization platform that allows users to connect their financial accounts, log transactions, and view financial indicators and progress toward their financial goals — all in one place.
          </p>
          <p>
            The App is strictly a read-only visualization tool. We do not execute transactions, move funds, trade securities, or take any financial action on your behalf. The App provides a dashboard of your financial data aggregated from the accounts and sources you authorize.
          </p>
          <p>
            By creating an account and using the App, you agree to be bound by these Terms & Conditions (&quot;Terms&quot;). If you do not agree to these Terms, you must not create an account or use the App.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>2. No Financial Advice Disclaimer</h2>
          <p>
            {APP_NAME} is a financial data aggregation and visualization tool. We do not provide financial advice, investment recommendations, tax advice, legal advice, or any other professional financial service.
          </p>
          <p>
            Any information displayed through the App — including balances, trends, projections, spending categorizations, or asset valuations — is for informational and educational purposes only. It does not constitute a recommendation to buy, sell, or hold any financial instrument, nor does it represent a complete or accurate picture of your financial situation.
          </p>
          <p>
            You should consult with a qualified financial advisor, tax professional, or legal expert before making any financial decisions. You acknowledge that your use of the App does not create a fiduciary relationship between you and {APP_NAME}.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>3. Account Registration and Security</h2>
          <p>To access the App, you must create an account. You agree to:</p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>Provide accurate, current, and complete registration information</li>
            <li>Maintain and update your information to keep it accurate and complete</li>
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of any unauthorized access or use of your account</li>
            <li>Not share your account credentials with any third party</li>
            <li>Accept responsibility for all activities that occur under your account</li>
          </ul>
          <p>
            You must be at least 18 years of age to create an account. By registering, you represent and warrant that you are at least 18 years old.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>4. Payments, Subscriptions, and Processing</h2>
          <p>
            Certain features of the App may be offered on a subscription basis. All payments are processed securely through Stripe, Inc., a third-party payment processor. We do not store your credit or debit card details on our servers.
          </p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>Subscription fees are billed in advance on a recurring basis (monthly or annually, as selected)</li>
            <li>You may cancel your subscription at any time through your account settings</li>
            <li>Cancellation takes effect at the end of the current billing period — no pro-rata refunds for partial periods</li>
            <li>We reserve the right to change subscription fees with 30 days&apos; notice</li>
            <li>All fees are exclusive of applicable taxes, which may be added to your bill</li>
            <li>Failed payments may result in account suspension until the outstanding balance is paid</li>
          </ul>
          <p>
            Stripe handles all payment information in compliance with PCI-DSS standards. You can review Stripe&apos;s services agreement at{' '}
            <a href='https://stripe.com/legal' className='text-primary hover:underline' target='_blank' rel='noopener noreferrer'>https://stripe.com/legal</a>.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>5. Service Availability and Limitation of Liability</h2>
          <p>
            We strive to provide reliable and uninterrupted access to the App, but we do not guarantee that the service will be available at all times, without interruption, or error-free.
          </p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>The App may be temporarily unavailable for scheduled maintenance, emergency repairs, or causes beyond our reasonable control</li>
            <li>Data displayed in the App may be delayed, inaccurate, or incomplete due to third-party data sources (financial institutions, market data providers, etc.)</li>
            <li>We are not liable for any loss or damage arising from your use of or inability to use the App</li>
            <li>In no event shall our total liability exceed the amount you have paid us in the twelve (12) months preceding the claim</li>
            <li>The App is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied</li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>6. Intellectual Property</h2>
          <p>
            The App, including its design, code, graphics, logos, trademarks, and all content not provided by you, is owned by or licensed to {APP_NAME} and is protected by intellectual property laws.
          </p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>You are granted a limited, non-exclusive, non-transferable license to use the App for your personal, non-commercial use</li>
            <li>You may not copy, modify, distribute, sell, lease, reverse-engineer, or create derivative works of the App or its underlying technology</li>
            <li>You retain ownership of any data you submit to the App (e.g., transaction records, account information)</li>
            <li>You grant us a limited license to access, process, and display your data solely as necessary to provide the App&apos;s functionality</li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>7. Account Suspension and Termination</h2>
          <p>We reserve the right to suspend or terminate your account at any time for any of the following reasons:</p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>Violation of these Terms or any applicable law or regulation</li>
            <li>Fraudulent, abusive, or illegal activity</li>
            <li>Providing false or misleading information</li>
            <li>Interfering with the operation or security of the App</li>
            <li>Non-payment of subscription fees</li>
            <li>Extended periods of inactivity</li>
          </ul>
          <p>
            You may terminate your account at any time by accessing your account settings or by contacting us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className='text-primary hover:underline'>{CONTACT_EMAIL}</a>.
            Upon termination, your right to access the App ceases immediately, and we will delete your personal data in accordance with our Privacy Policy.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>8. Governing Law and Jurisdiction</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States of America, without regard to its conflict of law provisions.
          </p>
          <p>
            Any disputes arising out of or relating to these Terms or your use of the App shall be resolved exclusively in the state or federal courts located in Delaware. You consent to the personal jurisdiction of such courts.
          </p>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
          </p>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>9. Modifications to These Terms</h2>
          <p>We may modify these Terms from time to time. When we do:</p>
          <ul className='list-disc pl-6 space-y-1'>
            <li>We will update the &quot;Last updated&quot; date at the top of this document</li>
            <li>We will notify you by email or via a prominent notice within the App if the changes are material</li>
            <li>Your continued use of the App after the effective date of the changes constitutes your acceptance of the updated Terms</li>
            <li>If you do not agree to the updated Terms, you must stop using the App and may terminate your account</li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>10. Contact</h2>
          <p>If you have questions, concerns, or requests regarding these Terms, you can reach us at:</p>
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
