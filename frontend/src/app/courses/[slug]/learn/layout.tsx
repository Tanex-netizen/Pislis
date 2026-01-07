// Generate static params for all courses at build time
export async function generateStaticParams() {
  // Return all known course slugs
  return [
    { slug: 'fb-automation' },
    { slug: 'fb-automation-mastery' },
    { slug: 'facebook-automation' },
  ];
}

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
