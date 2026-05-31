// =============================================
// FINWISE - AI-CHAT.JS
// Simulated AI financial mentor chat
// =============================================

(function () {
  'use strict';

  const knowledgeBase = {
    // Credit Cards
    'credit card': {
      response: `A **credit card** is a financial tool that lets you borrow money from a bank up to a set limit. Think of it as a short-term loan.

**How it works:**
- You spend on the card during the billing cycle
- The bank sends you a statement (monthly bill)
- Pay the full amount by the due date = **zero interest**
- Pay only minimum = interest charges kick in (24-48% p.a.)

**Golden Rule:** Never use a credit card as extra money. Use it as a **payment tool** to earn rewards on money you already have.`,
      followUp: ['CIBIL score', 'credit utilization', 'credit card types', 'pay credit card bill'],
    },
    'cibil score': {
      response: `**CIBIL Score** (Credit Score) is a 3-digit number between **300-900** that tells lenders how trustworthy you are with credit.

📊 **Score Ranges:**
- 750-900: Excellent → Best loan rates
- 700-749: Good → Approved easily
- 650-699: Fair → Higher interest
- Below 650: Poor → Loan rejection risk

🔧 **How to improve:**
1. Pay all bills on time (biggest factor - 35%)
2. Keep credit utilization below 30%
3. Don't apply for too many cards at once
4. Keep old accounts open
5. Maintain a mix of credit types`,
      followUp: ['credit utilization', 'how to improve CIBIL', 'credit card benefits'],
    },
    'credit utilization': {
      response: `**Credit Utilization** = (Balance Used ÷ Total Credit Limit) × 100

**Example:** If your limit is ₹1,00,000 and you've used ₹30,000 → utilization = 30%

🎯 **Ideal:** Keep it **below 30%** always

- Below 10%: Excellent
- 10-30%: Good
- 30-60%: Moderate (score may drop)
- Above 60%: Dangerous (hurts score significantly)

**Pro tip:** You can request a credit limit increase without using more — this automatically reduces utilization!`,
      followUp: ['CIBIL score', 'credit card types', 'pay bill on time'],
    },
    'sip': {
      response: `**SIP (Systematic Investment Plan)** is the smartest way to invest in mutual funds — automatically invest a fixed amount every month, regardless of market conditions.

📈 **Why SIP works:**
- **Rupee Cost Averaging:** Buy more units when market is low, fewer when high
- **Power of Compounding:** Your returns earn more returns
- **Discipline:** No need to time the market
- **Flexibility:** Start with ₹500/month

**Example:** ₹5,000/month for 20 years at 12% = **₹49.9 Lakhs** (invested only ₹12 Lakhs)

**When to start?** TODAY. Every year you delay costs significantly in final corpus.`,
      followUp: ['SIP vs lump sum', 'how to choose a fund', 'power of compounding', 'SIP calculator'],
    },
    'mutual fund': {
      response: `A **Mutual Fund** pools money from many investors and a professional fund manager invests it in stocks, bonds, or both.

🏦 **Types:**
- **Equity Funds** → Stocks (high risk, high return, 5+ years)
- **Debt Funds** → Bonds (low risk, stable, 1-3 years)
- **Hybrid Funds** → Mix of both (moderate risk)
- **Index Funds** → Track Nifty/Sensex (low cost, passive)

💡 **Beginner Recommendation:**
Start with **1-2 index funds** (Nifty 50 or Nifty Next 50). Low cost, diversified, market returns.

Avoid too many funds — 3-4 is sufficient for a complete portfolio!`,
      followUp: ['SIP', 'index fund vs active', 'expense ratio', 'how to select a fund'],
    },
    'expense ratio': {
      response: `**Expense Ratio** is the annual fee charged by a mutual fund, expressed as a percentage of your investment.

📊 **What's good?**
- Index Funds: 0.1% - 0.5% → Excellent
- Active Equity: 0.5% - 1.5% → Acceptable
- Above 2%: Too expensive, avoid!

**Why it matters:**
₹1,00,000 invested for 20 years at 12% return:
- 0.5% expense ratio → ₹5.6 Lakhs final value
- 2.5% expense ratio → ₹3.9 Lakhs final value
Difference: **₹1.7 Lakhs just from fees!**

**Always choose Direct Plans** — they have lower expense ratios than Regular plans.`,
      followUp: ['direct vs regular plan', 'index fund', 'mutual fund selection'],
    },
    'debt snowball': {
      response: `**Debt Snowball Method** = Pay off your **smallest debt first**, regardless of interest rate.

**How it works:**
1. List all debts from smallest to largest
2. Pay minimum on all except the smallest
3. Throw ALL extra money at the smallest debt
4. When it's paid off, roll that payment to the next smallest

🧠 **Psychology:** Gives you quick wins → motivation to keep going!

**Example:**
- Credit Card ₹20K (paid off in 2 months) ✅
- Personal Loan ₹80K (next target)
- Car Loan ₹3L (after that)

Best for people who need motivation. If you're disciplined, use **Debt Avalanche** (highest interest first) to save more money.`,
      followUp: ['debt avalanche', 'debt payoff calculator', 'emergency fund'],
    },
    'debt avalanche': {
      response: `**Debt Avalanche** = Pay off debt with the **highest interest rate first**.

**How it works:**
1. List all debts from highest to lowest interest rate
2. Pay minimum on all debts
3. Put ALL extra money toward the highest-rate debt
4. When paid off, cascade to the next highest rate

💰 **Mathematically optimal** — saves you the most money in interest.

**vs Snowball:**
- Avalanche saves more ₹ in interest
- Snowball gives faster emotional wins

**Which to choose?**
- If you're motivated and disciplined → **Avalanche**
- If you've tried before and given up → **Snowball**`,
      followUp: ['debt snowball', 'debt payoff calculator', 'credit card debt'],
    },
    'budgeting': {
      response: `**Budgeting** = telling your money where to go, instead of wondering where it went.

🎯 **The 50/30/20 Rule (Beginner-Friendly):**
- **50%** → Needs (rent, food, utilities, EMIs)
- **30%** → Wants (entertainment, dining, shopping)
- **20%** → Savings + investments

**Step-by-Step:**
1. Calculate your monthly take-home income
2. List all fixed expenses (rent, EMIs)
3. Track variable expenses for 1 month
4. Set spending limits for each category
5. Review weekly

**Tool:** Use the Budget Tracker in our Personal Finance section!`,
      followUp: ['savings goals', 'emergency fund', 'expense tracker', '50/30/20 rule'],
    },
    'emergency fund': {
      response: `An **Emergency Fund** is 3-6 months of living expenses saved in a liquid, accessible account.

🛡️ **Why you need it:**
- Job loss / medical emergency
- Unexpected repairs
- Avoid going into debt for emergencies

**How much?**
- Single, low expenses: 3 months
- Family, high expenses: 6 months
- Self-employed: 9-12 months

**Where to keep it:**
- Liquid Mutual Fund (1-day withdrawal)
- High-yield savings account
- NOT in stocks (market could crash when you need it)

**Example:** Monthly expenses ₹40,000 → Emergency Fund = ₹1.2L - ₹2.4L`,
      followUp: ['liquid fund', 'savings goals', 'budgeting'],
    },
    'index fund': {
      response: `An **Index Fund** passively tracks a market index like Nifty 50 or Sensex instead of trying to beat the market.

✅ **Why Index Funds are great for beginners:**
- **Low cost:** 0.1-0.2% expense ratio
- **Diversified:** Instant exposure to top 50/100 companies
- **No fund manager risk**
- **Consistent:** Matches market returns (12-13% historically)

📊 **Popular Index Funds in India:**
- Nifty 50 Index Fund
- Nifty Next 50
- Nifty Midcap 150
- Sensex Index Fund

**Active vs Index:**
Over 15+ years, 85% of active funds underperform the index after fees. That's why index funds often win long-term!`,
      followUp: ['mutual fund', 'expense ratio', 'SIP', 'direct vs regular plan'],
    },
    'side hustle': {
      response: `A **side hustle** is income you earn outside your main job. It builds financial resilience and accelerates wealth creation.

💡 **Popular Side Hustles in India:**
- **Freelancing:** Design, writing, coding (₹500-₹5000/hour)
- **Content Creation:** YouTube, Instagram (₹50K+ monthly possible)
- **Online Teaching:** Udemy, Unacademy, private tutoring
- **Affiliate Marketing:** Earn commissions promoting products
- **Selling Digital Products:** Courses, templates, ebooks

**Getting Started:**
1. Pick something you're already good at
2. Start with 1-2 hours/day
3. Build a portfolio or social presence
4. Price confidently from Day 1

Track all side income in our **Side Hustle Tracker** section!`,
      followUp: ['income tracking', 'tax on freelance income', 'investing side income'],
    },
    'agentic ai budgeting': {
      response: `**Agentic AI budgeting** means using a finance co-pilot that can monitor spending patterns, suggest actions, and help you keep your budget on track.

**Useful examples:**
- Auto-categorize card, UPI, and bank transactions
- Find spending leaks like subscriptions and food delivery spikes
- Warn you before you cross a category limit
- Suggest safe savings transfers after bills are covered

**Safety rule:** Keep approvals manual for payments, transfers, and investments. Let AI recommend, but you confirm money movement.`,
      followUp: ['AI fraud prevention', 'AI wealth management', 'budgeting', 'emergency fund'],
    },
    'ai fraud prevention': {
      response: `**AI fraud prevention** uses pattern detection to flag suspicious transactions or scam signals faster than manual checking.

**What AI can spot:**
- Unusual card usage, location, or merchant type
- Many small UPI transfers in a short time
- Fake KYC, refund, parcel, or loan messages
- Spending that does not match your normal behavior

**Never share:** OTP, UPI PIN, card PIN, net banking password, or full card details with any AI tool. Use AI as an alert layer, not as a place to reveal secrets.`,
      followUp: ['credit card fraud', 'UPI fraud', 'CIBIL score', 'credit card'],
    },
    'ai wealth management': {
      response: `**AI wealth management** uses a digital co-pilot to personalize planning around your income, goals, risk, taxes, and investments.

**It can help with:**
- Matching SIPs to goals
- Finding fund overlap and high expense ratios
- Suggesting portfolio rebalancing reminders
- Explaining risk before you invest

**Important:** Personalized investment recommendations can be regulated advice. Use AI to learn and prepare questions, and consult a qualified advisor for exact investment decisions.`,
      followUp: ['SIP', 'expense ratio', 'index fund', 'mutual fund'],
    },
    'hello': {
      response: `Hi there! 👋 I'm **FinAI**, your personal finance mentor. I'm here to help you understand money in simple terms.

I can help you with:
- 💳 **Credit Cards** — how they work, CIBIL score, best practices
- 📈 **Mutual Funds & SIP** — how to start investing
- 💸 **Debt Payoff** — become debt-free faster
- 💰 **Budgeting** — manage your money better
- 🚀 **Side Hustles** — grow your income

What would you like to learn today?`,
      followUp: ['credit card', 'SIP', 'budgeting', 'debt snowball'],
    },
    'default': {
      response: `Great question! Here are some things I can help you with:

- **Credit Cards:** Understand CIBIL score, utilization, card types
- **Mutual Funds:** Learn about SIP, NAV, fund types, metrics
- **Debt Payoff:** Snowball vs Avalanche method, payoff planning  
- **Budgeting:** 50/30/20 rule, tracking expenses
- **Side Hustles:** Income tracking and growth strategies
- **AI Finance:** Agentic AI budgeting, fraud prevention, wealth co-pilots

Try typing something like: *"What is SIP?"*, *"How to improve CIBIL score?"*, or *"agentic AI budgeting"*`,
      followUp: ['credit card', 'SIP', 'agentic AI budgeting', 'AI fraud prevention'],
    },
  };

  function findResponse(query) {
    const q = query.toLowerCase();
    const keys = Object.keys(knowledgeBase);
    const matched = keys.find(key => q.includes(key.toLowerCase()));
    return knowledgeBase[matched] || knowledgeBase['default'];
  }

  function addMessage(text, isUser = false) {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;

    const msg = document.createElement('div');
    msg.className = `message ${isUser ? 'user' : 'ai'}`;

    const initials = isUser ? 'U' : 'AI';
    const avatarBg = isUser ? '' : '';

    msg.innerHTML = `
      <div class="message-avatar">${initials}</div>
      <div class="message-bubble">${formatMarkdown(text)}</div>
    `;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/- (.*)/g, '• $1<br>');
  }

  function showTyping() {
    const messages = document.getElementById('chatMessages');
    if (!messages) return null;

    const typing = document.createElement('div');
    typing.className = 'message ai';
    typing.id = 'typingIndicator';
    typing.innerHTML = `
      <div class="message-avatar">AI</div>
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  }

  function updateSuggestions(chips) {
    const container = document.getElementById('chatSuggestions');
    if (!container) return;
    container.innerHTML = chips.map(chip => `
      <button class="suggestion-chip" onclick="window.chatSend('${chip}')">${chip}</button>
    `).join('');
  }

  function processQuery(query) {
    if (!query.trim()) return;

    addMessage(query, true);

    const typing = showTyping();

    // Simulate AI thinking delay
    const delay = 800 + Math.random() * 600;

    setTimeout(() => {
      typing?.remove();
      const result = findResponse(query);
      addMessage(result.response, false);
      updateSuggestions(result.followUp || []);
    }, delay);
  }

  // ── Public API ────────────────────────────
  window.chatSend = function (msg) {
    const input = document.getElementById('chatInput');
    if (input) input.value = '';
    processQuery(msg);
  };

  function initChat() {
    const sendBtn = document.getElementById('chatSendBtn');
    const input = document.getElementById('chatInput');

    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        const msg = input?.value?.trim();
        if (msg) processQuery(msg);
        if (input) input.value = '';
      });
    }

    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const msg = input.value.trim();
          if (msg) processQuery(msg);
          input.value = '';
        }
      });
    }

    // Welcome message
    setTimeout(() => {
      processQuery('hello');
    }, 500);
  }

  document.addEventListener('DOMContentLoaded', initChat);

})();
