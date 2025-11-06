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

      const cellTexts = Array.from(cells).map(cell => cell.textContent?.trim().replace(/\s+/g, ' ') || '');

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
          if (lower.includes('price') && idx < 8 && !lower.includes('close')) headerIndices['openPrice'] = idx;
          if (lower.includes('close time') || lower.includes('closetime')) headerIndices['closeTime'] = idx;
          if (lower.includes('commission')) headerIndices['commission'] = idx;
          if (lower.includes('swap')) headerIndices['swap'] = idx;
          if (lower.includes('profit')) headerIndices['pnl'] = idx;
          if (lower.includes('pips')) headerIndices['pips'] = idx;
        });
        isDataSection = true;
        continue;
      }

      if (!isDataSection || Object.keys(headerIndices).length === 0) continue;

      if (cellTexts.length < 3) continue;

      const ticketText = cellTexts[headerIndices['ticket']] || '';
      const numericTicket = ticketText.replace(/\D/g, '');
      if (!numericTicket || isNaN(Number(numericTicket))) continue;

      const typeText = (cellTexts[headerIndices['type']] || '').toLowerCase();
      if (!typeText.includes('buy') && !typeText.includes('sell')) continue;

      try {
        const openTimeIdx = headerIndices['openTime'];
        const sizeIdx = headerIndices['size'];
        const symbolIdx = headerIndices['symbol'];
        const openPriceIdx = headerIndices['openPrice'];
        const closeTimeIdx = headerIndices['closeTime'];
        const closeTimeText = cellTexts[closeTimeIdx] || '';

        let closePriceIdx = closeTimeIdx + 1;
        if (closePriceIdx >= cellTexts.length) continue;

        const trade: ParsedTrade = {
          ticket: numericTicket,
          openTime: cellTexts[openTimeIdx] || '',
          type: typeText.includes('buy') ? 'buy' : 'sell',
          size: parseFloat(cellTexts[sizeIdx]?.replace(/[^\d.]/g, '') || '0'),
          item: (cellTexts[symbolIdx] || '').toLowerCase(),
          openPrice: parseFloat(cellTexts[openPriceIdx]?.replace(/[^\d.]/g, '') || '0'),
          closeTime: closeTimeText,
          closePrice: parseFloat(cellTexts[closePriceIdx]?.replace(/[^\d.]/g, '') || '0'),
          pnl: parseFloat(cellTexts[headerIndices['pnl']]?.replace(/[^\d.-]/g, '') || '0'),
        };

        if (headerIndices['commission'] !== undefined) {
          trade.commission = parseFloat(cellTexts[headerIndices['commission']]?.replace(/[^\d.-]/g, '') || '0');
        }
        if (headerIndices['swap'] !== undefined) {
          trade.swap = parseFloat(cellTexts[headerIndices['swap']]?.replace(/[^\d.-]/g, '') || '0');
        }
        if (headerIndices['pips'] !== undefined) {
          trade.pips = parseFloat(cellTexts[headerIndices['pips']]?.replace(/[^\d.-]/g, '') || '0');
        }

        if (trade.openPrice > 0 && trade.closePrice > 0) {
          const priceDiff = trade.type === 'buy'
            ? trade.closePrice - trade.openPrice
            : trade.openPrice - trade.closePrice;

          const pipMultiplier = trade.item.includes('jpy') ? 100 : 10000;
          trade.pips = priceDiff * pipMultiplier;
        }

        if (trade.ticket && trade.openTime && trade.closeTime && !isNaN(trade.pnl)) {
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
