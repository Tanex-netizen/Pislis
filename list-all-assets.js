const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dwcxvaswf',
  api_key: '579255748571588',
  api_secret: 'BlMDsuraKQfeLv32ML3wSjyUb3g'
});

async function listAllAssets() {
  try {
    console.log('🔍 Fetching all assets from Cloudinary...\n');
    
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'video',
      max_results: 50
    });

    console.log(`📹 Found ${result.resources.length} videos\n`);
    console.log('List of videos:');
    console.log('='.repeat(80));
    
    result.resources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.public_id}`);
      console.log(`   Size: ${(resource.bytes / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Created: ${resource.created_at}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log(`Total: ${result.resources.length} videos`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error.error) {
      console.error('Error details:', error.error);
    }
  }
}

listAllAssets();
