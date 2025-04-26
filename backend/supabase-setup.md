# Supabase Integration Guide

## Initial Setup
1. Create new Supabase project
2. Get API keys:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## Database Schema

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Set up auth schema
create type user_role as enum ('user', 'admin');

-- Create users table
create table public.profiles (
  id uuid references auth.users primary key,
  username text unique,
  email text unique,
  score integer default 0,
  retry_chances integer default 3,
  role user_role default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create quests table
create type quest_type as enum ('main', 'side');

create table public.quests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  type quest_type not null,
  quarter smallint not null,
  year integer not null,
  completed boolean default false,
  progress integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create tasks table
create type task_status as enum ('not_started', 'in_progress', 'completed');

create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  quest_id uuid references public.quests(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  notes text,
  status task_status default 'not_started',
  points integer,
  proof_url text,
  verified boolean default false,
  retry_used boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone
);

-- Set up storage
insert into storage.buckets (id, name)
values ('task-proofs', 'Task Proof Images');

-- Set up RLS policies
alter table public.profiles enable row level security;
alter table public.quests enable row level security;
alter table public.tasks enable row level security;

-- Profiles policies
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Quests policies
create policy "Users can CRUD own quests"
  on public.quests for all
  using (auth.uid() = user_id);

-- Tasks policies
create policy "Users can CRUD own tasks"
  on public.tasks for all
  using (auth.uid() = user_id);

-- Storage policies
create policy "Users can upload own proofs"
  on storage.objects for insert
  with check (bucket_id = 'task-proofs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read own proofs"
  on storage.objects for select
  using (bucket_id = 'task-proofs' and auth.uid()::text = (storage.foldername(name))[1]);
```

## Edge Functions

### Task Verification
```typescript
// supabase/functions/verify-task/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { taskId, proofUrl } = await req.json()
    
    // Implement verification logic here
    // - Image analysis
    // - Proof validation
    // - Points calculation
    
    const points = calculatePoints(/* params */)
    
    // Update task in database
    const { data, error } = await supabase
      .from('tasks')
      .update({
        verified: true,
        points: points
      })
      .eq('id', taskId)
    
    return new Response(
      JSON.stringify({ success: true, points }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

## Client Integration

1. Install dependencies:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

2. Initialize client:
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

3. Generate types:
```bash
supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```