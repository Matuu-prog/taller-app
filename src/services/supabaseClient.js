import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://snwwptvlcicdtccrrinc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNud3dwdHZsY2ljZHRjY3JyaW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDYyMDgsImV4cCI6MjA4NzE4MjIwOH0.rC271najRtMAIcfXRBNN2b96zC8vsBtJiiCzNLzhtnA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)