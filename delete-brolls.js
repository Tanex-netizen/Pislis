const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dwcxvaswf',
  api_key: '579255748571588',
  api_secret: 'BlMDsuraKQfeLv32ML3wSjyUb3g'
});

async function listBrollVideos() {
  try {
    let allResources = [];
    let nextCursor = null;

    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'video',
        prefix: 'darwin-education/brolls',
        max_results: 500,
        next_cursor: nextCursor
      });

      allResources = allResources.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    return allResources;
  } catch (error) {
    console.error('Error listing b-rolls:', error.message);
    return [];
  }
}

async function deleteBrolls(count = 10) {
  console.log('🔍 Fetching b-roll videos...\n');
  
  const brolls = await listBrollVideos();
  console.log(`📹 Found ${brolls.length} b-roll videos in Cloudinary\n`);

  if (brolls.length === 0) {
    console.log('❌ No b-rolls found to delete');
    return;
  }

  // Delete only the specified number
  const toDelete = brolls.slice(0, count);
  
  console.log(`🗑️  Will delete ${toDelete.length} b-roll videos:\n`);
  toDelete.forEach((video, index) => {
    console.log(`${index + 1}. ${video.public_id}`);
  });

  console.log('\n⏳ Starting deletion...\n');

  let deleted = 0;
  let failed = 0;

  for (const video of toDelete) {
    try {
      await cloudinary.uploader.destroy(video.public_id, { resource_type: 'video' });
      deleted++;
      console.log(`✅ Deleted: ${video.public_id}`);
    } catch (error) {
      failed++;
      console.error(`❌ Failed to delete ${video.public_id}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 DELETION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully deleted: ${deleted}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📹 Remaining b-rolls: ${brolls.length - deleted}`);
  console.log('='.repeat(50));
}

// Delete 10 b-roll videos
deleteBrolls(10).catch(console.error);
