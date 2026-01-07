import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Category = 'anatomy' | 'foods' | 'people' | 'others';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';

// Cloudinary folder mapping
type CloudinarySource = {
  cloudinaryFolder: string;
  category: Category;
  // Hardcoded list of video filenames (update after upload)
  videos: string[];
};

// TODO: After uploading to Cloudinary, update these arrays with your actual video filenames
const CLOUDINARY_SOURCES: CloudinarySource[] = [
  { 
    cloudinaryFolder: 'brolls', 
    category: 'anatomy',
    videos: [] // Add your b-roll filenames here after upload
  },
  { 
    cloudinaryFolder: 'foods', 
    category: 'foods',
    videos: [] // Add your food video filenames here after upload
  },
  { 
    cloudinaryFolder: 'anatomy', 
    category: 'people',
    videos: [] // Add your people/anatomy video filenames here after upload
  },
  { 
    cloudinaryFolder: 'wins', 
    category: 'others',
    videos: [
      'IMG_1349.mp4',
      'IMG_1351.mp4',
      'IMG_1352.mp4',
      'IMG_1353.mp4',
      'IMG_1354.mp4',
      'IMG_1355.mp4',
      'IMG_1356.mp4',
      'IMG_1357.mp4',
      'IMG_1359.mp4',
      'IMG_1361.mp4',
      'IMG_1362.mp4',
      'IMG_1365.mp4',
      'IMG_1366.mp4',
      'IMG_1367.mp4',
      'IMG_1368.mp4',
      'IMG_1369.mp4',
      'IMG_1370.mp4',
      'IMG_1371.mp4',
      'IMG_1372.mp4',
      'IMG_4325.mp4',
    ]
  },
];

function toCloudinaryUrl(cloudinaryFolder: string, filename: string) {
  // Remove .mp4 extension and replace spaces with underscores
  const publicId = filename.replace('.mp4', '').replace(/ /g, '_');
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/f_auto,q_auto/darwin-education/${cloudinaryFolder}/${encodeURIComponent(publicId)}.mp4`;
}

function titleFromFilename(filename: string) {
  return filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
}

export async function GET() {
  const startTime = Date.now();
  console.log('[/api/brolls] Request received');
  
  try {
    const all = CLOUDINARY_SOURCES.map(({ cloudinaryFolder, category, videos }) => {
      return videos.map((filename) => ({
        title: titleFromFilename(filename),
        filename,
        url: toCloudinaryUrl(cloudinaryFolder, filename),
        category,
      }));
    });

    const flattened = all.flat();
    console.log(`[/api/brolls] Total videos configured: ${flattened.length}`);

    // Stable ordering: category, then title
    const categoryOrder: Record<Category, number> = {
      anatomy: 1,
      foods: 2,
      people: 3,
      others: 4,
    };

    flattened.sort((a, b) => {
      const c = categoryOrder[a.category] - categoryOrder[b.category];
      if (c !== 0) return c;
      return a.title.localeCompare(b.title);
    });

    const withIds = flattened.map((item, idx) => ({ id: idx + 1, ...item }));
    
    const totalTime = Date.now() - startTime;
    console.log(`[/api/brolls] ✓ Returning ${withIds.length} videos in ${totalTime}ms`);
    
    return NextResponse.json(withIds, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[/api/brolls] ✗ Error after ${totalTime}ms:`, error);
    return NextResponse.json(
      { error: 'Failed to load b-roll videos', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
