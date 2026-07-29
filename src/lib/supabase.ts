import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ptyxewifwvifhvuwlrwy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eXhld2lmd3ZpZmh2dXdscnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNDg1MjAsImV4cCI6MjEwMDkyNDUyMH0.y1OMB2tDa70juyDLhBHeKCwC2VIxST3bGPcIqSz76PM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
