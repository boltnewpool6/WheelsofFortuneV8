# How to Add Local Vehicle Images

The application is configured to load vehicle images from local files. Follow these steps to add your vehicle images:

## Step 1: Create Images Directory

Create a folder called `images` inside the `public` directory:

```
project-root/
└── public/
    └── images/
        ├── pulsar-ns-125.jpg
        └── tvs-jupiter.jpg
```

## Step 2: Add Your Images

Place your vehicle images in the `public/images/` folder with the following names:

- **Pulsar NS 125**: `pulsar-ns-125.jpg`
- **TVS Jupiter**: `tvs-jupiter.jpg`

### Recommended Image Specifications:
- **Format**: JPG, PNG, or WEBP
- **Dimensions**: 800x600 pixels (or similar 4:3 aspect ratio)
- **File Size**: Under 500KB for optimal loading speed

## Step 3: How It Works

The application references these images using the path `/images/[filename]`. When Vite builds the project, it automatically serves files from the `public` directory at the root level.

### Code Reference

In `src/pages/DrawArena.tsx`, you'll find:

```typescript
const vehicleImages: Record<string, string> = {
  'Pulsar NS 125': '/images/pulsar-ns-125.jpg',
  'TVS Jupiter': '/images/tvs-jupiter.jpg',
};
```

## Customization

### To Change Image Names:

If you want to use different filenames, update the path in `src/pages/DrawArena.tsx`:

```typescript
const vehicleImages: Record<string, string> = {
  'Pulsar NS 125': '/images/your-custom-name-1.jpg',
  'TVS Jupiter': '/images/your-custom-name-2.png',
};
```

### To Add More Vehicle Types:

1. Add the image to `public/images/`
2. Update the `vehicleImages` object in `DrawArena.tsx`
3. Update your `contest-data.json` to include the new prize

### Fallback Behavior

If an image fails to load, the application automatically displays a placeholder with the vehicle name. This ensures the application never breaks due to missing images.

## Quick Setup Commands

```bash
mkdir -p public/images

cp /path/to/your/pulsar-image.jpg public/images/pulsar-ns-125.jpg
cp /path/to/your/jupiter-image.jpg public/images/tvs-jupiter.jpg
```

## Verifying Images

After adding images, start the development server:

```bash
npm run dev
```

Navigate to the Draw Arena page and check if the vehicle images are displaying correctly on the draw cards.

## Troubleshooting

### Images not loading?

1. Check that files are in `public/images/` (not `src/images/`)
2. Verify filename spelling matches exactly
3. Ensure file extensions are correct (.jpg, .png, etc.)
4. Try hard-refreshing the browser (Ctrl+F5 or Cmd+Shift+R)

### Wrong aspect ratio?

Update the className in `DrawArena.tsx` line ~258:

```typescript
className="w-full h-40 object-cover rounded-lg mb-3"
```

Change `object-cover` to:
- `object-contain` - fits entire image
- `object-fill` - stretches to fill
- `object-scale-down` - scales down if needed
