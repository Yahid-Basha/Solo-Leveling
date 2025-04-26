import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jnuddaaruplcluuzsrbs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudWRkYWFydXBsY2x1dXpzcmJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0Mjk5NDUsImV4cCI6MjA2MTAwNTk0NX0.5rjJy4E5mnxRjYdeZ0JcmaKW-Hd7zK_XqbsEBoQUung';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);