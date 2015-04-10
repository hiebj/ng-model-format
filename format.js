(function() {
    'use strict';
    angular
        .module('model-format')
        .directive('parse', Parse)
        .directive('format', Format);

    var formatters = {};

    function Parse($filter) {
        function link($scope, $element, $attrs, $ngModel) {
            $ngModel.$parsers.push(function(value) {
                var parsed = format(value, $scope.$eval($attrs.parse), $filter);
                if (formatters[$ngModel.$name] && parsed === value) {
                    $ngModel.setViewValue(formatters[$ngModel.$name](value));
                }
                return parsed;
            });
        }
        return {
            restrict: 'A',
            require: 'ngModel',
            link: link
        };
    }

    function Format($filter) {
        function link($scope, $element, $attrs, $ngModel) {
            formatters[$ngModel.$name] = formatter;
            $ngModel.$formatters.push(formatter);
            function formatter(value) {
                return format(value, $scope.$eval($attrs.format), $filter);
            }
        }
        return {
            restrict: 'A',
            require: 'ngModel',
            link: link
        };
    }

    function format(value, formatter, $filter) {
        var formatted = value + '',
            filter;
        if (typeof formatter === 'function') {
            formatted = formatter(value);
        } else if (typeof formatter === 'string') {
            formatter = formatter.split(':');
            filter = $filter(formatter[0]);
            formatted = filter.apply(formatted, formatter.slice(1));
        } else if (typeof formatter === 'object') {
            formatted = formatted.replace.call(formatted, formatter.replace, formatter.with);
        } else if (angular.isArray(formatter)) {
            formatted = formatted.replace.apply(formatted, formatter);
        }
        return formatted;
    }
})();
