# Preview rename script for b-rolls folder
# Run this file in PowerShell from the b-rolls folder.
# It will only print what it would rename (no changes).

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
}

Write-Host "Preview: listing matches in current folder and subfolders..." -ForegroundColor Cyan
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

Write-Host "\nPreview complete. If output looks correct, I can run the actual rename script next." -ForegroundColor Cyan
