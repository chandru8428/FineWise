/**
 * SIP Engine
 * Core mathematical functions for the Premium SIP Calculator
 */

window.SIPEngine = {
  // Core Step-Up SIP Calculation
  calculateStepUpSIP(monthly, stepUpPct, rate, years) {
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    const annualStepUp = stepUpPct / 100;
    
    let currentMonthly = monthly;
    let totalInvested = 0;
    let corpus = 0;
    
    const monthlyData = [];
    const yearlyData = [];
    
    let yearInvested = 0;
    let yearStartCorpus = 0;

    for (let m = 1; m <= months; m++) {
      totalInvested += currentMonthly;
      yearInvested += currentMonthly;
      
      // Add contribution and compound
      corpus = (corpus + currentMonthly) * (1 + monthlyRate);
      
      monthlyData.push({
        month: m,
        contribution: currentMonthly,
        invested: totalInvested,
        corpus: corpus,
        gains: corpus - totalInvested
      });

      // Step up at the end of every 12 months
      if (m % 12 === 0) {
        const year = m / 12;
        yearlyData.push({
          year: year,
          invested: totalInvested,
          corpus: corpus,
          gains: corpus - totalInvested,
          annualContribution: yearInvested,
          yearGains: corpus - yearStartCorpus - yearInvested
        });
        
        currentMonthly = currentMonthly * (1 + annualStepUp);
        yearInvested = 0;
        yearStartCorpus = corpus;
      }
    }

    return { totalInvested, corpus, gains: corpus - totalInvested, monthlyData, yearlyData };
  },

  // Calculate Inflation Adjusted Value
  calculateInflationAdjusted(futureValue, inflationRate, years) {
    const rate = inflationRate / 100;
    return futureValue / Math.pow(1 + rate, years);
  },

  // Milestones Calculation (Time to reach targets)
  calculateMilestones(monthly, stepUpPct, rate) {
    const targets = [100000, 500000, 1000000, 5000000, 10000000, 50000000]; // 1L, 5L, 10L, 50L, 1Cr, 5Cr
    const results = [];
    
    let currentMonthly = monthly;
    let corpus = 0;
    let totalInvested = 0;
    const monthlyRate = rate / 100 / 12;
    const annualStepUp = stepUpPct / 100;
    
    let m = 1;
    let targetIndex = 0;

    // Cap at 50 years to prevent infinite loops
    while (targetIndex < targets.length && m <= 600) {
      totalInvested += currentMonthly;
      corpus = (corpus + currentMonthly) * (1 + monthlyRate);

      if (corpus >= targets[targetIndex]) {
        results.push({
          target: targets[targetIndex],
          months: m,
          years: (m / 12).toFixed(1),
          invested: totalInvested
        });
        targetIndex++;
      }

      if (m % 12 === 0) {
        currentMonthly = currentMonthly * (1 + annualStepUp);
      }
      m++;
    }
    
    return results;
  },

  // Compare SIP vs FD vs Gold vs PPF
  calculateComparisons(monthly, years) {
    const months = years * 12;
    const totalInvested = monthly * months;

    // Rates
    const sipRate = 12 / 100 / 12; // Equity mutual fund average 12%
    const fdRate = 7 / 100 / 12;   // Bank FD ~7%
    const goldRate = 9 / 100 / 12; // Gold historical ~9%
    const ppfRate = 7.1 / 100 / 12; // PPF fixed 7.1%

    const calcCorpus = (r) => monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);

    return [
      { name: 'Equity Mutual Fund (SIP)', rate: '12%', corpus: calcCorpus(sipRate), color: '#00D4AA' },
      { name: 'Gold', rate: '9%', corpus: calcCorpus(goldRate), color: '#F59E0B' },
      { name: 'Public Provident Fund (PPF)', rate: '7.1%', corpus: calcCorpus(ppfRate), color: '#3B82F6' },
      { name: 'Fixed Deposit (FD)', rate: '7%', corpus: calcCorpus(fdRate), color: '#64748B' }
    ];
  },

  // Planners

  // 1. Goal Planner: Required SIP to reach target
  calculateRequiredSIP(targetAmount, rate, years) {
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    const requiredSIP = targetAmount * monthlyRate / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));
    return requiredSIP;
  },

  // 2. Retirement Planner
  calculateRetirementSIP(currentAge, retireAge, lifeExpectancy, currentMonthlyExpense, inflationPre, inflationPost, preRetirementReturn, postRetirementReturn) {
    const yearsToRetire = retireAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retireAge;
    
    if (yearsToRetire <= 0 || yearsInRetirement <= 0) return null;

    // 1. Calculate future expenses at retirement
    const futureMonthlyExpense = currentMonthlyExpense * Math.pow(1 + (inflationPre / 100), yearsToRetire);
    const futureAnnualExpense = futureMonthlyExpense * 12;

    // 2. Calculate corpus required at retirement
    const realReturn = (1 + (postRetirementReturn / 100)) / (1 + (inflationPost / 100)) - 1;
    let requiredCorpus = 0;
    if (realReturn === 0) {
      requiredCorpus = futureAnnualExpense * yearsInRetirement;
    } else {
      requiredCorpus = futureAnnualExpense * (1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn;
    }

    // 3. Calculate required SIP today
    const requiredSIP = this.calculateRequiredSIP(requiredCorpus, preRetirementReturn, yearsToRetire);

    return {
      yearsToRetire,
      futureMonthlyExpense,
      requiredCorpus,
      requiredSIP
    };
  },

  // 3. Child Education Planner
  calculateEducationSIP(childAge, collegeAge, currentCost, inflation, returnRate) {
    const yearsLeft = collegeAge - childAge;
    if (yearsLeft <= 0) return null;

    const futureCost = currentCost * Math.pow(1 + (inflation / 100), yearsLeft);
    const requiredSIP = this.calculateRequiredSIP(futureCost, returnRate, yearsLeft);

    return { yearsLeft, futureCost, requiredSIP };
  },

  // 4. House Downpayment Planner
  calculateHouseSIP(houseCost, downpaymentPct, years, inflation, returnRate) {
    const futureHouseCost = houseCost * Math.pow(1 + (inflation / 100), years);
    const requiredDownpayment = futureHouseCost * (downpaymentPct / 100);
    const requiredSIP = this.calculateRequiredSIP(requiredDownpayment, returnRate, years);

    return { futureHouseCost, requiredDownpayment, requiredSIP };
  },

  // System Withdrawal Plan (SWP)
  calculateSWP(corpus, withdrawalMonthly, rate, years) {
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    
    let currentCorpus = corpus;
    let totalWithdrawn = 0;
    const yearlyData = [];

    for (let m = 1; m <= months; m++) {
      // Add interest for the month
      const interest = currentCorpus * monthlyRate;
      currentCorpus += interest;
      
      // Withdraw
      if (currentCorpus >= withdrawalMonthly) {
        currentCorpus -= withdrawalMonthly;
        totalWithdrawn += withdrawalMonthly;
      } else {
        totalWithdrawn += currentCorpus;
        currentCorpus = 0;
        break; // Corpus depleted
      }

      if (m % 12 === 0) {
        yearlyData.push({
          year: m / 12,
          balance: currentCorpus,
          withdrawn: totalWithdrawn
        });
      }
    }

    return { finalBalance: currentCorpus, totalWithdrawn, depleted: currentCorpus === 0, yearlyData };
  }
};
