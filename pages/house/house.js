var app = getApp();
var config = require('../../utils/gameConfig');
var HOUSES = config.HOUSES;
var LOAN_CONFIG = config.LOAN_CONFIG;

Page({
  data: {
    player: {},
    houses: HOUSES,
    showLoanModal: false,
    currentHouse: null,
    downPayments: []
  },
  onShow: function () {
    this.setData({ player: app.globalData.player });
  },
  buyFull: function (e) {
    var house = e.currentTarget.dataset.house;
    var player = app.globalData.player;
    if (player.money < house.price) {
      wx.showToast({ title: '资金不足', icon: 'none' });
      return;
    }
    player.money -= house.price;
    player.houses.push({
      id: house.id,
      name: house.name,
      buyPrice: house.price,
      rent: house.rent,
      area: house.area
    });
    app.saveGame();
    this.onShow();
    wx.showToast({ title: '购房成功', icon: 'success' });
  },
  showLoanModal: function (e) {
    var house = e.currentTarget.dataset.house;
    var options = LOAN_CONFIG.downPaymentOptions.map(function (ratio) {
      var downAmount = Math.floor(house.price * ratio);
      var loanAmount = house.price - downAmount;
      var monthlyRate = LOAN_CONFIG.annualRate / 12;
      var termMonths = LOAN_CONFIG.maxTerm * 12;
      var monthlyPayment = Math.floor(
        loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths) /
        (Math.pow(1 + monthlyRate, termMonths) - 1)
      );
      return { ratio: ratio, downAmount: downAmount, monthlyPayment: monthlyPayment, loanAmount: loanAmount };
    });
    this.setData({ showLoanModal: true, currentHouse: house, downPayments: options });
  },
  closeLoanModal: function () {
    this.setData({ showLoanModal: false });
  },
  confirmLoan: function (e) {
    var ratio = e.currentTarget.dataset.ratio;
    var house = this.data.currentHouse;
    var player = app.globalData.player;
    var downAmount = Math.floor(house.price * ratio);
    var loanAmount = house.price - downAmount;
    if (player.money < downAmount) {
      wx.showToast({ title: '首付资金不足', icon: 'none' });
      return;
    }
    var monthlyRate = LOAN_CONFIG.annualRate / 12;
    var termMonths = LOAN_CONFIG.maxTerm * 12;
    var monthlyPayment = Math.floor(
      loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths) /
      (Math.pow(1 + monthlyRate, termMonths) - 1)
    );
    player.money -= downAmount;
    player.houses.push({
      id: house.id,
      name: house.name,
      buyPrice: house.price,
      rent: house.rent,
      area: house.area,
      loan: {
        remainingPrincipal: loanAmount,
        monthlyPayment: monthlyPayment,
        remainingTerm: LOAN_CONFIG.maxTerm,
        overdueTimes: 0
      }
    });
    app.saveGame();
    this.setData({ showLoanModal: false });
    this.onShow();
    wx.showToast({ title: '贷款购房成功', icon: 'success' });
  },
  prepayLoan: function (e) {
    var index = e.currentTarget.dataset.index;
    var house = app.globalData.player.houses[index];
    var player = app.globalData.player;
    var remain = house.loan.remainingPrincipal;
    var that = this;
    wx.showModal({
      title: '提前还款',
      content: '剩余本金' + remain + '元，是否全部结清？',
      success: function (res) {
        if (res.confirm) {
          if (player.money < remain) {
            wx.showToast({ title: '资金不足', icon: 'none' });
            return;
          }
          player.money -= remain;
          house.loan.remainingPrincipal = 0;
          house.loan.remainingTerm = 0;
          app.saveGame();
          that.onShow();
          wx.showToast({ title: '贷款已结清', icon: 'success' });
        }
      }
    });
  },
  sellHouse: function (e) {
    var index = e.currentTarget.dataset.index;
    var house = app.globalData.player.houses[index];
    var player = app.globalData.player;
    var that = this;
    wx.showModal({
      title: '出售房产',
      content: '确认以' + house.buyPrice + '元出售' + house.name + '？',
      success: function (res) {
        if (res.confirm) {
          if (house.loan && house.loan.remainingPrincipal > 0) {
            player.money += house.buyPrice - house.loan.remainingPrincipal;
          } else {
            player.money += house.buyPrice;
          }
          player.houses.splice(index, 1);
          app.saveGame();
          that.onShow();
          wx.showToast({ title: '出售成功', icon: 'success' });
        }
      }
    });
  }
});
