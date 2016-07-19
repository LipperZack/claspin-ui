(function(angular) { 'use strict';

angular.module('claspin', [])
  .directive('claspin', function() {
    var template = '<div class="claspin-wrap">' + 
      '<div ng-class="[\'claspin\'].concat(selectionClasses)">' +
      '<div ng-class="\'row\'" ng-repeat="w in rows">' +
        '<div ng-repeat="item in w.items" ng-class="[\'item\'].concat(item.class)" style="background-color:{{item.backgroundColor}}" ng-click="selecting(item)">' +
          '<div style="width: 100%; height: 100%" uib-tooltip="item:{{item}}"></div>'+
        '</div>' +
      '</div>' +
      '</div>' +
    '</div>';
    
    var directive = {
      restrict: 'E',
      scope: {
        itemList: '=?itemList',
        selectedItem: '=?selectedItem',
        selectable: '@selectable'
      },
      transclude: true,
      template: template,
      link: link
    };
    
    function link(scope, element, attrs) {
      var arrToObj = function(arr){
        arr = arr || [];
        var Obj = {};
        arr.forEach(function(t){
          Obj[t.index] = t.status;
        })
        return Obj;
      }

      scope.itemList = scope.itemList || [];
      // 各个颜色的配置
      scope.itemColorMap = scope.itemColorMap || ['#008719','#60BE29','#FFEE3D','#FFAD30','#FF001D'];
      // row的长度
      scope.rowLength = scope.rowLength || 5;
      

      scope.$watch('itemList',   update);
      
      var selectedElement;
      scope.selectionClasses = [];
      scope.selecting = function(item) {
        if (scope.selectable === 'false')
          return;
        
        if (selectedElement) {
          // remove "selected" class from corresponding item element
          selectedElement.class = selectedElement.class.filter(function(c) {
            return c !== 'selected';
          });
        }
        
        if (item.class.indexOf('empty') !== -1) {
          selectedElement = null;
          scope.selectedItem = null;
          scope.selectionClasses = [];
          return;
        }
        
        selectedElement = item;
        selectedElement.class.push('selected');
        scope.selectedItem = item;
        scope.selectionClasses = ['selection-applied'];
      };
      
      function update() {
        scope.selectedItem = attrs.selectedItem || null;
        scope.selectable = attrs.selectable || 'true';

        scope.rows = [];
        scope.items = [];
        
        var currentRow = null;
        
        // first run: create all item 
        scope.itemList.forEach(function(item, i, itemList){
          if (currentRow === null) {
            currentRow = {
              items: []
            };
            
            scope.rows.push(currentRow);
          }
          
          var item = angular.extend({}, item, {
            class: ['filled']
          });
          
          currentRow.items.push(item);
          scope.items.push(item);
          
          if (i % scope.rowLength === (scope.rowLength-1) % scope.rowLength) {
            currentRow = null;
          }
        });
        

        // second run: render the color
        scope.items.forEach(function(item) {
          // invalid value transfer to default
          // todo the code is not nessary ,just fix to the server response in the future
          if(item.status >= scope.itemColorMap.length){
            item.status = 0;
          }

          item.backgroundColor = scope.itemColorMap[item.status];

          // add some random shade/tint to have a pretty look
          // todo the code is not nessary ,just fix to the server response in the future
          if(item.status == 0){
            var color = new Values(item.backgroundColor);
            color = color.shade(20*Math.random());
            item.backgroundColor = '#' + color.hex;
          }
          else if(item.status == 1){
            var color = new Values(item.backgroundColor);
            color = color.tint(20*Math.random());
            item.backgroundColor = '#' + color.hex;
          }
        });
      }
    }
    return directive;
  })
})(angular);
