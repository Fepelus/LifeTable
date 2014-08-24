// Datediff
!function(e){function t(e,t){if(!e)throw new Error("Date should be specified");var n=new Date(1970,0,1,0).getTime(),o=new Date,t=t&&t instanceof Date?t:o,s=t-e,i=new Date(n+s),r=i.getFullYear()-1970,u=i.getMonth(),d=i.getDate()-1,a=i.getHours(),f=i.getMinutes(),c=i.getSeconds(),m={years:0,months:0,days:0,hours:0,minutes:0,seconds:0};return 0>r?m:(m.years=r>0?r:0,m.months=u>0?u:0,m.days=d>0?d:0,m.hours=a>0?a:0,m.minutes=f>0?f:0,m.seconds=c>0?c:0,m)}"function"==typeof define&&define.amd?define(function(){return t}):"object"==typeof module&&module.exports?module.exports=t:e.datediff=t}(this);


// LifeTable app
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

    thetable = {"male":{0:{"qx":0.00497,"ex":79.5}, 1:{"qx":0.0004,"ex":78.9},
      2:{"qx":0.00022,"ex":77.9}, 3:{"qx":0.00016,"ex":77}, 4:{"qx":0.00013,"ex":76},
      5:{"qx":0.00012,"ex":75}, 6:{"qx":0.00011,"ex":74}, 7:{"qx":0.0001,"ex":73},
      8:{"qx":0.0001,"ex":72}, 9:{"qx":0.00009,"ex":71}, 10:{"qx":0.00009,"ex":70},
      11:{"qx":0.0001,"ex":69}, 12:{"qx":0.0001,"ex":68}, 13:{"qx":0.00013,"ex":67},
      14:{"qx":0.00018,"ex":66}, 15:{"qx":0.00027,"ex":65.1}, 16:{"qx":0.00038,"ex":64.1},
      17:{"qx":0.00048,"ex":63.1}, 18:{"qx":0.00056,"ex":62.1}, 19:{"qx":0.00061,"ex":61.2},
      20:{"qx":0.00063,"ex":60.2}, 21:{"qx":0.00063,"ex":59.2}, 22:{"qx":0.00063,"ex":58.3},
      23:{"qx":0.00064,"ex":57.3}, 24:{"qx":0.00066,"ex":56.3}, 25:{"qx":0.00068,"ex":55.4},
      26:{"qx":0.00071,"ex":54.4}, 27:{"qx":0.00073,"ex":53.5}, 28:{"qx":0.00075,"ex":52.5},
      29:{"qx":0.00078,"ex":51.5}, 30:{"qx":0.00081,"ex":50.6}, 31:{"qx":0.00085,"ex":49.6},
      32:{"qx":0.00089,"ex":48.7}, 33:{"qx":0.00093,"ex":47.7}, 34:{"qx":0.00097,"ex":46.7},
      35:{"qx":0.00101,"ex":45.8}, 36:{"qx":0.00106,"ex":44.8}, 37:{"qx":0.00111,"ex":43.9},
      38:{"qx":0.00118,"ex":42.9}, 39:{"qx":0.00125,"ex":42}, 40:{"qx":0.00134,"ex":41},
      41:{"qx":0.00144,"ex":40.1}, 42:{"qx":0.00155,"ex":39.1}, 43:{"qx":0.00168,"ex":38.2},
      44:{"qx":0.00183,"ex":37.3}, 45:{"qx":0.00199,"ex":36.3}, 46:{"qx":0.00218,"ex":35.4},
      47:{"qx":0.00239,"ex":34.5}, 48:{"qx":0.00261,"ex":33.6}, 49:{"qx":0.00286,"ex":32.7},
      50:{"qx":0.00312,"ex":31.7}, 51:{"qx":0.0034,"ex":30.8}, 52:{"qx":0.0037,"ex":29.9},
      53:{"qx":0.00401,"ex":29.1}, 54:{"qx":0.00434,"ex":28.2}, 55:{"qx":0.00469,"ex":27.3},
      56:{"qx":0.00505,"ex":26.4}, 57:{"qx":0.00544,"ex":25.5}, 58:{"qx":0.00588,"ex":24.7},
      59:{"qx":0.00638,"ex":23.8}, 60:{"qx":0.00695,"ex":23}, 61:{"qx":0.00759,"ex":22.1},
      62:{"qx":0.0083,"ex":21.3}, 63:{"qx":0.00911,"ex":20.5}, 64:{"qx":0.01003,"ex":19.7},
      65:{"qx":0.01106,"ex":18.9}, 66:{"qx":0.01222,"ex":18.1}, 67:{"qx":0.01353,"ex":17.3},
      68:{"qx":0.015,"ex":16.5}, 69:{"qx":0.01664,"ex":15.7}, 70:{"qx":0.01846,"ex":15},
      71:{"qx":0.02047,"ex":14.3}, 72:{"qx":0.02269,"ex":13.6}, 73:{"qx":0.02514,"ex":12.9},
      74:{"qx":0.02789,"ex":12.2}, 75:{"qx":0.03099,"ex":11.5}, 76:{"qx":0.03454,"ex":10.9},
      77:{"qx":0.03859,"ex":10.2}, 78:{"qx":0.04321,"ex":9.6}, 79:{"qx":0.04847,"ex":9},
      80:{"qx":0.05443,"ex":8.5}, 81:{"qx":0.06115,"ex":7.9}, 82:{"qx":0.06869,"ex":7.4},
      83:{"qx":0.07709,"ex":6.9}, 84:{"qx":0.08641,"ex":6.5}, 85:{"qx":0.09668,"ex":6},
      86:{"qx":0.10765,"ex":5.6}, 87:{"qx":0.11839,"ex":5.3}, 88:{"qx":0.12976,"ex":4.9},
      89:{"qx":0.14305,"ex":4.5}, 90:{"qx":0.15948,"ex":4.2}, 91:{"qx":0.17951,"ex":3.9},
      92:{"qx":0.19624,"ex":3.7}, 93:{"qx":0.21572,"ex":3.5}, 94:{"qx":0.23333,"ex":3.3},
      95:{"qx":0.24774,"ex":3.1}, 96:{"qx":0.25768,"ex":3}, 97:{"qx":0.27033,"ex":2.9},
      98:{"qx":0.2815,"ex":2.7}, 99:{"qx":0.29226,"ex":2.6}, 100:{"qx":0.30671,"ex":2.5}},
      "female":{"0":{"qx":0.00353,"ex":84}, 1:{"qx":0.00031,"ex":83.3},
      2:{"qx":0.00016,"ex":82.4}, 3:{"qx":0.00013,"ex":81.4}, 4:{"qx":0.0001,"ex":80.4},
      5:{"qx":0.00009,"ex":79.4}, 6:{"qx":0.00008,"ex":78.4}, 7:{"qx":0.00008,"ex":77.4},
      8:{"qx":0.00007,"ex":76.4}, 9:{"qx":0.00007,"ex":75.4}, 10:{"qx":0.00007,"ex":74.4},
      11:{"qx":0.00008,"ex":73.4}, 12:{"qx":0.00008,"ex":72.4}, 13:{"qx":0.00009,"ex":71.4},
      14:{"qx":0.00012,"ex":70.4}, 15:{"qx":0.00015,"ex":69.4}, 16:{"qx":0.00019,"ex":68.5},
      17:{"qx":0.00022,"ex":67.5}, 18:{"qx":0.00024,"ex":66.5}, 19:{"qx":0.00025,"ex":65.5},
      20:{"qx":0.00025,"ex":64.5}, 21:{"qx":0.00025,"ex":63.5}, 22:{"qx":0.00025,"ex":62.5},
      23:{"qx":0.00026,"ex":61.6}, 24:{"qx":0.00028,"ex":60.6}, 25:{"qx":0.00029,"ex":59.6},
      26:{"qx":0.00031,"ex":58.6}, 27:{"qx":0.00032,"ex":57.6}, 28:{"qx":0.00033,"ex":56.6},
      29:{"qx":0.00035,"ex":55.7}, 30:{"qx":0.00037,"ex":54.7}, 31:{"qx":0.00039,"ex":53.7},
      32:{"qx":0.00041,"ex":52.7}, 33:{"qx":0.00044,"ex":51.7}, 34:{"qx":0.00047,"ex":50.8},
      35:{"qx":0.00051,"ex":49.8}, 36:{"qx":0.00055,"ex":48.8}, 37:{"qx":0.0006,"ex":47.8},
      38:{"qx":0.00065,"ex":46.9}, 39:{"qx":0.00071,"ex":45.9}, 40:{"qx":0.00078,"ex":44.9},
      41:{"qx":0.00085,"ex":44}, 42:{"qx":0.00093,"ex":43}, 43:{"qx":0.00102,"ex":42.1},
      44:{"qx":0.00112,"ex":41.1}, 45:{"qx":0.00122,"ex":40.1}, 46:{"qx":0.00134,"ex":39.2},
      47:{"qx":0.00146,"ex":38.2}, 48:{"qx":0.00159,"ex":37.3}, 49:{"qx":0.00173,"ex":36.4},
      50:{"qx":0.00187,"ex":35.4}, 51:{"qx":0.00203,"ex":34.5}, 52:{"qx":0.00219,"ex":33.5},
      53:{"qx":0.00237,"ex":32.6}, 54:{"qx":0.00255,"ex":31.7}, 55:{"qx":0.00274,"ex":30.8},
      56:{"qx":0.00296,"ex":29.9}, 57:{"qx":0.0032,"ex":28.9}, 58:{"qx":0.00346,"ex":28},
      59:{"qx":0.00376,"ex":27.1}, 60:{"qx":0.0041,"ex":26.2}, 61:{"qx":0.00448,"ex":25.3},
      62:{"qx":0.00491,"ex":24.5}, 63:{"qx":0.00539,"ex":23.6}, 64:{"qx":0.00593,"ex":22.7},
      65:{"qx":0.00653,"ex":21.8}, 66:{"qx":0.0072,"ex":21}, 67:{"qx":0.00794,"ex":20.1},
      68:{"qx":0.00875,"ex":19.3}, 69:{"qx":0.00965,"ex":18.4}, 70:{"qx":0.01071,"ex":17.6},
      71:{"qx":0.01213,"ex":16.8}, 72:{"qx":0.01354,"ex":16}, 73:{"qx":0.01496,"ex":15.2},
      74:{"qx":0.01656,"ex":14.4}, 75:{"qx":0.01847,"ex":13.7}, 76:{"qx":0.02077,"ex":12.9},
      77:{"qx":0.02353,"ex":12.2}, 78:{"qx":0.02679,"ex":11.5}, 79:{"qx":0.03062,"ex":10.8},
      80:{"qx":0.03507,"ex":10.1}, 81:{"qx":0.0402,"ex":9.4}, 82:{"qx":0.04605,"ex":8.8},
      83:{"qx":0.05268,"ex":8.2}, 84:{"qx":0.06015,"ex":7.6}, 85:{"qx":0.06856,"ex":7.1},
      86:{"qx":0.07805,"ex":6.6}, 87:{"qx":0.08873,"ex":6.1}, 88:{"qx":0.1007,"ex":5.6},
      89:{"qx":0.11405,"ex":5.2}, 90:{"qx":0.12886,"ex":4.8}, 91:{"qx":0.14519,"ex":4.5},
      92:{"qx":0.16308,"ex":4.1}, 93:{"qx":0.18237,"ex":3.8}, 94:{"qx":0.20215,"ex":3.6},
      95:{"qx":0.22143,"ex":3.4}, 96:{"qx":0.23932,"ex":3.2}, 97:{"qx":0.25208,"ex":3},
      98:{"qx":0.26484,"ex":2.9}, 99:{"qx":0.2776,"ex":2.8}, 100:{"qx":0.29036,"ex":2.7}}};

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
