import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-950 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Privacy Policy</h1>
            
            <div className="space-y-6 text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
                <p>
                  We collect information you provide directly to us when you create an account, enroll in courses, 
                  or communicate with us. This may include your name, email address, payment information, and 
                  course progress data.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
                <p>
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Provide, maintain, and improve our courses and services</li>
                  <li>Process enrollments and payments</li>
                  <li>Send you course updates and educational content</li>
                  <li>Respond to your comments and questions</li>
                  <li>Protect against fraudulent or illegal activity</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. Information Sharing</h2>
                <p>
                  We do not sell or rent your personal information to third parties. We may share your information 
                  with service providers who assist us in operating our platform, conducting our business, or 
                  serving our users.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
                <p>
                  You have the right to access, update, or delete your personal information at any time. 
                  You can manage your account settings or contact us directly for assistance.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Cookies</h2>
                <p>
                  We use cookies and similar tracking technologies to track activity on our platform and 
                  store certain information to improve user experience and analyze usage patterns.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">7. Changes to This Policy</h2>
                <p>
                  We may update this privacy policy from time to time. We will notify you of any changes by 
                  posting the new policy on this page and updating the "Last Updated" date.
                </p>
              </section>

              <section className="pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Last Updated: January 7, 2026
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  If you have any questions about this Privacy Policy, please contact us.
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
