Dubbledecker website
====================

The site for [Dubbledecker](https://apps.apple.com/gb/app/dubbledecker/id806904237), live London bus times for iPhone. Made by Very Nice Software Limited.

Next.js + Tailwind, exported as a plain static site.

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # writes the static site to out/
```

It's hosted on Vercel, which builds and deploys `master` (and a preview for each pull request). Vercel serves pages without `.html`, so `vercel.json` redirects the old `.html` URLs.

- The hero is a live three.js iPhone ported from `../phone-studio` (`components/studio/engine.js`). The features, their screens and colours are in `components/features.ts`; screens are in `public/screens/` (1206 × 2622 WebP, `cwebp -q 85 -sharp_yuv`).
- `public/models/iphone-pro-max.glb` ("Apple iPhone 18 Pro Max" by AakashMansukhani, Sketchfab Free Standard licence) is committed and served from the site, so check the licence allows that. Without it the site shows the simpler procedural phone.
- `/licenses.html` is linked from the app's Info screen, and the App Store privacy link may still be `/privacy.html`: keep their redirects in `vercel.json`. The licences (`app/licenses/licenses.json`) are the app's CocoaPods acknowledgements plus the Pacifico font it bundles; update them when the Podfile changes.
- `og.png` is built from `app/og-phone.jpg`, a Phone Studio render. Re-render it there if the app's look changes.
- The "nice" footer is the Very Nice Software mark.
- `vercel.json` also sets security headers on every response (`next.config` can't, as a static export): `frame-ancestors 'none'` and `X-Frame-Options: DENY` stop other sites showing the pages in an iframe, and `nosniff` stops browsers guessing file types. To allow an embed somewhere, list that site in `frame-ancestors` and drop `X-Frame-Options`. They only apply on Vercel, not in `next dev`.
- `package.json` overrides the PostCSS that Next 15 pins (8.4.31, which has advisories) with the 8.5 line Next 16 uses. Drop the override after moving to Next 16.
