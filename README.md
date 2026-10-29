Dubbledecker website
====================

The site for [Dubbledecker](https://apps.apple.com/gb/app/dubbledecker/id806904237), live London bus times for iPhone. Made by Very Nice Software Limited.

Next.js + Tailwind, exported as a plain static site.

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # writes the static site to out/
```

Deploy by uploading `out/` (it's hosted on S3 static website hosting — set the error document to `404.html`).

- `public/media/` — screen recordings from the app (`*.mp4`, H.264, 720px wide) and their posters (`*.jpg`). The feature list in `app/page.tsx` refers to them by basename.
- `/licenses.html` is linked from the app's Info screen, so keep that route. Its contents come from the app's CocoaPods acknowledgements (`app/licenses/licenses.json`).
- The "nice" footer and `ShaderCanvas` are the Very Nice Software mark, shared with the Spider site.
