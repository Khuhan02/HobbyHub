# Supabase Database Setup

To use HobbyHub with Supabase, run the following SQL commands in your Supabase SQL Editor:

```sql
-- Profiles Table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  phone text,
  business_name text,
  business_type text,
  city text,
  plan text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Active Classes Table
create table classes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text,
  day_of_week text,
  start_time text,
  end_time text,
  max_capacity integer,
  teacher_name text,
  term_fee numeric,
  enrolled_count integer default 0,
  is_active boolean default true
);

-- Students Table
create table students (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  age integer,
  photo_url text,
  class_id uuid references classes,
  parent_name text,
  parent_phone text,
  parent_email text,
  enrolled_date timestamp with time zone default now(),
  notes text
);

-- Attendance Table
create table attendance (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  class_id uuid references classes,
  student_id uuid references students,
  date date not null,
  status text check (status in ('present', 'absent', 'late')),
  marked_at timestamp with time zone default now()
);

-- Payments Table
create table payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  student_id uuid references students,
  class_id uuid references classes,
  amount numeric not null,
  due_date date,
  paid_date date,
  status text check (status in ('paid', 'overdue', 'pending')),
  method text check (method in ('cash', 'transfer', 'qr')),
  term_label text
);

-- Communication Logs Table
create table messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text,
  recipient_type text,
  recipient_id text,
  content text,
  sent_at timestamp with time zone default now(),
  channel text
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table classes enable row level security;
alter table students enable row level security;
alter table attendance enable row level security;
alter table payments enable row level security;
alter table messages enable row level security;

-- Create Policies (Example: Users can only see their own data)
create policy "Users can see own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can manage own classes" on classes for all using (auth.uid() = user_id);
create policy "Users can manage own students" on students for all using (auth.uid() = user_id);
create policy "Users can manage own attendance" on attendance for all using (auth.uid() = user_id);
create policy "Users can manage own payments" on payments for all using (auth.uid() = user_id);
create policy "Users can manage own messages" on messages for all using (auth.uid() = user_id);
```

Don't forget to set up your environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
