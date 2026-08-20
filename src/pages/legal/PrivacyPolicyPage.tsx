import LegalLayout, { type TocEntry } from './LegalLayout'

const toc: TocEntry[] = [
  { id: 'pp-1', label: 'Who we are & scope' },
  { id: 'pp-2', label: 'Definitions' },
  { id: 'pp-3', label: 'Data we collect' },
  { id: 'pp-4', label: 'How we use data' },
  { id: 'pp-5', label: 'Legal basis for processing' },
  { id: 'pp-6', label: 'Consent & withdrawal' },
  { id: 'pp-7', label: 'Sharing & disclosure' },
  { id: 'pp-8', label: 'Third-party data you enter' },
  { id: 'pp-9', label: 'Where data is stored' },
  { id: 'pp-10', label: 'Cross-border transfers' },
  { id: 'pp-11', label: 'Security' },
  { id: 'pp-12', label: 'Retention' },
  { id: 'pp-13', label: 'Your rights (India)' },
  { id: 'pp-14', label: 'Your rights (GDPR)' },
  { id: 'pp-15', label: 'Age requirement' },
  { id: 'pp-16', label: 'Cookies & local storage' },
  { id: 'pp-17', label: 'Breach notification' },
  { id: 'pp-18', label: 'Grievance Officer' },
  { id: 'pp-19', label: 'EU Representative' },
  { id: 'pp-20', label: 'Changes to this policy' },
  { id: 'pp-21', label: 'Governing law' },
  { id: 'pp-22', label: 'Contact' },
]

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      effectiveDate="20 August 2026"
      toc={toc}
      summary={
        <ul>
          <li>We collect account details you give us, farm/business data, and operational records (animals, milk, breeding, tasks) your team enters.</li>
          <li>We don't sell personal data, and we don't run advertising trackers or analytics SDKs today.</li>
          <li>Data is currently hosted on servers in São Paulo, Brazil; a separate EU-region database is planned ahead of onboarding EU customers.</li>
          <li>Data is deleted 30 days after your account or farm is closed, unless we're legally required to keep it longer.</li>
          <li>You can request access, correction, export, or erasure of your data at any time — see §13/§14.</li>
        </ul>
      }
    >
      <section className="legal-section" id="pp-1">
        <h2><span className="num">01</span>Who we are &amp; scope</h2>
        <p>This Privacy Policy explains how <strong>Ashnix Technologies Private Limited</strong> ("Ashnix", "CattleForce", "we", "us", "our"), a company incorporated in India with its registered office at Begur Village, Bangalore South, Karnataka, India – 560068, collects, uses, and protects personal data through the CattleForce livestock management platform available at cattleforce.in and its associated applications (the "Service").</p>
        <p>This Policy applies to personal data we process as a <strong>data fiduciary</strong> (account holders and farm staff we bill or communicate with directly), and describes separately our role as a <strong>processor</strong> for operational records your organisation enters about its own workers and investors (see §8).</p>
        <p>It applies to all users of the Service, wherever located, including our current users in Venezuela and prospective users in the European Union and United Kingdom.</p>
      </section>

      <section className="legal-section" id="pp-2">
        <h2><span className="num">02</span>Definitions</h2>
        <ul>
          <li><strong>Personal Data</strong> — any data about an identifiable individual (e.g. name, email, phone).</li>
          <li><strong>Data Principal</strong> (under India's DPDPA) / <strong>Data Subject</strong> (under GDPR) — the individual the personal data is about.</li>
          <li><strong>Data Fiduciary</strong> (DPDPA) / <strong>Controller</strong> (GDPR) — the entity deciding why and how personal data is processed.</li>
          <li><strong>Processing</strong> — any operation performed on data: collection, storage, use, disclosure, deletion.</li>
          <li><strong>Farm Account</strong> — the workspace a customer operates within the Service, containing that farm's operational records.</li>
        </ul>
      </section>

      <section className="legal-section" id="pp-3">
        <h2><span className="num">03</span>Data we collect</h2>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead><tr><th>Category</th><th>Examples</th><th>Source</th></tr></thead>
            <tbody>
              <tr><td>Account data</td><td>Full name, email address, authentication credentials (or your Google account identifier, if you sign in with Google)</td><td>You, at signup</td></tr>
              <tr><td>Farm/business data</td><td>Farm name, location, phone, email, address, currency &amp; timezone settings</td><td>You or your Farm Superuser</td></tr>
              <tr><td>Operational records</td><td>Animal and offspring records, weights, breed composition, reproduction and calving events, milk production logs, tasks, notifications, audit logs</td><td>Entered by your team</td></tr>
              <tr><td>Personnel/contact records you enter</td><td>Names, phone numbers, and emails of your workers and investors</td><td>Entered by your team — see §8</td></tr>
              <tr><td>Technical data</td><td>IP address, device/browser type, and access timestamps generated by our hosting and database provider</td><td>Automatically, via infrastructure logs</td></tr>
            </tbody>
          </table>
        </div>
        <p>We do not currently use advertising cookies, analytics trackers, or session-replay tools. If that changes, this Policy will be updated in advance — see §16.</p>
      </section>

      <section className="legal-section" id="pp-4">
        <h2><span className="num">04</span>How we use data</h2>
        <ul>
          <li>Provide, operate, and maintain the Service (account access, farm records, reports).</li>
          <li>Communicate with you — service notices, security alerts, support responses, and, only with consent where required, product updates.</li>
          <li>Maintain security, prevent fraud or abuse, and enforce our Terms &amp; Conditions.</li>
          <li>Comply with legal obligations, including tax, accounting, and regulatory recordkeeping.</li>
          <li>Improve the Service using aggregated or de-identified usage data that cannot reasonably be linked back to an individual.</li>
        </ul>
        <p>We do not use your farm's operational data to train third-party AI models, and we do not sell personal data to anyone.</p>
      </section>

      <section className="legal-section" id="pp-5">
        <h2><span className="num">05</span>Legal basis for processing</h2>
        <p>Under the Digital Personal Data Protection Act, 2023 ("DPDPA"), we process account and farm data on the basis of the <strong>consent</strong> you give at signup, and, for processing necessary to fulfil a request you've made, on the basis of the "certain legitimate uses" recognised under the Act.</p>
        <p>For users based in the EU/UK, we rely on: performance of a contract (Art. 6(1)(b) GDPR) for core Service delivery, consent (Art. 6(1)(a)) for optional communications, and legitimate interests (Art. 6(1)(f)) for security and fraud prevention, balanced against your rights.</p>
      </section>

      <section className="legal-section" id="pp-6">
        <h2><span className="num">06</span>Consent &amp; withdrawal</h2>
        <p>Where we rely on consent, we ask for it in clear, specific language at the point of collection. You may withdraw consent at any time by writing to <a href="mailto:cattleeorcee@gmail.com">cattleeorcee@gmail.com</a>; withdrawal does not affect processing already carried out, and may mean we can no longer provide parts of the Service that depend on that data.</p>
      </section>

      <section className="legal-section" id="pp-7">
        <h2><span className="num">07</span>Sharing &amp; disclosure</h2>
        <p>We share personal data only with:</p>
        <ul>
          <li><strong>Infrastructure processors</strong> who host and run the Service on our behalf under contract (currently Supabase and its underlying cloud infrastructure) — bound to process data only on our instructions.</li>
          <li><strong>Authentication providers</strong> — Google, if you choose "Sign in with Google."</li>
          <li><strong>Payment processors</strong>, once in-app billing launches (none is integrated today; billing is handled outside the Service by invoice).</li>
          <li><strong>Law enforcement or regulators</strong>, where legally compelled.</li>
          <li><strong>A successor entity</strong>, in the event of a merger, acquisition, or asset sale — with notice to you and this Policy carried forward.</li>
        </ul>
        <p>We do not sell, rent, or trade personal data to third parties for their marketing purposes.</p>
      </section>

      <section className="legal-section" id="pp-8">
        <h2><span className="num">08</span>Third-party data you enter</h2>
        <p>The Service lets your team record contact details for people who are not the account holder — your workers and investors. For that data, <strong>your organisation is the data fiduciary/controller</strong>, responsible for having a lawful basis to enter it (for example, informing your staff that their contact details are recorded in your farm-management system); <strong>we act as a processor</strong>, storing and processing it only as needed to run the Service on your instructions.</p>
      </section>

      <section className="legal-section" id="pp-9">
        <h2><span className="num">09</span>Where data is stored</h2>
        <p>Data is currently hosted on servers located in <strong>São Paulo, Brazil</strong>. We are building region-segregated infrastructure so that, going forward, EU customer data will be stored in an EU data centre, and other regions may receive dedicated instances as we expand.</p>
      </section>

      <section className="legal-section" id="pp-10">
        <h2><span className="num">10</span>Cross-border transfers</h2>
        <p>Because our infrastructure is not currently located in India, personal data of Indian users is transferred to and processed in Brazil. The DPDPA permits cross-border transfer of personal data by default, except to countries specifically restricted by the Indian government; none of our processing locations are currently restricted. We take contractual and technical measures with our infrastructure providers to protect data in transit and at rest regardless of location.</p>
        <p>For EU/UK users, transfers outside the EEA/UK rely on an adequacy mechanism or Standard Contractual Clauses, and EU customer data is intended to move to EU-based infrastructure ahead of that market's launch.</p>
      </section>

      <section className="legal-section" id="pp-11">
        <h2><span className="num">11</span>Security</h2>
        <ul>
          <li>Encryption in transit (TLS) for all traffic to the Service.</li>
          <li>Row-level security enforced at the database layer, so a farm's data is only accessible to authorised users of that farm.</li>
          <li>Role-based access control distinguishing platform administrators from farm-level users.</li>
          <li>Credentials are never stored in plaintext; authentication is handled by our infrastructure provider's managed auth system.</li>
        </ul>
        <p>No system is perfectly secure, and we cannot guarantee absolute security, but we take reasonable and appropriate technical and organisational measures proportionate to the data we hold.</p>
      </section>

      <section className="legal-section" id="pp-12">
        <h2><span className="num">12</span>Retention</h2>
        <p>We retain personal data for as long as your account or Farm Account is active. Following account or Farm Account closure, we retain the associated data for <strong>30 days</strong> — to allow for recovery from accidental deletion or offboarding — after which it is permanently deleted from production systems, except where we are required by law (for example, tax or accounting records) to retain it longer, or where it briefly persists in encrypted backups until those backups are cycled out.</p>
      </section>

      <section className="legal-section" id="pp-13">
        <h2><span className="num">13</span>Your rights — India (DPDPA)</h2>
        <p>Subject to the Digital Personal Data Protection Act, 2023, you have the right to:</p>
        <ul>
          <li><strong>Access</strong> a summary of the personal data we hold about you and the processing we carry out.</li>
          <li><strong>Correct or update</strong> inaccurate or incomplete personal data.</li>
          <li><strong>Erase</strong> personal data that is no longer necessary for the purpose it was collected for.</li>
          <li><strong>Withdraw consent</strong> at any time (see §6).</li>
          <li><strong>Nominate</strong> another individual to exercise these rights on your behalf in the event of your death or incapacity.</li>
          <li><strong>Grievance redressal</strong> — raise a complaint with our Grievance Officer (§18) before approaching the Data Protection Board of India.</li>
        </ul>
        <p>We aim to respond to verified requests within 30 days.</p>
      </section>

      <section className="legal-section" id="pp-14">
        <h2><span className="num">14</span>Your rights — EU/UK (GDPR)</h2>
        <p>If you are processed under GDPR, in addition to the rights above you have the right to: <strong>data portability</strong> (receive your data in a structured, machine-readable format), <strong>restriction of processing</strong>, <strong>objection to processing</strong> based on legitimate interests, and the right to <strong>lodge a complaint</strong> with your local supervisory authority.</p>
      </section>

      <section className="legal-section" id="pp-15">
        <h2><span className="num">15</span>Age requirement</h2>
        <p>The Service is intended for business use by farm operators and staff aged <strong>18 or older</strong>. We do not knowingly collect personal data from individuals under 18. If we learn we have done so, we will delete it.</p>
      </section>

      <section className="legal-section" id="pp-16">
        <h2><span className="num">16</span>Cookies &amp; local storage</h2>
        <p>We do not use advertising or analytics cookies today. The Service stores a session token in your browser's local storage solely to keep you signed in; this is strictly necessary for the Service to function and is not used to track you across other sites. If we introduce analytics or marketing cookies in future, we will update this section and, where required, request consent via a cookie banner.</p>
      </section>

      <section className="legal-section" id="pp-17">
        <h2><span className="num">17</span>Breach notification</h2>
        <p>In the event of a personal data breach, we will notify the Data Protection Board of India and affected users as required under DPDPA, and — for EU/UK users — notify the relevant supervisory authority within 72 hours of becoming aware, and affected individuals without undue delay where the breach is likely to result in high risk to them.</p>
      </section>

      <section className="legal-section" id="pp-18">
        <h2><span className="num">18</span>Grievance Officer</h2>
        <p>In accordance with the Digital Personal Data Protection Act, 2023, Ashnix Technologies Private Limited designates a Grievance Officer to address complaints regarding the processing of personal data:</p>
        <ul>
          <li>Grievance Officer, Ashnix Technologies Private Limited</li>
          <li>Email: <a href="mailto:cattleeorcee@gmail.com">cattleeorcee@gmail.com</a></li>
          <li>Address: Begur Village, Bangalore South, Karnataka, India – 560068</li>
        </ul>
      </section>

      <section className="legal-section" id="pp-19">
        <h2><span className="num">19</span>EU Representative</h2>
        <p>Ashnix Technologies Private Limited has no establishment in the European Union. Ahead of onboarding customers based in the EU, we will appoint a representative in the Union under Article 27 GDPR, and publish their name and contact address here.</p>
      </section>

      <section className="legal-section" id="pp-20">
        <h2><span className="num">20</span>Changes to this policy</h2>
        <p>We may update this Policy as the Service, our infrastructure, or applicable law changes. Material changes will be notified to account holders by email or an in-app notice before they take effect. The effective date at the top of this page reflects the last revision.</p>
      </section>

      <section className="legal-section" id="pp-21">
        <h2><span className="num">21</span>Governing law</h2>
        <p>This Policy is governed by the laws of India. Subject to §14 for the statutory rights of EU/UK data subjects, any dispute arising from this Policy is subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.</p>
      </section>

      <section className="legal-section" id="pp-22">
        <h2><span className="num">22</span>Contact</h2>
        <p>
          Ashnix Technologies Private Limited<br />
          Begur Village, Bangalore South, Karnataka, India – 560068<br />
          <a href="mailto:cattleeorcee@gmail.com">cattleeorcee@gmail.com</a>
        </p>
      </section>
    </LegalLayout>
  )
}
