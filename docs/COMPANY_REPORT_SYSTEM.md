# Company Report System

This document outlines the comprehensive company report generation system for Local 825's Bulldozer Search application.

## 🏗️ System Architecture

### Database Structure

#### `company_reports` Table

```sql
CREATE TABLE company_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  report_title text,
  report_content text NOT NULL,
  report_summary text,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  report_type text NOT NULL DEFAULT 'company_analysis' CHECK (report_type IN ('company_analysis', 'safety_audit', 'union_research', 'government_contracts')),
  metadata jsonb DEFAULT '{}',
  processing_started_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  processing_completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### Enhanced `conversations` Table

```sql
-- Added columns to distinguish reports from regular chats
ALTER TABLE conversations ADD COLUMN report_type text CHECK (report_type IN ('chat', 'company_report', 'safety_audit', 'union_research', 'government_contracts')) DEFAULT 'chat';
ALTER TABLE conversations ADD COLUMN report_id uuid REFERENCES company_reports(id) ON DELETE SET NULL;
```

## 🎯 Key Features

### 1. **Engaging Loading Screen**

- **Progress Tracking**: Real-time progress with step-by-step processing
- **Data Extraction**: Live display of extracted information
- **Visual Feedback**: Animated icons and progress bars
- **Estimated Time**: Dynamic time remaining calculation

### 2. **Comprehensive Report Generation**

- **13-Section Structure**: Executive summary, corporate structure, leadership, workforce, labor relations, projects, safety, financial, political, market, pressure points, strategy, appendices
- **Multi-Source Research**: Government records, industry databases, corporate information, personal data, human intelligence
- **Strategic Analysis**: Organizing recommendations and pressure points

### 3. **Report Management**

- **Report History**: Sidebar section showing all generated reports
- **Status Tracking**: Processing, completed, failed states
- **Quick Access**: One-click report viewing and follow-up questions
- **PDF Download**: Export functionality (coming soon)

### 4. **Follow-up Questions**

- **Context-Aware**: Questions reference the specific report
- **Quick Questions**: Pre-defined common questions
- **Custom Questions**: User-defined follow-up queries
- **Report Sidebar**: Always-accessible report reference

## 🔧 Components

### Core Components

#### `ReportGenerationLoading`

- **Location**: `components/report-generation-loading.tsx`
- **Purpose**: Engaging loading screen during report generation
- **Features**:
  - 6 processing steps with progress tracking
  - Live data extraction display
  - Animated progress indicators
  - Estimated completion time

#### `ReportSidebar`

- **Location**: `components/report-sidebar.tsx`
- **Purpose**: Display and interact with completed reports
- **Features**:
  - Report sections navigation
  - Quick question buttons
  - Custom question input
  - Download functionality
  - Report summary display

#### `ReportHistorySection`

- **Location**: `components/sidebar/report-history-section.tsx`
- **Purpose**: Show user's report history in sidebar
- **Features**:
  - Status indicators (completed, processing, failed)
  - Date formatting
  - Download buttons for completed reports
  - Click to view functionality

### Server Actions

#### `lib/actions/reports.ts`

- **createCompanyReport**: Create new report in database
- **updateCompanyReport**: Update report status and content
- **getCompanyReports**: Fetch user's reports
- **getCompanyReport**: Fetch specific report
- **deleteCompanyReport**: Remove report
- **completeCompanyReport**: Mark report as completed
- **createReportConversation**: Create chat conversation for report

## 📊 Report Types

### 1. **Company Analysis** (Default)

- Comprehensive company research
- 13-section detailed report
- Strategic organizing recommendations

### 2. **Safety Audit**

- OSHA violations focus
- Safety compliance analysis
- Risk assessment

### 3. **Union Research**

- Labor relations history
- Organizing attempts
- Union status analysis

### 4. **Government Contracts**

- Federal/state contract analysis
- Bidding patterns
- Compliance issues

## 🚀 Usage Flow

### 1. **Report Generation**

```typescript
// User clicks "Generate Company Report"
const result = await createCompanyReport({
  companyName: "ABC Construction",
  reportTitle: "Company Analysis: ABC Construction",
  reportType: "company_analysis"
})

// Show loading screen
<ReportGenerationLoading
  companyName="ABC Construction"
  onCancel={handleCancel}
  onComplete={handleComplete}
/>

// Navigate to search with comprehensive prompt
router.push(`/search?q=${encodeURIComponent(prompt)}&reportId=${result.reportId}`)
```

### 2. **Report Completion**

```typescript
// When AI completes the report
await completeCompanyReport(reportId, reportContent, reportSummary)

// Show report sidebar
<ReportSidebar
  report={completedReport}
  isOpen={true}
  onAskQuestion={handleQuestion}
  onDownload={handleDownload}
/>
```

### 3. **Follow-up Questions**

```typescript
// User asks question about report
const question = 'What are the main safety concerns?'
const contextQuestion = `Based on the ${report.company_name} report: ${question}`
router.push(`/search?q=${encodeURIComponent(contextQuestion)}`)
```

## 🎨 UI/UX Features

### Loading Screen

- **Progress Bar**: Overall completion percentage
- **Step Indicators**: 6 processing steps with icons
- **Data Extraction**: Live updates of found information
- **Time Estimation**: Dynamic remaining time calculation
- **Cancel Option**: Allow user to cancel generation

### Report Sidebar

- **Company Header**: Company name and status
- **Action Buttons**: Download PDF, open in search
- **Section Navigation**: 12 report sections with icons
- **Quick Questions**: Pre-defined common questions
- **Custom Input**: User-defined follow-up questions
- **Summary Display**: Report summary at bottom

### Report History

- **Status Icons**: Visual indicators for report status
- **Date Formatting**: Clean date/time display
- **Download Buttons**: PDF download for completed reports
- **Click to View**: Open report in sidebar

## 🔒 Security & Permissions

### Row Level Security (RLS)

```sql
-- Users can only access their own reports
CREATE POLICY "Users can view own reports" ON company_reports
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports" ON company_reports
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

### Data Validation

- **Status Validation**: Only valid status values allowed
- **Report Type Validation**: Predefined report types only
- **User Ownership**: Users can only access their own reports

## 📈 Performance Optimizations

### Caching

- **Report History**: Cached in sidebar for quick access
- **Loading States**: Optimized animations and transitions
- **Error Handling**: Graceful fallbacks for failed operations

### Database Indexes

```sql
CREATE INDEX idx_company_reports_user_id ON company_reports(user_id);
CREATE INDEX idx_company_reports_company_name ON company_reports(company_name);
CREATE INDEX idx_company_reports_status ON company_reports(status);
CREATE INDEX idx_company_reports_created_at ON company_reports(created_at);
```

## 🔮 Future Enhancements

### Planned Features

1. **PDF Generation**: Server-side PDF creation with proper formatting
2. **Report Templates**: Customizable report structures
3. **Batch Processing**: Generate multiple reports simultaneously
4. **Report Sharing**: Share reports with team members
5. **Advanced Analytics**: Report usage and effectiveness metrics
6. **Real-time Updates**: WebSocket integration for live progress
7. **Export Options**: Excel, Word, and other formats
8. **Report Scheduling**: Automated report generation
9. **Integration APIs**: Connect with external data sources
10. **Mobile Optimization**: Responsive design for mobile devices

### Technical Improvements

1. **Background Processing**: Move report generation to background jobs
2. **Caching Layer**: Redis integration for better performance
3. **File Storage**: S3 integration for report file storage
4. **Search Integration**: Full-text search across reports
5. **Version Control**: Report versioning and history
6. **Audit Trail**: Complete audit log of report activities

## 🛠️ Development Guidelines

### Adding New Report Types

1. Update database migration with new report type
2. Add report type to validation checks
3. Create specialized prompt templates
4. Update UI components to handle new type
5. Add appropriate icons and styling

### Customizing Report Structure

1. Modify the prompt template in `generate-company-report.tsx`
2. Update section definitions in `report-sidebar.tsx`
3. Adjust database schema if needed
4. Update validation and type definitions

### Error Handling

- **Network Errors**: Retry logic with exponential backoff
- **Database Errors**: Proper error messages and fallbacks
- **User Feedback**: Toast notifications for all operations
- **Loading States**: Clear indication of processing status

---

_Last updated: January 2025_
