;(function(exports, $) {
  "use strict";

  /**
   * Social Block constructor
   */
  var Block = function(el, arr) {
    this.el = el || this.buildElement();
    this._fb = new exports.NumberFlipper.Flipper(
      this.el,
      arr
    );
  };

  Block.prototype.buildElement = function() {
    return document.createElement('div');
  };

  Block.prototype.getFlipper = function() {
    return this._fb;
  };
  var MultiBlock = function(el, social) {
    this._blocks = [];
    this.el = el;

    var options = {
      cols: 13
    };

    this._columns = MultiBlock.createColumns(options.cols);

    for(var i = 0, j = this._columns.length; i < j; i++) {
      this.populateColumn(this._columns[i]);
    }

    $.when.apply($, social)
      .then(function() {
        var els = [].slice.call(arguments, 0);

        els = MultiBlock.flattenData(els);
        els = MultiBlock.shuffleData(els);

      });

    // for(var i = 0, j = arrs.length; i < j; i++) {
    //   this.addBlock(new Block(null, arrs[i]));
    // }
  };

  MultiBlock.flattenData = function(data, target) {
    var target = target || []; 

    for(var i = 0, j = data.length; i < j; i++) {
      if(data[i] instanceof Array) {
        target.push(MultiBlock.flattenData(data[i], target));
      } else {
        target.push(data[i]);
      }
    }

    return target;
  };

  MultiBlock.shuffleData = function(array) {
    var currentIndex = array.length
      , temporaryValue
      , randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  MultiBlock.settings = {};
  MultiBlock.settings.FLIP_INTERVAL = 3000;

  MultiBlock._API   = {};

  MultiBlock._API.INSTAGRAM           = {};
  MultiBlock._API.INSTAGRAM.CLIENT_ID = "6b9fd306d8c546159b04d1632b42f69e";
  MultiBlock._API.INSTAGRAM.URL       = "https://api.instagram.com/v1/users/{{account_id}}/media/recent/?client_id=" + MultiBlock._API.INSTAGRAM.CLIENT_ID;

  // Static methods

  MultiBlock.createColumns = function(total) {
    var cols = [], col;
    for(var i = 0, j = total; i < j; i++) {
      col = document.createElement('div');
      col.className = 'sw-col';
      cols.push(col);
    }

    return cols;
  };

  MultiBlock.jsonp = function(url, callback) {
    var cbn = "jsonp_callback_" + Date.now();
    url += "&callback=" + cbn;

    window[cbn] = callback;

    var model = document.createElement("script");
    model.src=url;
    document.body.appendChild(model);
  };

  // Prototype
  //
  MultiBlock.prototype.populateColumn = function(col) {
    var maxHeight = 4,
        curHeight = 0,
        rowHeight;

    while(maxHeight < curHeight) {
      rowHeight = Math.ceil(Math.random() * maxHeight - curHeight);
      curHeight += rowHeight;

      this.addBlock(col, colHeight); 
    }
  };

  MultiBlock.prototype.addBlock = function(size) {
    var block = {
      view: document.createElement('sw-block-' + size),
      model: null,
      region: col
    };

    this._blocks.push(block);
    col.appendChild(block.view);
  };

  MultiBlock.prototype.chooseRandomBlock = function() {
    var ind = Math.floor(Math.random() * this._blocks.length);
    return this._blocks[ind];
  };

  MultiBlock.prototype.run = function() {
    var _this = this;
    setInterval(function() {
      _this.chooseRandomBlock()
        .getFlipper()
        .flipToNext();
    }, MultiBlock.settings.FLIP_INTERVAL);
  };

  MultiBlock.Social = function(inst) {
    var $d = $.Deferred();

    return function(options) {
      var URL = inst.getURL(options);

      function formatData(data) {
        var rendered = inst.formatData(data, inst.render);
        $d.resolve(rendered);
      }

      MultiBlock.jsonp(URL, formatData);

      return $d.promise();
    };
  };

  MultiBlock.Social.Instagram = MultiBlock.Social({

    getURL: function(user_id) {
      return MultiBlock._API.INSTAGRAM.URL.replace("{{account_id}}", user_id);
    },

    render: function (data) {
      return "<img src='{{src}}' />".replace("{{src}}", data.images.standard_resolution.url); 
    },

    formatData: function(data, render) {
      var posts = data.data
        , rendered = [];

      for(var i = 0, j = posts.length; i < j; i++) {
        rendered.push(render(posts[i]));
      }

      return rendered;
    }

  });

  exports.SocialBlock = Block;
  exports.SocialBlocks = MultiBlock;

}).call(this, this, jQuery);