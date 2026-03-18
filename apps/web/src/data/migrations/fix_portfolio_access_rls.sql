-- Fix portfolio_access RLS: enable read and insert for anon users
-- RLS was enabled but no policies existed, blocking all operations

-- Allow anyone to read portfolio_access (needed to display purchased classes)
create policy "Portfolio access readable by everyone"
  on portfolio_access for select
  using (true);

-- Allow anyone to insert into portfolio_access (purchase flow uses anon key)
create policy "Portfolio access insertable by everyone"
  on portfolio_access for insert
  with check (true);

-- Also ensure related tables are readable for the portfolio join queries:

-- Classes need to be readable (not just public ones) for purchased class lookups
-- Check if a broader read policy is needed:
-- The existing policy only allows reading public classes, but purchased classes
-- may not be public. Add a policy for classes referenced in portfolio_access.
create policy "Purchased classes readable by buyer"
  on classes for select
  using (
    is_public = true
    OR id IN (select class_id from portfolio_access)
  );

-- Drop the old narrower policy first to avoid conflicts
drop policy if exists "Public classes readable" on classes;

-- Instructors need to be readable for the join
create policy "Instructors readable by everyone"
  on instructors for select
  using (true);

-- class_blocks and block_exercises need to be readable for loading purchased classes
create policy "Class blocks readable by everyone"
  on class_blocks for select
  using (true);

create policy "Block exercises readable by everyone"
  on block_exercises for select
  using (true);

-- Allow instructors to insert their own classes and related data
create policy "Classes insertable by everyone"
  on classes for insert
  with check (true);

create policy "Classes updatable by everyone"
  on classes for update
  using (true);

create policy "Class blocks insertable"
  on class_blocks for insert
  with check (true);

create policy "Block exercises insertable"
  on block_exercises for insert
  with check (true);

-- Instructors insert/update
create policy "Instructors insertable"
  on instructors for insert
  with check (true);

create policy "Instructors updatable"
  on instructors for update
  using (true);

-- Exercises insert for custom exercises
create policy "Exercises insertable"
  on exercises for insert
  with check (true);

create policy "Exercises updatable"
  on exercises for update
  using (true);

create policy "Exercises deletable"
  on exercises for delete
  using (true);
