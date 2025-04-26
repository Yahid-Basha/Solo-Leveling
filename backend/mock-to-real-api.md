# Mock to Real API Conversion Guide

## Current Mock Implementation
The application currently uses an in-memory store in `src/services/api.ts` with:
- Arrays for users, quests, and tasks
- Simulated API delays
- Mock verification logic

## Converting to Real API

### User Authentication
Replace mock auth in `api.login()` with Supabase auth:
```typescript
const { data: { user }, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      username: email.split('@')[0],
      score: 0,
      retryChances: 3
    }
  }
});
```

### Database Tables
1. users
   - id (uuid, references auth.users)
   - username (text)
   - email (text)
   - score (integer)
   - retry_chances (integer)
   - created_at (timestamp)

2. quests
   - id (uuid)
   - user_id (uuid, references users.id)
   - title (text)
   - type (enum: 'main', 'side')
   - quarter (integer)
   - year (integer)
   - completed (boolean)
   - progress (integer)
   - created_at (timestamp)

3. tasks
   - id (uuid)
   - quest_id (uuid, references quests.id)
   - user_id (uuid, references users.id)
   - title (text)
   - notes (text)
   - status (enum: 'not_started', 'in_progress', 'completed')
   - points (integer)
   - proof_url (text)
   - verified (boolean)
   - retry_used (boolean)
   - created_at (timestamp)
   - completed_at (timestamp)

### API Endpoints to Implement
1. Authentication
   - POST /auth/signup
   - POST /auth/login
   - POST /auth/logout
   - GET /auth/user

2. Quests
   - POST /quests
   - GET /quests
   - PUT /quests/:id
   - DELETE /quests/:id

3. Tasks
   - POST /tasks
   - GET /tasks
   - PUT /tasks/:id
   - PUT /tasks/:id/status
   - POST /tasks/:id/verify
   - POST /tasks/:id/retry
   - DELETE /tasks/:id

4. Dashboard
   - GET /dashboard
   - GET /stats/current-quarter

### File Upload
Replace mock image handling with Supabase Storage:
```typescript
const { data, error } = await supabase.storage
  .from('task-proofs')
  .upload(`${userId}/${taskId}`, file);
```