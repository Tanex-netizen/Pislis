# Complete rename script for both batches of b-rolls
$map = @{
  "293426915988" = "stomach-cross-section.mp4"
  "293426915989" = "skull-neck-muscles.mp4"
  "293426915990" = "red-blood-cells.mp4"
  "293426915991" = "runner-blue-silhouette.mp4"
  "293426915992" = "hip-pain-highlight.mp4"
  "293426915993" = "elbow-xray.mp4"
  "293426915994" = "lungs-diaphragm-anatomy.mp4"
  "293426915995" = "vascular-system-overlay.mp4"
  "293426915996" = "nervous-system-branches.mp4"
  "293426915997" = "digestive-organ-illustration.mp4"
  "293426915998" = "lungs-front-view.mp4"
  "293426915999" = "woman-covering-nose.mp4"
  "293426916000" = "blood-cells-closeup.mp4"
  "293426916001" = "knee-joint-pain-highlight.mp4"
  "293426916002" = "hip-joint-side-view.mp4"
  "293426916003" = "bone-cross-section.mp4"
  "293426916004" = "woman-face-neutral.mp4"
  "293426916005" = "neck-arteries-illustration.mp4"
  "293426916007" = "lungs-3d-render.mp4"
  "293426916008" = "ribcage-and-heart.mp4"
  "293426916009" = "stomach-organ-illustration.mp4"
  "293426916010" = "stomach-cross-section-2.mp4"
  "293426916011" = "cervical-spine-vertebrae.mp4"
  "293426916012" = "athlete-stretching.mp4"
  "293426916013" = "shoulder-pain-xray.mp4"
  "293426916014" = "spinal-column-blue-highlight.mp4"
  "293426916015" = "man-breathing-exercise.mp4"
  "293426916016" = "chest-heart-glow.mp4"
  "293426916017" = "heart-organ-3d.mp4"
  "293426916018" = "blood-vessels-and-cells.mp4"
  "293426916019" = "heart-cross-section.mp4"
  "293426916033" = "fetus-embryo-development.mp4"
  "293426916034" = "athlete-stretching-colorful.mp4"
  "293426916035" = "torso-organs-visible.mp4"
  "293426916036" = "skeleton-colored-organs.mp4"
  "293426916037" = "digestive-system-colorful.mp4"
  "293426916038" = "spine-nervous-system.mp4"
  "293426916041" = "intestines-cross-section.mp4"
  "293426916042" = "intestines-detailed-view.mp4"
  "293426916043" = "full-skeleton-organs.mp4"
  "293426916044" = "muscular-system-red.mp4"
  "293426916045" = "man-organs-highlighted.mp4"
  "293426916046" = "lungs-heart-diagram.mp4"
  "293426916047" = "stomach-esophagus.mp4"
  "293426916048" = "kidneys-pair.mp4"
  "293426916049" = "stomach-pink-illustration.mp4"
  "293426916051" = "liver-organ.mp4"
  "293426916052" = "torso-orange-organs.mp4"
  "293426916054" = "stomach-red-closeup.mp4"
  "293426916055" = "heart-valves.mp4"
  "293426916057" = "pregnant-woman-fetus.mp4"
  "293426916058" = "intestines-stomach.mp4"
  "293426916060" = "chakra-spine-lights.mp4"
  "293426916061" = "intestines-detailed.mp4"
  "293426916062" = "ribcage-spine.mp4"
  "293426916063" = "digestive-system-golden.mp4"
  "293426916064" = "brain-organ.mp4"
  "293426916065" = "blood-vessel-artery.mp4"
  "293426916066" = "bladder-organ.mp4"
  "293426916067" = "torso-organs-blue.mp4"
  "293426916068" = "back-view-anatomy.mp4"
  "293426916069" = "digestive-system-side.mp4"
  "293426916070" = "spine-organs-side-view.mp4"
  "293426916071" = "digestive-system-beige.mp4"
  "293426916072" = "man-face-portrait.mp4"
  "293426916073" = "kidneys-pink.mp4"
  "293426916074" = "ribcage-organs.mp4"
  "293426916075" = "vascular-system-blue-overlay.mp4"
  "293426916076" = "organs-side-view-colorful.mp4"
}

$allMp4 = Get-ChildItem -Path . -Recurse -Filter "*.mp4" -File
$successCount = 0

foreach ($key in $map.Keys) {
  $matches = $allMp4 | Where-Object { $_.Name -like "*${key}*" }
  if ($matches.Count -eq 1) {
    Rename-Item -Path $matches[0].FullName -NewName $map[$key] -ErrorAction SilentlyContinue
    Write-Host "Renamed:" $matches[0].Name "->" $map[$key] -ForegroundColor Green
    $successCount++
  }
}

Write-Host "`nRenamed $successCount files" -ForegroundColor Cyan
