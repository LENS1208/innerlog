const EXPECTED_DB = 'xvqpsnrcmkvngxrinjyf';

export function validateEnvironment() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('❌ Supabase environment variables are missing!');
  }

  if (!url.includes(EXPECTED_DB)) {
    console.warn('⚠️ WARNING: Unexpected database detected');
    console.warn('Current URL:', url);
    console.warn('Expected database ID:', EXPECTED_DB);
  } else {
    console.log('✅ Environment validation passed');
    console.log('Database:', EXPECTED_DB);
  }

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
    isExpected: dbId === EXPECTED_DB,
    fullUrl: url,
  };
}
