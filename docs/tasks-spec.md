# Tasks & Submissions Spec (matches/conversations migration)

Status: design spec only. No DB migrations included — schema below describes the
target shape for a future migration once Session 1 (matches/conversations) lands.

## Tables

### `tasks`

One row per day (1-3) per conversation. Created once, when the conversation starts.

| column      | type        | notes                                  |
|-------------|-------------|-----------------------------------------|
| id          | uuid pk     | default gen_random_uuid()              |
| conversation_id | uuid fk -> conversations.id | cascade delete |
| day_number  | smallint    | check (day_number between 1 and 3)     |
| prompt_text | text        | the question/prompt shown to both users |
| is_active   | boolean     | default true; false once superseded/disabled |
| created_at  | timestamptz | default now()                          |

Unique constraint: `(conversation_id, day_number)`.

### `submissions`

One row per user per day per conversation.

| column          | type        | notes                                   |
|-----------------|-------------|------------------------------------------|
| id              | uuid pk     | default gen_random_uuid()               |
| conversation_id | uuid fk -> conversations.id | cascade delete          |
| user_id         | uuid fk -> users.id (or auth.users.id)  |
| day_number      | smallint    | check (day_number between 1 and 3)      |
| audio_url       | text        | Supabase Storage path, not a signed URL |
| created_at      | timestamptz | default now()                           |

Unique constraint: `(conversation_id, user_id, day_number)` — one submission per user per day.

## Flow

1. A `matches` row is created for two users -> a `conversations` row is created for that match.
2. On `conversations` insert, insert 3 `tasks` rows for that `conversation_id`, one each for
   `day_number` 1, 2, 3, with `is_active = true`.
3. Each user records an audio answer per day, uploaded to Supabase Storage, then a `submissions`
   row is inserted referencing the storage path via `audio_url`.
4. Chat unlock rule (see below) is re-evaluated whenever a `submissions` row is inserted for
   `day_number = 3`.

## Unlock rule

`messages.enabled` is set to `true` for a conversation **only when both participants have a
`submissions` row with `day_number = 3`** for that `conversation_id`.

```sql
-- conceptual check, not a migration
select count(distinct user_id) = 2
from submissions
where conversation_id = :conversation_id
  and day_number = 3;
```

Until that condition is true, `messages.enabled` stays `false` and the chat UI shows the
locked state (tasks only, no free-text messaging).

## RLS sketch

```sql
-- submissions: a user can only insert their own submission, and only for a
-- conversation they are a participant in.
create policy "insert own submission"
on submissions for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from conversations c
    where c.id = submissions.conversation_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
  )
);

-- submissions: a user can read submissions (own + partner's) for conversations
-- they are a participant in.
create policy "select own conversation submissions"
on submissions for select
using (
  exists (
    select 1 from conversations c
    where c.id = submissions.conversation_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
  )
);

-- tasks: read-only for participants, no client-side writes.
create policy "select own conversation tasks"
on tasks for select
using (
  exists (
    select 1 from conversations c
    where c.id = tasks.conversation_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
  )
);
```

## Out of scope for this spec

- Actual storage upload/recording logic (stubbed in `TaskPanel.tsx`).
- The trigger/function that inserts the 3 `tasks` rows on `conversations` insert.
- The trigger/function that flips `messages.enabled`.
- Migration files under `supabase/migrations` — these will be authored separately once
  the matches/conversations schema itself is migrated.
