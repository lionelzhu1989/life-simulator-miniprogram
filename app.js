App({
  globalData: {
    player: {
      age: 18,
      money: 10000,
      salary: 0,
      health: 100,
      mood: 80,
      IQ: 100,
      EQ: 80,
      job: null,
      stocks: [],
      houses: [],
      spouse: null,
      children: []
    }
  },
  onLaunch() {
    var save = wx.getStorageSync('game_save');
    if (save) {
      this.globalData.player = save;
    } else {
      this.showComplianceTip();
    }
  },
  saveGame() {
    wx.setStorageSync('game_save', this.globalData.player);
  },
  resetGame() {
    this.globalData.player = {
      age: 18,
      money: 10000,
      salary: 0,
      health: 100,
      mood: 80,
      IQ: 100,
      EQ: 80,
      job: null,
      stocks: [],
      houses: [],
      spouse: null,
      children: []
    };
    this.saveGame();
  },
  showComplianceTip() {
    wx.showModal({
      title: '合规提示',
      content: '本游戏为虚拟人生模拟，所有股票、房产、金融数据均为虚拟数值，不构成任何现实投资建议。',
      showCancel: false,
      confirmText: '我知道了'
    });
  }
});
