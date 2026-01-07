const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dwcxvaswf',
  api_key: '579255748571588',
  api_secret: 'BlMDsuraKQfeLv32ML3wSjyUb3g'
});

async function fetchAllLessons() {
  const allVideos = [];
  let nextCursor = null;

  console.log('Fetching videos from darwin-education/lessons...');

  do {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'darwin-education/lessons',
        resource_type: 'video',
        max_results: 500,
        next_cursor: nextCursor
      });

      const videos = result.resources.map((video, index) => {
        const filename = video.public_id.split('/').pop();
        return {
          id: allVideos.length + index + 1,
          title: filename.replace(/_/g, ' ').replace(/\.(mp4|mov|avi)$/i, ''),
          filename: filename,
          url: video.secure_url,
          publicId: video.public_id,
          duration: Math.round(video.duration || 0)
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
    const videos = await fetchAllLessons();

    console.log(`\nTotal lesson videos found: ${videos.length}\n`);

    // Display all videos
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   File: ${video.filename}`);
      console.log(`   URL: ${video.url}`);
      console.log(`   Duration: ${video.duration}s\n`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
