const CORRECT_DB = 'xvqpsnrcmkvngxrinjyf';
const OLD_DB = 'zcflpkmxeupharqbaymc';

export function validateEnvironment() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('❌ Supabase environment variables are missing!');
  }

  if (url.includes(OLD_DB)) {
    console.error('❌ CRITICAL ERROR: Connected to OLD database!');
    console.error('Current URL:', url);
    console.error('This database should NOT be used.');
    throw new Error(
      'Invalid database connection detected. Please update .env file with correct database credentials.'
    );
  }

  if (!url.includes(CORRECT_DB)) {
    console.warn('⚠️ WARNING: Unknown database detected');
    console.warn('Current URL:', url);
    console.warn('Expected URL should contain:', CORRECT_DB);
  }

  console.log('✅ Environment validation passed');
  console.log('Database:', url.match(/https:\/\/([^.]+)/)?.[1] || 'unknown');

  return {
    url,
    anonKey,
    isValid: true,
  };
}

export function getEnvironmentInfo() {
  const url = import.meta.env.VITE_SUPABASE_URL || 'NOT_SET';
  const dbId = url.match(/https:\/\/([^.]+)/)?.[1] || 'unknown';

  return {
    databaseId: dbId,
    isCorrect: dbId === CORRECT_DB,
    isOld: dbId === OLD_DB,
    fullUrl: url,
  };
}
