-- Company Reports System - Complete Setup
-- This script creates the company_reports table and all related components
-- Links reports to both users (who created them) and companies (who they're about)
-- Compatible with existing main_companies and profiles tables

-- Enable RLS on the table
ALTER TABLE IF EXISTS company_reports ENABLE ROW LEVEL SECURITY;

-- Create the company_reports table
CREATE TABLE IF NOT EXISTS company_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_id UUID REFERENCES main_companies(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'failed')),
    report_type TEXT DEFAULT 'company_analysis' CHECK (report_type IN ('company_analysis', 'safety_audit', 'union_research', 'government_contracts')),
    metadata JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_reports_user_id ON company_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_company_reports_company_id ON company_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_company_reports_status ON company_reports(status);
CREATE INDEX IF NOT EXISTS idx_company_reports_created_at ON company_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_reports_report_type ON company_reports(report_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_company_reports_updated_at ON company_reports;
CREATE TRIGGER update_company_reports_updated_at
    BEFORE UPDATE ON company_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own reports" ON company_reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON company_reports;
DROP POLICY IF EXISTS "Users can update own reports" ON company_reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON company_reports;

-- Create RLS policies
CREATE POLICY "Users can view own reports" ON company_reports
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reports" ON company_reports
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reports" ON company_reports
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reports" ON company_reports
    FOR DELETE
    USING (user_id = auth.uid());

-- Create function to automatically link reports to companies by name
CREATE OR REPLACE FUNCTION link_report_to_company()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to find a matching company by name
    IF NEW.company_id IS NULL AND NEW.company_name IS NOT NULL THEN
        SELECT id INTO NEW.company_id
        FROM main_companies
        WHERE LOWER(name) = LOWER(NEW.company_name)
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-link companies
DROP TRIGGER IF EXISTS auto_link_company_report ON company_reports;
CREATE TRIGGER auto_link_company_report
    BEFORE INSERT OR UPDATE ON company_reports
    FOR EACH ROW
    EXECUTE FUNCTION link_report_to_company();

-- Create function to update report status and generated_at
CREATE OR REPLACE FUNCTION update_report_status(
    report_id UUID,
    new_status TEXT,
    new_content JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE company_reports
    SET 
        status = new_status,
        generated_at = CASE WHEN new_status = 'completed' THEN NOW() ELSE generated_at END,
        content = COALESCE(new_content, content),
        updated_at = NOW()
    WHERE id = report_id;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON company_reports TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a view for easier querying of reports with company info
CREATE OR REPLACE VIEW company_reports_with_companies AS
SELECT 
    cr.*,
    mc.name as linked_company_name,
    mc.industry as linked_company_industry,
    mc.status as linked_company_status,
    mc.priority as linked_company_priority,
    mc.is_active as linked_company_active,
    mc.company_profile as linked_company_profile,
    mc.osha_violations as linked_company_osha_violations,
    mc.nlrb_cases as linked_company_nlrb_cases,
    mc.organizing_leverage as linked_company_organizing_leverage,
    mc.recommendations as linked_company_recommendations,
    mc.citations as linked_company_citations,
    mc.costs as linked_company_costs,
    mc.address1 as linked_company_address1,
    mc.address2 as linked_company_address2,
    mc.city as linked_company_city,
    mc.state as linked_company_state,
    mc.zip as linked_company_zip,
    mc.phone1 as linked_company_phone1,
    mc.contract_type as linked_company_contract_type,
    mc.agreement_active as linked_company_agreement_active,
    mc.days_until_expiry as linked_company_days_until_expiry,
    mc.agreement_category as linked_company_agreement_category,
    mc.last_outreach_date as linked_company_last_outreach_date,
    mc.follow_up_needed as linked_company_follow_up_needed,
    mc.engagement_stage as linked_company_engagement_stage,
    mc.ai_insight as linked_company_ai_insight,
    mc.last_modified as linked_company_last_modified,
    p.username as user_username,
    p.role as user_role,
    p.industry as user_industry,
    p.organization_size as user_organization_size
FROM company_reports cr
LEFT JOIN main_companies mc ON cr.company_id = mc.id
LEFT JOIN profiles p ON cr.user_id = p.id;

-- Grant permissions on the view
GRANT SELECT ON company_reports_with_companies TO authenticated;

-- Create function to get user's report statistics
CREATE OR REPLACE FUNCTION get_user_report_stats(user_uuid UUID)
RETURNS TABLE(
    total_reports BIGINT,
    completed_reports BIGINT,
    draft_reports BIGINT,
    generating_reports BIGINT,
    failed_reports BIGINT,
    company_analysis_count BIGINT,
    safety_audit_count BIGINT,
    union_research_count BIGINT,
    government_contracts_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_reports,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_reports,
        COUNT(*) FILTER (WHERE status = 'generating') as generating_reports,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_reports,
        COUNT(*) FILTER (WHERE report_type = 'company_analysis') as company_analysis_count,
        COUNT(*) FILTER (WHERE report_type = 'safety_audit') as safety_audit_count,
        COUNT(*) FILTER (WHERE report_type = 'union_research') as union_research_count,
        COUNT(*) FILTER (WHERE report_type = 'government_contracts') as government_contracts_count
    FROM company_reports
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions on the function
GRANT EXECUTE ON FUNCTION get_user_report_stats(UUID) TO authenticated;

-- Create function to get company report statistics
CREATE OR REPLACE FUNCTION get_company_report_stats(company_uuid UUID)
RETURNS TABLE(
    total_reports BIGINT,
    completed_reports BIGINT,
    draft_reports BIGINT,
    generating_reports BIGINT,
    failed_reports BIGINT,
    unique_users BIGINT,
    latest_report_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_reports,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_reports,
        COUNT(*) FILTER (WHERE status = 'generating') as generating_reports,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_reports,
        COUNT(DISTINCT user_id) as unique_users,
        MAX(created_at) as latest_report_date
    FROM company_reports
    WHERE company_id = company_uuid;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions on the function
GRANT EXECUTE ON FUNCTION get_company_report_stats(UUID) TO authenticated;

-- Create function to search reports by company name or content
CREATE OR REPLACE FUNCTION search_company_reports(
    search_term TEXT,
    user_uuid UUID DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    company_name TEXT,
    company_id UUID,
    title TEXT,
    status TEXT,
    report_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    linked_company_name TEXT,
    linked_company_industry TEXT,
    linked_company_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cr.id,
        cr.user_id,
        cr.company_name,
        cr.company_id,
        cr.title,
        cr.status,
        cr.report_type,
        cr.created_at,
        mc.name as linked_company_name,
        mc.industry as linked_company_industry,
        mc.status as linked_company_status
    FROM company_reports cr
    LEFT JOIN main_companies mc ON cr.company_id = mc.id
    WHERE (
        LOWER(cr.company_name) LIKE LOWER('%' || search_term || '%') OR
        LOWER(cr.title) LIKE LOWER('%' || search_term || '%') OR
        LOWER(mc.name) LIKE LOWER('%' || search_term || '%') OR
        LOWER(mc.industry) LIKE LOWER('%' || search_term || '%')
    )
    AND (user_uuid IS NULL OR cr.user_id = user_uuid)
    ORDER BY cr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions on the function
GRANT EXECUTE ON FUNCTION search_company_reports(TEXT, UUID) TO authenticated;

COMMENT ON TABLE company_reports IS 'Stores company research reports generated by users';
COMMENT ON COLUMN company_reports.user_id IS 'The user who created this report';
COMMENT ON COLUMN company_reports.company_id IS 'Linked company from main_companies table (auto-linked by name)';
COMMENT ON COLUMN company_reports.company_name IS 'Name of the company this report is about';
COMMENT ON COLUMN company_reports.content IS 'JSON content of the generated report';
COMMENT ON COLUMN company_reports.status IS 'Current status: draft, generating, completed, or failed';
COMMENT ON COLUMN company_reports.report_type IS 'Type of report: company_analysis, safety_audit, union_research, government_contracts';
COMMENT ON COLUMN company_reports.metadata IS 'Additional metadata for the report';