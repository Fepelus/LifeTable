
var LifeTable = (function () {

	var thetable = {
		"male": {0:79.5, 1:78.9, 2:77.9, 3:77.0, 4:76.0, 5:75.0,
		6:74.0, 7:73.0, 8:72.0, 9:71.0, 10:70.0, 11:69.0, 12:68.0,
		13:67.0, 14:66.0, 15:65.1, 16:64.1, 17:63.1, 18:62.1, 19:61.2,
		20:60.2, 21:59.2, 22:58.3, 23:57.3, 24:56.3, 25:55.4, 26:54.4,
		27:53.5, 28:52.5, 29:51.5, 30:50.6, 31:49.6, 32:48.7, 33:47.7,
		34:46.7, 35:45.8, 36:44.8, 37:43.9, 38:42.9, 39:42.0, 40:41.0,
		41:40.1, 42:39.1, 43:38.2, 44:37.3, 45:36.3, 46:35.4, 47:34.5,
		48:33.6, 49:32.7, 50:31.7, 51:30.8, 52:29.9, 53:29.1, 54:28.2,
		55:27.3, 56:26.4, 57:25.5, 58:24.7, 59:23.8, 60:23.0, 61:22.1,
		62:21.3, 63:20.5, 64:19.7, 65:18.9, 66:18.1, 67:17.3, 68:16.5,
		69:15.7, 70:15.0, 71:14.3, 72:13.6, 73:12.9, 74:12.2, 75:11.5,
		76:10.9, 77:10.2, 78:9.6, 79:9.0, 80:8.5, 81:7.9, 82:7.4,
		83:6.9, 84:6.5, 85:6.0, 86:5.6, 87:5.3, 88:4.9, 89:4.5,
		90:4.2, 91:3.9, 92:3.7, 93:3.5, 94:3.3, 95:3.1, 96:3.0,
		97:2.9, 98:2.7, 99:2.6, 100:2.5},

		"female": { 0:84.0, 1:83.3, 2:82.4, 3:81.4, 4:80.4, 5:79.4,
		6:78.4, 7:77.4, 8:76.4, 9:75.4, 10:74.4, 11:73.4, 12:72.4,
		13:71.4, 14:70.4, 15:69.4, 16:68.5, 17:67.5, 18:66.5, 19:65.5,
		20:64.5, 21:63.5, 22:62.5, 23:61.6, 24:60.6, 25:59.6, 26:58.6,
		27:57.6, 28:56.6, 29:55.7, 30:54.7, 31:53.7, 32:52.7, 33:51.7,
		34:50.8, 35:49.8, 36:48.8, 37:47.8, 38:46.9, 39:45.9, 40:44.9,
		41:44.0, 42:43.0, 43:42.1, 44:41.1, 45:40.1, 46:39.2, 47:38.2,
		48:37.3, 49:36.4, 50:35.4, 51:34.5, 52:33.5, 53:32.6, 54:31.7,
		55:30.8, 56:29.9, 57:28.9, 58:28.0, 59:27.1, 60:26.2, 61:25.3,
		62:24.5, 63:23.6, 64:22.7, 65:21.8, 66:21.0, 67:20.1, 68:19.3,
		69:18.4, 70:17.6, 71:16.8, 72:16.0, 73:15.2, 74:14.4, 75:13.7,
		76:12.9, 77:12.2, 78:11.5, 79:10.8, 80:10.1, 81:9.4, 82:8.8,
		83:8.2, 84:7.6, 85:7.1, 86:6.6, 87:6.1, 88:5.6, 89:5.2,
		90:4.8, 91:4.5, 92:4.1, 93:3.8, 94:3.6, 95:3.4, 96:3.2,
		97:3.0, 98:2.9, 99:2.8, 100:2.7 }
	}

	return {
		lookup: function (sex, age) {
				return thetable[sex][age];
		}
	};

}());

var Person = Backbone.Model.extend({
	defaults: {
		day: 19,
		month: 9,
		year: 1973,
		sex: "male"
	},

	get_birthday: function () {
		return moment(new Date(this.get("year"),this.get("month"),this.get("day")));
	},

	get_age: function () {
		return Math.floor(moment().diff(this.get_birthday(), 'years',true));
	},

	life_expectancy: function () {
		return LifeTable.lookup(this.get("sex"),this.get_age());
	},

	difference_in: function (unit) {
		var death = this.get_birthday().add('years',this.get_age()).add('years', this.life_expectancy());
		return death.diff(moment(), unit);
	}


});

var thisPerson = new Person;

InputView = Backbone.View.extend({
	model: thisPerson,
	initialize: function () {
		this.render();
		this.original_options();
		this.original_selections();
	},
	render: function () {
		var template = _.template( $("#inputtemplate").html(), {} );
		this.$el.html(template);
	},
	events: {
		"change select": "selectionChanged"
	},
	original_options: function () {
		var thisyear = parseInt(moment().format('YYYY'));
		for (i=1; i<=31; i++) {
			var content = $("<option></option>").val(i).text(i);
			$('select#day').append(content);
		}
		for (i=0; i<12; i++) {
			var content = $("<option></option>").val(i+1).text(moment.monthsShort[i]);
			$('select#month').append(content);
		}
		for (i=thisyear-100; i<=thisyear; i++) {
			var content = $("<option></option>").val(i).text(i);
			$('select#year').append(content);
		}
	},
	original_selections: function () {
		$('select#day').val(this.model.get('day'));
		$('select#month').val(this.model.get('month'));
		$('select#year').val(this.model.get('year'));
		$('select#sex').val(this.model.get('sex'));
	},
    selectionChanged: function (e) {
      var field = $(e.currentTarget);
      var value = $("option:selected", field).val();
      var data = {};
      data[field.attr('id')] = value;
      this.model.set(data);
    }
});

PersonView = Backbone.View.extend({
	model: thisPerson,
	initialize: function () {
		this.render();
		this.model.bind('change', this.render, this);
		this.model.bind('ping', this.render, this);
	},
	render: function () {
		var variables = {
			"age": this.model.get_age(),
			"sex": this.model.get("sex"),
			"life_expectancy_years": this.model.difference_in('years'),
			"life_expectancy_days": this.model.difference_in('days'),
			"life_expectancy_hours": this.model.difference_in('hours')
		};
		var template = _.template( $("#outputtemplate").html(), variables );
		this.$el.html(template);
	}
});


$(function () {
	var input_view = new InputView({el: $("#input_container")});
	var person_view = new PersonView({el: $("#output_container")});
});

