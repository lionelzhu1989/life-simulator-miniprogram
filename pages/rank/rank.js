var app = getApp();
var engine = require('../../utils/gameEngine');
var getTotalAsset = engine.getTotalAsset;

Page({
  data: {
    myAsset: 0,
    myRank: 0,
    rankList: []
  },
  onShow: function () {
    var myAsset = getTotalAsset(app.globalData.player);
    var mockRank = [
      { name: '张同学', asset: 98000000 },
      { name: '李学姐', asset: 65000000 },
      { name: '王学长', asset: 42000000 },
      { name: '赵同学', asset: 28000000 },
      { name: '孙同学', asset: 15000000 },
      { name: '周同学', asset: 8000000 },
      { name: '吴同学', asset: 3000000 },
      { name: '郑同学', asset: 1200000 }
    ];
    var allList = mockRank.concat([{ name: '我', asset: myAsset, isMe: true }]);
    allList.sort(function (a, b) { return b.asset - a.asset; });
    var myRank = allList.findIndex(function (item) { return item.isMe; }) + 1;
    var displayList = allList.slice(0, 10).map(function (item) {
      return { name: item.name, asset: item.asset.toLocaleString(), isMe: item.isMe };
    });
    this.setData({
      myAsset: myAsset.toLocaleString(),
      myRank: myRank,
      rankList: displayList
    });
  },
  onShareAppMessage: function () {
    return {
      title: '我在校园财富榜排第' + this.data.myRank + '名，你来挑战一下？',
      path: '/pages/index/index'
    };
  }
});
