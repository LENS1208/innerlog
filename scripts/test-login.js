import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zcflpkmxeupharqbaymc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZmxwa214ZXVwaGFycWJheW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTMxMDMsImV4cCI6MjA3NzE4OTEwM30.zmbpKK0l4ExHKwOHJyPB47XOemDMHUpUDriVi5x4xCk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin(email, password) {
  console.log(`\nTesting login for: ${email}`);
  console.log('Password:', password);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log('✅ Login successful!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    return true;
  } catch (err) {
    console.error('❌ Exception:', err);
    return false;
  }
}

async function runTests() {
  console.log('=== Login Tests ===\n');

  await testLogin('takuan_1000@yahoo.co.jp', 'test2025');
  await testLogin('kan.yamaji@gmail.com', 'test2025');

  console.log('\n=== Tests Complete ===');
}

runTests();
