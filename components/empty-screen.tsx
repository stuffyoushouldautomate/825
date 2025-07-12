import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const exampleMessages = [
  {
    heading: 'Research OSHA violations for Earle Construction',
    message: 'Research OSHA violations for Earle Construction'
  },
  {
    heading: 'Find NLRB cases involving Esposito Construction in New Jersey',
    message: 'Find NLRB cases involving Esposito Construction in New Jersey'
  },
  {
    heading: 'Analyze government contracts for Boyce Excavating',
    message: 'Analyze government contracts for Boyce Excavatings'
  },
  {
    heading: 'Research union status of Insituform in New Jersey',
    message: 'Research union status of Insituform in New Jersey'
  }
]
export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <div className="mt-2 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
