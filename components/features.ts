// The App Store screenshot set (Figma "nice" › DD, frames 11–19), in the same order and copy.
// Each feature brings its own background and phone finish, as in the screenshots.

export type Background = { id: string; name: string; color: string; image?: string }

export const BACKGROUNDS: Background[] = [
  { id: 'red', name: 'Red', color: '#CC1C25' },
  { id: 'blue', name: 'Blue', color: '#0A6BFE' },
  { id: 'green', name: 'Green', color: '#7BC141' },
  { id: 'navy', name: 'Navy', color: '#1E2B50' },
  { id: 'wallpaper', name: 'Wallpaper', color: '#1B1C2E', image: '/media/wallpaper.jpg' },
]

// finish ids match FINISHES in studio/engine.js
export type Feature = { id: string; title: string; body: string; screen: string; bg: string; finish: string }

export const FEATURES: Feature[] = [
  { id: 'real-time', title: 'Real time bus arrivals', body: 'Every stop shows live arrivals, then the timetable after.', screen: '/screens/real-time.webp', bg: 'red', finish: 'ddred' },
  { id: 'nearby', title: 'Discover nearby stops', body: 'Stops are pinned with their letter and an arrow for the way the buses go.', screen: '/screens/nearby.webp', bg: 'red', finish: 'ddred' },
  { id: 'saved', title: 'Save stops for quick access', body: 'Save the stops you use every day. Arrivals refresh on their own, so a glance is all it takes.', screen: '/screens/saved.webp', bg: 'red', finish: 'ddred' },
  { id: 'route-maps', title: 'Explore route maps', body: 'Tap a bus to follow its whole route on the map, stop by stop.', screen: '/screens/route-maps.webp', bg: 'red', finish: 'ddred' },
  { id: 'widgets', title: 'Home screen widgets', body: 'Arrivals for your saved stops, right on your Home Screen.', screen: '/screens/widgets.webp', bg: 'wallpaper', finish: 'blue' },
  { id: 'trams', title: 'Croydon Trams', body: 'Live times at every Croydon tram stop, in the same app as your buses.', screen: '/screens/trams.webp', bg: 'green', finish: 'green' },
  { id: 'river-buses', title: 'River Buses', body: 'Live times from every pier for Thames Clippers and the Woolwich Ferry.', screen: '/screens/river-buses.webp', bg: 'blue', finish: 'ddblue' },
  { id: 'dark-mode', title: 'Dark mode', body: 'A dark theme for late buses and early starts.', screen: '/screens/dark-mode.webp', bg: 'navy', finish: 'ddred' },
]

export const GUARDIAN_URL =
  'https://www.theguardian.com/technology/2014/mar/31/best-iphone-ipad-apps-microsoft-office-boom-beach'
