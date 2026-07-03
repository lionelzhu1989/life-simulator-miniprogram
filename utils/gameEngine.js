var config = require('./gameConfig');
var EVENTS = config.EVENTS;
var STOCKS = config.STOCKS;
var LOAN_CONFIG = config.LOAN_CONFIG;

// 推进一年：全量年度结算
function nextYear(player) {
  var p = JSON.parse(JSON.stringify(player));

  // 1. 年龄增长
  p.age += 1;

  // 2. 结算本人年薪
  if (p.job) {
    p.money += p.job.salary;
  }

  // 3. 结算配偶薪资与家庭加成
  if (p.spouse) {
    p.money += p.spouse.salary;
    if (p.spouse.healthBonus) p.health = Math.min(100, p.health + p.spouse.healthBonus);
    if (p.spouse.moodBonus) p.mood = Math.min(100, p.mood + p.spouse.moodBonus);
  }

  // 4. 结算房产租金收益
  p.houses.forEach(function (house) {
    p.money += house.rent * 12;
  });

  // 5. 结算房贷年度还款
  p.houses.forEach(function (house) {
    if (house.loan && house.loan.remainingTerm > 0) {
      var annualPayment = house.loan.monthlyPayment * 12;
      if (p.money >= annualPayment) {
        p.money -= annualPayment;
        house.loan.remainingTerm -= 1;
        house.loan.remainingPrincipal = Number(
          (house.loan.remainingPrincipal * (1 + LOAN_CONFIG.annualRate) - annualPayment).toFixed(2)
        );
      } else {
        house.loan.overdueTimes = (house.loan.overdueTimes || 0) + 1;
        p.health = Math.max(0, p.health - 5);
        p.mood = Math.max(0, p.mood - 8);
      }
    }
  });

  // 逾期3次强制拍卖房产
  p.houses = p.houses.filter(function (house) {
    if (house.loan && house.loan.overdueTimes >= 3) {
      p.money += Math.floor(house.buyPrice * 0.7);
      return false;
    }
    return true;
  });

  // 6. 子女年度抚养费
  p.children.forEach(function (child) {
    p.money -= 20000;
    child.age += 1;
  });

  // 7. 属性自然衰减
  p.health = Math.max(0, p.health - 2);
  p.mood = Math.max(0, p.mood - 3);

  // 8. 刷新股票行情
  p.stocks = p.stocks.map(function (stock) {
    var config = STOCKS.find(function (s) { return s.code === stock.code; });
    if (!config) return stock;
    var change = (Math.random() - 0.5) * 2 * config.volatility;
    stock.currentPrice = Number((stock.currentPrice * (1 + change)).toFixed(2));
    return stock;
  });

  // 9. 30%概率触发随机事件
  var currentEvent = null;
  if (Math.random() < 0.3) {
    currentEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    p = applyEvent(p, currentEvent);
  }

  return { player: p, event: currentEvent };
}

// 应用随机事件效果
function applyEvent(player, event) {
  var p = player;
  var eff = event.effect;
  if (eff.money) {
    if (eff.type === 'salary' && p.job) {
      p.money += p.job.salary * eff.money;
    } else {
      p.money += eff.money;
    }
  }
  if (eff.health) p.health = Math.max(0, Math.min(100, p.health + eff.health));
  if (eff.mood) p.mood = Math.max(0, Math.min(100, p.mood + eff.mood));
  if (eff.IQ) p.IQ += eff.IQ;
  if (eff.stockLoss) {
    p.stocks.forEach(function (s) {
      s.currentPrice = Number((s.currentPrice * (1 - eff.stockLoss)).toFixed(2));
    });
  }
  if (eff.houseGain) {
    p.houses.forEach(function (h) {
      h.buyPrice = Math.floor(h.buyPrice * (1 + eff.houseGain));
      if (h.rent) h.rent = Math.floor(h.rent * (1 + eff.houseGain * 0.5));
    });
  }
  return p;
}

// 计算玩家总资产
function getTotalAsset(player) {
  var stockValue = player.stocks.reduce(function (sum, s) { return sum + s.currentPrice * s.amount; }, 0);
  var houseValue = player.houses.reduce(function (sum, h) { return sum + h.buyPrice; }, 0);
  var loanDebt = player.houses.reduce(function (sum, h) {
    return sum + (h.loan ? Math.max(0, h.loan.remainingPrincipal) : 0);
  }, 0);
  return Math.floor(player.money + stockValue + houseValue - loanDebt);
}

module.exports = {
  nextYear: nextYear,
  getTotalAsset: getTotalAsset
};
