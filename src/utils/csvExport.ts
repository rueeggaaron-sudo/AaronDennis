import type { Transaction } from './dcaEngine';

export const exportTransactionsToCSV = (transactions: Transaction[], coinName: string) => {
  const headers = ['Datum', 'Coin', 'Investierter Betrag (EUR)', 'Gekaufte Menge', 'Preis (EUR)'];
  const rows = transactions.map(tx => [
    new Date(tx.date).toLocaleDateString('de-DE'),
    coinName,
    tx.amountEur.toFixed(2),
    tx.amountCoin.toFixed(8),
    tx.price.toFixed(2)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DCA_Export_${coinName}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
