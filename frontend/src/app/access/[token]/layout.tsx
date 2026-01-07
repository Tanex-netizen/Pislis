// Generate static params - access tokens are dynamic, so we return empty array
// This allows the page to be built but users will get the page at runtime
export async function generateStaticParams() {
  // Access tokens are generated dynamically, so we can't pre-generate them
  // Return empty array to allow dynamic access
  return [];
}

export default function AccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
