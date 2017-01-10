

(function () {
  function getType(x) {
    // TODO make this faster ?
    return {}.toString.call(x);
  }


  function copyObject(x) {
    var output = {};

    // TODO use Object.keys ?
    for (var key in x) {
      output[key] = copy(x[key]);
    }

    return output;
  }

  function copyArray(x) {
    var length = x.length;

    var output = new Array(length);

    for (var i = 0; i < length; ++i) {
      output[i] = copy(x[i]);
    }

    return output;
  }

  // TODO can this be made faster ?
  // TODO what about regexps, etc. ?
  function copy(x) {
    switch (getType(x)) {
    case "[object Array]":
      return copyArray(x);

    case "[object Object]":
      return copyObject(x);

    // TODO is this necessary ?
    case "[object Date]":
      return new Date(x.getTime());

    default:
      return x;
    }
  }


  function isEqualArray(x, y) {
    var xLength = x.length;
    var yLength = y.length;

    if (xLength === yLength) {
      for (var i = 0; i < xLength; ++i) {
        if (!isEqual(x[i], y[i])) {
          return false;
        }
      }

      return true;

    } else {
      return false;
    }
  }

  function isEqualObject(x, y) {
    // TODO use Object.keys ?
    for (var key in x) {
      if (key in y) {
        if (!isEqual(x[key], y[key])) {
          return false;
        }

      } else {
        return false;
      }
    }

    // TODO use Object.keys ?
    for (var key in y) {
      if (!(key in x)) {
        return false;
      }
    }

    return true;
  }

  function isNaN(x) {
    return x !== x
  }

  function isEqual(x, y) {
    var xType = getType(x);
    var yType = getType(y);

    if (xType === yType) {
      switch (xType) {
      case "[object Array]":
        return isEqualArray(x, y);

      case "[object Object]":
        return isEqualObject(x, y);

      case "[object Date]":
        return x.getTime() === y.getTime();

      case "[object Number]":
        return x === y || (isNaN(x) && isNaN(y))

      default:
        return x === y;
      }

    } else {
      return false;
    }
  }


  function removeChartListeners(chart, listeners) {
    if (listeners != null) {
      // TODO use Object.keys ?
      for (var key in listeners) {
        var listener = listeners[key];

        chart.removeListener(chart, listener.event, listener.method);
      }
    }
  }

  // TODO make this faster ?
  // TODO does this work for listeners, etc. ?
  function updateChartObject(chart, oldObj, newObj) {
    var didUpdate = false;

    // TODO use Object.keys ?
    for (var key in newObj) {
      // TODO make this faster ?
      if (!(key in oldObj) || !isEqual(oldObj[key], newObj[key])) {
        if (key === "listeners") {
          // TODO make this faster ?
          removeChartListeners(chart, oldObj[key]);
        }

        // TODO make this faster ?
        chart[key] = copy(newObj[key]);
        didUpdate = true;
      }
    }

    // TODO use Object.keys ?
    for (var key in oldObj) {
      if (!(key in newObj)) {
        if (key === "listeners") {
          removeChartListeners(chart, oldObj[key]);
        }

        delete chart[key];
        didUpdate = true;
      }
    }

    return didUpdate;
  }


  var id = 0;

  AmCharts.React = React.createClass({
    getInitialState: function () {
      return {
        id: "__AmCharts_React_" + (++id) + "__",
        chart: null
      };
    },

    makeFixedCategoryHeights : function(){
      AmCharts.addInitHandler(function(chart) {
        // set base values
        console.log('in handler func')
        var categoryWidth = 25;
        var containerHeight = 500;

        // calculate bottom margin based on number of data points
        var chartHeight = categoryWidth * chart.dataProvider.length;
        var marginBottom = containerHeight - chartHeight;
        if(chartHeight === 25){
          chartHeight = 70;
          marginBottom = 430;
        }
        // set the bottom margin
        if (0 < marginBottom) {
          //chart.autoMargins = false;
          chart.valueAxes[0].ignoreAxisWidth = true;
          chart.marginBottom = marginBottom;
        }

      }, ['gantt']);
    },

    componentDidMount: function () {
      // AmCharts mutates the config object, so we have to make a deep copy to prevent that
      var props = copy(this.props);
      this.makeFixedCategoryHeights();
      this.setState({
        chart: AmCharts.makeChart(this.state.id, props)
      });

    },

    shouldComponentUpdate: function(newProps){
      if(this.state.chart === null ){ //|| newProps.dataProvider.length === 0
        return false;
      }
      const thingFilterChanged = !isEqualArray(this.props.dataProvider,newProps.dataProvider);
      //const thingFilterChanged = (this.props.dataProvider.length !== newProps.dataProvider.length);
      if(thingFilterChanged){
        return true;
      }
      else{
        this.state.chart.validateData();
        return false;
      }
      //this.state.dataProvider = newProps.dataProvider;
      //var didUpdate = updateChartObject(this.state.chart, this.props, newProps);
      //this.state.chart.validateData();
      //return false;
    },

    componentWillUnmount: function () {
      if (this.state.chart) {
        this.state.chart.clear();
      }
    },
    componentDidUpdate(prevProps, prevState){
      var props = copy(this.props);
      this.makeFixedCategoryHeights();
      this.setState({
        chart: AmCharts.makeChart(this.state.id, props)
      });
    },

    render: function () {
      return React.DOM.div({
        id: this.state.id,
        style: {
          width: "100%",
          height: "100%",
          'margin-top' : "15px",
          'background-color' : 'white'
        }
      });
    }
  });
})();
