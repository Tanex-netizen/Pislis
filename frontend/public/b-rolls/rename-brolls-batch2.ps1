# Rename script for second batch of b-rolls
# Run from b-rolls folder

$map = @{
  "293426916033" = "fetus-embryo-development.mp4"
  "293426916034" = "athlete-stretching-colorful.mp4"
  "293426916035" = "torso-organs-visible.mp4"
  "293426916036" = "skeleton-colored-organs.mp4"
  "293426916037" = "digestive-system-colorful.mp4"
  "293426916038" = "spine-nervous-system.mp4"
  "293426916049" = "stomach-pink-illustration.mp4"
  "293426916041" = "intestines-cross-section.mp4"
  "293426916042" = "intestines-detailed-view.mp4"
  "293426916043" = "full-skeleton-organs.mp4"
  "293426916044" = "muscular-system-red.mp4"
  "293426916045" = "man-organs-highlighted.mp4"
  "293426916046" = "lungs-heart-diagram.mp4"
  "293426916047" = "stomach-esophagus.mp4"
  "293426916048" = "kidneys-pair.mp4"
  "293426916059" = "digestive-organs-illustration.mp4"
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

Write-Host "Preview: searching for batch 2 files..." -ForegroundColor Cyan
$allMp4 = Get-ChildItem -Path . -Recurse -Filter "*.mp4" -File

foreach ($key in $map.Keys) {
  $matches = $allMp4 | Where-Object { $_.Name -like "*${key}*" }
  if ($matches.Count -eq 0) {
    Write-Host "No match for key:" $key -ForegroundColor Yellow
  } elseif ($matches.Count -gt 1) {
    Write-Host "Multiple matches for key:" $key -ForegroundColor Yellow
    $matches | ForEach-Object { Write-Host "  " $_.FullName }
  } else {
    $old = $matches[0].FullName
    $new = Join-Path $matches[0].DirectoryName $map[$key]
    Write-Host "Would rename:" $old "->" $new -ForegroundColor Green
  }
}

Write-Host "\nPreview complete. Ready to apply renames." -ForegroundColor Cyan
