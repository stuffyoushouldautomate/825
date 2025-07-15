'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function TriggerTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const triggerJob = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setResult(
          '✅ Job triggered successfully! Check the Trigger.dev dashboard.'
        )
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Trigger.dev Test</h3>
      <Button onClick={triggerJob} disabled={isLoading}>
        {isLoading ? 'Triggering...' : 'Trigger Sample Job'}
      </Button>
      {result && <p className="mt-4 text-sm">{result}</p>}
    </div>
  )
}
