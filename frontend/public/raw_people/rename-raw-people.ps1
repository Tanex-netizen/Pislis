# Rename raw_people folder files based on thumbnails
# Only renaming numeric/hash files, leaving already-named files unchanged

$map = @{
  "2a19b734788b4dabb06c5cfddaffbea5_t4" = "woman-looking-down.mp4"
  "2a82068dd5aa22c1c07023e0804e3d3f_t1" = "woman-blonde-standing.mp4"
  "2d8e55085acfa6550d6ab94187ab04ab" = "woman-red-top.mp4"
  "3c4137cafd6e9878759ec03a5b9d02c0" = "woman-blonde-portrait.mp4"
  "4ed564ec688e92dd56c22b3c88ff735d" = "woman-green-shirt-smiling.mp4"
  "28a1e91a6723f9afd093b23369efb343" = "man-with-beard-brown.mp4"
  "037fd2878309f49bd383e88b7c7eb6ec" = "pregnant-woman-belly.mp4"
  "71d9d364b7a472ebaa4dcc5177f02d21" = "woman-peach-top.mp4"
  "80d0f6365188252897f5bc572974861a_720w" = "red-cars-driving.mp4"
  "96f945845f22a380fc486cea9f3831e9" = "chocolate-brownies-dessert.mp4"
  "538fb620c57389ccddd8e5c05d540140_720w" = "woman-tan-skin-portrait.mp4"
  "655f7f8da41e18a80cb2c1ac1c5b53fb" = "blue-ocean-water.mp4"
  "66671c4ca8fa464a5d70a47051997064" = "man-dumbbell-workout.mp4"
  "82347e645536849843d77bd3ea2ffd00_720w" = "man-torso-fit.mp4"
  "0463138f57b20e1c99dc45d25d252937" = "woman-brown-vest.mp4"
  "3044654-uhd_3840_2160" = "woman-white-sweater.mp4"
  "3044660-uhd_3840_2160" = "woman-side-profile-blonde.mp4"
  "3044675-uhd_3840_2160" = "woman-smiling-happy.mp4"
  "3248993-uhd_3840_2160" = "man-outdoors-smiling.mp4"
  "3753690-uhd_3840_2160" = "woman-dark-hair-portrait.mp4"
  "4100354-uhd_4096_2160" = "woman-black-hair-closeup.mp4"
  "4105022-uhd_3840_2160" = "woman-purple-background.mp4"
  "4435249-uhd_3840_2160" = "woman-grey-background.mp4"
  "4982413-hd_1920_1080" = "woman-pink-background.mp4"
  "5198161-uhd_3840_2160" = "woman-hands-face.mp4"
  "5469574-uhd_2160_3840" = "woman-thinking-pink.mp4"
  "5516428-uhd_3840_2160" = "woman-ocean-background.mp4"
  "5544312-hd_1920_1080" = "woman-purple-shirt.mp4"
  "5636880-hd_1920_1080" = "man-pink-blue-lighting.mp4"
  "5843377-hd_1026_1832" = "woman-meditation-yoga.mp4"
  "5843399-hd_1046_1866" = "airplane-sky-flying.mp4"
  "6023296-uhd_3840_2160" = "man-portrait-closeup.mp4"
  "6268977-hd_1080_2048" = "coffee-beans-roasted.mp4"
  "6332662-uhd_4096_2160" = "woman-green-smoothie.mp4"
  "6412412-hd_1920_1080" = "woman-peach-lighting.mp4"
  "6605949-uhd_4096_2160" = "woman-hands-prayer-pose.mp4"
  "6866748-uhd_2160_4096" = "woman-brown-hair-portrait.mp4"
  "6935847-hd_1080_1920" = "man-dark-suit.mp4"
  "6970177-hd_1920_1080" = "man-yellow-shirt.mp4"
  "6970199-hd_1920_1080" = "man-field-outdoors.mp4"
  "6975017-uhd_4096_2160" = "woman-blonde-soft-lighting.mp4"
  "7328452-uhd_2160_3840" = "man-pink-shirt.mp4"
  "7478345-uhd_2160_3840" = "woman-orange-shirt.mp4"
  "7531422-hd_1080_1920" = "woman-white-robe.mp4"
  "7583217-hd_1920_1080" = "man-white-shirt-casual.mp4"
  "7788805-uhd_3840_2160" = "woman-beige-sweater.mp4"
  "7788821-uhd_2160_3840" = "woman-orange-top-closeup.mp4"
  "7928994-uhd_2160_3840" = "woman-applying-cream.mp4"
  "8107581-uhd_2160_4096" = "man-grey-shirt-thinking.mp4"
  "8165135-hd_1080_1920" = "man-blue-shirt-portrait.mp4"
  "8375701-uhd_4096_2160" = "man-laptop-workspace.mp4"
  "8416670-hd_1080_1920" = "woman-white-shirt-portrait.mp4"
  "8636882-uhd_2560_1440" = "woman-peach-blazer.mp4"
  "8818531-uhd_3840_2160" = "woman-white-shirt-outdoor.mp4"
  "8860242-uhd_4096_2160" = "man-suit-professional.mp4"
  "9001900-hd_1080_1920" = "woman-pink-blazer.mp4"
  "9152709b84644003870bd91491e57ad5" = "woman-phone-bed.mp4"
  "10372474-hd_1920_1080" = "man-phone-bed.mp4"
  "10431976-hd_1080_1920" = "man-fitness-dumbbell.mp4"
  "11654896-uhd_3840_2160" = "woman-towel-head-smiling.mp4"
  "13107036-uhd_3840_2160" = "woman-towel-head-closeup.mp4"
  "be8e7290fd6bb8a085ef4c29accfb6d6" = "bird-yellow-feathers.mp4"
  "c469bd2f36f44bc54bd8f47502bd1144" = "woman-fitness-pose.mp4"
  "c4cf43fc70aa2eec9d6bc915385b0fae" = "baby-newborn-hand.mp4"
  "e9f68b4c5f2bc6cc280e9b7fcdf1e42b" = "fitness-analysis-tablet.mp4"
  "f5ab7e5c6b29127d443e78300f7fd8ad" = "woman-white-outfit.mp4"
  "fe26b7a29451e9012279c7761134aa9d" = "man-black-shirt-workout.mp4"
  "fe8c37b2abe71f837f90db0747c390fb" = "woman-fitness-gym.mp4"
  "FDownloader.Net_AQPxNdL9OTId8rJ4OdRcb9TU_dkYP-nSD3qv0-hE20UfeGybI0BNBr0o55Hb6mbWUleb5p50swgvk41OIF7iRsfa1eRx4JGAtLXYPGD4OQkVrg_720p_(HD)" = "person-exercising-outdoors.mp4"
  "pinterestdownloader.com-1747841733.317895" = "woman-stretching-exercise.mp4"
}

Write-Host "Renaming raw_people folder files..." -ForegroundColor Cyan

$allMp4 = Get-ChildItem -Path . -Recurse -Filter "*.mp4" -File
$successCount = 0

foreach ($key in $map.Keys) {
  $matches = $allMp4 | Where-Object { $_.Name -like "*${key}*" }
  if ($matches.Count -eq 1) {
    $newName = $map[$key]
    # Check if target name already exists
    $targetPath = Join-Path $matches[0].DirectoryName $newName
    if (Test-Path $targetPath) {
      Write-Host "Skipped (target exists):" $newName -ForegroundColor Yellow
    } else {
      Rename-Item -Path $matches[0].FullName -NewName $newName -ErrorAction SilentlyContinue
      Write-Host "Renamed:" $matches[0].Name "->" $newName -ForegroundColor Green
      $successCount++
    }
  }
}

Write-Host "`nRenamed $successCount files" -ForegroundColor Cyan
