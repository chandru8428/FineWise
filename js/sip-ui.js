/**
 * SIP UI Binding & Interactions
 */

(function() {
  'use strict';

  // State
  let sipGrowthChart = null;

  function initSIPUI() {
    // Tab switching logic
    const tabs = document.querySelectorAll('.sip-tab-btn');
    const contents = document.querySelectorAll('.sip-tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.target);
        if (target) target.classList.add('active');

        // Re-render charts if needed because display:none affects canvas
        if (tab.dataset.target === 'sip-tab-calculator') {
          updateSIPAdvanced();
        }
      });
    });

    // Slider syncs
    const sliders = document.querySelectorAll('.sip-advanced-container .range-slider[data-sync]');
    sliders.forEach(slider => {
      const syncId = slider.dataset.sync;
      const syncEl = document.getElementById(syncId);
      if (syncEl) {
        slider.addEventListener('input', () => { 
          syncEl.value = slider.value; 
          updateSIPAdvanced(); 
        });
        syncEl.addEventListener('input', () => { 
          slider.value = syncEl.value; 
          updateSIPAdvanced(); 
        });
      }
    });

    // Inputs triggering updates
    const inputs = document.querySelectorAll('.sip-advanced-container input, .sip-advanced-container select');
    inputs.forEach(input => {
      if (!input.dataset.sync) { // Avoid double binding with sliders
        input.addEventListener('input', updateSIPAdvanced);
      }
    });

    // AI Advisor interactions
    const aiSendBtn = document.getElementById('ai-send-btn');
    if (aiSendBtn) {
      aiSendBtn.addEventListener('click', handleAIChat);
    }

    // Initialize Chart
    initAdvancedChart();
    
    // Initial run
    updateSIPAdvanced();
  }

  function initAdvancedChart() {
    const ctx = document.getElementById('sipAdvancedChart');
    if (!ctx) return;

    sipGrowthChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Total Invested', 'Est. Returns'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#94A3B8', '#00D4AA'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) label += ': ';
                if (context.parsed !== null) {
                  label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.parsed);
                }
                return label;
              }
            }
          }
        }
      }
    });
  }

  function updateSIPAdvanced() {
    if (!window.SIPEngine) return;

    const monthly = parseFloat(document.getElementById('adv-sip-monthly')?.value || 5000);
    const rate = parseFloat(document.getElementById('adv-sip-rate')?.value || 12);
    const years = parseFloat(document.getElementById('adv-sip-years')?.value || 10);
    const stepUp = parseFloat(document.getElementById('adv-sip-stepup')?.value || 0);
    const inflation = parseFloat(document.getElementById('adv-sip-inflation')?.value || 6);

    const result = window.SIPEngine.calculateStepUpSIP(monthly, stepUp, rate, years);
    
    // Update simple DOM elements
    const format = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    
    const elInvested = document.getElementById('adv-sip-invested');
    if (elInvested) elInvested.textContent = format(result.totalInvested);
    
    const elReturns = document.getElementById('adv-sip-returns');
    if (elReturns) elReturns.textContent = format(result.gains);
    
    const elTotal = document.getElementById('adv-sip-total');
    if (elTotal) elTotal.textContent = format(result.corpus);
    
    const inflationAdjusted = window.SIPEngine.calculateInflationAdjusted(result.corpus, inflation, years);
    const elInfTotal = document.getElementById('adv-sip-inflation-total');
    if (elInfTotal) elInfTotal.textContent = format(inflationAdjusted);

    // Update Chart
    if (sipGrowthChart && result) {
      sipGrowthChart.data.datasets[0].data = [result.totalInvested, result.gains];
      sipGrowthChart.update();
    }

    // Update Data Table
    renderDataTable(result.yearlyData);

    // Update AI Insights automatically
    generateAIInsights(monthly, rate, years, stepUp, result.corpus);
  }

  function renderDataTable(yearlyData) {
    const tbody = document.getElementById('adv-sip-table-body');
    if (!tbody || !yearlyData) return;
    
    const format = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    tbody.innerHTML = yearlyData.map(d => `
      <tr>
        <td>Year ${d.year}</td>
        <td>${format(d.annualContribution)}</td>
        <td>${format(d.invested)}</td>
        <td class="text-green">${format(d.yearGains)}</td>
        <td style="font-weight:700;color:var(--color-teal);">${format(d.corpus)}</td>
      </tr>
    `).join('');
  }

  function generateAIInsights(monthly, rate, years, stepUp, corpus) {
    const box = document.getElementById('adv-ai-insight');
    if (!box) return;

    let insights = [];
    if (rate > 15) {
      insights.push(`⚠️ <strong class="text-amber">High Expectation:</strong> ${rate}% annual return is highly aggressive. Historically, equity mutual funds average 10-12% over long periods.`);
    } else if (rate < 8) {
      insights.push(`💡 <strong class="text-teal">Conservative:</strong> ${rate}% is a safe estimate, typically achieved by hybrid or debt-oriented funds.`);
    }

    if (stepUp === 0) {
      const stepUpResult = window.SIPEngine.calculateStepUpSIP(monthly, 10, rate, years);
      const diff = stepUpResult.corpus - corpus;
      const format = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
      insights.push(`🚀 <strong class="text-teal">Pro Tip:</strong> If you increase your SIP by just 10% every year, your final wealth will increase by <strong class="text-green">${format(diff)}</strong>.`);
    }

    if (years < 5) {
      insights.push(`⚠️ <strong class="text-amber">Short Horizon:</strong> Equity investments can be volatile in the short term. For <5 years, consider debt funds or FDs.`);
    }

    box.innerHTML = insights.join('<br><br>');
  }

  function handleAIChat() {
    const input = document.getElementById('ai-chat-input');
    const container = document.getElementById('ai-chat-messages');
    if (!input || !container || !input.value.trim()) return;

    const q = input.value.trim();
    input.value = '';

    // Add user message
    container.innerHTML += `
      <div style="text-align: right; margin-bottom: 12px;">
        <div style="display:inline-block; background: var(--color-teal); color: #1e293b; padding: 10px 14px; border-radius: 16px 16px 0 16px; font-size: 0.9rem;">
          ${q}
        </div>
      </div>
    `;

    // Simulate AI loading
    const loaderId = 'ai-loader-' + Date.now();
    container.innerHTML += `
      <div id="${loaderId}" style="text-align: left; margin-bottom: 12px;">
        <div style="display:inline-block; background: var(--color-surface); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 14px; border-radius: 16px 16px 16px 0; font-size: 0.9rem;">
          <span class="typing-indicator"><span>.</span><span>.</span><span>.</span></span>
        </div>
      </div>
    `;
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
      const loader = document.getElementById(loaderId);
      if (loader) loader.remove();

      let answer = "I'm your AI assistant. I can analyze your portfolio, suggest asset allocations, and answer questions about personal finance.";
      
      const qLower = q.toLowerCase();
      if (qLower.includes('1 crore') || qLower.includes('1cr')) {
        answer = "To reach ₹1 Crore, the most common strategy is the '15x15x15' rule: ₹15,000 per month for 15 years at 15% return. However, if you expect a more realistic 12% return, you'll need about ₹20,000 per month for 15 years.";
      } else if (qLower.includes('pause') || qLower.includes('stop')) {
        answer = "Pausing an SIP doesn't withdraw your money; the accumulated corpus continues to grow. However, you miss out on buying units during that period, which significantly affects long-term compounding.";
      } else if (qLower.includes('step up') || qLower.includes('increase')) {
        answer = "Step-up SIP is highly recommended! Your salary increases every year, so your investments should too. Even a 5% annual step-up can increase your final corpus by 30-40% over 20 years.";
      } else if (qLower.includes('inflation')) {
        answer = "Inflation is the silent wealth killer. At 6% inflation, ₹1 Crore today will only have the purchasing power of ~₹31 Lakhs in 20 years. Always look at the 'Inflation-Adjusted' value in the calculator.";
      }

      container.innerHTML += `
        <div style="text-align: left; margin-bottom: 12px;">
          <div style="display:inline-block; background: var(--color-surface); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 14px; border-radius: 16px 16px 16px 0; font-size: 0.9rem; line-height: 1.5;">
            ${answer}
          </div>
        </div>
      `;
      container.scrollTop = container.scrollHeight;
    }, 1500);
  }

  // Init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSIPUI);
  } else {
    initSIPUI();
  }

})();
