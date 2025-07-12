'use client'

import { Button } from '@/components/ui/button'
import { FileSearch } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function GenerateCompanyReport() {
  const router = useRouter()

  const generateReport = () => {
    const comprehensivePrompt = `Generate a comprehensive company report for union organizing research. Use these sources and structure:

SOURCES TO RESEARCH:
Government: OSHA violations, NLRB cases, federal/state contracts, court records, licensing, political contributions, environmental permits
Industry: IUOE database, ENR rankings, trade publications, bid services, equipment records
Corporate: Company website, press releases, job postings, LinkedIn, social media, employee reviews
Personal: Executive profiles, property records, news articles, alumni directories
Human Intel: Former employees, union networks, community contacts, supply chain

REPORT STRUCTURE (13 sections):

1. EXECUTIVE SUMMARY
- Company overview, union status, organizing potential, key recommendations

2. CORPORATE STRUCTURE & OPERATIONS  
- History, ownership, subsidiaries, facilities, services, revenue, major clients

3. LEADERSHIP & MANAGEMENT
- Key executives, board structure, management style, family connections, political activities

4. WORKFORCE ANALYSIS
- Employee count/breakdown, union representation, demographics, compensation, working conditions

5. LABOR RELATIONS PROFILE
- Union history, anti-union tactics, NLRB cases, collective bargaining, organizing attempts

6. PROJECTS & CONTRACTS
- Current projects, government contracts, bidding patterns, PLAs, prevailing wage compliance

7. SAFETY & COMPLIANCE
- OSHA violations, injuries/fatalities, environmental issues, litigation, licensing status

8. FINANCIAL PROFILE
- Revenue trends, funding sources, banking relationships, UCC filings, real estate assets

9. POLITICAL & COMMUNITY CONNECTIONS
- Political contributions, lobbying, industry associations, community reputation, charitable work

10. MARKET POSITION & COMPETITION
- Market share, competitors, competitive advantages, expansion strategies, bidding approach

11. STRATEGIC PRESSURE POINTS
- Client pressure opportunities, financial leverage, regulatory vulnerabilities, community pressure

12. ORGANIZING STRATEGY RECOMMENDATIONS
- Priority targets, messaging approach, worker concerns, anticipated responses, legal strategy, timeline

13. APPENDICES
- Facility locations, executive contacts, employee lists, OSHA details, legal cases, political contributions

Provide comprehensive factual analysis with strategic insights. Use markdown formatting with clear headings.`

    router.push(`/search?q=${encodeURIComponent(comprehensivePrompt)}`)
  }

  return (
    <Button
      onClick={generateReport}
      variant="outline"
      className="w-full justify-start"
    >
      <FileSearch className="size-4 mr-2" />
      <span>Generate Company Report</span>
    </Button>
  )
}
