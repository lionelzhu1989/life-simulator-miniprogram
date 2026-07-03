var app = getApp();
var config = require('../../utils/gameConfig');
var SPOUSES = config.SPOUSES;

Page({
  data: {
    player: {},
    spouses: SPOUSES
  },
  onShow: function () {
    this.setData({ player: app.globalData.player });
  },
  marry: function (e) {
    var spouse = e.currentTarget.dataset.spouse;
    var player = app.globalData.player;
    if (player.money < 100000) {
      wx.showToast({ title: '结婚需要10万彩礼', icon: 'none' });
      return;
    }
    player.money -= 100000;
    player.spouse = spouse;
    player.mood = Math.min(100, player.mood + 20);
    app.saveGame();
    this.onShow();
    wx.showToast({ title: '结婚成功！', icon: 'success' });
  },
  haveChild: function () {
    var player = app.globalData.player;
    if (!player.spouse) return;
    if (player.children.length >= 3) return;
    if (player.money < 50000) {
      wx.showToast({ title: '生育需要5万元', icon: 'none' });
      return;
    }
    player.money -= 50000;
    player.children.push({ age: 0 });
    player.mood = Math.min(100, player.mood + 10);
    app.saveGame();
    this.onShow();
    wx.showToast({ title: '孩子出生了！', icon: 'success' });
  }
});
