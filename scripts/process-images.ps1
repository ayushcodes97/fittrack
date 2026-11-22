# Center-crops every .raw image in public/images/foods/.raw to a 512x512 JPEG
# and removes the .raw folder afterwards. Uses System.Drawing (built into Windows).
Add-Type -AssemblyName System.Drawing

$rawDir = Join-Path $PSScriptRoot "..\public\images\foods\.raw"
$outDir = Join-Path $PSScriptRoot "..\public\images\foods"
$files = Get-ChildItem -Path $rawDir -Filter *.raw -ErrorAction SilentlyContinue

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, [long]82)

$ok = 0; $failed = @()
foreach ($f in $files) {
    $id = $f.BaseName
    try {
        $img = [System.Drawing.Image]::FromFile($f.FullName)
        try {
            $side = [Math]::Min($img.Width, $img.Height)
            $x = [int](($img.Width - $side) / 2)
            $y = [int](($img.Height - $side) / 2)
            # guard: skip images that are too small to look good
            if ($side -lt 200) { throw "source too small ($($img.Width)x$($img.Height))" }
            $bmp = New-Object System.Drawing.Bitmap 512, 512
            $gfx = [System.Drawing.Graphics]::FromImage($bmp)
            $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $srcRect = New-Object System.Drawing.Rectangle $x, $y, $side, $side
            $dstRect = New-Object System.Drawing.Rectangle 0, 0, 512, 512
            $gfx.DrawImage($img, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
            $gfx.Dispose()
            $bmp.Save((Join-Path $outDir "$id.jpg"), $codec, $ep)
            $bmp.Dispose()
            $ok++
        } finally {
            $img.Dispose()
        }
    } catch {
        $failed += "$id ($($_.Exception.Message))"
    }
}

Remove-Item -Recurse -Force $rawDir -ErrorAction SilentlyContinue
Write-Output "Processed $ok images. Failed: $($failed -join '; ')"
if ($failed.Count -gt 0) { exit 2 }
