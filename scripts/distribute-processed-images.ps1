# Distribute images from public/images/devices/_/processed to correct device or board brand folders.
# Normalize filenames: lowercase, spaces to hyphens, remove special chars.

$ErrorActionPreference = "Stop"
$processedDir = Join-Path $PSScriptRoot "..\public\images\devices\_\processed"
$devicesRoot = Join-Path $PSScriptRoot "..\public\images\devices"
$boardsRoot = Join-Path $PSScriptRoot "..\public\images\boards"

function Normalize-Filename($name) {
  $n = $name.ToLowerInvariant()
  $n = $n -replace '\s+', '-'
  $n = $n -replace '[®™]', ''
  $n = $n -replace '', ''  # broken encoding
  $n = $n -replace '[^\w\-\.]', '-'
  $n = $n -replace '-+', '-'
  $n = $n.Trim('-')
  return $n
}

# Returns ( "devices"|"boards", brandFolderName ) or $null if skip
function Get-TargetFolder($fileName) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($fileName).ToLowerInvariant()
  $first = ($base -split '[-_\s]')[0]

  # Boards
  if ($base.StartsWith("aclam-") -or $base.StartsWith("smart-track-")) { return @("boards", "aclam") }
  if ($base.StartsWith("pedaltrain-")) { return @("boards", "pedaltrain") }
  if ($base.StartsWith("warwick-rockboard")) { return @("boards", "rockboard") }
  if ($base -eq "headrush-pedalboard") { return @("devices", "headrush") }  # device

  # Devices by prefix
  $deviceBrands = @{
    "amt" = "amt"; "boss" = "boss"; "bass-dd" = "boss"; "bodd" = "boss"; "re-boss" = "boss"
    "cioks" = "cioks"; "dunlop" = "dunlop"; "cry-baby" = "dunlop"; "evhmhg" = "evh"
    "fractal" = "fractal"; "headrush" = "headrush"; "line6" = "line6"; "mission" = "mission"
    "mooer" = "mooer"; "mxr" = "mxr"; "mxr75" = "mxr"; "mxrdd30" = "mxr"; "mxrm309" = "mxr"; "mxt" = "mxr"
    "nux" = "nux"; "strymon" = "strymon"; "valeton" = "valeton"; "walrus" = "walrus"; "walrusaudio" = "walrus"
    "zoom" = "zoom"; "aclam" = "aclam"
  }
  foreach ($key in $deviceBrands.Keys) {
    if ($base.StartsWith($key)) { return @("devices", $deviceBrands[$key]) }
  }
  # Dunlop with space in name (e.g. "dunlop CRY BABY...")
  if ($base.StartsWith("dunlop")) { return @("devices", "dunlop") }
  if ($base.StartsWith("cry ") -or $base.StartsWith("kirk ")) { return @("devices", "dunlop") }

  # Standalone filenames (no brand prefix)
  if ($base -in @("gm-800", "gt-1000core", "gx-100", "me-90", "sl-2")) { return @("devices", "boss") }
  if ($base -match "^boss-") { return @("devices", "boss") }

  $zoomOnly = @("g11", "g1four", "g6", "m50gplus", "ms-200dplus", "ms-60bplus", "ms-70cdrplus", "ms-80irplus", "ms-90lpplus")
  if ($base -in $zoomOnly) { return @("devices", "zoom") }
  if ($base.StartsWith("zoom")) { return @("devices", "zoom") }

  if ($base -in @("minicortex", "quadcortex", "pocket_gt")) { return @("devices", "neural") }

  return $null
}

$files = Get-ChildItem -Path $processedDir -File -Filter "*.png"
$copied = @()
foreach ($f in $files) {
  $target = Get-TargetFolder $f.Name
  if (-not $target) { continue }
  $type = $target[0]
  $brand = $target[1]
  $normalized = Normalize-Filename $f.Name
  $destDir = if ($type -eq "boards") { Join-Path $boardsRoot $brand } else { Join-Path $devicesRoot $brand }
  if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
  $destPath = Join-Path $destDir $normalized
  Copy-Item -Path $f.FullName -Destination $destPath -Force
  $relPath = if ($type -eq "boards") { "boards/$brand/$normalized" } else { "devices/$brand/$normalized" }
  $copied += [PSCustomObject]@{ From = $f.Name; To = $relPath; Type = $type; Brand = $brand }
}
$copied | Format-Table -AutoSize
Write-Host "Copied $($copied.Count) files."
