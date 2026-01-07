'use client';

import { CheckCircle, Award, Headphones, Users } from 'lucide-react';

const features = [
  {
    icon: CheckCircle,
    title: 'FB Automation Experts',
    description: 'Learn from successful Facebook page owners earning 6-figures monthly.',
  },
  {
    icon: Award,
    title: 'Proven Methods',
    description: 'Apply strategies that have grown pages from 0 to 100K+ followers organically.',
  },
  {
    icon: Headphones,
    title: 'Lifetime Access',
    description: 'Access all automation tools, templates, and course updates forever.',
  },
  {
    icon: Users,
    title: 'FB Growth Community',
    description: 'Join our exclusive community of Facebook automation specialists.',
  },
];

const Features = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
              Why Choose <span className="text-gradient">Darwin</span> Education?
            </h2>
            <p className="text-gray-400 text-lg">
              We provide proven Facebook automation strategies, organic growth techniques,
              and monetization blueprints to help you build a profitable Facebook business.
            </p>

            {/* Features List */}
            <div className="grid sm:grid-cols-2 gap-6 mt-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{feature.title}</h4>
                    <p className="text-gray-500 text-sm mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
