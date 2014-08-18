'use strict';
/* global jQuery:false */
/* global Morris:false */
/* global moment:false */


angular.module('openhimWebui2App')
  .controller('ChannelMonitoringCtrl', function ($scope, $modal, $location, $routeParams, Api, Alerting) {

    /***************************************************/
    /**         Initial page load functions           **/
    /***************************************************/

    var channelSuccess = function(channel){
      $scope.channel = channel;
    };

    var channelError = function(err){
      // on error - add server error alert
      Alerting.AlertAddServerMsg(err.status);
    };

    //get the Data for the supplied ID and store in 'transactionsDetails' object
    Api.Channels.get({ channelId: $routeParams.channelId }, channelSuccess, channelError);

    /***************************************************/
    /**         Initial page load functions           **/
    /***************************************************/



    /*********************************************************/
    /**         Transaction Load Metric Functions           **/
    /*********************************************************/

    var updateLoadLineChart = function(loadResults){

      /* DEFAULT LOAD OBJECT */
      var loadData = [
        { date: moment().subtract(6, 'd').format('YYYY-MM-DD'), value: 0 },
        { date: moment().subtract(5, 'd').format('YYYY-MM-DD'), value: 0 },
        { date: moment().subtract(4, 'd').format('YYYY-MM-DD'), value: 0 },
        { date: moment().subtract(3, 'd').format('YYYY-MM-DD'), value: 0 },
        { date: moment().subtract(2, 'd').format('YYYY-MM-DD'), value: 0 },
        { date: moment().subtract(1, 'd').format('YYYY-MM-DD'), value: 0 },
        { date: moment().format('YYYY-MM-DD'), value: 0 }
      ];
      $scope.loadTotal = 0;
      /* DEFAULT LOAD OBJECT */

      var dateFormat, date;

      // construct the loadData if API success
      for (var i = 0; i < loadResults.length; i++) {
        //moment format date to ensure zeros are present
        dateFormat = new Date(loadResults[i]._id.year + '-' + loadResults[i]._id.month + '-' + loadResults[i]._id.day);
        date = moment(dateFormat).format('YYYY-MM-DD');

        // check if date is equal to date in object and update load total
        for (var x = 0; x < loadData.length; x++) {
          if( loadData[x].date === date ){
            loadData[x].value = loadResults[i].load;
            // add to load total
            $scope.loadTotal += loadResults[i].load;
          }
        }
      }

      // if chart object exist then set new data
      if ($scope.loadLineChart){
        $scope.loadLineChart.setData(loadData);
      }else{
        createLoadLineChart(loadData);
      }
    };

    var createLoadLineChart = function(lineChartData){
      // check if graph element exist before creating
      if ( jQuery('#load-graph:visible').length ){
        // Morris Bar Chart
        $scope.loadLineChart = new Morris.Line({
          element: 'load-graph',
          data: lineChartData,
          xkey: 'date',
          ykeys: ['value'],
          labels: ['Load'],
          resize: true
        });
      }
    };

    /*********************************************************/
    /**         Transaction Load Metric Functions           **/
    /*********************************************************/



    /******************************************************************/
    /**         Transaction Response Time Metric Functions           **/
    /******************************************************************/
    
    var updateResponseTimeLineChart = function(loadResults){

      /* DEFAULT LOAD OBJECT */
      var responseTimeData = [
        { date: moment().subtract(6, 'd').format('YYYY-MM-DD'), value: 0 },
        { date: moment().subtract(5, 'd').format('YYYY-MM-DD'), value: 0 },
        { date: moment().subtract(4, 'd').format('YYYY-MM-DD'), value: 0 },
        { date: moment().subtract(3, 'd').format('YYYY-MM-DD'), value: 0 },
        { date: moment().subtract(2, 'd').format('YYYY-MM-DD'), value: 0 },
        { date: moment().subtract(1, 'd').format('YYYY-MM-DD'), value: 0 },
        { date: moment().format('YYYY-MM-DD'), value: 0 }
      ];
      $scope.avgResponseTime = 0;
      /* DEFAULT LOAD OBJECT */

      var dateFormat, date;
      var avgResponseTimeTotal = 0;

      // construct the loadData if API success
      for (var i = 0; i < loadResults.length; i++) {
        //moment format date to ensure zeros are present
        dateFormat = new Date(loadResults[i]._id.year + '-' + loadResults[i]._id.month + '-' + loadResults[i]._id.day);
        date = moment(dateFormat).format('YYYY-MM-DD');

        // check if date is equal to date in object and update load total
        for (var x = 0; x < responseTimeData.length; x++) {
          if( responseTimeData[x].date === date ){
            responseTimeData[x].value = loadResults[i].avgResp.toFixed(2);
            // add to load total
            avgResponseTimeTotal += parseFloat(loadResults[i].avgResp);
          }
        }
      }
      $scope.avgResponseTime = (avgResponseTimeTotal / responseTimeData.length).toFixed(2);

      // if chart object exist then set new data
      if ($scope.responseTimeLineChart){
        $scope.responseTimeLineChart.setData(responseTimeData);
      }else{
        createResponseTimeLineChart(responseTimeData);
      }
    };

    var createResponseTimeLineChart = function(lineChartData){
      // check if graph element exist before creating
      if ( jQuery('#response-time-graph:visible').length ){
        // Morris Bar Chart
        $scope.responseTimeLineChart = new Morris.Line({
          element: 'response-time-graph',
          data: lineChartData,
          xkey: 'date',
          ykeys: ['value'],
          labels: ['Load'],
          postUnits: ' ms',
          resize: true
        });
      }
    };

    /******************************************************************/
    /**         Transaction Response Time Metric Functions           **/
    /******************************************************************/



    /************************************************************/
    /**         Transaction Load/Time Metric REQUEST           **/
    /************************************************************/

    $scope.getLoadTimeMetrics = function(){
      // reset any load metric alert warnings
      Alerting.AlertReset();

      // do API call here to pull channel load metrics
      Api.Metrics.query({
        time: 'day',
        channelId : $routeParams.channelId,
        startDate: moment().subtract(1,'weeks').toDate(),
        endDate: moment().toDate()
      }, $scope.loadTimeMetricsSuccess, $scope.loadTimeMetricsError);
    };

    $scope.loadTimeMetricsSuccess = function(loadTimeResults){
      updateLoadLineChart(loadTimeResults);
      updateResponseTimeLineChart(loadTimeResults);
    };

    $scope.loadTimeMetricsError = function(err){
      // add warning message when unable to get data
      Alerting.AlertAddMsg('load', 'danger', 'Transaction Load Error: ' + err.status + ' ' + err.data);
      Alerting.AlertAddMsg('responseTime', 'danger', 'Transaction Response Time Error: ' + err.status + ' ' + err.data);
    };

    // do the inital load of the transaction status metrics
    $scope.getLoadTimeMetrics();

    /************************************************************/
    /**         Transaction Load/Time Metric REQUEST           **/
    /************************************************************/

    



    /***********************************************************/
    /**         Transaction Status Metric Functions           **/
    /***********************************************************/

    $scope.getStatusMetrics = function(){
      // do API call here to pull channel status metrics
      /* SIMULATED STATUS VALUES */
      var statusData = [];
      var total = 450;
      var value, percent;

      if ( 1 === 1 ){
        value = 40;
        percent = (100 / total * value).toFixed(2);
        statusData.push({ label: 'Processing', value: value, percent: percent, color: '#777777' });
      }

      if ( 1 === 1 ){
        value = 95;
        percent = (100 / total * value).toFixed(2);
        statusData.push({ label: 'Failed', value: value, percent: percent, color: '#d9534f' });
      }
      
      if ( 1 === 1 ){
        value = 40;
        percent = (100 / total * value).toFixed(2);
        statusData.push({ label: 'Completed', value: value, percent: percent, color: '#f0ad4e' });
      }

      if ( 1 === 1 ){
        value = 25;
        percent = (100 / total * value).toFixed(2);
        statusData.push({ label: 'Completed with Error(s)', value: value, percent: percent, color: '#5bc0de' });
      }

      if ( 1 === 1 ){
        value = 250;
        percent = (100 / total * value).toFixed(2);
        statusData.push({ label: 'Successful', value: value, percent: percent, color: '#5cb85c' });
      }
      /* SIMULATED STATUS VALUES */

      updateStatusBarChart(statusData);
      updateStatusDonutChart(statusData);
    };
    
    var updateStatusBarChart = function(statusData){
      // construct status bar object for morris
      var statusBarData = [];
      for (var i = 0; i < statusData.length; i++) {
        statusBarData.push({ label: statusData[i].label, value: statusData[i].value });
      }

      // if chart object exist then set new data
      if ($scope.statusBarChart){
        $scope.statusBarChart.setData(statusBarData);
      }else{
        createBarChart(statusBarData);
      }
    };

    var updateStatusDonutChart = function(statusData){
      var statusDonutData = [];
      var statusDonutColors = [];
      for (var i = 0; i < statusData.length; i++) {
        statusDonutData.push({ label: statusData[i].label, value: statusData[i].percent });
        statusDonutColors.push(statusData[i].color);
      }

      // if chart object exist then set new data
      if ($scope.statusDonutChart){
        $scope.statusDonutChart.setData(statusDonutData);
      }else{
        createDonutChart(statusDonutData, statusDonutColors);
      }
    };

    var createBarChart = function(statusBarData){
      // check if graph element exist before creating
      if ( jQuery('#status-bar:visible').length ){
        // Morris Bar Chart
        $scope.statusBarChart = new Morris.Bar({
          element: 'status-bar',
          data: statusBarData,
          xkey: 'label',
          ykeys: ['value'],
          labels: ['Total'],
          barRatio: 0.4,
          xLabelMargin: 10,
          resize: true,
          hideHover: 'auto',
          barColors: ['#3d88ba'],
          hoverCallback: function (index, options, content) {
            $scope.statusDonutChart.select(index);
            return content;
          }
        });
      }
    };

    var createDonutChart = function(statusDonutData, statusDonutColors){
      // check if graph element exist before creating
      if ( jQuery('#status-donut:visible').length ){
        // Morris Donut Chart
        $scope.statusDonutChart = new Morris.Donut({
          element: 'status-donut',
          data: statusDonutData,
          colors: statusDonutColors,
          resize: true,
          formatter: function (y) { return y + '%'; }
        });
      }
    };

    // do the inital load of the transaction status metrics
    $scope.getStatusMetrics();

    /***********************************************************/
    /**         Transaction Status Metric Functions           **/
    /***********************************************************/

  });