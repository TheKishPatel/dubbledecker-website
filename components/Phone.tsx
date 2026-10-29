import { ReactNode } from 'react'

interface PhoneProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * A simple iPhone 17 Pro frame. The screen recordings already include the
 * status bar and Dynamic Island, so the frame is just the bezel and body.
 * Width is set by the caller; the height follows from the screen's aspect.
 */
export default function Phone({ children, className = '', style }: PhoneProps) {
  return (
    <div className={`phone ${className}`} style={style}>
      <div className="phone-screen">{children}</div>
    </div>
  )
}
