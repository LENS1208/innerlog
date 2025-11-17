#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Simple fetch-based backup without @supabase/supabase-js
const supabaseUrl = 'https://zcflpkmxeupharqbaymc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZmxwa214ZXVwaGFycWJheW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTMxMDMsImV4cCI6MjA3NzE4OTEwM30.zmbpKK0l4ExHKwOHJyPB47XOemDMHUpUDriVi5x4xCk';

const timestamp = '20251117_manual';
const backupDir = path.join(__dirname, '..', 'backups', timestamp);

console.log(`\n📦 Starting manual database backup...`);
console.log(`📂 Backup directory: ${backupDir}\n`);

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const tables = [
  'user_settings',
  'account_summary',
  'ai_coaching_jobs',
  'daily_notes',
  'ai_proposals',
  'account_transactions',
  'import_history',
  'trade_notes',
  'trades'
];

async function backupTable(tableName) {
  process.stdout.write(`  ${tableName}... `);

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/${tableName}?select=*`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    const filePath = path.join(backupDir, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const size = fs.statSync(filePath).size;
    console.log(`✅ ${data.length} records (${(size / 1024).toFixed(1)} KB)`);

    return data.length;
  } catch (err) {
    console.log(`⚠️  Error: ${err.message}`);
    fs.writeFileSync(path.join(backupDir, `${tableName}.json`), '[]');
    return 0;
  }
}

async function main() {
  let totalRecords = 0;
  let totalSize = 0;

  for (const table of tables) {
    const count = await backupTable(table);
    totalRecords += count;
  }

  for (const table of tables) {
    const filePath = path.join(backupDir, `${table}.json`);
    if (fs.existsSync(filePath)) {
      totalSize += fs.statSync(filePath).size;
    }
  }

  console.log(`\n✅ Backup completed!`);
  console.log(`\n📊 Summary:`);
  console.log(`  - Total records: ${totalRecords}`);
  console.log(`  - Total size: ${(totalSize / 1024).toFixed(1)} KB`);
  console.log(`  - Location: ${backupDir}`);
}

main().catch(err => {
  console.error('\n❌ Backup failed:', err.message);
  process.exit(1);
});
