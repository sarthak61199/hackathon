import ReactSkeleton, { type SkeletonProps } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { cn } from '../../utils/cn'

interface Props extends SkeletonProps {
  className?: string
}

export default function Skeleton({ className, ...props }: Props) {
  return (
    <ReactSkeleton
      baseColor="#27272a"
      highlightColor="#3f3f46"
      borderRadius="0.375rem"
      className={cn(className)}
      {...props}
    />
  )
}
