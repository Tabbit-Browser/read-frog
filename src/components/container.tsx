import { cn } from '@/utils/styles/tailwind'

function Container({ ref, className, children, ...props }: React.ComponentPropsWithoutRef<'div'> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={ref}
      className={cn(
        'max-w-7xl mx-auto w-full px-6 md:px-8 lg:px-14 overflow-auto',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Container
