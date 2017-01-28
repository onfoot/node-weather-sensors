$(function() {
  
  $.get('/weather', function(sensors) {
    
    var chartLabels = [];
    var temperatures = [];
    var humidities = [];
    
    const now = Date.now();
    const nowDate = new Date(now);
    const startDate = new Date(Date.now()-86400000);
    
    var interval = 30*60;
    
    var intervals = {};

    sensors.forEach(function(sensor) {
      const created = new Date(sensor.created);
      const intervalTime = '' + (Math.floor(created.valueOf() / (15*60 * 1000.0)));
      
      var interval = intervals[intervalTime];
      if (!interval) {
        intervals[intervalTime] = {mint: sensor.t, maxt: sensor.t, minh: sensor.h, maxh: sensor.h, start: created};
      } else {
        if (interval.mint > sensor.t) {
          interval.mint = sensor.t;
        }
        
        if (interval.maxt < sensor.t) {
          interval.maxt = sensor.t;
        }
        
        if (interval.minh > sensor.h) {
          interval.minh = sensor.h;
        }
        
        if (interval.maxh < sensor.h) {
          interval.maxh = sensor.h;
        }
        
        intervals[intervalTime] = interval;
      }

    });
    
    const intervalKeys = Object.keys(intervals).sort();
    
    intervalKeys.forEach(function(key) {
      const interval = intervals[key];
      temperatures.push((interval.maxt + interval.mint) / 2.0);
      humidities.push((interval.maxh + interval.minh) / 2.0 * 100.0);
      
      if (interval.start.getHours() % 3 === 0 && interval.start.getMinutes() === 0) {
        chartLabels.push(interval.start.getHours() + ':00');
      } else {
        chartLabels.push(null);
      }
      
    });
    new Chartist.Line('#tempChart', {
      series: [temperatures],
      labels: chartLabels
    }, {height: 300});    

    new Chartist.Line('#humidityChart', {
      series: [humidities],
      labels: chartLabels
    }, {height: 300});    
    
  });
});
