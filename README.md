Dubbledecker website
====================

The site for [Dubbledecker](https://apps.apple.com/gb/app/dubbledecker/id806904237), live London bus times for iPhone. Made by Very Nice Software Limited.

Next.js + Tailwind, exported as a plain static site.

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # writes the static site to out/
```

Deploy by uploading `out/` (it's hosted on S3 static website hosting). The build writes the not-found page as both `404.html` and `error.html`, so either works as the error document.

- The hero is a live three.js iPhone ported from `../phone-studio` (`components/studio/engine.js`). The features, their screens and colours are in `components/features.ts`; screens are in `public/screens/` (1206 × 2622 WebP, `cwebp -q 85 -sharp_yuv`).
- `public/models/iphone-pro-max.glb` ("Apple iPhone 18 Pro Max" by AakashMansukhani, Sketchfab Free Standard licence) is committed and served from the site, so check the licence allows that. Without it the site shows the simpler procedural phone.
- `/licenses.html` is linked from the app's Info screen, so keep that URL (and check where the App Store privacy link points before moving `/privacy.html`). The licences come from the app's CocoaPods acknowledgements (`app/licenses/licenses.json`).
- `og.png` is built from `app/og-phone.jpg`, a Phone Studio render. Re-render it there if the app's look changes.
- The "nice" footer is the Very Nice Software mark.
