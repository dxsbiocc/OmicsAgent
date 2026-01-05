import { ECharts, graphic } from "echarts";

export function initAxisBreakInteraction(myChart: ECharts) {
  var GRID_TOP = 120;
  var GRID_BOTTOM = 80;
  var Y_DATA_ROUND_PRECISION = 0;
  var _currentAxisBreaks = [
    {
      start: 5000,
      end: 100000,
      gap: "2%",
    },
  ];

  let _brushingEl: any = null;
  myChart.getZr().on("mousedown", function (params) {
    _brushingEl = new graphic.Rect({
      shape: { x: 0, y: params.offsetY },
      style: { stroke: "none", fill: "#ccc" },
      ignore: true,
    });
    myChart.getZr().add(_brushingEl);
  });
  myChart.getZr().on("mousemove", function (params) {
    if (!_brushingEl) {
      return;
    }
    var initY = _brushingEl.shape.y;
    var currPoint = [params.offsetX, params.offsetY];
    _brushingEl.setShape("width", myChart.getWidth());
    _brushingEl.setShape("height", currPoint[1] - initY);
    _brushingEl.ignore = false;
  });
  document.addEventListener("mouseup", function (params) {
    if (!_brushingEl) {
      return;
    }
    var initX = _brushingEl.shape.x;
    var initY = _brushingEl.shape.y;
    var currPoint: [number, number] = [params.offsetX, params.offsetY];
    var pixelSpan = Math.abs(currPoint[1] - initY);
    if (pixelSpan > 2) {
      updateAxisBreak(myChart, [initX, initY], currPoint);
    }
    myChart.getZr().remove(_brushingEl);
    _brushingEl = null;
  });
  myChart.on("axisbreakchanged", function (params) {
    // Remove expanded axis breaks from _currentAxisBreaks.
    var changedBreaks = (params as any).breaks || [];
    for (var i = 0; i < changedBreaks.length; i++) {
      var changedBreakItem = changedBreaks[i];
      if (changedBreakItem.isExpanded) {
        for (var j = _currentAxisBreaks.length - 1; j >= 0; j--) {
          if (
            _currentAxisBreaks[j].start === changedBreakItem.start &&
            _currentAxisBreaks[j].end === changedBreakItem.end
          ) {
            _currentAxisBreaks.splice(j, 1);
          }
        }
      }
    }
  });
  function updateAxisBreak(
    myChart: ECharts,
    initXY: [number, number],
    currPoint: [number, number]
  ) {
    var dataXY0 = myChart.convertFromPixel({ gridIndex: 0 }, initXY);
    var dataXY1 = myChart.convertFromPixel({ gridIndex: 0 }, currPoint);
    var dataRange = [roundYValue(dataXY0[1]), roundYValue(dataXY1[1])];
    if (dataRange[0] > dataRange[1]) {
      dataRange.reverse();
    }
    var newBreak = {
      start: dataRange[0],
      end: dataRange[1],
    };
    insertAndMergeNewBreakWithExistingBreaks(newBreak);
    var gapPercentStr =
      (Math.abs(
        myChart.convertToPixel({ yAxisIndex: 0 }, newBreak.start) -
          myChart.convertToPixel({ yAxisIndex: 0 }, newBreak.end)
      ) /
        getYAxisPixelSpan(myChart)) *
        100 +
      "%";
    function makeOption(gapPercentStr: string) {
      (newBreak as any).gap = gapPercentStr;
      return {
        yAxis: {
          breaks: _currentAxisBreaks,
        },
      };
    }
    // This is to make a transition animation effect - firstly create axis break
    // on the brushed area, then collapse it to a small gap.
    myChart.setOption(makeOption(gapPercentStr));
    setTimeout(() => {
      myChart.setOption(makeOption("2%"));
    }, 0);
  }
  // Insert and merge new break with existing breaks if intersecting.
  function insertAndMergeNewBreakWithExistingBreaks(newBreak: {
    start: number;
    end: number;
  }) {
    for (var i = _currentAxisBreaks.length - 1; i >= 0; i--) {
      var existingBreak = _currentAxisBreaks[i];
      if (
        existingBreak.start <= newBreak.end &&
        existingBreak.end >= newBreak.start
      ) {
        newBreak.start = Math.min(existingBreak.start, newBreak.start);
        newBreak.end = Math.max(existingBreak.end, newBreak.end);
        _currentAxisBreaks.splice(i, 1); // Remove the existing break.
      }
    }
    _currentAxisBreaks.push({ ...newBreak, gap: "2%" });
  }
  function getYAxisPixelSpan(myChart: ECharts) {
    return myChart.getHeight() - GRID_BOTTOM - GRID_TOP;
  }
  function roundYValue(val: number) {
    return +(+val).toFixed(Y_DATA_ROUND_PRECISION);
  }
}
