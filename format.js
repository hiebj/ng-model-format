(function() {
    'use strict';
    angular
        .module('model-format', [])
        .directive('parse', Parse)
        .directive('format', Format);

    var formatters = {};

    function Parse($filter, $timeout) {
        function link($scope, $element, $attrs, $ngModel) {
            $ngModel.$parsers.push(parser);
            function parser(value) {
                var parsed = value;
                if (($attrs.parseEmpty && $scope.$eval($attrs.parseEmpty)) ||
                    (value && (value + '').length)) {
                    parsed = format(value, $scope.$eval($attrs.parse), $filter);
                    if (parsed && (parsed + '').length && typeof $attrs.number !== 'undefined') {
                        parsed = parsed * 1;
                    }
                }
                if (formatters[$attrs.ngModel]) {
                    $timeout(function() {
                        var cursor;
                        $element.val(formatters[$attrs.ngModel](parsed));
                        cursor = $element.val().indexOf(parsed) + (parsed + '').length;
                        $element[0].setSelectionRange(cursor, cursor);
                    });
                }
                return parsed;
            }
        }
        return {
            restrict: 'A',
            require: 'ngModel',
            link: link
        };
    }

    function Format($filter, $timeout) {
        function link($scope, $element, $attrs, $ngModel) {
            formatters[$attrs.ngModel] = formatter;
            $ngModel.$formatters.push(formatter);
            function formatter(value) {
                var formatted = value;
                if ($attrs.formatEmpty  && $scope.$eval($attrs.formatEmpty) ||
                    (value && (value + '').length)) {
                    formatted = format(value, $scope.$eval($attrs.format), $filter);
                }
                return formatted;
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
            formatter[0] = value;
            formatted = filter.apply(formatted, formatter);
        } else if (value && angular.isArray(formatter)) {
            formatted = formatted.replace.apply(formatted, formatter);
        } else if (value && typeof formatter === 'object') {
            formatted = formatted.replace.call(formatted, formatter.replace, formatter.with);
        }
        return formatted;
    }
})();
