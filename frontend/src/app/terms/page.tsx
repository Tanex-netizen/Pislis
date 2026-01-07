import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-950 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Terms of Service</h1>
            
            <div className="space-y-6 text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using Pislis educational platform, you accept and agree to be bound by 
                  these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Course Access and Usage</h2>
                <p>
                  Upon enrollment in a course, you receive a non-exclusive, non-transferable right to access 
                  the course content for personal educational purposes. You may not:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Share your account credentials with others</li>
                  <li>Download, reproduce, or distribute course materials without permission</li>
                  <li>Use course content for commercial purposes</li>
                  <li>Reverse engineer or copy our platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials and for 
                  all activities that occur under your account. You must notify us immediately of any 
                  unauthorized use of your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Payment and Refunds</h2>
                <p>
                  All course fees must be paid in full before accessing course content. Refunds may be issued 
                  within 7 days of enrollment if you have not accessed more than 25% of the course content. 
                  Refund requests must be submitted through our support channels.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
                <p>
                  All course content, including videos, text, graphics, and materials, are the property of 
                  Pislis or our content creators and are protected by copyright and intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. User Conduct</h2>
                <p>
                  You agree not to use our platform to:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Harass, abuse, or harm others</li>
                  <li>Post false or misleading information</li>
                  <li>Violate any laws or regulations</li>
                  <li>Interfere with the platform's operation</li>
                  <li>Collect other users' personal information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">7. Disclaimer of Warranties</h2>
                <p>
                  Our platform and courses are provided "as is" without warranties of any kind. We do not 
                  guarantee that the platform will be error-free or uninterrupted, or that course content 
                  will lead to specific results or outcomes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, Pislis shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages arising from your use of our platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">9. Termination</h2>
                <p>
                  We reserve the right to suspend or terminate your account at any time for violations of 
                  these terms or for any reason at our discretion. Upon termination, your right to access 
                  courses will immediately cease.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">10. Changes to Terms</h2>
                <p>
                  We may modify these terms at any time. Continued use of our platform after changes are 
                  posted constitutes acceptance of the modified terms.
                </p>
              </section>

              <section className="pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Last Updated: January 7, 2026
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  For questions about these Terms of Service, please contact our support team.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
