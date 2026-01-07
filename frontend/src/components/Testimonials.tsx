import { Star } from 'lucide-react';

// Static testimonials data - no client interactivity needed
const testimonials = [
  {
    id: 1,
    name: 'Maria Santos',
    role: 'FB Page Owner - 120K Followers',
    avatar: 'M',
    rating: 5,
    text: 'These automation strategies helped me grow from 500 to 120K followers in 8 months! Now earning ₱45K monthly through organic methods.',
  },
  {
    id: 2,
    name: 'Carlos Rodriguez',
    role: 'FB Automation Specialist',
    avatar: 'C',
    rating: 5,
    text: 'Managing 15 Facebook pages was impossible until I learned these automation tools. Now I run them effortlessly and earn ₱80K/month.',
  },
  {
    id: 3,
    name: 'Ana Garcia',
    role: 'FB Monetization Expert',
    avatar: 'A',
    rating: 5,
    text: 'The monetization course changed everything! Went from zero income to ₱30K monthly from my 50K follower page without spending on ads.',
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 relative bg-dark-300/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title">Success Stories</h2>
          <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
            Real results from students who mastered Facebook automation and organic growth
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="card">
              {/* User Info */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-400 text-sm leading-relaxed">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
