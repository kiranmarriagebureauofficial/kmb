Add-Type -AssemblyName System.Drawing

$srcPath = "E:\kiranmarriagebureau\Kiran Marriage Bureau Logo.png"
$brandDir = "E:\kiranmarriagebureau\public\brand"

if (-not (Test-Path $brandDir)) {
    New-Item -ItemType Directory -Path $brandDir -Force
}

$orig = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $orig.Width
$height = $orig.Height

Write-Output "Processing original logo: ${width}x${height}..."

# Palette:
# Antique Gold: #D9A93F -> R=217, G=169, B=63
# Deep Maroon: #5A0A14 -> R=90, G=10, B=20

# 1. logo-full-transparent.png
Write-Output "Generating logo-full-transparent.png..."
$fullTrans = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $p = $orig.GetPixel($x, $y)
        $lum = [math]::Max($p.R, [math]::Max($p.G, $p.B))
        if ($lum -gt 25) {
            # Alpha scales from 0 to 255
            $alpha = [math]::Min(255, [int]($lum * 1.1))
            # Gold color matching antique gold #D9A93F with subtle highlight
            $r = [math]::Min(255, [int](217 * ($lum / 255.0) + 38 * ($lum / 255.0)))
            $g = [math]::Min(255, [int](169 * ($lum / 255.0) + 34 * ($lum / 255.0)))
            $b = [math]::Min(255, [int](63 * ($lum / 255.0) + 20 * ($lum / 255.0)))
            $col = [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b)
            $fullTrans.SetPixel($x, $y, $col)
        } else {
            $fullTrans.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}
$fullTrans.Save("$brandDir\logo-full-transparent.png", [System.Drawing.Imaging.ImageFormat]::Png)
$fullTrans.Dispose()
Write-Output "Saved logo-full-transparent.png"

# 2. logo-print.png (Maroon on white)
Write-Output "Generating logo-print.png..."
$printBmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gPrint = [System.Drawing.Graphics]::FromImage($printBmp)
$gPrint.Clear([System.Drawing.Color]::White)
for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $p = $orig.GetPixel($x, $y)
        $lum = [math]::Max($p.R, [math]::Max($p.G, $p.B))
        if ($lum -gt 30) {
            # Map brightness to deep maroon #5A0A14 on white
            $factor = $lum / 255.0
            $r = [int](255 - (255 - 90) * $factor)
            $g = [int](255 - (255 - 10) * $factor)
            $b = [int](255 - (255 - 20) * $factor)
            $printBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
        }
    }
}
$gPrint.Dispose()
$printBmp.Save("$brandDir\logo-print.png", [System.Drawing.Imaging.ImageFormat]::Png)
$printBmp.Dispose()
Write-Output "Saved logo-print.png"

# 3. Find bounds for icon (couple) Y: 0 to 770
$iconMinX = $width; $iconMaxX = 0; $iconMinY = 770; $iconMaxY = 0
for ($y = 0; $y -lt 770; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $p = $orig.GetPixel($x, $y)
        if (($p.R + $p.G + $p.B) -gt 60) {
            if ($x -lt $iconMinX) { $iconMinX = $x }
            if ($x -gt $iconMaxX) { $iconMaxX = $x }
            if ($y -lt $iconMinY) { $iconMinY = $y }
            if ($y -gt $iconMaxY) { $iconMaxY = $y }
        }
    }
}
Write-Output "Icon bounds: X: $iconMinX..$iconMaxX, Y: $iconMinY..$iconMaxY"

# Create square logo-icon.png with padding
$iconW = $iconMaxX - $iconMinX
$iconH = $iconMaxY - $iconMinY
$iconDim = [math]::Max($iconW, $iconH) + 60
$iconBmp = New-Object System.Drawing.Bitmap($iconDim, $iconDim, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$offsetX = [int](($iconDim - $iconW) / 2)
$offsetY = [int](($iconDim - $iconH) / 2)

for ($y = $iconMinY; $y -le $iconMaxY; $y++) {
    for ($x = $iconMinX; $x -le $iconMaxX; $x++) {
        $p = $orig.GetPixel($x, $y)
        $lum = [math]::Max($p.R, [math]::Max($p.G, $p.B))
        if ($lum -gt 25) {
            $alpha = [math]::Min(255, [int]($lum * 1.1))
            $r = [math]::Min(255, [int](217 * ($lum / 255.0) + 38 * ($lum / 255.0)))
            $g = [math]::Min(255, [int](169 * ($lum / 255.0) + 34 * ($lum / 255.0)))
            $b = [math]::Min(255, [int](63 * ($lum / 255.0) + 20 * ($lum / 255.0)))
            $col = [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b)
            $destX = $offsetX + ($x - $iconMinX)
            $destY = $offsetY + ($y - $iconMinY)
            $iconBmp.SetPixel($destX, $destY, $col)
        }
    }
}
$iconBmp.Save("$brandDir\logo-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$iconBmp.Dispose()
Write-Output "Saved logo-icon.png"

# 4. Find bounds for wordmark Y: 980 to 1220
$wmMinX = $width; $wmMaxX = 0; $wmMinY = 1220; $wmMaxY = 980
for ($y = 980; $y -lt [math]::Min($height, 1230); $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $p = $orig.GetPixel($x, $y)
        if (($p.R + $p.G + $p.B) -gt 60) {
            if ($x -lt $wmMinX) { $wmMinX = $x }
            if ($x -gt $wmMaxX) { $wmMaxX = $x }
            if ($y -lt $wmMinY) { $wmMinY = $y }
            if ($y -gt $wmMaxY) { $wmMaxY = $y }
        }
    }
}
Write-Output "Wordmark bounds: X: $wmMinX..$wmMaxX, Y: $wmMinY..$wmMaxY"

$wmW = $wmMaxX - $wmMinX + 20
$wmH = $wmMaxY - $wmMinY + 20
$wmBmp = New-Object System.Drawing.Bitmap($wmW, $wmH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = $wmMinY; $y -le $wmMaxY; $y++) {
    for ($x = $wmMinX; $x -le $wmMaxX; $x++) {
        $p = $orig.GetPixel($x, $y)
        $lum = [math]::Max($p.R, [math]::Max($p.G, $p.B))
        if ($lum -gt 25) {
            $alpha = [math]::Min(255, [int]($lum * 1.1))
            $r = [math]::Min(255, [int](217 * ($lum / 255.0) + 38 * ($lum / 255.0)))
            $g = [math]::Min(255, [int](169 * ($lum / 255.0) + 34 * ($lum / 255.0)))
            $b = [math]::Min(255, [int](63 * ($lum / 255.0) + 20 * ($lum / 255.0)))
            $col = [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b)
            $destX = 10 + ($x - $wmMinX)
            $destY = 10 + ($y - $wmMinY)
            $wmBmp.SetPixel($destX, $destY, $col)
        }
    }
}
$wmBmp.Save("$brandDir\logo-wordmark.png", [System.Drawing.Imaging.ImageFormat]::Png)
$wmBmp.Dispose()
Write-Output "Saved logo-wordmark.png"

# 5. Create logo-banner.png (horizontal lockup)
# Size: 1200x320 with Icon on left (scaled), vertical gold divider flourish, Wordmark on right
$bannerW = 1200
$bannerH = 340
$bannerBmp = New-Object System.Drawing.Bitmap($bannerW, $bannerH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gBanner = [System.Drawing.Graphics]::FromImage($bannerBmp)
$gBanner.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gBanner.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Draw scaled icon (height ~ 280)
$iconPng = [System.Drawing.Bitmap]::FromFile("$brandDir\logo-icon.png")
$gBanner.DrawImage($iconPng, 30, 30, 280, 280)
$iconPng.Dispose()

# Draw divider line in Antique Gold #D9A93F
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 217, 169, 63), 2)
$gBanner.DrawLine($pen, 340, 50, 340, 290)
$pen.Dispose()

# Draw Wordmark
$wmPng = [System.Drawing.Bitmap]::FromFile("$brandDir\logo-wordmark.png")
# scale wordmark to width ~ 780
$targetWmW = 780
$targetWmH = [int]($wmPng.Height * ($targetWmW / $wmPng.Width))
$wmY = [int]((340 - $targetWmH) / 2)
$gBanner.DrawImage($wmPng, 370, $wmY, $targetWmW, $targetWmH)
$wmPng.Dispose()

$gBanner.Dispose()
$bannerBmp.Save("$brandDir\logo-banner.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bannerBmp.Dispose()
Write-Output "Saved logo-banner.png"

$orig.Dispose()
Write-Output "ALL 5 BRAND ASSETS SUCCESSFULLY GENERATED!"

