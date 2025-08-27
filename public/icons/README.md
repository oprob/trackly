# PWA Icons

This directory should contain the following icon files for the MoneyTracker PWA:

## Required Icon Sizes:
- `icon-72x72.png` (72×72px)
- `icon-96x96.png` (96×96px) 
- `icon-128x128.png` (128×128px)
- `icon-144x144.png` (144×144px)
- `icon-152x152.png` (152×152px)
- `icon-192x192.png` (192×192px)
- `icon-384x384.png` (384×384px)
- `icon-512x512.png` (512×512px)

## Shortcut Icons:
- `add-transaction.png` (96×96px)
- `dashboard.png` (96×96px)

## Screenshots (for app store listings):
- `../screenshots/mobile-1.png` (390×844px)
- `../screenshots/desktop-1.png` (1920×1080px)

## How to Generate Icons:
1. Create a high-resolution icon (1024×1024px) with your MoneyTracker logo
2. Use online tools like https://realfavicongenerator.net/ or PWA Builder
3. Or use command-line tools like ImageMagick:
   ```bash
   convert icon-1024.png -resize 72x72 icon-72x72.png
   convert icon-1024.png -resize 96x96 icon-96x96.png
   # ... and so on for each size
   ```

## Design Guidelines:
- Use a simple, recognizable design that works well at small sizes
- Consider using the app's primary colors (#000000 theme)
- Ensure good contrast for visibility
- Icons should be maskable (work with shaped icon masks on different platforms)