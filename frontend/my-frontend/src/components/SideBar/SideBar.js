import React from 'react';
import '../../pages/HaremAltin/HaremAltin.css';

const Sidebar = ({
  isOpen,
  goldPrices,
  selectedGoldForModify,
  setSelectedGoldForModify,
  transactionType,
  setTransactionType,
  modificationValue,
  setModificationValue,
  applyModification,
  resetModifications,
}) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <h2>Fiyatları Güncelle</h2>

      <select
        value={selectedGoldForModify}
        onChange={(e) => setSelectedGoldForModify(e.target.value)}
      >
        {goldPrices.map((gold) => (
          <option key={gold.gold_type} value={gold.gold_type}>
            {gold.gold_type}
          </option>
        ))}
      </select>

      <div className="radio-group">
        <input
          type="radio"
          id="buy"
          name="transactionType"
          value="buy"
          checked={transactionType === 'buy'}
          onChange={() => setTransactionType('buy')}
        />
        <label htmlFor="buy">Alış Fiyatı</label>

        <input
          type="radio"
          id="sell"
          name="transactionType"
          value="sell"
          checked={transactionType === 'sell'}
          onChange={() => setTransactionType('sell')}
        />
        <label htmlFor="sell">Satış Fiyatı</label>
      </div>

      <input
        type="number"
        value={modificationValue}
        onChange={(e) => setModificationValue(e.target.value)}
        placeholder="Değer Giriniz..."
      />

      <div className="buttons-row">
        <button className="apply-button" onClick={applyModification}>
          Uygula
        </button>
        <button className="reset-button" onClick={resetModifications}>
          Sıfırla
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
