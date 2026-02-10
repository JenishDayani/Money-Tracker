# Split Spend

Split Spend is a money management app for trips and shared expenses. It supports authentication, cloud storage, and flexible expense participants so only the right friends share each cost.

## Features

- Email/password authentication with Supabase.
- Create trip groups and add members.
- Add expenses with only the participants who joined.
- Automatic settle-up summary (who pays whom).

## Setup

### 1) Create a Supabase project

Create a project at https://supabase.com and grab the Project URL and anon key.

### 2) Configure environment variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 3) Create database tables

Run this SQL in the Supabase SQL editor:

```sql
create table profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	full_name text,
	created_at timestamp with time zone default now()
);

create table groups (
	id uuid primary key default gen_random_uuid(),
	owner_id uuid references auth.users(id) on delete cascade,
	name text not null,
	created_at timestamp with time zone default now()
);

create table group_members (
	id uuid primary key default gen_random_uuid(),
	group_id uuid references groups(id) on delete cascade,
	name text not null,
	created_at timestamp with time zone default now()
);

create table expenses (
	id uuid primary key default gen_random_uuid(),
	group_id uuid references groups(id) on delete cascade,
	payer_member_id uuid references group_members(id) on delete set null,
	description text not null,
	amount numeric not null,
	created_at timestamp with time zone default now()
);

create table expense_participants (
	id uuid primary key default gen_random_uuid(),
	expense_id uuid references expenses(id) on delete cascade,
	member_id uuid references group_members(id) on delete cascade,
	share_amount numeric not null
);

alter table groups enable row level security;
alter table group_members enable row level security;
alter table expenses enable row level security;
alter table expense_participants enable row level security;
alter table profiles enable row level security;

create policy "Profiles are private" on profiles
	for all using (auth.uid() = id);

create policy "Users manage their groups" on groups
	for all using (auth.uid() = owner_id);

create policy "Members belong to group owner" on group_members
	for all using (exists (
		select 1 from groups where groups.id = group_members.group_id and groups.owner_id = auth.uid()
	));

create policy "Expenses belong to group owner" on expenses
	for all using (exists (
		select 1 from groups where groups.id = expenses.group_id and groups.owner_id = auth.uid()
	));

create policy "Participants belong to group owner" on expense_participants
	for all using (exists (
		select 1 from expenses
		join groups on groups.id = expenses.group_id
		where expenses.id = expense_participants.expense_id and groups.owner_id = auth.uid()
	));
```

### 4) Install dependencies and run

```bash
npm install
npm run dev
```

Open http://localhost:3000 to get started.

## Notes

- Passwords are handled by Supabase Auth.
- Group members are stored by name so you can track friends even if they don’t have accounts yet.
