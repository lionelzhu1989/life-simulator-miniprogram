var app = getApp();
var config = require('../../utils/gameConfig');
var STOCKS = config.STOCKS;

Page({
  data: {
    player: {},
    stocks: []
  },
  onShow: function () {
    var player = app.globalData.player;
    var stocks = STOCKS.map(function (s) {
      var hold = player.stocks.find(function (h) { return h.code === s.code; });
      return Object.assign({}, s, { currentPrice: hold ? hold.currentPrice : s.basePrice });
    });
    this.setData({ player: player, stocks: stocks });
  },
  getHoldAmount: function (code) {
    var hold = app.globalData.player.stocks.find(function (s) { return s.code === code; });
    return hold ? hold.amount : 0;
  },
  buyStock: function (e) {
    var stock = e.currentTarget.dataset.stock;
    var that = this;
    wx.showModal({
      title: '买入 ' + stock.name,
      editable: true,
      placeholderText: '输入买入股数',
      success: function (res) {
        if (res.confirm && res.content) {
          var amount = parseInt(res.content);
          if (isNaN(amount) || amount <= 0) {
            wx.showToast({ title: '请输入有效数量', icon: 'none' });
            return;
          }
          var total = amount * stock.currentPrice;
          var player = app.globalData.player;
          if (total > player.money) {
            wx.showToast({ title: '资金不足', icon: 'none' });
            return;
          }
          player.money -= total;
          var exist = player.stocks.find(function (s) { return s.code === stock.code; });
          if (exist) {
            exist.amount += amount;
          } else {
            player.stocks.push({
              code: stock.code,
              name: stock.name,
              amount: amount,
              currentPrice: stock.currentPrice
            });
          }
          app.saveGame();
          that.onShow();
          wx.showToast({ title: '买入成功', icon: 'success' });
        }
      }
    });
  },
  sellStock: function (e) {
    var stock = e.currentTarget.dataset.stock;
    var hold = app.globalData.player.stocks.find(function (s) { return s.code === stock.code; });
    if (!hold || hold.amount <= 0) {
      wx.showToast({ title: '无持仓', icon: 'none' });
      return;
    }
    var that = this;
    wx.showModal({
      title: '卖出 ' + stock.name,
      editable: true,
      placeholderText: '当前持仓' + hold.amount + '股，输入卖出数量',
      success: function (res) {
        if (res.confirm && res.content) {
          var amount = parseInt(res.content);
          if (isNaN(amount) || amount <= 0) {
            wx.showToast({ title: '请输入有效数量', icon: 'none' });
            return;
          }
          if (amount > hold.amount) {
            wx.showToast({ title: '持仓不足', icon: 'none' });
            return;
          }
          var player = app.globalData.player;
          player.money += amount * stock.currentPrice;
          hold.amount -= amount;
          if (hold.amount <= 0) {
            player.stocks = player.stocks.filter(function (s) { return s.code !== stock.code; });
          }
          app.saveGame();
          that.onShow();
          wx.showToast({ title: '卖出成功', icon: 'success' });
        }
      }
    });
  }
});
