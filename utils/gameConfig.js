// 职业配置
var JOBS = [
  { id: 'intern', name: '实习生', salary: 36000, requireIQ: 0, requireEQ: 0 },
  { id: 'programmer', name: '初级程序员', salary: 120000, requireIQ: 110, requireEQ: 70 },
  { id: 'market', name: '市场专员', salary: 80000, requireIQ: 90, requireEQ: 100 },
  { id: 'finance', name: '金融分析师', salary: 150000, requireIQ: 120, requireEQ: 90 },
  { id: 'manager', name: '部门经理', salary: 250000, requireIQ: 115, requireEQ: 110 }
];

// 股票配置
var STOCKS = [
  { code: 'TECH001', name: '互联网科技', basePrice: 100, volatility: 0.3 },
  { code: 'HOUSE001', name: '地产龙头', basePrice: 50, volatility: 0.2 },
  { code: 'BANK001', name: '国有银行', basePrice: 30, volatility: 0.08 },
  { code: 'MED001', name: '医药生物', basePrice: 80, volatility: 0.25 }
];

// 房产配置
var HOUSES = [
  { id: 'old', name: '老破小', price: 500000, rent: 1500, area: 50 },
  { id: 'normal', name: '刚需住宅', price: 1500000, rent: 3500, area: 90 },
  { id: 'school', name: '学区房', price: 3000000, rent: 5000, area: 80 },
  { id: 'villa', name: '别墅', price: 8000000, rent: 12000, area: 200 }
];

// 贷款配置
var LOAN_CONFIG = {
  annualRate: 0.045,
  maxTerm: 30,
  downPaymentOptions: [0.3, 0.5, 0.7]
};

// 配偶配置
var SPOUSES = [
  { id: 'teacher', name: '教师', salary: 80000, EQ: 100, moodBonus: 5 },
  { id: 'doctor', name: '医生', salary: 180000, IQ: 110, healthBonus: 3 },
  { id: 'designer', name: '设计师', salary: 120000, EQ: 105, moodBonus: 8 },
  { id: 'civil', name: '公务员', salary: 100000, EQ: 95, stability: true }
];

// 随机事件库
var EVENTS = [
  { id: 1, text: '公司发年终奖，多拿了2个月工资', effect: { money: 2, type: 'salary' }, type: 'good' },
  { id: 2, text: '生病住院，花费10000元医疗费', effect: { money: -10000, health: -10 }, type: 'bad' },
  { id: 3, text: '买彩票中了5000元小奖', effect: { money: 5000 }, type: 'good' },
  { id: 4, text: '利用业余时间充电学习，智商+5', effect: { IQ: 5, mood: -5 }, type: 'neutral' },
  { id: 5, text: '股市震荡，持仓整体亏损20%', effect: { stockLoss: 0.2 }, type: 'bad' },
  { id: 6, text: '楼市利好，所有房产增值10%', effect: { houseGain: 0.1 }, type: 'good' },
  { id: 7, text: '朋友聚会放松，心情+10', effect: { mood: 10, money: -500 }, type: 'neutral' },
  { id: 8, text: '坚持健身锻炼，健康+8', effect: { health: 8 }, type: 'neutral' }
];

module.exports = {
  JOBS: JOBS,
  STOCKS: STOCKS,
  HOUSES: HOUSES,
  LOAN_CONFIG: LOAN_CONFIG,
  SPOUSES: SPOUSES,
  EVENTS: EVENTS
};
