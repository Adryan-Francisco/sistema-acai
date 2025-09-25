// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://npunyvpnjupzpzhnthpr.supabase.co'; // Cole sua URL aqui
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdW55dnBuanVwenB6aG50aHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MTc5NDIsImV4cCI6MjA3Mzk5Mzk0Mn0.cf_1S_PD8OWc1PZ3JbG2l2Yk3k9RX2HxyhiXU6SoWT0'; // Cole sua Chave API aqui

export const supabase = createClient(supabaseUrl, supabaseKey);