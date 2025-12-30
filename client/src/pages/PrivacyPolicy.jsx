import { useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <button className="back-link" onClick={() => navigate(-1)}>
          <HiArrowLeft /> Back
        </button>

        <header className="privacy-header">
          <h1>Privacy Policy</h1>
          <p className="effective-date">Effective Date: December 1, 2025 | Last Updated: December 22, 2025</p>
        </header>

        <div className="privacy-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              PromoSecure Technologies Private Limited ("PromoSecure," "we," "us," or "our") is committed to
              protecting the privacy and security of your personal information. This Privacy Policy describes
              how we collect, use, disclose, and safeguard information when you use our promotional verification
              platform and related services (collectively, the "Services").
            </p>
            <p>
              By accessing or using our Services, you acknowledge that you have read, understood, and agree to
              be bound by this Privacy Policy. If you do not agree with our policies and practices, please do
              not use our Services.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide Directly</h3>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, company name, and encrypted password when you register for an account.</li>
              <li><strong>Batch Data:</strong> Titles, descriptions, and location information for promotional batches you create.</li>
              <li><strong>Communications:</strong> Information you provide when contacting our support team.</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <ul>
              <li><strong>Photo Data:</strong> Images captured through the Services with automatic face detection and blurring applied.</li>
              <li><strong>Device Information:</strong> Device type, operating system, and browser type.</li>
              <li><strong>Location Data:</strong> GPS coordinates when photo capture functionality is used (with your permission).</li>
              <li><strong>Usage Data:</strong> Login times, feature usage, and interaction patterns for service improvement.</li>
            </ul>

            <h3>2.3 Special Note on Photographic Data</h3>
            <p>
              Our Services are specifically designed to protect the privacy of individuals appearing in
              promotional verification photos. All facial features are automatically detected and obscured
              using our proprietary AI-powered blurring technology before photos are stored or transmitted.
              Managers and administrators only have access to blurred versions of images.
            </p>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our Services</li>
              <li>Process and verify promotional activities</li>
              <li>Authenticate users and prevent unauthorized access</li>
              <li>Detect and prevent fraudulent use of our platform</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send administrative communications about your account</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information, including:
            </p>
            <ul>
              <li>TLS/SSL encryption for all data in transit</li>
              <li>AES-256 encryption for data at rest</li>
              <li>Bcrypt hashing for password storage</li>
              <li>Role-based access controls</li>
              <li>Regular security audits and penetration testing</li>
              <li>Multi-factor authentication options</li>
            </ul>
            <p>
              While we strive to protect your personal information, no method of transmission over the
              Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>5. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to
              provide you Services. We may retain certain information for legitimate business purposes
              or as required by law, including:
            </p>
            <ul>
              <li>Account data: Duration of account plus 30 days after deletion request</li>
              <li>Photo batches: As specified in your subscription agreement</li>
              <li>Audit logs: 12 months for security and compliance purposes</li>
            </ul>
          </section>

          <section>
            <h2>6. Information Sharing and Disclosure</h2>
            <p>We do not sell, trade, or rent your personal information. We may share information only in the following circumstances:</p>
            <ul>
              <li><strong>With Your Organization:</strong> Account administrators within your organization may access user data as permitted by their role.</li>
              <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our platform (cloud hosting, analytics).</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental request.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
            </ul>
          </section>

          <section>
            <h2>7. Your Rights and Choices</h2>
            <p>Depending on your jurisdiction, you may have the following rights:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a machine-readable copy of your data</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
              <li><strong>Withdrawal:</strong> Withdraw consent where processing is consent-based</li>
            </ul>
            <p>To exercise these rights, please contact your account administrator or our support team.</p>
          </section>

          <section>
            <h2>8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of
              residence. We ensure appropriate safeguards are in place for such transfers in compliance with
              applicable data protection laws, including Standard Contractual Clauses where required.
            </p>
          </section>

          <section>
            <h2>9. Children's Privacy</h2>
            <p>
              Our Services are not intended for individuals under the age of 18. We do not knowingly collect
              personal information from children. If we learn that we have collected information from a child
              under 18, we will take steps to delete such information promptly.
            </p>
          </section>

          <section>
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically to reflect changes in our practices or applicable
              laws. We will notify you of any material changes by posting the updated policy on our platform
              and updating the "Last Updated" date. Your continued use of our Services after such modifications
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2>11. Contact Us</h2>
            <p>If you have questions or concerns about this Privacy Policy or our data practices, please contact:</p>
            <div className="contact-info">
              <p><strong>PromoSecure Technologies Private Limited</strong></p>
              <p>Data Protection Officer</p>
              <p>Email: contactigtyt@gmail.com</p>
              <p>Address: Chennai, India</p>
            </div>
            <p className="response-note">
              We will respond to your inquiry within 5-7
              business days.
            </p>
          </section>
        </div>

        <footer className="privacy-footer">
          <p>© 2025 PromoSecure Technologies Private Limited. All rights reserved.</p>
        </footer>
      </div>

      <style>{`
                .privacy-page {
                    min-height: 100vh;
                    background: var(--bg-secondary);
                    padding: 2rem;
                }

                .privacy-container {
                    max-width: 900px;
                    margin: 0 auto;
                    background: var(--bg-card);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-lg);
                    overflow: hidden;
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem 1.5rem;
                    background: none;
                    border: none;
                    color: var(--brand-primary);
                    font-weight: 500;
                    cursor: pointer;
                    transition: color var(--transition-fast);
                }

                .back-link:hover {
                    color: var(--brand-secondary);
                }

                .privacy-header {
                    padding: 2rem 2.5rem;
                    border-bottom: 1px solid var(--border-color);
                    background: linear-gradient(135deg, var(--primary-50) 0%, var(--bg-card) 100%);
                }

                .privacy-header h1 {
                    font-size: 2rem;
                    margin: 0 0 0.5rem;
                    color: var(--text-primary);
                }

                .effective-date {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin: 0;
                }

                .privacy-content {
                    padding: 2.5rem;
                }

                .privacy-content section {
                    margin-bottom: 2.5rem;
                }

                .privacy-content section:last-child {
                    margin-bottom: 0;
                }

                .privacy-content h2 {
                    font-size: 1.25rem;
                    color: var(--text-primary);
                    margin: 0 0 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid var(--primary-100);
                }

                .privacy-content h3 {
                    font-size: 1rem;
                    color: var(--text-secondary);
                    margin: 1.5rem 0 0.75rem;
                    font-weight: 600;
                }

                .privacy-content p {
                    color: var(--text-secondary);
                    line-height: 1.8;
                    margin: 0 0 1rem;
                }

                .privacy-content ul {
                    margin: 0 0 1rem;
                    padding-left: 1.5rem;
                }

                .privacy-content li {
                    color: var(--text-secondary);
                    line-height: 1.8;
                    margin-bottom: 0.5rem;
                }

                .privacy-content li strong {
                    color: var(--text-primary);
                }

                .contact-info {
                    background: var(--bg-tertiary);
                    padding: 1.25rem 1.5rem;
                    border-radius: var(--radius-lg);
                    margin: 1rem 0;
                }

                .contact-info p {
                    margin: 0.25rem 0;
                }

                .response-note {
                    font-style: italic;
                    font-size: 0.9rem;
                }

                .privacy-footer {
                    padding: 1.5rem 2.5rem;
                    border-top: 1px solid var(--border-color);
                    background: var(--bg-tertiary);
                    text-align: center;
                }

                .privacy-footer p {
                    margin: 0;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }

                @media (max-width: 768px) {
                    .privacy-page {
                        padding: 1rem;
                    }

                    .privacy-header,
                    .privacy-content,
                    .privacy-footer {
                        padding: 1.5rem;
                    }

                    .privacy-header h1 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
    </div>
  );
};

export default PrivacyPolicy;
