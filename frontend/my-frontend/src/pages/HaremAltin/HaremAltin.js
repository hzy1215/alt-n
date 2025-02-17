import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import NavBar from '../../components/NavBar/NavBar.js';
import Sidebar from '../../components/SideBar/SideBar.js';
import GoldTable from '../../components/GoldTable/GoldTable.js';
import GoldChart from '../../components/GoldChart/GoldChart.js';

import './HaremAltin.css';

const HaremAltin = () => {
  const [goldPrices, setGoldPrices] = useState([]);
  const [highlightMap, setHighlightMap] = useState({});

  const [selectedGoldForModify, setSelectedGoldForModify] = useState('');
  const [chartGoldType, setChartGoldType] = useState('');

  const [transactionType, setTransactionType] = useState('buy');
  const [modificationValue, setModificationValue] = useState('');
  const [modifications, setModifications] = useState({});

  const [fetchError, setFetchError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [chartData, setChartData] = useState({});

  const oldPricesRef = useRef([]);

  useEffect(() => {
    const fetchGoldPrices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/latest-prices');
        console.log('Success /latest-prices response:', response.data);

        if (response.data && response.data.length > 0) {
          const oneDayMs = 24 * 60 * 60 * 1000;
          const now = new Date();
          const filteredData = response.data.filter(item => {
            const itemDate = new Date(item.timestamp.replace(" ", "T"));
            return (now - itemDate) <= oneDayMs;
          });
          
          setGoldPrices(filteredData);

          if (!selectedGoldForModify && filteredData.length > 0 && filteredData[0].gold_type) {
            setSelectedGoldForModify(filteredData[0].gold_type);
          }
          if (!chartGoldType && filteredData.length > 0 && filteredData[0].gold_type) {
            setChartGoldType(filteredData[0].gold_type);
          }
        }
        setFetchError(false);
        setErrorMessage('');
      } catch (error) {
        console.error('Failed to fetch gold prices:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
          setErrorMessage(
            error.response.data?.error || `Server Error (status: ${error.response.status})`
          );
        } else if (error.request) {
          console.error('No response from server. Request details:', error.request);
          setErrorMessage('No response from server. (Check if backend is running)');
        } else {
          console.error('Error setting up request:', error.message);
          setErrorMessage(error.message);
        }
        setFetchError(true);
      }
    };

    fetchGoldPrices();
    const interval = setInterval(fetchGoldPrices, 30000);
    return () => clearInterval(interval);
  }, [selectedGoldForModify, chartGoldType]);

  useEffect(() => {
    if (goldPrices.length === 0) return;

    const previousPrices = oldPricesRef.current;
    const newHighlights = {};

    goldPrices.forEach((newItem) => {
      const oldItem = previousPrices.find((o) => o.gold_type === newItem.gold_type);
      if (!oldItem) {
        newHighlights[newItem.gold_type] = { buy: '', sell: '' };
      } else {
        let buyClass = '';
        let sellClass = '';

        if (newItem.buy > oldItem.buy) {
          buyClass = 'highlight-up';
        } else if (newItem.buy < oldItem.buy) {
          buyClass = 'highlight-down';
        }

        if (newItem.sell > oldItem.sell) {
          sellClass = 'highlight-up';
        } else if (newItem.sell < oldItem.sell) {
          sellClass = 'highlight-down';
        }

        newHighlights[newItem.gold_type] = { buy: buyClass, sell: sellClass };
      }
    });

    console.log("New highlights:", newHighlights);
    setHighlightMap(newHighlights);

    const timer = setTimeout(() => setHighlightMap({}), 2000);
    oldPricesRef.current = goldPrices;
    return () => clearTimeout(timer);
  }, [goldPrices]);

  useEffect(() => {
    if (!chartGoldType) return;

    const fetchHistoricalData = async () => {
      try {
        const encoded = encodeURIComponent(chartGoldType);
        const [buyRes, sellRes] = await Promise.all([
          axios.get(`http://localhost:5000/historical-prices/${encoded}/buy`),
          axios.get(`http://localhost:5000/historical-prices/${encoded}/sell`),
        ]);

        console.log('/historical-prices BUY data:', buyRes.data);
        console.log('/historical-prices SELL data:', sellRes.data);

        setChartData({
          buy: buyRes.data,
          sell: sellRes.data,
        });
      } catch (error) {
        console.error('Failed to fetch historical data:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        } else if (error.request) {
          console.error('No response from server. Request details:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }
      }
    };

    fetchHistoricalData();
  }, [chartGoldType]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebarIfClickedOutside = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const applyModification = () => {
    const amount = parseFloat(modificationValue);
    if (!isNaN(amount) && selectedGoldForModify) {
      setModifications((prev) => {
        const newMods = { ...prev };
        if (!newMods[selectedGoldForModify]) {
          newMods[selectedGoldForModify] = { buy: 0, sell: 0 };
        }
        if (transactionType === 'sell') {
          newMods[selectedGoldForModify].sell = amount;
        } else {
          newMods[selectedGoldForModify].buy = -amount;
        }
        return newMods;
      });
      setModificationValue('');
    }
  };

  const resetModifications = () => {
    setModifications({});
  };

  const handleRowClick = (goldType) => {
    setChartGoldType(goldType);
  };

  return (
    <>
      <NavBar onMenuClick={toggleSidebar} />

      <div
        className={`overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={closeSidebarIfClickedOutside}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        goldPrices={goldPrices}
        selectedGoldForModify={selectedGoldForModify}
        setSelectedGoldForModify={setSelectedGoldForModify}
        transactionType={transactionType}
        setTransactionType={setTransactionType}
        modificationValue={modificationValue}
        setModificationValue={setModificationValue}
        applyModification={applyModification}
        resetModifications={resetModifications}
      />

      <div className="main-content">
        <div className="content-card">
          {fetchError && (
            <p style={{ color: 'red' }}>
              Error fetching gold prices.<br />
              <b>Details:</b> {errorMessage}
            </p>
          )}

          <h3 style={{ marginBottom: '1rem' }}>Fiyatlar</h3>

          <GoldTable
            goldPrices={goldPrices}
            modifications={modifications}
            highlightMap={highlightMap}
            onRowClick={handleRowClick}
          />

          <GoldChart
            chartData={chartData}
            chartGoldType={chartGoldType}
          />
        </div>
      </div>
    </>
  );
};

export default HaremAltin;
