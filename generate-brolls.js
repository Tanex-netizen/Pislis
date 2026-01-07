const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: 'dwcxvaswf',
  api_key: '579255748571588',
  api_secret: 'BlMDsuraKQfeLv32ML3wSjyUb3g'
});

async function getAllVideos(folder) {
  let allResources = [];
  let nextCursor = null;

  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'video',
      prefix: folder,
      max_results: 500,
      next_cursor: nextCursor
    });

    allResources = allResources.concat(result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return allResources;
}

async function main() {
  console.log('Fetching all b-roll videos from Cloudinary...\n');

  // Fetch from all folders
  const brollsVideos = await getAllVideos('darwin-education/b-rolls');
  const winsVideos = await getAllVideos('darwin-education/wins');
  const anatomyVideos = await getAllVideos('darwin-education/anatomy');
  const foodsVideos = await getAllVideos('darwin-education/foods');
  const peopleVideos = await getAllVideos('darwin-education/raw_people');

  console.log(`Found ${brollsVideos.length} videos in darwin-education/b-rolls`);
  console.log(`Found ${winsVideos.length} videos in darwin-education/wins`);
  console.log(`Found ${anatomyVideos.length} videos in darwin-education/anatomy`);
  console.log(`Found ${foodsVideos.length} videos in darwin-education/foods`);
  console.log(`Found ${peopleVideos.length} videos in darwin-education/raw_people`);

  let id = 1;
  const allVideos = [];

  // Add b-rolls (anatomy)
  brollsVideos.forEach(video => {
    const filename = video.public_id.split('/').pop();
    const title = filename.replace(/-/g, ' ').replace('.mp4', '').replace(/\b\w/g, l => l.toUpperCase());
    allVideos.push({
      id: id++,
      title: title,
      filename: filename + '.mp4',
      url: video.secure_url,
      category: 'anatomy'
    });
  });

  // Add anatomy videos
  anatomyVideos.forEach(video => {
    const filename = video.public_id.split('/').pop();
    const title = filename.replace(/-/g, ' ').replace('.mp4', '').replace(/\b\w/g, l => l.toUpperCase());
    allVideos.push({
      id: id++,
      title: title,
      filename: filename + '.mp4',
      url: video.secure_url,
      category: 'anatomy'
    });
  });

  // Add people videos
  peopleVideos.forEach(video => {
    const filename = video.public_id.split('/').pop();
    const title = filename.replace(/-/g, ' ').replace('.mp4', '').replace(/\b\w/g, l => l.toUpperCase());
    allVideos.push({
      id: id++,
      title: title,
      filename: filename + '.mp4',
      url: video.secure_url,
      category: 'people'
    });
  });

  // Add wins
  winsVideos.forEach(video => {
    const filename = video.public_id.split('/').pop();
    const title = 'Win ' + filename.replace('.mp4', '');
    allVideos.push({
      id: id++,
      title: title,
      filename: filename + '.mp4',
      url: video.secure_url,
      category: 'others'
    });
  });

  // Add foods
  foodsVideos.forEach(video => {
    const filename = video.public_id.split('/').pop();
    const title = filename.replace(/-/g, ' ').replace('.mp4', '').replace(/\b\w/g, l => l.toUpperCase());
    allVideos.push({
      id: id++,
      title: title,
      filename: filename + '.mp4',
      url: video.secure_url,
      category: 'foods'
    });
  });

  console.log(`\nTotal videos: ${allVideos.length}`);

  // Write to file
  fs.writeFileSync(
    './frontend/public/data/brolls.json',
    JSON.stringify(allVideos, null, 2)
  );

  console.log('\n✅ Generated frontend/public/data/brolls.json');
  console.log(`\nBreakdown:`);
  console.log(`- Anatomy: ${brollsVideos.length + anatomyVideos.length}`);
  console.log(`- People: ${peopleVideos.length}`);
  console.log(`- Foods: ${foodsVideos.length}`);
  console.log(`- Others (Wins): ${winsVideos.length}`);
}

main().catch(console.error);
