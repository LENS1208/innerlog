import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zcflpkmxeupharqbaymc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZmxwa214ZXVwaGFycWJheW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTMxMDMsImV4cCI6MjA3NzE4OTEwM30.zmbpKK0l4ExHKwOHJyPB47XOemDMHUpUDriVi5x4xCk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function signupUser() {
  try {
    console.log('Signing up user: takuan_1000@yahoo.co.jp');

    const { data, error } = await supabase.auth.signUp({
      email: 'takuan_1000@yahoo.co.jp',
      password: 'test2025',
      options: {
        emailRedirectTo: undefined,
        data: {}
      }
    });

    if (error) {
      console.error('Error signing up:', error);
      process.exit(1);
    }

    console.log('User signed up successfully!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Email confirmed:', data.user?.email_confirmed_at);
    console.log('\nYou can now login with:');
    console.log('Email: takuan_1000@yahoo.co.jp');
    console.log('Password: test2025');
  } catch (err) {
    console.error('Exception:', err);
    process.exit(1);
  }
}

signupUser();
