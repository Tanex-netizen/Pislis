// Generate static params for all courses at build time
export async function generateStaticParams() {
  // Return known course slugs for static generation
  return [
    { slug: 'fb-automation' },
    { slug: 'facebook-automation' },
    // Add more course slugs as needed
  ];
}

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
