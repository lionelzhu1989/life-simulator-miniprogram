var app = getApp();
var config = require('../../utils/gameConfig');
var JOBS = config.JOBS;

Page({
  data: {
    jobs: JOBS,
    currentJobId: null
  },
  onShow: function () {
    this.setData({ currentJobId: app.globalData.player.job ? app.globalData.player.job.id : null });
  },
  applyJob: function (e) {
    var job = e.currentTarget.dataset.job;
    var p = app.globalData.player;
    if (p.IQ < job.requireIQ || p.EQ < job.requireEQ) {
      wx.showToast({ title: '属性不达标', icon: 'none' });
      return;
    }
    app.globalData.player.job = job;
    app.globalData.player.salary = job.salary;
    app.saveGame();
    this.setData({ currentJobId: job.id });
    wx.showToast({ title: '入职成功！', icon: 'success' });
  }
});
