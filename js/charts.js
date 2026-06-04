// =============================================
// FINWISE - CHARTS.JS
// Chart.js implementations for all sections
// =============================================

(function () {
  'use strict';

  // Shared chart defaults
  const getChartDefaults = () => ({
    color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#F1F5F9' : '#0F172A',
    gridColor: document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
    tooltipBg: document.documentElement.getAttribute('data-theme') === 'dark' ? '#152057' : '#FFFFFF',
  });

  const COLORS = {
    teal: '#00D4AA',
    tealLight: 'rgba(0,212,170,0.15)',
    amber: '#F59E0B',
    amberLight: 'rgba(245,158,11,0.15)',
    red: '#EF4444',
    green: '#10B981',
    purple: '#8B5CF6',
    navy: '#0B1437',
    blue: '#3B82F6',
  };

  function getGlobalOptions() {
    const d = getChartDefaults();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: d.color,
            font: { family: 'DM Sans', size: 12 },
            boxWidth: 12,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: d.tooltipBg,
          titleColor: d.color,
          bodyColor: d.color,
          borderColor: 'rgba(0,212,170,0.2)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          titleFont: { family: 'Sora', weight: '600' },
          bodyFont: { family: 'DM Sans' },
          callbacks: {
            label: function (ctx) {
              const val = ctx.raw;
              if (typeof val === 'number' && val > 1000) {
                return ` ${ctx.dataset.label}: ₹${val.toLocaleString('en-IN')}`;
              }
              return ` ${ctx.dataset.label}: ${val}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: d.gridColor },
          ticks: { color: d.color, font: { family: 'DM Sans', size: 11 } },
        },
        y: {
          grid: { color: d.gridColor },
          ticks: {
            color: d.color,
            font: { family: 'DM Sans', size: 11 },
            callback: (val) => {
              if (val >= 1e7) return '₹' + (val / 1e7).toFixed(1) + 'Cr';
              if (val >= 1e5) return '₹' + (val / 1e5).toFixed(1) + 'L';
              if (val >= 1000) return '₹' + (val / 1000).toFixed(0) + 'K';
              return val;
            }
          },
        }
      }
    };
  }

  // ── SIP Growth Chart ───────────────────────
  function initSIPChart() {
    const canvas = document.getElementById('sipGrowthChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const investedColor = document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)';

    window.sipChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Invested amount', 'Est. returns'],
        datasets: [{
          data: [600000, 560000],
          backgroundColor: [investedColor, COLORS.teal],
          borderWidth: 0,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ₹${ctx.raw.toLocaleString('en-IN')}`
            }
          }
        }
      }
    });
  }

  // ── Budget Pie Chart ───────────────────────
  function initBudgetChart() {
    const canvas = document.getElementById('budgetPieChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    window.budgetChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Needs', 'Wants', 'Savings', 'Remaining'],
        datasets: [{
          data: [50000, 30000, 20000, 0],
          backgroundColor: [COLORS.blue, COLORS.amber, COLORS.teal, COLORS.green],
          borderWidth: 0,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: getChartDefaults().color,
              font: { family: 'DM Sans', size: 12 },
              padding: 16,
              boxWidth: 12,
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ₹${ctx.raw.toLocaleString('en-IN')}`
            }
          }
        }
      }
    });
  }

  // ── Expense Tracker Chart ──────────────────
  function initExpenseChart() {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    window.expenseChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Income',
            data: [50000, 52000, 50000, 55000, 53000, 56000],
            backgroundColor: COLORS.teal,
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Expenses',
            data: [38000, 42000, 35000, 41000, 39000, 44000],
            backgroundColor: COLORS.amber,
            borderRadius: 6,
            borderSkipped: false,
          }
        ]
      },
      options: {
        ...getGlobalOptions(),
        plugins: {
          ...getGlobalOptions().plugins,
        }
      }
    });
  }

  // ── Compounding Power Chart ────────────────
  function initCompoundingChart() {
    const canvas = document.getElementById('compoundingChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const years = Array.from({ length: 30 }, (_, i) => `Y${i + 1}`);
    const monthly = 5000;
    const rate = 0.12 / 12;

    const compoundData = years.map((_, i) => {
      const n = (i + 1) * 12;
      return Math.round(monthly * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate));
    });

    const simpleData = years.map((_, i) => {
      return monthly * (i + 1) * 12;
    });

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0,212,170,0.5)');
    gradient.addColorStop(1, 'rgba(0,212,170,0)');

    window.compoundingChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'With Compounding (12% p.a.)',
            data: compoundData,
            borderColor: COLORS.teal,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 0,
          },
          {
            label: 'Without Compounding',
            data: simpleData,
            borderColor: COLORS.amber,
            backgroundColor: 'transparent',
            fill: false,
            tension: 0,
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
          }
        ]
      },
      options: getGlobalOptions()
    });
  }

  // ── Net Worth Chart ────────────────────────
  function initNetWorthChart() {
    const canvas = document.getElementById('netWorthChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    window.netWorthChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Net Worth',
          data: [250000, 270000, 265000, 290000, 310000, 340000],
          borderColor: COLORS.teal,
          backgroundColor: 'rgba(0,212,170,0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointBackgroundColor: COLORS.teal,
          pointRadius: 5,
          pointHoverRadius: 8,
        }]
      },
      options: getGlobalOptions()
    });
  }

  // ── Debt Payoff Timeline Chart ─────────────
  function initDebtChart() {
    const canvas = document.getElementById('debtTimelineChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    window.debtChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Personal Loan', 'Credit Card', 'Home Loan', 'Car Loan'],
        datasets: [{
          label: 'Remaining Balance',
          data: [150000, 45000, 2500000, 600000],
          backgroundColor: [COLORS.red, COLORS.amber, COLORS.purple, COLORS.blue],
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        ...getGlobalOptions(),
        indexAxis: 'y',
        plugins: {
          ...getGlobalOptions().plugins,
        }
      }
    });
  }

  // ── Side Hustle Chart ──────────────────────
  function initSideHustleChart() {
    const canvas = document.getElementById('sideHustleChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    window.sideHustleChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Side Income',
          data: [8000, 12000, 9500, 15000, 18000, 22000],
          backgroundColor: COLORS.teal,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: getGlobalOptions()
    });
  }

  // ── Fund Comparison Chart ──────────────────
  function initFundComparisonChart() {
    const canvas = document.getElementById('fundComparisonChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    window.fundComparisonChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['1 Year', '3 Years', '5 Years', '10 Years'],
        datasets: [
          {
            label: 'Large Cap',
            data: [12, 15, 14, 13],
            backgroundColor: COLORS.teal,
            borderRadius: 6,
          },
          {
            label: 'Mid Cap',
            data: [18, 22, 20, 18],
            backgroundColor: COLORS.amber,
            borderRadius: 6,
          },
          {
            label: 'Small Cap',
            data: [25, 28, 24, 22],
            backgroundColor: COLORS.purple,
            borderRadius: 6,
          },
          {
            label: 'Index Fund',
            data: [11, 14, 13, 12],
            backgroundColor: COLORS.blue,
            borderRadius: 6,
          }
        ]
      },
      options: {
        ...getGlobalOptions(),
        plugins: {
          ...getGlobalOptions().plugins,
          tooltip: {
            ...getGlobalOptions().plugins.tooltip,
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}% CAGR`
            }
          }
        },
        scales: {
          x: getGlobalOptions().scales.x,
          y: {
            ...getGlobalOptions().scales.y,
            ticks: {
              callback: (val) => val + '%',
              color: getChartDefaults().color,
              font: { family: 'DM Sans', size: 11 },
            }
          }
        }
      }
    });
  }

  // ── Update charts on theme change ─────────
  function updateChartThemes() {
    const charts = [
      window.sipChart, window.budgetChart, window.expenseChart,
      window.compoundingChart, window.netWorthChart, window.debtChart,
      window.sideHustleChart, window.fundComparisonChart
    ];
    charts.forEach(chart => {
      if (chart && chart.options) {
        const d = getChartDefaults();
        if (chart.options.plugins?.legend?.labels) {
          chart.options.plugins.legend.labels.color = d.color;
        }
        if (chart.options.plugins?.tooltip) {
          chart.options.plugins.tooltip.titleColor = d.color;
          chart.options.plugins.tooltip.bodyColor = d.color;
          chart.options.plugins.tooltip.backgroundColor = d.tooltipBg;
        }
        if (chart.options.scales?.x?.ticks) chart.options.scales.x.ticks.color = d.color;
        if (chart.options.scales?.x?.grid) chart.options.scales.x.grid.color = d.gridColor;
        if (chart.options.scales?.y?.ticks) chart.options.scales.y.ticks.color = d.color;
        if (chart.options.scales?.y?.grid) chart.options.scales.y.grid.color = d.gridColor;
        chart.update();
      }
    });
  }

  // ── Init all charts ────────────────────────
  function initAllCharts() {
    initSIPChart();
    initBudgetChart();
    initExpenseChart();
    initCompoundingChart();
    initNetWorthChart();
    initDebtChart();
    initSideHustleChart();
    initFundComparisonChart();
  }

  // Observe theme changes
  const observer = new MutationObserver(() => updateChartThemes());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function initCharts() {
    // Wait for Chart.js to load
    if (typeof Chart !== 'undefined') {
      initAllCharts();
    } else {
      window.addEventListener('load', initAllCharts);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharts);
  } else {
    initCharts();
  }

  window.updateChartThemes = updateChartThemes;

})();
