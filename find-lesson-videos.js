const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dwcxvaswf',
  api_key: '579255748571588',
  api_secret: 'BlMDsuraKQfeLv32ML3wSjyUb3g'
});

async function findLessonVideos() {
  const result = await cloudinary.api.resources({
    type: 'upload',
    resource_type: 'video',
    max_results: 500
  });
  
  const lessons = result.resources.filter(v => 
    v.public_id.toLowerCase().includes('lesson') || 
    v.public_id.match(/^Lesson-\d+/)
  );
  
  console.log('Lesson videos found:', lessons.length);
  console.log('---');
  lessons.forEach(v => {
    console.log(`${v.public_id}`);
    console.log(`  URL: ${v.secure_url}`);
    console.log('');
  });
}

findLessonVideos().catch(console.error);
