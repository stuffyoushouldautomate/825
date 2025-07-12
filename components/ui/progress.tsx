import { cn } from '@/lib/utils/index'
import * as React from 'react'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  colorClass?: string // e.g. 'bg-primary', 'bg-green-500'
  heightClass?: string // e.g. 'h-2', 'h-4'
  striped?: boolean
  animated?: boolean
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value = 0,
      max = 100,
      colorClass = 'bg-primary',
      heightClass = 'h-2',
      striped = true,
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100))
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          'relative w-full rounded-full bg-muted overflow-hidden',
          heightClass,
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-in-out',
            colorClass,
            striped &&
              'bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.08)_75%,transparent_75%,transparent)] bg-[length:1.5rem_1.5rem]',
            animated && 'animate-progress-stripes'
          )}
          style={{ width: `${percent}%` }}
        />
        <style jsx>{`
          @keyframes progress-stripes {
            0% {
              background-position-x: 0;
            }
            100% {
              background-position-x: 1.5rem;
            }
          }
          .animate-progress-stripes {
            animation: progress-stripes 1s linear infinite;
          }
        `}</style>
      </div>
    )
  }
)
Progress.displayName = 'Progress'
