export const APP_STORE_URL = 'https://apps.apple.com/gb/app/dubbledecker/id806904237'

interface AppStoreButtonProps {
  size?: 'md' | 'lg'
  className?: string
}

// Frosted white glass (.glass in app/globals.css); hover and press lighten it, as in the Figma states
export default function AppStoreButton({ size = 'lg', className = '' }: AppStoreButtonProps) {
  const lg = size === 'lg'

  return (
    <a
      href={APP_STORE_URL}
      className={`glass group inline-flex items-center rounded-full bg-white/90 text-black transition-colors hover:bg-white/60 active:bg-white/40 [--edge-bottom:0.5] [--edge-top:1] ${lg ? 'h-[60px] gap-3 pl-7 pr-8' : 'h-12 gap-2 pl-5 pr-6'} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={`transition-opacity group-hover:opacity-70 group-active:opacity-50 ${lg ? '-mt-0.5 h-[26px] w-[26px]' : '-mt-px h-[18px] w-[18px]'}`}
        fill="currentColor"
      >
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
      <span
        className={`font-semibold tracking-[-0.02em] ${lg ? 'text-[21px]' : 'text-[15px] transition-opacity group-hover:opacity-70 group-active:opacity-50'}`}
      >
        Download
      </span>
    </a>
  )
}
