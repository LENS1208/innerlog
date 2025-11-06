export type ParsedTrade = {
  ticket: string;
  openTime: string;
  type: string;
  size: number;
  item: string;
  openPrice: number;
  closeTime: string;
  closePrice: number;
  pnl: number;
  pips?: number;
  commission?: number;
  swap?: number;
};

export function parseHtmlStatement(htmlText: string): ParsedTrade[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  const trades: ParsedTrade[] = [];

  const tables = doc.querySelectorAll('table');

  for (const table of tables) {
    const rows = table.querySelectorAll('tr');

    let headerIndices: { [key: string]: number } = {};
    let isDataSection = false;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.querySelectorAll('th, td');

      if (cells.length === 0) continue;

      const cellTexts = Array.from(cells).map(cell => cell.textContent?.trim() || '');

      if (cellTexts.some(text =>
        text.toLowerCase().includes('ticket') ||
        text.toLowerCase().includes('order') ||
        text.toLowerCase().includes('position')
      )) {
        cellTexts.forEach((text, idx) => {
          const lower = text.toLowerCase();
          if (lower.includes('ticket') || lower.includes('order')) headerIndices['ticket'] = idx;
          if (lower.includes('open time') || lower.includes('opentime')) headerIndices['openTime'] = idx;
          if (lower.includes('type')) headerIndices['type'] = idx;
          if (lower.includes('size') || lower.includes('volume') || lower.includes('lot')) headerIndices['size'] = idx;
          if (lower.includes('item') || lower.includes('symbol')) headerIndices['symbol'] = idx;
          if (lower.includes('open price') || lower.includes('openprice')) headerIndices['openPrice'] = idx;
          if (lower.includes('close time') || lower.includes('closetime')) headerIndices['closeTime'] = idx;
          if (lower.includes('close price') || lower.includes('closeprice') || lower.includes('s/l')) headerIndices['closePrice'] = idx;
          if (lower.includes('profit') || lower.includes('p/l') || lower.includes('pnl')) headerIndices['pnl'] = idx;
          if (lower.includes('commission')) headerIndices['commission'] = idx;
          if (lower.includes('swap')) headerIndices['swap'] = idx;
          if (lower.includes('pips')) headerIndices['pips'] = idx;
        });
        isDataSection = true;
        continue;
      }

      if (!isDataSection || Object.keys(headerIndices).length === 0) continue;

      if (cellTexts.length < 3) continue;

      const ticketText = cellTexts[headerIndices['ticket']] || '';
      if (!ticketText || isNaN(Number(ticketText))) continue;

      const typeText = (cellTexts[headerIndices['type']] || '').toLowerCase();
      if (!typeText.includes('buy') && !typeText.includes('sell')) continue;

      try {
        const trade: ParsedTrade = {
          ticket: ticketText,
          openTime: cellTexts[headerIndices['openTime']] || '',
          type: typeText.includes('buy') ? 'buy' : 'sell',
          size: parseFloat(cellTexts[headerIndices['size']] || '0'),
          item: cellTexts[headerIndices['symbol']] || '',
          openPrice: parseFloat(cellTexts[headerIndices['openPrice']] || '0'),
          closeTime: cellTexts[headerIndices['closeTime']] || '',
          closePrice: parseFloat(cellTexts[headerIndices['closePrice']] || '0'),
          pnl: parseFloat(cellTexts[headerIndices['pnl']] || '0'),
        };

        if (headerIndices['commission'] !== undefined) {
          trade.commission = parseFloat(cellTexts[headerIndices['commission']] || '0');
        }
        if (headerIndices['swap'] !== undefined) {
          trade.swap = parseFloat(cellTexts[headerIndices['swap']] || '0');
        }
        if (headerIndices['pips'] !== undefined) {
          trade.pips = parseFloat(cellTexts[headerIndices['pips']] || '0');
        }

        if (trade.openPrice > 0 && trade.closePrice > 0) {
          const priceDiff = trade.type === 'buy'
            ? trade.closePrice - trade.openPrice
            : trade.openPrice - trade.closePrice;

          const pipMultiplier = trade.item.includes('JPY') ? 100 : 10000;
          trade.pips = priceDiff * pipMultiplier;
        }

        if (trade.ticket && trade.openTime && trade.closeTime && trade.pnl !== 0) {
          trades.push(trade);
        }
      } catch (error) {
        console.warn('Failed to parse row:', error);
        continue;
      }
    }
  }

  return trades;
}

export function convertHtmlTradesToCsvFormat(trades: ParsedTrade[]): string {
  const headers = ['Ticket', 'Open Time', 'Type', 'Size', 'Item', 'Price', 'Close Time', 'Price', 'Commission', 'Swap', 'Profit', 'Pips'];

  const rows = trades.map(trade => [
    trade.ticket,
    trade.openTime,
    trade.type,
    trade.size.toString(),
    trade.item,
    trade.openPrice.toString(),
    trade.closeTime,
    trade.closePrice.toString(),
    (trade.commission || 0).toString(),
    (trade.swap || 0).toString(),
    trade.pnl.toString(),
    (trade.pips || 0).toFixed(1),
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
