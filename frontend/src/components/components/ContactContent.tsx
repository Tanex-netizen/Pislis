'use client';

import { Facebook, Instagram, MessageCircle, Send } from 'lucide-react';

export default function ContactContent() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Telegram Contact */}
          <div className="card p-6 self-start">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
            <p className="text-gray-400 mb-8">
              Have questions? Reach out to us directly on Telegram for instant support and assistance.
            </p>
            
            <a
              href="https://t.me/+MaOIiu5SXVhlZGE9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-3 py-2 bg-[#0088cc] hover:bg-[#0077b5] text-white text-sm font-medium rounded-md transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send us a Message on Telegram</span>
            </a>
          </div>

          {/* Additional Info */}
          <div className="space-y-8">
            <div className="card p-8">
              <h3 className="text-xl font-bold text-white mb-4">Follow Us</h3>
              <p className="text-gray-400 mb-6">
                Stay updated with the latest Facebook automation tips and strategies
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/share/182pRbvAzn/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-400 hover:bg-primary-500 hover:text-white transition-all"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/darwin.cents?igsh=MWd2Y2Z6end4Zm81NA%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-400 hover:bg-primary-500 hover:text-white transition-all"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="card p-8 bg-primary-500/10 border-primary-500/30">
              <h3 className="text-xl font-bold text-white mb-2">Need Instant Help?</h3>
              <p className="text-gray-400 mb-4">
                Join our community and get answers from fellow students
              </p>
              <a 
                href="https://t.me/+MaOIiu5SXVhlZGE9" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Join Community</span>
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
