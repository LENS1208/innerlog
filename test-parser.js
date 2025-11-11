// Test HTML parser
const fs = require('fs');
const { JSDOM } = require('jsdom');

const htmlContent = `<tr align="center" bgcolor="#C0C0C0">
   <td>Ticket</td><td nowrap="">Open Time</td><td>Type</td><td>Size</td><td>Item</td>
   <td>Price</td><td>S / L</td><td>T / P</td><td nowrap="">Close Time</td>
   <td>Price</td><td>Commission</td><td>Taxes</td><td>Swap</td><td>Profit</td></tr>
<tr align="right"><td>100017023</td><td nowrap="">2025.09.08 11:09:24</td><td>buy</td><td class="mspt">1.00</td><td>usdjpy</td><td style="mso-number-format:0\.000;">147.545</td><td style="mso-number-format:0\.000;">0.000</td><td style="mso-number-format:0\.000;">147.675</td><td class="msdate" nowrap="">2025.09.08 11:48:05</td><td style="mso-number-format:0\.000;">147.610</td><td class="mspt">0</td><td class="mspt">0</td><td class="mspt">0</td><td class="mspt">6 500</td></tr>`;

const dom = new JSDOM(htmlContent);
const doc = dom.window.document;
const rows = doc.querySelectorAll('tr');

console.log('Total rows:', rows.length);

rows.forEach((row, rowIdx) => {
  const cells = row.querySelectorAll('th, td');
  const cellTexts = Array.from(cells).map(cell => cell.textContent?.trim().replace(/\s+/g, ' ') || '');

  console.log(`\nRow ${rowIdx}:`);
  cellTexts.forEach((text, idx) => {
    console.log(`  [${idx}] ${text}`);
  });
});
