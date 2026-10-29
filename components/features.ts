// The App Store screenshot set (Figma "nice" › DD, frames 11–19), in the same order and copy.
// Each feature brings its own background and phone finish, as in the screenshots.

export type Background = { id: string; name: string; color: string; image?: string }
export type Finish = { id: string; name: string; swatch: string }

export const BACKGROUNDS: Background[] = [
  { id: 'red', name: 'Red', color: '#CC1C25' },
  { id: 'blue', name: 'Blue', color: '#0A6BFE' },
  { id: 'green', name: 'Green', color: '#7BC141' },
  { id: 'navy', name: 'Navy', color: '#1E2B50' },
  { id: 'wallpaper', name: 'Wallpaper', color: '#1B1C2E', image: '/media/wallpaper.jpg' },
]

// ids match FINISHES in studio/engine.js
export const FINISHES: Finish[] = [
  { id: 'ddred', name: 'Red', swatch: '#CD1C25' },
  { id: 'ddblue', name: 'Blue', swatch: '#0084FF' },
  { id: 'green', name: 'Green', swatch: '#58A300' },
  { id: 'blue', name: 'Deep Blue', swatch: '#2D3A53' },
  { id: 'orange', name: 'Cosmic Orange', swatch: '#C8622B' },
  { id: 'silver', name: 'Silver', swatch: '#DCDEE1' },
]

export type Feature = { id: string; title: string; screen: string; bg: string; finish: string }

export const FEATURES: Feature[] = [
  { id: 'real-time', title: 'Real time bus arrivals', screen: '/screens/real-time.jpg', bg: 'red', finish: 'ddred' },
  { id: 'nearby', title: 'Discover nearby stops', screen: '/screens/nearby.jpg', bg: 'red', finish: 'ddred' },
  { id: 'saved', title: 'Save stops for quick access', screen: '/screens/saved.jpg', bg: 'red', finish: 'ddred' },
  { id: 'route-maps', title: 'Explore route maps', screen: '/screens/route-maps.jpg', bg: 'red', finish: 'ddred' },
  { id: 'widgets', title: 'Home screen widgets', screen: '/screens/widgets.jpg', bg: 'wallpaper', finish: 'blue' },
  { id: 'trams', title: 'Croydon Trams', screen: '/screens/trams.jpg', bg: 'green', finish: 'green' },
  { id: 'river-buses', title: 'River Buses', screen: '/screens/river-buses.jpg', bg: 'blue', finish: 'ddblue' },
  { id: 'dark-mode', title: 'Dark mode', screen: '/screens/dark-mode.jpg', bg: 'navy', finish: 'ddred' },
]

export const GUARDIAN_URL =
  'https://www.theguardian.com/technology/2014/mar/31/best-iphone-ipad-apps-microsoft-office-boom-beach'
