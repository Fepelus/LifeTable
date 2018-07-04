// Datediff
// by Dmitriy Filipenko
// https://github.com/dmfilipenko/datediff
// MIT License
!function(e){function t(e,t){if(!e)throw new Error("Date should be specified");var n=new Date(1970,0,1,0).getTime(),o=new Date,t=t&&t instanceof Date?t:o,s=t-e,i=new Date(n+s),r=i.getFullYear()-1970,u=i.getMonth(),d=i.getDate()-1,a=i.getHours(),f=i.getMinutes(),c=i.getSeconds(),m={years:0,months:0,days:0,hours:0,minutes:0,seconds:0};return 0>r?m:(m.years=r>0?r:0,m.months=u>0?u:0,m.days=d>0?d:0,m.hours=a>0?a:0,m.minutes=f>0?f:0,m.seconds=c>0?c:0,m)}"function"==typeof define&&define.amd?define(function(){return t}):"object"==typeof module&&module.exports?module.exports=t:e.datediff=t}(this);


(function(root, mod) {
  if (typeof exports == "object" && typeof module == "object") return mod(exports); // CommonJS
  if (typeof define == "function" && define.amd) return define(["exports"], mod); // AMD
  mod(root.lifetable || (root.lifetable = {})); // Plain browser env
})(this, function(exports) {
  "use strict";

  var InputController, BirthdayModel, BirthdayStorage, LifeTable, OutputView, utils;

/*
 * InputController - Builds droplists, watches their changes and changes model
 * BirthdayModel - Source of truth and notifies observers
 * BirthdayStorage - Stores to localstorage on changes to BirthdayModel
 * LifeTable - Source of this birthday's stats
 * OutputView - Renders on changes to BirthdayModel
 */

/** INPUT CONTROLLER **/
  InputController = function (id, model) {
    this.el = document.getElementById(id);
    this.model = model;
    this.buildDropboxes();
    this.attachListener();
    this.notifyModel();
  };

  InputController.prototype.attachListener = function () {
    this.el.addEventListener('change', this.notifyModel.bind(this), false);
  };

  InputController.prototype.getCurrentState = function () {
    return ['day','month','year','sex'].reduce(function (oldval, thiselement) {
      var newval = oldval;
      newval[thiselement] = utils.getSelectedOption(document.getElementById(thiselement));
      return newval;
    }, {});
  };

  InputController.prototype.notifyModel = function (e) {
    this.model.setState(this.getCurrentState());
  };

  InputController.prototype.buildDropboxes = function () {
    [
      this.buildSelectDay(),
      this.buildSelectMonth(),
      this.buildSelectYear(),
      this.buildSelectSex()
    ].forEach((function(selectBox) {
      this.el.appendChild(selectBox);
    }).bind(this));
  };

  InputController.prototype.buildSelectDay = function () {
    var content = {}, i;
    for (i = 1; i <= 31; i++) {
      content["" + i] = "" + i;
    };
    return utils.buildSelectBox("day", content);
  };

  InputController.prototype.buildSelectMonth = function () {
    var content = {
      "1": "Jan", "2": "Feb", "3": "Mar",
      "4": "Apr", "5": "May", "6": "Jun",
      "7": "Jul", "8": "Aug", "9": "Sep",
      "10": "Oct", "11": "Nov", "12": "Dec"
    };
    return utils.buildSelectBox("month", content);
  };

  InputController.prototype.buildSelectYear = function () {
    var content = {}, i, now = new Date();
    for (i = now.getFullYear() - 99; i <= now.getFullYear(); i++) {
      content["" + i] = "" + i;
    };
    return utils.buildSelectBox("year", content);
  };

  InputController.prototype.buildSelectSex = function () {
    var content = {
      "male": "Male", "female": "Female"
    };
    return utils.buildSelectBox("sex", content);
  };

  InputController.prototype.setSelected = function (new_state) {
    Object.getOwnPropertyNames(new_state).forEach(function (key) {
      utils.setSelectTo(key, new_state[key]);
    }.bind(this));
    this.notifyModel();
  };

/** BIRTHDAY MODEL **/
  BirthdayModel = function () {
    this.observers = [];
  };

  BirthdayModel.prototype.addObserver = function (observer) {
    this.observers.push(observer);
  };

  BirthdayModel.prototype.setState = function (state) {
    this.state = state;
    this.age = this.getAge();
    this.stats = LifeTable.getStats(this.state.sex, this.age);
    this.notifyObservers();
  };

  BirthdayModel.prototype.getAge = function () {
    var birth = new Date(this.state.year, this.state.month-1, this.state.day),
        now = new Date(),
        diff = datediff(birth, now);
    return diff.years;
  };

  BirthdayModel.prototype.notifyObservers = function () {
    this.observers.forEach(function (observer) {
      observer.notify(this.state, this.age, this.stats);
    }.bind(this));
  };

/** BIRTHDAY STORAGE **/
  BirthdayStorage = function () {
    this.key = 'LifeTable';
  };

  BirthdayStorage.prototype.getBirthday = function () {
    var output = JSON.parse(localStorage.getItem(this.key)) || { "year": "1990" };
    return output;
  };

  BirthdayStorage.prototype.notify = function (state) {
    localStorage.setItem(this.key,JSON.stringify(state));
  };

/** LIFETABLE **/
  LifeTable = (function () {

    var thetable, years_left, chance_of_death_in_next_years;

    thetable = {"male":{0:{"qx":0.00357,"ex":80.4},
      1:{"qx":0.00029,"ex":79.7}, 2:{"qx":0.00016,"ex":78.8},
      3:{"qx":0.00014,"ex":77.8}, 4:{"qx":0.00012,"ex":76.8},
      5:{"qx":0.00011,"ex":75.8}, 6:{"qx":0.00010,"ex":74.8},
      7:{"qx":0.00009,"ex":73.8}, 8:{"qx":0.00008,"ex":72.8},
      9:{"qx":0.00008,"ex":71.8}, 10:{"qx":0.00008,"ex":70.8},
      11:{"qx":0.00009,"ex":69.8}, 12:{"qx":0.00010,"ex":68.8},
      13:{"qx":0.00012,"ex":67.8}, 14:{"qx":0.00016,"ex":66.9},
      15:{"qx":0.00022,"ex":65.9}, 16:{"qx":0.00030,"ex":64.9},
      17:{"qx":0.00038,"ex":63.9}, 18:{"qx":0.00045,"ex":62.9},
      19:{"qx":0.00052,"ex":61.9}, 20:{"qx":0.00056,"ex":61.0},
      21:{"qx":0.00059,"ex":60.0}, 22:{"qx":0.00061,"ex":59.0},
      23:{"qx":0.00063,"ex":58.1}, 24:{"qx":0.00064,"ex":57.1},
      25:{"qx":0.00065,"ex":56.2}, 26:{"qx":0.00066,"ex":55.2},
      27:{"qx":0.00068,"ex":54.2}, 28:{"qx":0.00070,"ex":53.3},
      29:{"qx":0.00073,"ex":52.3}, 30:{"qx":0.00077,"ex":51.3},
      31:{"qx":0.00082,"ex":50.4}, 32:{"qx":0.00087,"ex":49.4},
      33:{"qx":0.00093,"ex":48.5}, 34:{"qx":0.00099,"ex":47.5},
      35:{"qx":0.00105,"ex":46.6}, 36:{"qx":0.00111,"ex":45.6},
      37:{"qx":0.00117,"ex":44.7}, 38:{"qx":0.00124,"ex":43.7},
      39:{"qx":0.00132,"ex":42.8}, 40:{"qx":0.00142,"ex":41.8},
      41:{"qx":0.00154,"ex":40.9}, 42:{"qx":0.00165,"ex":39.9},
      43:{"qx":0.00176,"ex":39.0}, 44:{"qx":0.00187,"ex":38.1},
      45:{"qx":0.00199,"ex":37.1}, 46:{"qx":0.00215,"ex":36.2},
      47:{"qx":0.00233,"ex":35.3}, 48:{"qx":0.00254,"ex":34.4},
      49:{"qx":0.00275,"ex":33.5}, 50:{"qx":0.00298,"ex":32.5},
      51:{"qx":0.00322,"ex":31.6}, 52:{"qx":0.00348,"ex":30.7},
      53:{"qx":0.00379,"ex":29.8}, 54:{"qx":0.00412,"ex":29.0},
      55:{"qx":0.00448,"ex":28.1}, 56:{"qx":0.00486,"ex":27.2},
      57:{"qx":0.00527,"ex":26.3}, 58:{"qx":0.00572,"ex":25.5},
      59:{"qx":0.00621,"ex":24.6}, 60:{"qx":0.00675,"ex":23.8},
      61:{"qx":0.00731,"ex":22.9}, 62:{"qx":0.00790,"ex":22.1},
      63:{"qx":0.00855,"ex":21.3}, 64:{"qx":0.00928,"ex":20.4},
      65:{"qx":0.01009,"ex":19.6}, 66:{"qx":0.01099,"ex":18.8},
      67:{"qx":0.01204,"ex":18.0}, 68:{"qx":0.01326,"ex":17.2},
      69:{"qx":0.01461,"ex":16.5}, 70:{"qx":0.01613,"ex":15.7},
      71:{"qx":0.01783,"ex":14.9}, 72:{"qx":0.01976,"ex":14.2},
      73:{"qx":0.02194,"ex":13.5}, 74:{"qx":0.02440,"ex":12.8},
      75:{"qx":0.02716,"ex":12.1}, 76:{"qx":0.03027,"ex":11.4},
      77:{"qx":0.03380,"ex":10.7}, 78:{"qx":0.03782,"ex":10.1},
      79:{"qx":0.04249,"ex":9.5}, 80:{"qx":0.04793,"ex":8.9},
      81:{"qx":0.05414,"ex":8.3}, 82:{"qx":0.06113,"ex":7.7},
      83:{"qx":0.06899,"ex":7.2}, 84:{"qx":0.07794,"ex":6.7},
      85:{"qx":0.08804,"ex":6.2}, 86:{"qx":0.09934,"ex":5.8},
      87:{"qx":0.11163,"ex":5.4}, 88:{"qx":0.12493,"ex":5.0},
      89:{"qx":0.13924,"ex":4.6}, 90:{"qx":0.15455,"ex":4.3},
      91:{"qx":0.17091,"ex":4.0}, 92:{"qx":0.18813,"ex":3.7},
      93:{"qx":0.20571,"ex":3.5}, 94:{"qx":0.22330,"ex":3.2},
      95:{"qx":0.23890,"ex":3.0}, 96:{"qx":0.25527,"ex":2.8},
      97:{"qx":0.27430,"ex":2.6}, 98:{"qx":0.29584,"ex":2.5},
      99:{"qx":0.31995,"ex":2.3}, 100:{"qx":0.34389,"ex":2.1}},
      "female":{0:{"qx":0.00330,"ex":84.6}, 1:{"qx":0.00022,"ex":83.8},
      2:{"qx":0.00013,"ex":82.9}, 3:{"qx":0.00011,"ex":81.9},
      4:{"qx":0.00010,"ex":80.9}, 5:{"qx":0.00009,"ex":79.9},
      6:{"qx":0.00008,"ex":78.9}, 7:{"qx":0.00007,"ex":77.9},
      8:{"qx":0.00007,"ex":76.9}, 9:{"qx":0.00007,"ex":75.9},
      10:{"qx":0.00007,"ex":74.9}, 11:{"qx":0.00008,"ex":73.9},
      12:{"qx":0.00009,"ex":72.9}, 13:{"qx":0.00010,"ex":71.9},
      14:{"qx":0.00013,"ex":70.9}, 15:{"qx":0.00015,"ex":70.0},
      16:{"qx":0.00018,"ex":69.0}, 17:{"qx":0.00020,"ex":68.0},
      18:{"qx":0.00021,"ex":67.0}, 19:{"qx":0.00022,"ex":66.0},
      20:{"qx":0.00023,"ex":65.0}, 21:{"qx":0.00023,"ex":64.0},
      22:{"qx":0.00024,"ex":63.0}, 23:{"qx":0.00025,"ex":62.1},
      24:{"qx":0.00026,"ex":61.1}, 25:{"qx":0.00027,"ex":60.1},
      26:{"qx":0.00028,"ex":59.1}, 27:{"qx":0.00029,"ex":58.1},
      28:{"qx":0.00031,"ex":57.1}, 29:{"qx":0.00033,"ex":56.2},
      30:{"qx":0.00036,"ex":55.2}, 31:{"qx":0.00039,"ex":54.2},
      32:{"qx":0.00043,"ex":53.2}, 33:{"qx":0.00046,"ex":52.2},
      34:{"qx":0.00050,"ex":51.3}, 35:{"qx":0.00054,"ex":50.3},
      36:{"qx":0.00058,"ex":49.3}, 37:{"qx":0.00062,"ex":48.3},
      38:{"qx":0.00067,"ex":47.4}, 39:{"qx":0.00072,"ex":46.4},
      40:{"qx":0.00078,"ex":45.4}, 41:{"qx":0.00085,"ex":44.5},
      42:{"qx":0.00093,"ex":43.5}, 43:{"qx":0.00102,"ex":42.6},
      44:{"qx":0.00111,"ex":41.6}, 45:{"qx":0.00121,"ex":40.6},
      46:{"qx":0.00131,"ex":39.7}, 47:{"qx":0.00142,"ex":38.7},
      48:{"qx":0.00153,"ex":37.8}, 49:{"qx":0.00166,"ex":36.9},
      50:{"qx":0.00180,"ex":35.9}, 51:{"qx":0.00196,"ex":35.0},
      52:{"qx":0.00214,"ex":34.0}, 53:{"qx":0.00233,"ex":33.1},
      54:{"qx":0.00252,"ex":32.2}, 55:{"qx":0.00271,"ex":31.3},
      56:{"qx":0.00292,"ex":30.4}, 57:{"qx":0.00315,"ex":29.4},
      58:{"qx":0.00341,"ex":28.5}, 59:{"qx":0.00368,"ex":27.6},
      60:{"qx":0.00398,"ex":26.7}, 61:{"qx":0.00429,"ex":25.8},
      62:{"qx":0.00463,"ex":24.9}, 63:{"qx":0.00502,"ex":24.1},
      64:{"qx":0.00545,"ex":23.2}, 65:{"qx":0.00596,"ex":22.3},
      66:{"qx":0.00658,"ex":21.4}, 67:{"qx":0.00729,"ex":20.6},
      68:{"qx":0.00808,"ex":19.7}, 69:{"qx":0.00896,"ex":18.9},
      70:{"qx":0.00994,"ex":18.0}, 71:{"qx":0.01105,"ex":17.2},
      72:{"qx":0.01230,"ex":16.4}, 73:{"qx":0.01377,"ex":15.6},
      74:{"qx":0.01546,"ex":14.8}, 75:{"qx":0.01739,"ex":14.0},
      76:{"qx":0.01955,"ex":13.3}, 77:{"qx":0.02198,"ex":12.5},
      78:{"qx":0.02477,"ex":11.8}, 79:{"qx":0.02802,"ex":11.1},
      80:{"qx":0.03188,"ex":10.4}, 81:{"qx":0.03644,"ex":9.7},
      82:{"qx":0.04185,"ex":9.1}, 83:{"qx":0.04814,"ex":8.4},
      84:{"qx":0.05538,"ex":7.8}, 85:{"qx":0.06356,"ex":7.3},
      86:{"qx":0.07276,"ex":6.7}, 87:{"qx":0.08320,"ex":6.2},
      88:{"qx":0.09506,"ex":5.7}, 89:{"qx":0.10853,"ex":5.3},
      90:{"qx":0.12362,"ex":4.9}, 91:{"qx":0.14002,"ex":4.5},
      92:{"qx":0.15755,"ex":4.1}, 93:{"qx":0.17622,"ex":3.8},
      94:{"qx":0.19596,"ex":3.5}, 95:{"qx":0.21627,"ex":3.3},
      96:{"qx":0.23736,"ex":3.0}, 97:{"qx":0.25858,"ex":2.8},
      98:{"qx":0.27945,"ex":2.6}, 99:{"qx":0.29929,"ex":2.5},
      100:{"qx":0.31851,"ex":2.3}}};


    years_left = function (sex, age) {
        return thetable[sex][age]["ex"];
    };

    chance_of_death_in_next_years = function (sex,age) {
      return function (next_years) {
        var chance_of_living=1, adjusted_age = age-1, i = next_years;
        for (; i>0; i--) {
          if ((adjusted_age + i) > 100) {
            continue;
          }
          chance_of_living=chance_of_living * (1-thetable[sex][adjusted_age+i]["qx"]);
        }
        return utils.toXDecimalPlaces(1-chance_of_living, 3);
      };
    };

    return {
      getStats: function (sex, age) {
        return {
          years_left: years_left(sex, age),
          chance_of_death_in_next_years: chance_of_death_in_next_years(sex, age)
        };
      }
    };

  }());

/** OUTPUT VIEW **/
  OutputView = function (targetId, templateId) {
    this.el = document.getElementById(targetId);
    this.template = utils.template(document.getElementById(templateId).innerHTML);
  };

  OutputView.prototype.notify = function (state, age, stats) {
    this.render(state, age, stats)
  };

  OutputView.prototype.render = function (state, age, stats) {
    this.el.innerHTML = this.template({
      age: Math.floor(age),
      sex: state.sex,
      life_expectancy_years: Math.floor(stats.years_left),
      life_expectancy_days: Math.floor(stats.years_left * 365),
      life_expectancy_hours: Math.floor(stats.years_left * 365 * 24),
      five_year_chance: stats.chance_of_death_in_next_years(5),
      ten_year_chance: stats.chance_of_death_in_next_years(10),
      twenty_year_chance: stats.chance_of_death_in_next_years(20)
    });
  };

/** UTILS **/
  utils = {
    // getSelectedOption returns the value of the selected option of the given select element
    getSelectedOption: function (selectElement) {
      return selectElement.options[selectElement.options.selectedIndex].value;
    },
    setSelectTo: function (id, value) {
      var option,  i, children = document.getElementById(id).children;
      for (i=0; i < children.length; i++) {
        option = children[i];
        option.selected = (option.value === value);
      };
    },
    buildSelectBox: function (id, content) {
      var output = document.createElement("select");
      output.id = id;
      Object.getOwnPropertyNames(content).forEach(function (val) {
        var option = document.createElement("option");
        option.value = val;
        option.appendChild(document.createTextNode(content[val]));
        output.appendChild(option);
      });
      return output;
    },
    toXDecimalPlaces: function (payload, places) {
        return Math.round((payload) * Math.pow(10,places)) / Math.pow(10,places);
    },
    template: function (a,b) {  // From https://github.com/honza/140medley/
      return function (c,d) {
        return a.replace(
          /#{([^}]*)}/g,
          function (a,f) {
            return Function("x","with(x)return "+f).call(c,d||b||{});
          }
        )
      }
    }
  };

/** EXPORTS **/
  exports.start = function (elements) {
    var model, view, controller, storage, initial_birthday;

    storage = new BirthdayStorage();
    initial_birthday = storage.getBirthday();

    model = new BirthdayModel();
    view = new OutputView(elements.output, elements.output_template);
    model.addObserver(view);
    controller = new InputController(elements.input, model);
    controller.setSelected(initial_birthday);
    model.addObserver(storage);
  }

});
