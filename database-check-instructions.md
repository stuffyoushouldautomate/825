# Database Check Instructions

## Overview
I've created a diagnostic script (`check-profiles.mjs`) to check your Supabase database for the profiles table and identify any users without profiles. However, we need your Supabase credentials to run it.

## Step 1: Get Your Supabase Credentials

1. Go to your **Supabase Dashboard** (https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (the `anon` key, not the `service_role` key)

## Step 2: Run the Diagnostic Script

Once you have those credentials, run this command in your terminal:

```bash
NEXT_PUBLIC_SUPABASE_URL="your_project_url_here" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key_here" \
node check-profiles.mjs
```

Replace `your_project_url_here` and `your_anon_key_here` with your actual values.

## Step 3: Manual Database Check (Alternative)

If you prefer to check directly in your Supabase dashboard:

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Run this query to check for users without profiles:

```sql
SELECT 
    u.id, 
    u.email, 
    u.created_at as user_created_at, 
    p.id as profile_id,
    CASE 
        WHEN p.id IS NULL THEN 'MISSING PROFILE'
        ELSE 'HAS PROFILE'
    END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
```

## Step 4: Fix Missing Profiles

If you find users without profiles, run this query to create them:

```sql
INSERT INTO public.profiles (id, username, email, full_name, avatar_url, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) as username,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.raw_user_meta_data->>'avatar_url' as avatar_url,
    now() as created_at,
    now() as updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

## What This Will Tell Us

The diagnostic will show:
- ✅ Whether the profiles table exists and is accessible
- 📊 How many profiles are in the database
- 🔍 Sample profile data to understand the structure
- ⚠️ Any users who don't have corresponding profiles (the likely cause of your errors)

## Expected Results

If everything is working correctly, you should see:
- Profiles table is accessible
- Each authenticated user has a corresponding profile
- No missing profiles

If there are issues, you'll see:
- Users without profiles (these need to be created)
- Database access errors
- Table structure problems

Let me know the results and I can help you fix any issues that are found!