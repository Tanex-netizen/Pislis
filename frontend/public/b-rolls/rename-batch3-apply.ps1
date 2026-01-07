# Apply renames for batch 3
$map = @{
  "293426916020" = "blood-vessel-tissue.mp4"
  "293426916021" = "tissue-cells-microscopic.mp4"
  "293426916023" = "muscle-tissue-red.mp4"
  "293426916025" = "muscle-fibers-closeup.mp4"
  "293426916027" = "digestive-organs-detailed.mp4"
  "293426916028" = "spine-vertebrae-column.mp4"
  "293426916030" = "woman-portrait-young.mp4"
  "293426916031" = "woman-face-side-profile.mp4"
  "293426916032" = "woman-portrait-dark-bg.mp4"
  "293426916040" = "stomach-pink-organ.mp4"
  "293426916050" = "intestines-digestive-tract.mp4"
  "293426916077" = "red-wine-glass.mp4"
  "293426916079" = "orange-juice-drink.mp4"
  "293426916080" = "vascular-system-pink.mp4"
  "293426916081" = "digestive-organs-beige.mp4"
  "293426916082" = "stomach-intestines-pink.mp4"
  "293426916083" = "spine-nervous-system-blue.mp4"
  "293426916084" = "heart-blood-cells-red.mp4"
  "293426916085" = "cat-green-eyes.mp4"
  "293426916086" = "elderly-person-face.mp4"
  "293426916087" = "red-blood-cells-floating.mp4"
  "293426916088" = "vascular-system-nervous.mp4"
  "293426916089" = "full-skeleton-blue.mp4"
  "293426916090" = "man-smoking-vaping.mp4"
  "293426916092" = "blood-cells-cluster.mp4"
  "293426916094" = "intestines-stomach-tract.mp4"
  "293426916096" = "virus-cells-colorful.mp4"
  "293426916097" = "lungs-respiratory-system.mp4"
  "293426916098" = "torso-skeleton-organs.mp4"
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
