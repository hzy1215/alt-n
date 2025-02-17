import React from 'react';
import '../../pages/HaremAltin/HaremAltin.css';

const GoldTable = ({
  goldPrices,
  modifications,
  highlightMap,
  onRowClick,
}) => {
  const renderRows = goldPrices.map((gold) => {
    const highlight = highlightMap[gold.gold_type] || { buy: '', sell: '' };
    const modification = modifications[gold.gold_type] || { buy: 0, sell: 0 };

    const modifiedBuy = (parseFloat(gold.buy) + modification.buy).toFixed(2);
    const modifiedSell = (parseFloat(gold.sell) + modification.sell).toFixed(2);

    return (
      <tr key={gold.gold_type} onClick={() => onRowClick(gold.gold_type)}>
        <td>{gold.gold_type}</td>
        <td className={highlight.buy}>{modifiedBuy}</td>
        <td className={highlight.sell}>{modifiedSell}</td>
      </tr>
    );
  });

  return (
    <table className="gold-prices-table">
      <thead>
        <tr>
          <th>Tür</th>
          <th>ALIŞ</th>
          <th>SATIŞ</th>
        </tr>
      </thead>
      <tbody>{renderRows}</tbody>
    </table>
  );
};

export default GoldTable;
