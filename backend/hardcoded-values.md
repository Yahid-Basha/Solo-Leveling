# Hardcoded Values and Dynamic Replacements

## Authentication
Current:
- Mock user creation
- Automatic login success
- Local storage only

Replace with:
- Supabase authentication
- Proper session management
- Server-side validation

## Points System
Current:
- Random points (20-70) for task completion
- Fixed +15 points for retries
- Static 3 retry chances per quarter

Make Dynamic:
- Point calculation based on:
  - Task complexity
  - Time to complete
  - Quest type (main/side)
  - Streak bonuses
- Retry chances based on:
  - User level
  - Previous performance
  - Subscription tier

## Task Verification
Current:
- Auto-verification
- Mock image upload
- Placeholder proof URLs

Replace with:
- AI-powered verification system
- Real image upload to Supabase Storage
- Proof validation rules:
  - Image analysis
  - Metadata verification
  - Timestamp validation

## Progress Calculation
Current:
- Simple percentage based on completed tasks

Make Dynamic:
- Weighted progress based on:
  - Task importance
  - Time investment
  - Dependencies
  - Milestones reached

## Quarter Management
Current:
- Simple calculation based on current month

Enhance with:
- Custom quarter definitions
- Timezone support
- Quarter start/end dates
- Holiday adjustments
- Roll-over handling

## User Stats
Current:
- Basic score tracking
- Simple completion counting

Expand to:
- Achievement system
- Experience points
- User levels
- Badges/rewards
- Historical performance
- Trending data