// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jnqczmqzmopaslsbejmj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpucWN6bXF6bW9wYXNsc2Jlam1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzc4MjYsImV4cCI6MjA2MzgxMzgyNn0.CTzVtB2OMVbKR9ipph5kEhcCjeEYgW9doGBpKODCqIA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);