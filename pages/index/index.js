var app = getApp();
var engine = require('../../utils/gameEngine');
var nextYear = engine.nextYear;
var getTotalAsset = engine.getTotalAsset;

Page({
  data: {
    player: {},
    totalAsset: 0,
    showEvent: false,
    currentEvent: null,
    eventTitle: ''
  },
  onShow: function () {
    this.refreshData();
  },
  refreshData: function () {
    var player = app.globalData.player;
    this.setData({
      player: player,
      totalAsset: getTotalAsset(player).toLocaleString()
    });
  },
  handleNextYear: function () {
    if (this.data.player.health <= 0) {
      wx.showModal({
        title: '人生结束',
        content: '健康值归零，本次人生已结束，可重开开启新人生',
        showCancel: false
      });
      return;
    }
    var result = nextYear(app.globalData.player);
    app.globalData.player = result.player;
    app.saveGame();
    this.refreshData();
    if (result.event) {
      var title = '📌 日常事件';
      if (result.event.type === 'good') title = '🎉 好事发生';
      if (result.event.type === 'bad') title = '⚠️ 意外事件';
      this.setData({
        showEvent: true,
        currentEvent: result.event,
        eventTitle: title
      });
    }
  },
  closeEvent: function () {
    this.setData({ showEvent: false });
  },
  goFamily: function () {
    wx.navigateTo({ url: '/pages/family/family' });
  },
  goRank: function () {
    wx.navigateTo({ url: '/pages/rank/rank' });
  },
  goAI: function () {
    wx.showModal({
      title: '校招AI匹配',
      content: '跳转至AI岗位匹配系统，为你推荐真实合适的工作',
      success: function (res) {
        if (res.confirm) {
          // 替换为你的校招AI小程序AppID
          wx.navigateToMiniProgram({
            appId: 'wx0000000000000000'
          });
        }
      }
    });
  },
  onShareAppMessage: function () {
    var p = this.data.player;
    return {
      title: '我在人生模拟器里' + p.age + '岁赚了' + this.data.totalAsset + '元，你也来试试！',
      path: '/pages/index/index'
    };
  },
  handleReset: function () {
    wx.showModal({
      title: '确认重开？',
      content: '当前人生进度将被全部清空',
      success: function (res) {
        if (res.confirm) {
          app.resetGame();
          this.refreshData();
        }
      }.bind(this)
    });
  }
});
