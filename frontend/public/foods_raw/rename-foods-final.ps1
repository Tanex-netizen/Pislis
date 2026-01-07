# Rename last 3 food videos in foods_raw folder

$map = @{
  "3c0b258f82330facadaa79403e03b5ec_720w" = "potatoes-wrapped-foil-baking.mp4"
  "7e78e8d339a80ed3356c4ed2a06908b7" = "hands-cutting-green-lettuce.mp4"
  "511bdb67803f1a25133272bd4a7d1231" = "broccoli-florets-tray.mp4"
}

Write-Host "Renaming last 3 food videos..." -ForegroundColor Cyan

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
