// =============================================
// FINWISE - TRACKERS.JS
// Income, expense, debt, savings trackers
// =============================================

(function () {
  'use strict';

  // ── Expense Tracker ────────────────────────
  const expenseTracker = {
    expenses: JSON.parse(localStorage.getItem('fw-expenses') || '[]'),
    income: JSON.parse(localStorage.getItem('fw-income') || '[]'),

    addExpense(data) {
      const entry = { id: Date.now(), ...data, date: new Date().toISOString() };
      this.expenses.push(entry);
      this.save();
      this.render();
      window.showToast?.('Expense added!', 'success');
    },

    addIncome(data) {
      const entry = { id: Date.now(), ...data, date: new Date().toISOString() };
      this.income.push(entry);
      this.save();
      this.render();
      window.showToast?.('Income added!', 'success');
    },

    deleteEntry(id, type) {
      if (type === 'expense') {
        this.expenses = this.expenses.filter(e => e.id !== id);
      } else {
        this.income = this.income.filter(e => e.id !== id);
      }
      this.save();
      this.render();
    },

    save() {
      localStorage.setItem('fw-expenses', JSON.stringify(this.expenses));
      localStorage.setItem('fw-income', JSON.stringify(this.income));
    },

    getTotals() {
      const totalIncome = this.income.reduce((s, e) => s + parseFloat(e.amount), 0);
      const totalExpenses = this.expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
      return { totalIncome, totalExpenses, savings: totalIncome - totalExpenses };
    },

    render() {
      const { totalIncome, totalExpenses, savings } = this.getTotals();

      const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setEl('tracker-total-income', window.formatCurrency(totalIncome));
      setEl('tracker-total-expenses', window.formatCurrency(totalExpenses));
      setEl('tracker-net-savings', window.formatCurrency(savings));

      // Expense list
      const expenseList = document.getElementById('expense-list');
      if (expenseList) {
        if (this.expenses.length === 0) {
          expenseList.innerHTML = `
            <div class="empty-state">
              <div class="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              </div>
              <span class="empty-title">No expenses yet</span>
              <span class="empty-desc">Add your first expense above</span>
            </div>`;
        } else {
          expenseList.innerHTML = this.expenses.slice(-10).reverse().map(e => `
            <div class="flex items-center justify-between" style="padding: 10px 0; border-bottom: 1px solid var(--border-color);">
              <div>
                <div class="text-body-sm" style="font-weight:600;">${e.description}</div>
                <div class="text-caption text-muted-color">${e.category} · ${new Date(e.date).toLocaleDateString('en-IN')}</div>
              </div>
              <div class="flex items-center gap-sm">
                <span class="text-red" style="font-weight:700;">-${window.formatCurrency(e.amount)}</span>
                <button onclick="window.expenseTracker.deleteEntry(${e.id}, 'expense')" class="btn btn-ghost btn-sm" style="padding:4px 8px; color: var(--color-red);">✕</button>
              </div>
            </div>
          `).join('');
        }
      }

      // Update pie chart if available
      if (window.expenseChart) {
        const byCategory = {};
        this.expenses.forEach(e => {
          byCategory[e.category] = (byCategory[e.category] || 0) + parseFloat(e.amount);
        });
        window.expenseChart.data.labels = Object.keys(byCategory);
        window.expenseChart.data.datasets[0].data = Object.values(byCategory);
        window.expenseChart.update();
      }
    }
  };

  // ── Debt Tracker ───────────────────────────
  const debtTracker = {
    debts: JSON.parse(localStorage.getItem('fw-debts') || '[]'),

    addDebt(data) {
      const entry = { id: Date.now(), ...data };
      this.debts.push(entry);
      this.save();
      this.render();
      window.showToast?.('Debt added!', 'success');
    },

    removeDebt(id) {
      this.debts = this.debts.filter(d => d.id !== id);
      this.save();
      this.render();
      window.showToast?.('Debt removed', 'info');
    },

    updateDebt(id, paid) {
      const debt = this.debts.find(d => d.id === id);
      if (debt) {
        debt.balance = Math.max(0, debt.balance - paid);
        if (debt.balance === 0) {
          window.showToast?.(`🎉 "${debt.name}" is paid off!`, 'success');
        }
        this.save();
        this.render();
      }
    },

    getDebts() { return this.debts; },

    save() {
      localStorage.setItem('fw-debts', JSON.stringify(this.debts));
    },

    render() {
      const container = document.getElementById('debt-list');
      if (!container) return;

      const totalDebt = this.debts.reduce((s, d) => s + parseFloat(d.balance), 0);
      const totalDebtEl = document.getElementById('debt-total');
      if (totalDebtEl) totalDebtEl.textContent = window.formatCurrency(totalDebt);

      if (this.debts.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span class="empty-title">No debts tracked</span>
            <span class="empty-desc">You're debt-free or add debts to plan payoff</span>
          </div>`;
        return;
      }

      container.innerHTML = this.debts.map(debt => {
        const originalBalance = debt.originalBalance || debt.balance;
        const progress = ((originalBalance - debt.balance) / originalBalance * 100);
        return `
          <div class="debt-card">
            <div class="debt-card-header">
              <div>
                <div class="debt-name">${debt.name}</div>
                <div class="text-caption text-muted-color">${debt.rate}% p.a. · Min: ${window.formatCurrency(debt.minPayment)}/mo</div>
              </div>
              <div class="debt-amount">${window.formatCurrency(debt.balance)}</div>
            </div>
            <div class="progress-container">
              <div class="progress-header">
                <span class="text-caption text-muted-color">Paid off</span>
                <span class="text-caption text-teal">${progress.toFixed(0)}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%; background: ${progress === 100 ? 'var(--color-teal)' : 'var(--gradient-teal)'}"></div>
              </div>
            </div>
            <div class="flex gap-sm">
              <input type="number" id="debt-pay-${debt.id}" placeholder="Amount to pay" class="form-input" style="flex:1;" min="0">
              <button onclick="window.debtTracker.updateDebt(${debt.id}, parseFloat(document.getElementById('debt-pay-${debt.id}').value) || 0)" class="btn btn-primary btn-sm">Pay</button>
              <button onclick="window.debtTracker.removeDebt(${debt.id})" class="btn btn-secondary btn-sm" style="color:var(--color-red); border-color: var(--color-red);">Remove</button>
            </div>
          </div>`;
      }).join('');

      // Update debt calc
      window.calcDebtPayoff?.();
    }
  };

  // ── Savings Goals Tracker ──────────────────
  const savingsTracker = {
    goals: JSON.parse(localStorage.getItem('fw-goals') || '[]'),

    addGoal(data) {
      const entry = { id: Date.now(), current: 0, ...data };
      this.goals.push(entry);
      this.save();
      this.render();
      window.showToast?.('Goal added!', 'success');
    },

    addSavings(id, amount) {
      const goal = this.goals.find(g => g.id === id);
      if (goal) {
        goal.current = Math.min(goal.current + parseFloat(amount), goal.target);
        if (goal.current >= goal.target) {
          window.showToast?.(`🎉 Goal "${goal.name}" achieved!`, 'success');
        }
        this.save();
        this.render();
      }
    },

    removeGoal(id) {
      this.goals = this.goals.filter(g => g.id !== id);
      this.save();
      this.render();
    },

    save() {
      localStorage.setItem('fw-goals', JSON.stringify(this.goals));
    },

    render() {
      const container = document.getElementById('savings-goals-list');
      if (!container) return;

      if (this.goals.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <span class="empty-title">No savings goals</span>
            <span class="empty-desc">Add a goal to start tracking</span>
          </div>`;
        return;
      }

      container.innerHTML = this.goals.map(goal => {
        const progress = Math.min((goal.current / goal.target) * 100, 100);
        const remaining = goal.target - goal.current;
        return `
          <div class="card">
            <div class="flex justify-between items-center mb-md">
              <div>
                <div style="font-weight:700; font-size:1rem;">${goal.name}</div>
                <div class="text-caption text-muted-color">${goal.category || 'General'}</div>
              </div>
              <div class="badge badge-teal">${progress.toFixed(0)}%</div>
            </div>
            <div class="flex justify-between mb-sm">
              <span class="text-caption text-muted-color">Saved: <strong class="text-teal">${window.formatCurrency(goal.current)}</strong></span>
              <span class="text-caption text-muted-color">Goal: <strong>${window.formatCurrency(goal.target)}</strong></span>
            </div>
            <div class="progress-bar progress-bar-lg mb-md">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="flex gap-sm">
              <input type="number" id="goal-add-${goal.id}" placeholder="Add amount" class="form-input" style="flex:1;" min="0">
              <button onclick="window.savingsTracker.addSavings(${goal.id}, document.getElementById('goal-add-${goal.id}').value)" class="btn btn-primary btn-sm">Add</button>
              <button onclick="window.savingsTracker.removeGoal(${goal.id})" class="btn btn-secondary btn-sm" style="color:var(--color-red);">×</button>
            </div>
            ${remaining > 0 ? `<div class="text-caption text-muted-color mt-sm">₹${Math.round(remaining).toLocaleString('en-IN')} remaining</div>` : '<div class="badge badge-teal mt-sm">🎉 Goal Achieved!</div>'}
          </div>`;
      }).join('');
    }
  };

  // ── Side Hustle Tracker ────────────────────
  const sideHustleTracker = {
    entries: JSON.parse(localStorage.getItem('fw-hustle') || '[]'),

    add(data) {
      this.entries.push({ id: Date.now(), ...data, date: new Date().toISOString() });
      this.save();
      this.render();
      window.showToast?.('Income added!', 'success');
    },

    remove(id) {
      this.entries = this.entries.filter(e => e.id !== id);
      this.save();
      this.render();
    },

    save() {
      localStorage.setItem('fw-hustle', JSON.stringify(this.entries));
    },

    getMonthlyTotal() {
      const now = new Date();
      return this.entries
        .filter(e => new Date(e.date).getMonth() === now.getMonth())
        .reduce((s, e) => s + parseFloat(e.amount), 0);
    },

    getYearlyTotal() {
      return this.entries.reduce((s, e) => s + parseFloat(e.amount), 0);
    },

    render() {
      const monthlyEl = document.getElementById('hustle-monthly');
      const yearlyEl = document.getElementById('hustle-yearly');
      if (monthlyEl) monthlyEl.textContent = window.formatCurrency(this.getMonthlyTotal());
      if (yearlyEl) yearlyEl.textContent = window.formatCurrency(this.getYearlyTotal());

      const list = document.getElementById('hustle-list');
      if (!list) return;

      if (this.entries.length === 0) {
        list.innerHTML = '<p class="text-secondary-color text-body-sm">No entries yet. Add your first side income!</p>';
        return;
      }

      list.innerHTML = this.entries.slice(-8).reverse().map(e => `
        <div class="flex items-center justify-between" style="padding: 10px 0; border-bottom: 1px solid var(--border-color);">
          <div>
            <div style="font-weight:600; font-size:0.875rem;">${e.source}</div>
            <div class="text-caption text-muted-color">${e.category} · ${new Date(e.date).toLocaleDateString('en-IN')}</div>
          </div>
          <div class="flex items-center gap-sm">
            <span class="text-green" style="font-weight:700;">+${window.formatCurrency(e.amount)}</span>
            <button onclick="window.sideHustleTracker.remove(${e.id})" class="btn btn-ghost btn-sm" style="padding:4px 8px; color: var(--color-red);">✕</button>
          </div>
        </div>
      `).join('');
    }
  };

  // ── Form Handlers ──────────────────────────
  function initFormHandlers() {
    // Expense form
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
      expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const desc = document.getElementById('expense-desc')?.value;
        const amount = document.getElementById('expense-amount')?.value;
        const category = document.getElementById('expense-category')?.value;
        if (!desc || !amount) return;
        expenseTracker.addExpense({ description: desc, amount: parseFloat(amount), category });
        expenseForm.reset();
      });
    }

    // Income form
    const incomeForm = document.getElementById('income-form');
    if (incomeForm) {
      incomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const desc = document.getElementById('income-desc')?.value;
        const amount = document.getElementById('income-amount')?.value;
        if (!desc || !amount) return;
        expenseTracker.addIncome({ description: desc, amount: parseFloat(amount) });
        incomeForm.reset();
      });
    }

    // Debt form
    const debtForm = document.getElementById('debt-form');
    if (debtForm) {
      debtForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('debt-name')?.value;
        const balance = document.getElementById('debt-balance')?.value;
        const rate = document.getElementById('debt-rate')?.value;
        const minPayment = document.getElementById('debt-min-payment')?.value;
        if (!name || !balance) return;
        debtTracker.addDebt({
          name,
          balance: parseFloat(balance),
          originalBalance: parseFloat(balance),
          rate: parseFloat(rate || 0),
          minPayment: parseFloat(minPayment || 1000)
        });
        debtForm.reset();
      });
    }

    // Goal form
    const goalForm = document.getElementById('goal-form');
    if (goalForm) {
      goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('goal-name')?.value;
        const target = document.getElementById('goal-target')?.value;
        const category = document.getElementById('goal-category')?.value;
        if (!name || !target) return;
        savingsTracker.addGoal({ name, target: parseFloat(target), category });
        goalForm.reset();
      });
    }

    // Side hustle form
    const hustleForm = document.getElementById('hustle-form');
    if (hustleForm) {
      hustleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const source = document.getElementById('hustle-source')?.value;
        const amount = document.getElementById('hustle-amount')?.value;
        const category = document.getElementById('hustle-category')?.value;
        if (!source || !amount) return;
        sideHustleTracker.add({ source, amount: parseFloat(amount), category });
        hustleForm.reset();
      });
    }
  }

  // ── Expose to window ──────────────────────
  window.expenseTracker = expenseTracker;
  window.debtTracker = debtTracker;
  window.savingsTracker = savingsTracker;
  window.sideHustleTracker = sideHustleTracker;

  function initTrackers() {
    initFormHandlers();
    // Render initial state
    expenseTracker.render();
    debtTracker.render();
    savingsTracker.render();
    sideHustleTracker.render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrackers);
  } else {
    initTrackers();
  }

})();
