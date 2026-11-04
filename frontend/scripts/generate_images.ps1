Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path $PSScriptRoot "..\public\new-images"
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

# 1. Copy real uploaded banners
$uploadedDir = "C:\Users\singh\.gemini\antigravity\brain\7a339f28-c059-45db-b1d9-82e2e49692df\.user_uploaded"

$banner1 = Join-Path $uploadedDir "media_1793334330806_31b7a882.jpg"
$banner2 = Join-Path $uploadedDir "media_1793334330806_1df610c9.jpg"
$banner3 = Join-Path $uploadedDir "media_1793334330827_2bf143fe.jpg"

if (Test-Path $banner1) {
    Copy-Item $banner1 (Join-Path $outputDir "hero-wall-decor.jpg") -Force
    Copy-Item $banner1 (Join-Path $outputDir "banner-inspiration.jpg") -Force
    Write-Host "Copied banner 1"
}

if (Test-Path $banner2) {
    Copy-Item $banner2 (Join-Path $outputDir "hero-devotional.jpg") -Force
    Copy-Item $banner2 (Join-Path $outputDir "banner-frames-detail.jpg") -Force
    Write-Host "Copied banner 2"
}

if (Test-Path $banner3) {
    Copy-Item $banner3 (Join-Path $outputDir "hero-car-decor.jpg") -Force
    Copy-Item $banner3 (Join-Path $outputDir "banner-decor-character.jpg") -Force
    Write-Host "Copied banner 3"
}

# Helper to generate a clean, elegant binary JPEG
function Create-CardImage {
    param(
        [string]$Filename,
        [string]$Title,
        [string]$Subtitle,
        [int]$Width = 600,
        [int]$Height = 600
    )

    $destPath = Join-Path $outputDir $Filename
    $bmp = New-Object System.Drawing.Bitmap $Width, $Height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Cream background
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(246, 242, 235))
    $g.FillRectangle($bgBrush, 0, 0, $Width, $Height)

    # Subtle inner decorative border
    $borderPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(215, 204, 188)), 2
    $g.DrawRectangle($borderPen, 20, 20, ($Width - 40), ($Height - 40))

    $innerBorderPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(45, 115, 121)), 1
    $innerBorderPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
    $g.DrawRectangle($innerBorderPen, 28, 28, ($Width - 56), ($Height - 56))

    # Center decorative frame
    $frameBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255))
    $frameWidth = $Width * 0.58
    $frameHeight = $Height * 0.52
    $frameX = ($Width - $frameWidth) / 2
    $frameY = ($Height * 0.15)
    $g.FillRectangle($frameBrush, $frameX, $frameY, $frameWidth, $frameHeight)

    $frameOutlinePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(45, 115, 121)), 3
    $g.DrawRectangle($frameOutlinePen, $frameX, $frameY, $frameWidth, $frameHeight)

    # Decorative icon inside frame (star/lotus motif)
    $motifPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(200, 165, 95)), 2
    $motifCenterY = $frameY + ($frameHeight / 2) - 10
    $motifCenterX = $Width / 2
    $g.DrawEllipse($motifPen, ($motifCenterX - 35), ($motifCenterY - 35), 70, 70)
    $g.DrawEllipse($motifPen, ($motifCenterX - 20), ($motifCenterY - 20), 40, 40)

    # Brand text inside frame
    $fontFamily = New-Object System.Drawing.FontFamily "Arial"
    $brandFont = New-Object System.Drawing.Font($fontFamily, [float]11, [System.Drawing.FontStyle]::Bold)
    $brandBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(45, 115, 121))
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("aai Prints", $brandFont, $brandBrush, [float]$motifCenterX, [float]($motifCenterY + 55), $sf)

    # Title below frame
    $titleFont = New-Object System.Drawing.Font($fontFamily, [float]14, [System.Drawing.FontStyle]::Bold)
    $titleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(35, 35, 35))
    $titleY = $frameY + $frameHeight + 25
    $g.DrawString($Title, $titleFont, $titleBrush, [float]($Width / 2), [float]$titleY, $sf)

    # Subtitle
    if ($Subtitle) {
        $subFont = New-Object System.Drawing.Font($fontFamily, [float]10, [System.Drawing.FontStyle]::Regular)
        $subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(120, 110, 95))
        $g.DrawString($Subtitle, $subFont, $subBrush, [float]($Width / 2), [float]($titleY + 26), $sf)
        $subFont.Dispose()
    }

    # Save as 100% genuine JPEG
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

    $brandFont.Dispose()
    $titleFont.Dispose()
    $fontFamily.Dispose()
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created valid JPEG: $Filename"
}

# Create Neutral Product Placeholder
Create-CardImage "product-placeholder.jpg" "Aai Prints" "Home Décor Collection" 600 600

# Create Category Circular Preview JPEGs
Create-CardImage "cat-backlit-led-frames.jpg" "Backlit LED Frames" "Devotional Lighting" 400 400
Create-CardImage "cat-desk-standees.jpg" "Desk Standees" "Tabletop Décor" 400 400
Create-CardImage "cat-wall-hangings.jpg" "Wall Hangings" "Sacred & Artistic" 400 400
Create-CardImage "cat-metal-wall-art.jpg" "Metal Wall Art" "Laser Cut Elegance" 400 400
Create-CardImage "cat-dashboard-idols.jpg" "Dashboard Idols" "Divine Travel Companion" 400 400
Create-CardImage "cat-car-hangings.jpg" "Car Hangings" "Macrame & Brass" 400 400
Create-CardImage "cat-wall-clocks.jpg" "Wall Clocks" "Silent Quartz Décor" 400 400
Create-CardImage "cat-framed-wall-art.jpg" "Framed Wall Art" "Gallery Quality" 400 400
Create-CardImage "cat-gift-combos.jpg" "Gift Combos" "Auspicious Gifting" 400 400

Write-Host "ALL IMAGES SUCCESSFULLY GENERATED AS VALID BINARY JPEGS!"
