export interface TransactionData {
  ticket: string;
  transaction_date: string;
  transaction_type: string;
  category: string;
  description: string;
  amount: number;
}

function generateDemoTransactions(): TransactionData[] {
  const transactions: TransactionData[] = [];

  const depositDate = new Date('2022-10-01T00:00:00Z');
  transactions.push({
    ticket: 'DEP-A-001',
    transaction_date: depositDate.toISOString(),
    transaction_type: 'deposit',
    category: 'balance',
    description: 'Initial Deposit',
    amount: 1000000
  });

  const xmPointsEarnedEntries = [
    { date: '2022-11-15T00:00:00Z', amount: 15000, ticket: 'XMP-A-001' },
    { date: '2023-01-20T00:00:00Z', amount: 22000, ticket: 'XMP-A-002' },
    { date: '2023-04-10T00:00:00Z', amount: 18500, ticket: 'XMP-A-003' },
    { date: '2023-07-05T00:00:00Z', amount: 25000, ticket: 'XMP-A-004' },
    { date: '2023-10-12T00:00:00Z', amount: 30000, ticket: 'XMP-A-005' },
    { date: '2024-01-15T00:00:00Z', amount: 28000, ticket: 'XMP-A-006' },
    { date: '2024-04-20T00:00:00Z', amount: 32000, ticket: 'XMP-A-007' },
    { date: '2024-07-10T00:00:00Z', amount: 35000, ticket: 'XMP-A-008' },
    { date: '2024-10-05T00:00:00Z', amount: 40000, ticket: 'XMP-A-009' },
    { date: '2025-01-10T00:00:00Z', amount: 45000, ticket: 'XMP-A-010' },
  ];

  xmPointsEarnedEntries.forEach(entry => {
    transactions.push({
      ticket: entry.ticket,
      transaction_date: entry.date,
      transaction_type: 'credit_in',
      category: 'credit',
      description: 'Credit In-XMP, XM Points Earned',
      amount: entry.amount
    });
  });

  const xmPointsUsedEntries = [
    { date: '2023-03-01T00:00:00Z', amount: -12000, ticket: 'XMPU-A-001' },
    { date: '2023-08-15T00:00:00Z', amount: -20000, ticket: 'XMPU-A-002' },
    { date: '2024-02-20T00:00:00Z', amount: -25000, ticket: 'XMPU-A-003' },
    { date: '2024-08-10T00:00:00Z', amount: -30000, ticket: 'XMPU-A-004' },
    { date: '2025-02-01T00:00:00Z', amount: -35000, ticket: 'XMPU-A-005' },
  ];

  xmPointsUsedEntries.forEach(entry => {
    transactions.push({
      ticket: entry.ticket,
      transaction_date: entry.date,
      transaction_type: 'credit_out',
      category: 'credit',
      description: 'Credit Out, XM Points Used for Trading',
      amount: entry.amount
    });
  });

  const withdrawalEntries = [
    { date: '2023-06-01T00:00:00Z', amount: -150000, ticket: 'WD-A-001' },
    { date: '2024-03-15T00:00:00Z', amount: -200000, ticket: 'WD-A-002' },
    { date: '2024-12-10T00:00:00Z', amount: -180000, ticket: 'WD-A-003' },
  ];

  withdrawalEntries.forEach(entry => {
    transactions.push({
      ticket: entry.ticket,
      transaction_date: entry.date,
      transaction_type: 'withdrawal',
      category: 'balance',
      description: 'Withdrawal to Bank',
      amount: entry.amount
    });
  });

  const depositEntries = [
    { date: '2023-09-01T00:00:00Z', amount: 300000, ticket: 'DEP-A-002' },
    { date: '2024-06-15T00:00:00Z', amount: 250000, ticket: 'DEP-A-003' },
  ];

  depositEntries.forEach(entry => {
    transactions.push({
      ticket: entry.ticket,
      transaction_date: entry.date,
      transaction_type: 'deposit',
      category: 'balance',
      description: 'Additional Deposit',
      amount: entry.amount
    });
  });

  transactions.sort((a, b) =>
    new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );

  return transactions;
}

export function calculateSummary(transactions: TransactionData[]) {
  let total_deposits = 0;
  let total_withdrawals = 0;
  let xm_points_earned = 0;
  let xm_points_used = 0;

  transactions.forEach(tx => {
    if (tx.transaction_type === 'deposit') {
      total_deposits += tx.amount;
    } else if (tx.transaction_type === 'withdrawal') {
      total_withdrawals += Math.abs(tx.amount);
    } else if (tx.transaction_type === 'credit_in') {
      xm_points_earned += tx.amount;
    } else if (tx.transaction_type === 'credit_out') {
      xm_points_used += Math.abs(tx.amount);
    }
  });

  return {
    total_deposits,
    total_withdrawals,
    xm_points_earned,
    xm_points_used
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transactions = generateDemoTransactions();
  console.log(JSON.stringify(transactions, null, 2));

  const summary = calculateSummary(transactions);
  console.log('\nSummary:');
  console.log(JSON.stringify(summary, null, 2));
}

export { generateDemoTransactions };
