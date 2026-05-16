# Create destination directory
$dest = "public\thumbnails"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# Define the mapping: SourceFile => DestFile (kebab-case)
$mappings = @(
  @{ Src = "public\thumbnail\FACEBOOK FACELESS.png";                          Dst = "public\thumbnails\facebook-faceless.png" },
  @{ Src = "public\thumbnail\NICHES THAT PRINT MONEY.png";                    Dst = "public\thumbnails\niches-that-print-money.png" },
  @{ Src = "public\thumbnail\NICHE AND STYLE.png";                            Dst = "public\thumbnails\niche-and-style.png" },
  @{ Src = "public\thumbnail\HOW TO TARGET US AUDIENCE.png";                  Dst = "public\thumbnails\how-to-target-us-audience.png" },
  @{ Src = "public\thumbnail\FB SET UP AND PAGE SET UP.png";                  Dst = "public\thumbnails\fb-set-up-and-page-set-up.png" },
  @{ Src = "public\thumbnail\AI GENERATED POICIES..png";                      Dst = "public\thumbnails\ai-generated-policies.png" },
  @{ Src = "public\thumbnail\HOW TO GO VIRAL ON FACEBOOK.png";                Dst = "public\thumbnails\how-to-go-viral-on-facebook.png" },
  @{ Src = "public\thumbnail\ORGANIC GROWTH HOW TO GAIN FOLLOWERS FAST.png"; Dst = "public\thumbnails\organic-growth-how-to-gain-followers-fast.png" },
  @{ Src = "public\thumbnail\LETS TALK ABOUT MONETIZATION.png";               Dst = "public\thumbnails\lets-talk-about-monetization.png" },
  @{ Src = "public\thumbnail\AVOIDING VIOLATIONS.png";                        Dst = "public\thumbnails\avoiding-violations.png" },
  @{ Src = "public\thumbnail\AI TOOLS FOR FACELESS CONTENT.png";              Dst = "public\thumbnails\ai-tools-for-faceless-content.png" },
  @{ Src = "public\thumbnail\RESTRICT A SPECIFIC COUNTRY.png";                Dst = "public\thumbnails\restrict-a-specific-country.png" },
  @{ Src = "public\thumbnail\HOW TO USE CAPCUT.png";                          Dst = "public\thumbnails\how-to-use-capcut.png" },
  @{ Src = "public\thumbnail\PC CAPCUT PRO BYPASS.png";                       Dst = "public\thumbnails\pc-capcut-pro-bypass.png" },
  @{ Src = "public\thumbnail\FREE CAPCUT PRO.png";                            Dst = "public\thumbnails\free-capcut-pro.png" },
  @{ Src = "public\thumbnail\INTRODUCING STREVIO.png";                        Dst = "public\thumbnails\introducing-strevio.png" },
  @{ Src = "public\thumbnail\SAAN I DOWNLOAD ANG NAKUHANG CLIP 1080P.png";   Dst = "public\thumbnails\saan-i-download-ang-nakuhang-clip-1080p.png" },
  @{ Src = "public\thumbnail\CREATE CONTENT WITH FREE TOOLS.png";             Dst = "public\thumbnails\create-content-with-free-tools.png" },
  @{ Src = "public\thumbnail\FACELESS FARM CONTENT.png";                      Dst = "public\thumbnails\faceless-farm-content.png" },
  @{ Src = "public\thumbnail\HOW TO AVOID COPYRIGHT STRIKES.png";             Dst = "public\thumbnails\how-to-avoid-copyright-strikes.png" },
  @{ Src = "public\thumbnail\FROM BASIC TO ADVANCED IMAGE CREATION.png";      Dst = "public\thumbnails\from-basic-to-advanced-image-creation.png" },
  @{ Src = "public\thumbnail\PAANO AKO KUMITA NG 6 DIGIITS SA STORY.png";    Dst = "public\thumbnails\paano-ako-kumita-ng-6-digits-sa-story.png" },
  @{ Src = "public\thumbnail\HOW TO SETUP PAYHIP STORE FOR YOUR DIGITAL PRODUCTS.png"; Dst = "public\thumbnails\how-to-setup-payhip-store.png" },
  @{ Src = "public\thumbnail\COMMON QUESTION.png";                            Dst = "public\thumbnails\common-question.png" },
  @{ Src = "public\thumbnail\3D Animation Style and General Niche.png";       Dst = "public\thumbnails\3d-animation-style-and-general-niche.png" },
  @{ Src = "public\thumbnail\SKELETON STYLE.png";                             Dst = "public\thumbnails\skeleton-style.png" },
  @{ Src = "public\thumbnail\awareness!.png";                                 Dst = "public\thumbnails\awareness.png" },
  @{ Src = "public\thumbnail\FACEBOOK MASTERY.png";                           Dst = "public\thumbnails\facebook-mastery.png" }
)

foreach ($m in $mappings) {
  if (Test-Path $m.Src) {
    Copy-Item -Path $m.Src -Destination $m.Dst -Force
    Write-Host "Copied: $($m.Src) -> $($m.Dst)"
  } else {
    Write-Warning "MISSING: $($m.Src)"
  }
}

Write-Host "`nDone! Files in public\thumbnails:"
Get-ChildItem $dest | Select-Object Name
