const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dwcxvaswf',
  api_key: '579255748571588',
  api_secret: 'BlMDsuraKQfeLv32ML3wSjyUb3g'
});

async function fetchAllVideos() {
  const allVideos = [];
  let nextCursor = null;

  console.log('Fetching videos from darwin-education/videos...');

  do {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'darwin-education/videos',
        resource_type: 'video',
        max_results: 500,
        next_cursor: nextCursor
      });

      const videos = result.resources.map((video, index) => {
        const filename = video.public_id.split('/').pop();
        return {
          id: allVideos.length + index + 1,
          title: `Video ${allVideos.length + index + 1}`,
          description: filename.replace(/_/g, ' ').replace(/\.(mp4|mov|avi)$/i, ''),
          filename: filename,
          url: video.secure_url,
          publicId: video.public_id
        };
      });

      allVideos.push(...videos);
      nextCursor = result.next_cursor;
      
      console.log(`Fetched ${videos.length} videos (Total: ${allVideos.length})`);

    } catch (error) {
      console.error('Error fetching videos:', error.message);
      break;
    }
  } while (nextCursor);

  return allVideos;
}

async function main() {
  try {
    const videos = await fetchAllVideos();

    console.log(`\nTotal videos found: ${videos.length}`);

    // Save to JSON file
    const outputPath = './frontend/public/data/homepage-videos.json';
    fs.writeFileSync(outputPath, JSON.stringify(videos, null, 2));
    console.log(`\nVideos saved to: ${outputPath}`);

    // Display summary
    console.log('\n=== Summary ===');
    console.log(`Videos: ${videos.length}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
