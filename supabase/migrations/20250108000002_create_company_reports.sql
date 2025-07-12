-- Migration: Create company reports table for Bulldozer Search
-- Description: Creates table to store company research reports with proper categorization
-- Date: 2025-01-08

-- Create company_reports table
create table if not exists public.company_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_name text not null,
  report_title text,
  report_content text not null,
  report_summary text,
  status text not null default 'processing' check (status in ('processing', 'completed', 'failed')),
  report_type text not null default 'company_analysis' check (report_type in ('company_analysis', 'safety_audit', 'union_research', 'government_contracts')),
  metadata jsonb default '{}',
  processing_started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  processing_completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add comment to table
comment on table public.company_reports is 'Company research reports for Local 825 users';

-- Create index for better performance
create index if not exists idx_company_reports_user_id on public.company_reports(user_id);
create index if not exists idx_company_reports_company_name on public.company_reports(company_name);
create index if not exists idx_company_reports_status on public.company_reports(status);
create index if not exists idx_company_reports_created_at on public.company_reports(created_at);

-- Enable Row Level Security
alter table public.company_reports enable row level security;

-- Create RLS policies for company_reports
create policy "Users can view own reports"
on public.company_reports
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create own reports"
on public.company_reports
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own reports"
on public.company_reports
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own reports"
on public.company_reports
for delete
to authenticated
using (auth.uid() = user_id);

-- Create function to update updated_at timestamp for company_reports
create or replace function public.handle_company_report_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create trigger to automatically update updated_at for company_reports
drop trigger if exists handle_company_reports_updated_at on public.company_reports;
create trigger handle_company_reports_updated_at
  before update on public.company_reports
  for each row execute function public.handle_company_report_updated_at();

-- Add report_type column to conversations table to distinguish reports from regular chats
alter table public.conversations add column if not exists report_type text check (report_type in ('chat', 'company_report', 'safety_audit', 'union_research', 'government_contracts')) default 'chat';

-- Add report_id column to conversations table to link to company_reports
alter table public.conversations add column if not exists report_id uuid references public.company_reports(id) on delete set null;

-- Create index for report_type in conversations
create index if not exists idx_conversations_report_type on public.conversations(report_type);
create index if not exists idx_conversations_report_id on public.conversations(report_id);

-- Update conversations table comment
comment on column public.conversations.report_type is 'Type of conversation: chat, company_report, safety_audit, union_research, government_contracts';
comment on column public.conversations.report_id is 'Reference to company_reports table if this is a report conversation'; 