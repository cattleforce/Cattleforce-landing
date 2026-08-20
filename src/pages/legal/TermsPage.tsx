import LegalLayout, { type TocEntry } from './LegalLayout'

const toc: TocEntry[] = [
  { id: 'tc-1', label: 'Acceptance' },
  { id: 'tc-2', label: 'Eligibility' },
  { id: 'tc-3', label: 'The Service' },
  { id: 'tc-4', label: 'Accounts & security' },
  { id: 'tc-5', label: 'Your data & your responsibilities' },
  { id: 'tc-6', label: 'Fees & payment' },
  { id: 'tc-7', label: 'Acceptable use' },
  { id: 'tc-8', label: 'Intellectual property' },
  { id: 'tc-9', label: 'Export & sanctions compliance' },
  { id: 'tc-10', label: 'Confidentiality' },
  { id: 'tc-11', label: 'Availability & support' },
  { id: 'tc-12', label: 'Third-party services' },
  { id: 'tc-13', label: 'Disclaimers' },
  { id: 'tc-14', label: 'Limitation of liability' },
  { id: 'tc-15', label: 'Indemnification' },
  { id: 'tc-16', label: 'Termination' },
  { id: 'tc-17', label: 'Governing law & disputes' },
  { id: 'tc-18', label: 'Force majeure' },
  { id: 'tc-19', label: 'Changes to these Terms' },
  { id: 'tc-20', label: 'General' },
  { id: 'tc-21', label: 'Contact' },
]

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      effectiveDate="20 August 2026"
      toc={toc}
      summary={
        <ul>
          <li>You must be 18+ and authorised to bind your farm/business to use the Service.</li>
          <li>You own your farm's data; we process it to run the Service and delete it 30 days after closure.</li>
          <li>Billing is currently handled outside the app by invoice; in-app payment is coming.</li>
          <li>The Service is provided "as is" with no uptime guarantee at this stage; liability is capped.</li>
          <li>Disputes are resolved exclusively in the courts of Bengaluru, Karnataka, under Indian law.</li>
        </ul>
      }
    >
      <section className="legal-section" id="tc-1">
        <h2><span className="num">01</span>Acceptance</h2>
        <p>These Terms &amp; Conditions ("Terms") form a binding agreement between you — and, where applicable, the farm or business entity you represent — and <strong>Ashnix Technologies Private Limited</strong>, registered office at Begur Village, Bangalore South, Karnataka, India – 560068 ("Ashnix", "we", "us"), governing your access to and use of CattleForce (the "Service"). If you do not agree, do not use the Service.</p>
      </section>

      <section className="legal-section" id="tc-2">
        <h2><span className="num">02</span>Eligibility</h2>
        <p>You must be at least 18 years old and, if signing up on behalf of a farm or business, authorised to bind that entity to these Terms. The Service is intended for business and professional use by farm operators, managers, and their staff — not for individual consumer use.</p>
      </section>

      <section className="legal-section" id="tc-3">
        <h2><span className="num">03</span>The Service</h2>
        <p>CattleForce is a cloud-based livestock management platform for tracking animals, breeding and reproduction, milk production, tasks, and related farm operations. We may add, change, or remove features over time.</p>
      </section>

      <section className="legal-section" id="tc-4">
        <h2><span className="num">04</span>Accounts &amp; security</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.</li>
          <li>You must notify us promptly at <a href="mailto:cattleeorcee@gmail.com">cattleeorcee@gmail.com</a> of any unauthorised use of your account.</li>
          <li>Farm Superusers are responsible for managing access for their own staff — grants and revocations — within the Service's access controls.</li>
        </ul>
      </section>

      <section className="legal-section" id="tc-5">
        <h2><span className="num">05</span>Your data &amp; your responsibilities</h2>
        <p>As between you and Ashnix, <strong>you own the operational data</strong> you and your team enter into the Service (animal records, milk logs, task data, and similar). You grant us a licence to host, process, and display that data solely to provide the Service to you.</p>
        <p>Where you enter personal data about third parties — your workers or investors — <strong>you are responsible for having a lawful basis to do so</strong> and for meeting any notice obligations to those individuals; we process that data on your instructions as described in our Privacy Policy §8.</p>
        <p>You may export your data at any time while your account is active, and for 30 days following closure — see §16.</p>
      </section>

      <section className="legal-section" id="tc-6">
        <h2><span className="num">06</span>Fees &amp; payment</h2>
        <p>Fees for the Service are currently invoiced and paid outside the Service. Once in-app billing is enabled, fees will be charged via an integrated payment processor on the terms displayed at checkout, including plan pricing, billing cycle, and any applicable taxes. Prices may change with prior notice; changes apply from your next billing cycle. Non-payment may result in suspension of access.</p>
      </section>

      <section className="legal-section" id="tc-7">
        <h2><span className="num">07</span>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose or in violation of any applicable law;</li>
          <li>Attempt to gain unauthorised access to another farm's data or to our systems;</li>
          <li>Reverse-engineer, decompile, or scrape the Service, or interfere with its normal operation;</li>
          <li>Upload data you do not have the right to share, or that infringes a third party's rights;</li>
          <li>Resell or provide the Service to third parties without our written consent.</li>
        </ul>
      </section>

      <section className="legal-section" id="tc-8">
        <h2><span className="num">08</span>Intellectual property</h2>
        <p>The Service, including its software, design, and branding, is owned by Ashnix Technologies Private Limited and protected by applicable intellectual property laws. Nothing in these Terms transfers ownership of the Service to you. Subject to these Terms, we grant you a limited, non-exclusive, non-transferable licence to access and use the Service for your internal business purposes.</p>
      </section>

      <section className="legal-section" id="tc-9">
        <h2><span className="num">09</span>Export &amp; sanctions compliance</h2>
        <p>You represent that you are not located in, or a resident of, a country or region subject to comprehensive sanctions, and are not on any applicable restricted-party list, except to the extent we have expressly agreed to provide the Service to you for testing or other authorised purposes. Availability of the Service in any given country also depends on our own infrastructure and payment providers' terms of service, which may independently restrict certain jurisdictions regardless of this clause.</p>
      </section>

      <section className="legal-section" id="tc-10">
        <h2><span className="num">10</span>Confidentiality</h2>
        <p>Each party agrees to protect the other's non-public business information disclosed in connection with the Service with the same degree of care it uses for its own confidential information, and not to disclose it to third parties except as needed to perform under these Terms or as required by law.</p>
      </section>

      <section className="legal-section" id="tc-11">
        <h2><span className="num">11</span>Availability &amp; support</h2>
        <p>We aim to keep the Service available and performant but do not currently guarantee any specific uptime percentage. We may perform maintenance that temporarily affects availability, with advance notice where practicable. Support is available via <a href="mailto:cattleeorcee@gmail.com">cattleeorcee@gmail.com</a>.</p>
      </section>

      <section className="legal-section" id="tc-12">
        <h2><span className="num">12</span>Third-party services</h2>
        <p>The Service relies on third-party infrastructure, including our hosting and database provider and, if you choose it, Google for sign-in. We are not responsible for outages or issues originating from those third-party providers, though we will work to mitigate their impact on you.</p>
      </section>

      <section className="legal-section" id="tc-13">
        <h2><span className="num">13</span>Disclaimers</h2>
        <p>The Service is provided <strong>"as is" and "as available"</strong>, without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted or error-free, or that farm or animal outcomes will meet any particular result based on data or recommendations derived from the Service.</p>
      </section>

      <section className="legal-section" id="tc-14">
        <h2><span className="num">14</span>Limitation of liability</h2>
        <p>To the maximum extent permitted by law, Ashnix Technologies Private Limited shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits, revenue, or data, arising from your use of the Service. Our total aggregate liability for any claim arising from these Terms or the Service shall not exceed the fees you paid us in the 12 months preceding the claim, or ₹10,000 if no fees have been paid.</p>
      </section>

      <section className="legal-section" id="tc-15">
        <h2><span className="num">15</span>Indemnification</h2>
        <p>You agree to indemnify and hold Ashnix Technologies Private Limited harmless from claims, damages, and expenses, including reasonable legal fees, arising from your breach of these Terms, your violation of applicable law, or data you input into the Service without a lawful basis to do so.</p>
      </section>

      <section className="legal-section" id="tc-16">
        <h2><span className="num">16</span>Termination</h2>
        <p>You may close your account at any time. We may suspend or terminate access for breach of these Terms, non-payment, or extended inactivity, with notice where practicable. Following termination, your data is retained for <strong>30 days</strong> to allow export or reactivation, after which it is permanently deleted, consistent with our Privacy Policy §12.</p>
      </section>

      <section className="legal-section" id="tc-17">
        <h2><span className="num">17</span>Governing law &amp; disputes</h2>
        <p>These Terms are governed by the laws of India. Subject to any mandatory local consumer-protection or data-protection rights you may have where you reside, you and Ashnix submit to the exclusive jurisdiction of the courts of <strong>Bengaluru, Karnataka</strong> for any dispute arising out of or relating to these Terms or the Service.</p>
      </section>

      <section className="legal-section" id="tc-18">
        <h2><span className="num">18</span>Force majeure</h2>
        <p>Neither party is liable for delay or failure to perform caused by events beyond its reasonable control, including natural disasters, internet or infrastructure outages, war, or governmental action.</p>
      </section>

      <section className="legal-section" id="tc-19">
        <h2><span className="num">19</span>Changes to these Terms</h2>
        <p>We may update these Terms from time to time. Material changes will be notified by email or in-app notice, and continued use of the Service after they take effect constitutes acceptance.</p>
      </section>

      <section className="legal-section" id="tc-20">
        <h2><span className="num">20</span>General</h2>
        <ul>
          <li><strong>Severability</strong> — if any provision is held unenforceable, the rest of these Terms remain in effect.</li>
          <li><strong>Entire agreement</strong> — these Terms and our Privacy Policy constitute the entire agreement between you and us regarding the Service.</li>
          <li><strong>Assignment</strong> — you may not assign these Terms without our consent; we may assign them in connection with a merger, acquisition, or sale of assets.</li>
          <li><strong>Notices</strong> — we may send notices to the email address associated with your account.</li>
        </ul>
      </section>

      <section className="legal-section" id="tc-21">
        <h2><span className="num">21</span>Contact</h2>
        <p>
          Ashnix Technologies Private Limited<br />
          Begur Village, Bangalore South, Karnataka, India – 560068<br />
          <a href="mailto:cattleeorcee@gmail.com">cattleeorcee@gmail.com</a>
        </p>
      </section>
    </LegalLayout>
  )
}
