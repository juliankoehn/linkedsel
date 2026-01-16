-- Remove the trigger on auth.users that was causing registration failures
-- Credits are now initialized lazily via the API when the user first accesses them
-- This approach is more reliable and gives new users 3 free credits as a welcome bonus

-- Drop the trigger that runs on user registration
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;

-- Keep the function for reference/manual use, but it's no longer automatically triggered
-- The initialize_user_credits function can still be called manually if needed

-- Note: The API endpoint /api/credits now handles credit initialization:
-- - When a user without credits accesses their balance, a record is created
-- - New users receive INITIAL_FREE_CREDITS (3) as a welcome bonus
-- - A 'bonus' transaction is logged with reason 'welcome_bonus'
