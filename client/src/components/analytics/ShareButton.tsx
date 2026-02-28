import type { RefObject } from 'react'
import { toPng } from 'html-to-image'
import toast from 'react-hot-toast'
import { Share2 } from 'lucide-react'
import IconButton from '../ui/IconButton'

interface ShareButtonProps {
  cardRef: RefObject<HTMLDivElement>
}

export default function ShareButton({ cardRef }: ShareButtonProps) {
  async function handleShare() {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = 'my-dining-year.png'
      link.href = dataUrl
      link.click()
      toast.success('Dining card downloaded!')
    } catch {
      toast.error('Could not export image')
    }
  }

  return (
    <IconButton
      icon={Share2}
      label="Share dining card"
      onClick={handleShare}
      className="bg-indigo-600 hover:bg-indigo-500 text-white"
    />
  )
}
