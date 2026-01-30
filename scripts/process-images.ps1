# Force CPU for ONNX Runtime to avoid GPU initialization hangs in sandbox
$env:ONNXRUNTIME_PROVIDER = 'CPUExecutionProvider'

$targetDir = "E:\dev\pedal\public\images\devices\_"
$outputDir = Join-Path $targetDir "processed"
$tempBorderDir = Join-Path $targetDir "temp_borders"
$dryRun = $args -contains "--dry-run"
$noBorders = $args -contains "--no-borders"

$rembgPath = "C:\Users\panta\AppData\Local\Python\pythoncore-3.11-64\Scripts\rembg.exe"

if (-not (Test-Path $targetDir)) {
    Write-Error "Directory not found: $targetDir"
    exit 1
}

# Cleanup and create folders
if (-not $dryRun) {
    if (Test-Path $outputDir) { Remove-Item -Path $outputDir -Recurse -Force | Out-Null }
    if (-not $noBorders) {
        if (Test-Path $tempBorderDir) { Remove-Item -Path $tempBorderDir -Recurse -Force | Out-Null }
        New-Item -ItemType Directory -Path $tempBorderDir -Force | Out-Null
    }
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

Write-Host "--- Image Processing Script (Output to: $outputDir) ---"
if ($dryRun) { Write-Host "*** DRY RUN MODE ENABLED ***`n" }
if ($noBorders) { Write-Host "*** NO BORDERS: Skipping border phase, rembg input = source dir ***`n" }

$files = Get-ChildItem -Path $targetDir -File

# PHASE 1: Prepare PNGs with Borders in Temp Folder (skipped when --no-borders)
if (-not $noBorders) {
    Write-Host "PHASE 1: Preparing PNG files with 100px borders..."
    foreach ($file in $files) {
        $ext = $file.Extension.ToLower()
        $inputPath = $file.FullName
        $baseName = $file.BaseName
        $borderedPath = Join-Path $tempBorderDir ($baseName + ".png")

        if ($ext -eq ".png" -or $ext -in ".jpg", ".jpeg", ".webp", ".avif") {
            Write-Host " - Processing: $($file.Name)"
            if (-not $dryRun) {
                # Convert to PNG and add border in one go
                & magick "$inputPath" -bordercolor white -border 100x100 "$borderedPath"
            }
        }
    }
}
else {
    Write-Host "PHASE 1: Skipped (--no-borders)."
}          

# PHASE 2: Background Removal (Bulk)
$rembgInputDir = if ($noBorders) { $targetDir } else { $tempBorderDir }
Write-Host "`nPHASE 2: Removing backgrounds using rembg (Bulk)..."
if (-not $dryRun) {
    Write-Host "Executing: $rembgPath p `"$rembgInputDir`" `"$outputDir`""
    # Using 'p' command: rembg p <input_dir> <output_dir>
    & $rembgPath p "$rembgInputDir" "$outputDir"
}
else {
    Write-Host "[DRY RUN] Would execute: $rembgPath p `"$rembgInputDir`" `"$outputDir`""
}

# PHASE 3: Trimming
Write-Host "`nPHASE 3: Trimming results..."
if (-not $dryRun) {
    $processedFiles = Get-ChildItem $outputDir -Filter *.png
    $count = 0
    $total = $processedFiles.Count

    foreach ($file in $processedFiles) {
        $count++
        $filePath = $file.FullName
        Write-Host "[$count/$total] Trimming: $($file.Name) (fuzz 20%)..."
        & magick "$filePath" -fuzz 20% -trim +repage "$filePath"
    }

    # Cleanup temp border folder (only when borders phase was run)
    if (-not $noBorders -and (Test-Path $tempBorderDir)) {
        Remove-Item -Path $tempBorderDir -Recurse -Force | Out-Null
    }
}

Write-Host "`nProcessing Complete! Results are in: $outputDir"
if ($dryRun) { Write-Host "*** DRY RUN MODE: No files were actually created or modified. ***" }
