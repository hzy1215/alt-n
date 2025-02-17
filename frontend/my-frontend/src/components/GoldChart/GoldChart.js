import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
// Zaman ölçeği için adapter (moment kullanarak)
import 'chartjs-adapter-moment';
import '../../pages/HaremAltin/HaremAltin.css';
import moment from 'moment-timezone';

moment.tz.setDefault('Europe/Istanbul');

Chart.register(...registerables, zoomPlugin);

const GoldChart = ({ chartData, chartGoldType }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    console.log('GoldChart: chartData =', chartData);
    if (!chartData || !chartData.buy || !chartData.sell || chartData.buy.length === 0 || chartData.sell.length === 0) {
      return;
    }
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    
    const canvasHeight = chartRef.current.height || 400;
    const gradientBuy = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradientBuy.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
    gradientBuy.addColorStop(1, 'rgba(255, 215, 0, 0)');

    const gradientSell = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradientSell.addColorStop(0, 'rgba(0, 123, 255, 0.5)');
    gradientSell.addColorStop(1, 'rgba(0, 123, 255, 0)');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.buy.map((d) => d.timestamp),
        datasets: [
          {
            label: `${chartGoldType} Buy Price`,
            data: chartData.buy.map((d) => d.price),
            borderColor: 'rgba(255, 215, 0, 0.8)',
            backgroundColor: gradientBuy,
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            borderWidth: 2,
          },
          {
            label: `${chartGoldType} Sell Price`,
            data: chartData.sell.map((d) => d.price),
            borderColor: 'rgba(0, 123, 255, 0.8)',
            backgroundColor: gradientSell,
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              font: {
                size: 14,
              },
              color: '#333',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 16,
            },
            bodyFont: {
              size: 14,
            },
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${value}`;
              },
            },
          },
          zoom: {
            pan: {
              enabled: true,
              mode: 'x',
            },
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: 'x',
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              tooltipFormat: 'MMM D, HH:mm',  
              unit: 'minute',
              displayFormats: {
                minute: 'MMM D, HH:mm',
                hour: 'MMM D, HH:mm',
              },
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
              callback: function(value) {
                return moment(value).tz('Europe/Istanbul').format('MMM D, HH:mm');
              },
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: false,
            grid: {
              color: '#f1f1f1',
            },
          },
        },        
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData, chartGoldType]);

  return (
    <div className="chart-container">
      <canvas ref={chartRef} />
    </div>
  );
};

export default GoldChart;
