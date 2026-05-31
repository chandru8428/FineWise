// =============================================
// FINWISE - CALCULATORS.JS
// All financial calculators with real math
// =============================================

(function () {
  'use strict';

  // ── SIP Calculator ─────────────────────────
  function calcSIP() {
    const monthly = parseFloat(document.getElementById('sip-monthly')?.value || 5000);
    const rate = parseFloat(document.getElementById('sip-rate')?.value || 12) / 100 / 12;
    const years = parseFloat(document.getElementById('sip-years')?.value || 10);
    const n = years * 12;

    const invested = monthly * n;
    const corpus = monthly * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate);
    const gains = corpus - invested;

    const investedEl = document.getElementById('sip-invested');
    const corpusEl = document.getElementById('sip-corpus');
    const gainsEl = document.getElementById('sip-gains');

    if (investedEl) investedEl.textContent = window.formatCurrency(invested);
    if (corpusEl) corpusEl.textContent = window.formatCurrency(corpus);
    if (gainsEl) gainsEl.textContent = window.formatCurrency(gains);

    updateSIPChart(invested, gains);
  }

  function updateSIPChart(invested, gains) {
    if (!window.sipChart) return;
    
    // For a doughnut chart, data is an array of values matching the labels
    window.sipChart.data.datasets[0].data = [Math.round(invested), Math.round(gains)];
    window.sipChart.update();
  }

  // ── Goal-Based SIP Planner ─────────────────
  function calcGoalSIP() {
    const goal = parseFloat(document.getElementById('goal-amount')?.value || 1000000);
    const years = parseFloat(document.getElementById('goal-years')?.value || 10);
    const rate = parseFloat(document.getElementById('goal-rate')?.value || 12) / 100 / 12;
    const n = years * 12;

    const monthlySIP = goal * rate / ((Math.pow(1 + rate, n) - 1) * (1 + rate));
    const totalInvested = monthlySIP * n;
    const totalGains = goal - totalInvested;

    const el_goal_monthly_sip = document.getElementById('goal-monthly-sip');
    if (el_goal_monthly_sip) el_goal_monthly_sip.textContent = window.formatCurrency(monthlySIP);
    const el_goal_total_invested = document.getElementById('goal-total-invested');
    if (el_goal_total_invested) el_goal_total_invested.textContent = window.formatCurrency(totalInvested);
    const el_goal_total_gains = document.getElementById('goal-total-gains');
    if (el_goal_total_gains) el_goal_total_gains.textContent = window.formatCurrency(totalGains);
    const el_goal_wealth_ratio = document.getElementById('goal-wealth-ratio');
    if (el_goal_wealth_ratio) el_goal_wealth_ratio.textContent = ((goal / totalInvested) || 0).toFixed(2) + 'x';
  }

  // ── Retirement Calculator ──────────────────
  function calcRetirement() {
    const currentAge = parseInt(document.getElementById('ret-current-age')?.value || 28);
    const retireAge = parseInt(document.getElementById('ret-retire-age')?.value || 60);
    const monthlyExpense = parseFloat(document.getElementById('ret-monthly-expense')?.value || 50000);
    const inflationRate = parseFloat(document.getElementById('ret-inflation')?.value || 6) / 100;
    const returnRate = parseFloat(document.getElementById('ret-return')?.value || 12) / 100;
    const lifeExpectancy = parseInt(document.getElementById('ret-life-exp')?.value || 85);

    const yearsToRetire = retireAge - currentAge;
    const retirementYears = lifeExpectancy - retireAge;

    // Future monthly expense at retirement
    const futureMonthlyExpense = monthlyExpense * Math.pow(1 + inflationRate, yearsToRetire);
    const futureAnnualExpense = futureMonthlyExpense * 12;

    // Corpus needed (Present Value of annuity)
    const realReturn = (1 + returnRate) / (1 + inflationRate) - 1;
    const corpusNeeded = futureAnnualExpense * (1 - Math.pow(1 + realReturn, -retirementYears)) / realReturn;

    // Monthly SIP needed
    const monthlyRate = returnRate / 12;
    const n = yearsToRetire * 12;
    const monthlySIP = corpusNeeded * monthlyRate / ((Math.pow(1 + monthlyRate, n) - 1) * (1 + monthlyRate));

    const el_ret_corpus = document.getElementById('ret-corpus');
    if (el_ret_corpus) el_ret_corpus.textContent = window.formatCurrency(corpusNeeded);
    const el_ret_monthly_sip = document.getElementById('ret-monthly-sip');
    if (el_ret_monthly_sip) el_ret_monthly_sip.textContent = window.formatCurrency(monthlySIP);
    const el_ret_future_expense = document.getElementById('ret-future-expense');
    if (el_ret_future_expense) el_ret_future_expense.textContent = window.formatCurrency(futureMonthlyExpense);
  }

  // ── Credit Utilization Calculator ─────────
  function calcCreditUtil() {
    const totalLimit = parseFloat(document.getElementById('cu-total-limit')?.value || 100000);
    const balanceUsed = parseFloat(document.getElementById('cu-balance-used')?.value || 30000);
    const utilization = (balanceUsed / totalLimit) * 100;

    const el_cu_utilization = document.getElementById('cu-utilization');
    if (el_cu_utilization) el_cu_utilization.textContent = utilization.toFixed(1) + '%';

    const fill = document.getElementById('cu-progress-fill');
    if (fill) {
      fill.style.width = Math.min(utilization, 100) + '%';
      fill.className = 'progress-fill';
      if (utilization <= 30) fill.className = 'progress-fill';
      else if (utilization <= 60) fill.className = 'progress-fill amber';
      else fill.className = 'progress-fill red';
    }

    const statusEl = document.getElementById('cu-status');
    if (statusEl) {
      if (utilization <= 30) {
        statusEl.textContent = '✅ Excellent! Your utilization is in the ideal range.';
        statusEl.className = 'info-box teal mt-md';
      } else if (utilization <= 60) {
        statusEl.textContent = '⚠️ Moderate. Try to reduce usage to below 30%.';
        statusEl.className = 'info-box amber mt-md';
      } else {
        statusEl.textContent = '❌ High risk! This can significantly hurt your CIBIL score.';
        statusEl.className = 'info-box red mt-md';
      }
    }

    const recommendEl = document.getElementById('cu-recommendation');
    if (recommendEl) {
      if (utilization > 30) {
        const targetBalance = totalLimit * 0.3;
        const payoff = balanceUsed - targetBalance;
        recommendEl.textContent = `Pay ₹${Math.round(payoff).toLocaleString('en-IN')} to reach 30% utilization.`;
      } else {
        recommendEl.textContent = 'Keep it up! Your credit utilization is healthy.';
      }
    }
  }

  // ── Debt Payoff Calculator (Avalanche) ─────
  function calcDebtPayoff() {
    const debts = window.debtTracker?.getDebts() || [];
    if (debts.length === 0) {
      const el_debt_result_tmp = document.getElementById('debt-result');
      if (el_debt_result_tmp) el_debt_result_tmp.innerHTML = '<p class="text-secondary-color">Add debts above to see your payoff plan.</p>';
      return;
    }

    const extraPayment = parseFloat(document.getElementById('debt-extra-payment')?.value || 0);
    const method = document.getElementById('debt-method')?.value || 'avalanche';

    // Sort by method
    const sorted = [...debts].sort((a, b) =>
      method === 'avalanche' ? b.rate - a.rate : a.balance - b.balance
    );

    let totalMonths = 0;
    let totalInterest = 0;
    const results = [];
    let extraPool = extraPayment;

    sorted.forEach((debt, i) => {
      let balance = debt.balance;
      let months = 0;
      let interest = 0;
      const monthlyRate = debt.rate / 100 / 12;
      const payment = debt.minPayment + (i === 0 ? extraPool : 0);

      while (balance > 0 && months < 600) {
        const interestCharge = balance * monthlyRate;
        interest += interestCharge;
        balance = balance + interestCharge - payment;
        if (balance < 0) balance = 0;
        months++;
      }

      totalMonths = Math.max(totalMonths, months);
      totalInterest += interest;
      results.push({ name: debt.name, months, interest });
    });

    const resultEl = document.getElementById('debt-result');
    if (resultEl) {
      resultEl.innerHTML = `
        <div class="card-grid card-grid-2">
          <div class="stat-card">
            <span class="stat-label">Debt-Free In</span>
            <span class="stat-value">${totalMonths} months</span>
            <span class="text-muted-color text-caption">${(totalMonths / 12).toFixed(1)} years</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total Interest Paid</span>
            <span class="stat-value text-red">${window.formatCurrency(totalInterest)}</span>
            <span class="text-muted-color text-caption">${method === 'avalanche' ? 'Minimum possible' : 'Snowball method'}</span>
          </div>
        </div>
        <div class="table-wrapper mt-md">
          <table class="data-table">
            <thead><tr><th>Debt</th><th>Paid Off In</th><th>Interest Paid</th></tr></thead>
            <tbody>${results.map(r => `<tr><td>${r.name}</td><td>${r.months} months</td><td class="text-red">${window.formatCurrency(r.interest)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      `;
    }
  }

  // ── Budget Calculator ──────────────────────
  function calcBudget() {
    const income = parseFloat(document.getElementById('budget-income')?.value || 0);
    const needs = parseFloat(document.getElementById('budget-needs')?.value || 0);
    const wants = parseFloat(document.getElementById('budget-wants')?.value || 0);
    const savings = parseFloat(document.getElementById('budget-savings')?.value || 0);

    const total = needs + wants + savings;
    const remaining = income - total;

    const needsPct = income > 0 ? ((needs / income) * 100).toFixed(0) : 0;
    const wantsPct = income > 0 ? ((wants / income) * 100).toFixed(0) : 0;
    const savingsPct = income > 0 ? ((savings / income) * 100).toFixed(0) : 0;

    document.getElementById('budget-needs-pct')?.setAttribute('style', `width: ${needsPct}%`);
    document.getElementById('budget-wants-pct')?.setAttribute('style', `width: ${wantsPct}%`);
    document.getElementById('budget-savings-pct')?.setAttribute('style', `width: ${savingsPct}%`);

    const remainEl = document.getElementById('budget-remaining-amount');
    if (remainEl) {
      remainEl.textContent = window.formatCurrency(Math.abs(remaining));
      remainEl.className = remaining >= 0 ? 'stat-value text-green' : 'stat-value text-red';
    }

    // 50/30/20 Rule check
    const ruleEl = document.getElementById('budget-rule-check');
    if (ruleEl && income > 0) {
      const checkNeeds = needsPct <= 50 ? '✅' : '❌';
      const checkWants = wantsPct <= 30 ? '✅' : '❌';
      const checkSavings = savingsPct >= 20 ? '✅' : '❌';
      ruleEl.innerHTML = `
        <span>${checkNeeds} Needs: ${needsPct}% (ideal ≤50%)</span>
        <span>${checkWants} Wants: ${wantsPct}% (ideal ≤30%)</span>
        <span>${checkSavings} Savings: ${savingsPct}% (ideal ≥20%)</span>
      `;
    }

    // Update budget chart
    if (window.budgetChart && income > 0) {
      window.budgetChart.data.datasets[0].data = [needs, wants, savings, Math.max(0, remaining)];
      window.budgetChart.update();
    }
  }

  // ── Lumpsum Calculator ─────────────────────
  function calcLumpsum() {
    const principal = parseFloat(document.getElementById('ls-principal')?.value || 100000);
    const rate = parseFloat(document.getElementById('ls-rate')?.value || 12) / 100;
    const years = parseFloat(document.getElementById('ls-years')?.value || 10);

    const futureValue = principal * Math.pow(1 + rate, years);
    const gains = futureValue - principal;

    const el_ls_future_value = document.getElementById('ls-future-value');
    if (el_ls_future_value) el_ls_future_value.textContent = window.formatCurrency(futureValue);
    const el_ls_gains = document.getElementById('ls-gains');
    if (el_ls_gains) el_ls_gains.textContent = window.formatCurrency(gains);
    const el_ls_cagr = document.getElementById('ls-cagr');
    if (el_ls_cagr) el_ls_cagr.textContent = (((futureValue / principal) - 1) / years * 100).toFixed(1) + '%';
  }

  // ── EMI Calculator ─────────────────────────
  function calcEMI() {
    const principal = parseFloat(document.getElementById('emi-principal')?.value || 500000);
    const rate = parseFloat(document.getElementById('emi-rate')?.value || 9) / 100 / 12;
    const tenure = parseFloat(document.getElementById('emi-tenure')?.value || 5) * 12;

    const emi = principal * rate * Math.pow(1 + rate, tenure) / (Math.pow(1 + rate, tenure) - 1);
    const totalPayment = emi * tenure;
    const totalInterest = totalPayment - principal;

    const el_emi_amount = document.getElementById('emi-amount');
    if (el_emi_amount) el_emi_amount.textContent = window.formatCurrency(emi);
    const el_emi_total_interest = document.getElementById('emi-total-interest');
    if (el_emi_total_interest) el_emi_total_interest.textContent = window.formatCurrency(totalInterest);
    const el_emi_total_payment = document.getElementById('emi-total-payment');
    if (el_emi_total_payment) el_emi_total_payment.textContent = window.formatCurrency(totalPayment);
  }

  // ── Bind all calculator inputs ─────────────
  function bindCalculators() {
    const bindings = [
      { ids: ['sip-monthly', 'sip-rate', 'sip-years'], fn: calcSIP },
      { ids: ['goal-amount', 'goal-years', 'goal-rate'], fn: calcGoalSIP },
      { ids: ['ret-current-age', 'ret-retire-age', 'ret-monthly-expense', 'ret-inflation', 'ret-return', 'ret-life-exp'], fn: calcRetirement },
      { ids: ['cu-total-limit', 'cu-balance-used'], fn: calcCreditUtil },
      { ids: ['debt-extra-payment', 'debt-method'], fn: calcDebtPayoff },
      { ids: ['budget-income', 'budget-needs', 'budget-wants', 'budget-savings'], fn: calcBudget },
      { ids: ['ls-principal', 'ls-rate', 'ls-years'], fn: calcLumpsum },
      { ids: ['emi-principal', 'emi-rate', 'emi-tenure'], fn: calcEMI },
    ];

    bindings.forEach(({ ids, fn }) => {
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', fn);
          el.addEventListener('change', fn);
        }
      });
    });

    // Slider sync with number inputs
    const sliders = document.querySelectorAll('.range-slider[data-sync]');
    sliders.forEach(slider => {
      const syncId = slider.dataset.sync;
      const syncEl = document.getElementById(syncId);
      if (syncEl) {
        slider.addEventListener('input', () => { syncEl.value = slider.value; syncEl.dispatchEvent(new Event('input')); });
        syncEl.addEventListener('input', () => { slider.value = syncEl.value; });
      }
    });
  }

  // ── Run initial calculations ───────────────
  function runInitialCalculations() {
    setTimeout(() => {
      calcSIP();
      calcGoalSIP();
      calcRetirement();
      calcCreditUtil();
      calcBudget();
      calcLumpsum();
      calcEMI();
    }, 500);
  }

  // ── Expose to window ──────────────────────
  window.calcSIP = calcSIP;
  window.calcGoalSIP = calcGoalSIP;
  window.calcRetirement = calcRetirement;
  window.calcCreditUtil = calcCreditUtil;
  window.calcDebtPayoff = calcDebtPayoff;
  window.calcBudget = calcBudget;
  window.calcLumpsum = calcLumpsum;
  window.calcEMI = calcEMI;

  function initCalculators() {
    bindCalculators();
    runInitialCalculations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculators);
  } else {
    initCalculators();
  }

})();
