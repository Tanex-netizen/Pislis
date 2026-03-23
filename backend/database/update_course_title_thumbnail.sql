-- Update course title and thumbnail for Faceless Facebook Mastery
-- Run this in Supabase SQL Editor

UPDATE courses
SET
  title = 'Faceless Facebook Mastery',
  thumbnail_url = 'https://res.cloudinary.com/dwcxvaswf/image/upload/v1774255173/Faceless_Facebook_Mastery_uhlstt.png'
WHERE slug = 'fb-automation-mastery';
