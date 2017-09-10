/* --- Made by justgoscha and licensed under MIT license --- */
app.filter('charLimit', function(){
    return function(text, maxChar){
        if(text.length > maxChar){
            var txt = text.slice(0, maxChar) + "...";
            return txt;
        }
        return text;
    }
});
app.directive('autocomplete', ['$compile', function ($compile) {
    var index = -1;

    var template = ['<div class="autocomplete {{attrs.class}}" id="{{attrs.id}}">',
                        '<span class="input-icon input-icon-right" style="width:100%;">',
                            '<input type="text" ng-model="searchParam" placeholder="{{attrs.placeholder}}" class="{{attrs.inputclass}}" id="{{attrs.inputid}}" autocomplete="off" ng-focus="onFocus()" />',
                            '<i class="icon-remove red" style="cursor:pointer;" ng-show="searchParam" ng-click="removeText()"></i>',
                        '</span>',
                        '<ul ng-show="completing" class="mCustomScrollbar" data-mcs-axis="y">',
                            '$AutocompleteTemplate$',
                        '</ul>',
                        '<ul id="no-result" ng-show="searchParam && (suggestions == null || suggestions.length == 0)"><li>Không tìm thấy kết quả phù hợp</li></ul>',
                    '</div>'];

    return {
        restrict: 'E',
        scope: {
            searchParam: '=ngModel',
            suggestions: '=data',
            onType: '=onType',
            onSelect: '=onSelect',
            onFocus: '=onFocus'
        },
        controller: ['$scope', '$element', '$attrs', '$timeout', function ($scope, $element, $attrs, $timeout) {
            function $scopeApply() {
                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    $scope.$apply();
                }
            }

            // the index of the suggestions that's currently selected
            $scope.selectedIndex = -1;

            // set new index
            $scope.setIndex = function (i) {
                $scope.selectedIndex = parseInt(i);
            };

            this.setIndex = function (i) {
                $scope.setIndex(i);
                $scopeApply();
            };

            $scope.getIndex = function (i) {
                return $scope.selectedIndex;
            };

            $scope.removeText = function () {
                $scope.searchParam = '';
            };

            // watches if the parameter filter should be changed
            var watching = true;

            // autocompleting drop down on/off
            $scope.completing = false;

            // scanning from barcode scanner
            $scope.scanning = false;
            var typingPromise;
            // starts autocompleting on typing in something
            $scope.$watch("searchParam", function (newValue, oldValue) {
                var delay = 300; //150;
                //if ((oldValue == undefined || oldValue == '') && newValue) delay = 0;//scanning == true
                if ((oldValue == undefined || oldValue == '') && newValue) { delay = 0; $scope.scanning = true; }//scanning == true
                if (typingPromise) $timeout.cancel(typingPromise);//does nothing, if timeout already done
                typingPromise = $timeout(function () {//Set timeout
                    if (watching && $scope.searchParam) {
                        $scope.completing = true;
                        $scope.searchFilter = $scope.searchParam;
                        $scope.selectedIndex = -1;
                    }
                    if ($scope.searchParam && $scope.searchParam != '' && $scope.searchParam.length > 1) {
                        // function thats passed to on-type attribute gets executed
                        if ($scope.onType)
                            $scope.onType($scope.searchParam);
                    }
                    else {
                        $scope.completing = false;
                        $scope.scanning = false;
                    }
                }, delay);
            });

            var timeoutPromise;
            // starts scanning after typing in something
            $scope.$watch("suggestions", function () {
                if (timeoutPromise) $timeout.cancel(timeoutPromise);  //does nothing, if timeout already done
                timeoutPromise = $timeout(function () {   //Set timeout

                    if ($scope.scanning === true && $scope.suggestions.length === 1) {
                        //console.log('scanning promise:' + $scope.scanning);
                        $scope.select($scope.suggestions[0]);
                    }
                    else if ($scope.scanning === true && $scope.suggestions.length >= 2 && $scope.suggestions.length <= 3) //
                    {
                        var existsKeywords = $scope.suggestions.filter(function (s) { return s.barcode.trim() === $scope.searchParam.trim(); });
                        if (existsKeywords.length > 0) {
                            $scope.select(existsKeywords[0]);
                        }

                    }
                    $scope.scanning = false;
                }, 200); //50
            });

            // for hovering over suggestions
            this.preSelect = function (suggestion) {

                watching = false;

                // this line determines if it is shown
                // in the input field before it's selected:
                //$scope.searchParam = suggestion;

                $scopeApply();
                watching = true;

            };

            $scope.preSelect = this.preSelect;

            this.preSelectOff = function () {
                watching = true;
            };

            $scope.preSelectOff = this.preSelectOff;

            // selecting a suggestion with RIGHT ARROW or ENTER
            $scope.select = function (suggestion, isclearsearch) {
                if (suggestion) {
                    //$scope.searchParam = suggestion;
                    //$scope.searchParam = isclearsearch == true ? '' : suggestion.Name;
                    $scope.searchFilter = suggestion;
                    if ($scope.onSelect) {
                        $scope.onSelect(suggestion);
                    }
                }
                watching = false;
                $scope.completing = false;
                $scope.scanning = false;
                setTimeout(function () { watching = true; }, 50); //150
                $scope.setIndex(-1);
                $scope.searchParam = '';
                $scope.suggestions = [];
            };
        }],
        link: function (scope, element, attrs) {
            function $scopeApply() {
                if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                    scope.$apply();
                }
            }

            var attr = '';

            // Default atts
            scope.attrs = {
                "placeholder": "start typing...",
                "class": "",
                "id": "",
                "inputclass": "",
                "inputid": ""
            };

            for (var a in attrs) {
                attr = a.replace('attr', '').toLowerCase();
                // add attribute overriding defaults
                // and preventing duplication
                if (a.indexOf('attr') === 0) {
                    scope.attrs[attr] = attrs[a];
                }
            }

            if (attrs.clickActivation) {
                element[0].onclick = function (e) {
                    if (!scope.searchParam) {
                        scope.completing = true;
                        $scopeApply();
                    }
                };
            }

            var keyupFiredCount = 0;
            function DelayExecution(f, delay) {
                var timer = null;
                return function () {
                    var context = this, args = arguments;

                    clearTimeout(timer);
                    timer = window.setTimeout(function () {
                        f.apply(context, args);
                    },
                    delay || 100);
                };
            }

            var key = { left: 37, up: 38, right: 39, down: 40, enter: 13, esc: 27, space: 32 };

            element[0].addEventListener("keyup", DelayExecution(function (e) {
                keyupFiredCount = keyupFiredCount + 1;
            }), true);

            element[0].addEventListener("blur", function (e) {
                keyupFiredCount = 0;
                // disable suggestions on blur
                // we do a timeout to prevent hiding it before a click event is registered
                setTimeout(function () {
                    scope.select();
                    scope.setIndex(-1);
                    $scopeApply();
                }, 300); //300
            }, true);

            element[0].addEventListener("keydown", function (e) {
                var keycode = e.keyCode || e.which;

                var l = angular.element(this).find('li').length - 1;

                if (scope.searchParam === '') {
                    keyupFiredCount = 0;
                }

                // implementation of the up and down movement in the list of suggestions
                switch (keycode) {
                    case key.up:
                        index = scope.getIndex() - 1;
                        //if (index < -1) {
                        //    index = l - 1;
                        //} else if (index >= l) {
                        //    index = -1;
                        //    scope.setIndex(index);
                        //    scope.preSelectOff();
                        //    break;
                        //}
                        if (index < 0) {
                            index = 0;
                        }
                        else if (index > l - 1) {
                            index = l - 1;
                        }
                        scope.setIndex(index);

                        if (index !== -1) {
                            scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());
                            var height = angular.element(angular.element(this).find('li')[index]).height() + 10;
                            var ul = angular.element(this).find('ul')[0];
                            if (ul && height > 0 && index >= 0 && index < l - 1) ul.scrollTop = Math.max(ul.scrollTop - height, 0);
                        }

                        $scopeApply();

                        break;
                    case key.down:
                        index = scope.getIndex() + 1;
                        //if (index < -1) {
                        //    index = l - 1;
                        //} else if (index >= l) {
                        //    index = -1;
                        //    scope.setIndex(index);
                        //    scope.preSelectOff();
                        //    $scopeApply();
                        //    break;
                        //}
                        if (index < 0) {
                            index = 0;
                        }
                        else if (index > l - 1) {
                            index = l - 1;
                        }
                        scope.setIndex(index);

                        if (index !== -1) {
                            scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());
                            var height = angular.element(angular.element(this).find('li')[index]).height() + 10;
                            var ul = angular.element(this).find('ul')[0];
                            if (ul && height > 0 && index > 0 && index < l - 1) ul.scrollTop = Math.min(ul.scrollTop + height, height * l);
                        }
                        break;
                    case key.left:
                        break;
                    case key.right:
                    case key.enter:
                        scope.scanning = false;
                        index = scope.getIndex();
                        //scope.preSelectOff();
                        if (index !== -1) {
                            //scope.select(scope.$eval(angular.element(angular.element(this).find('li')[index]).attr('val')), true);
                            scope.select(scope.suggestions[index]);
                        }
                        else {
                            if (scope.suggestions.length === 1) {
                                scope.select(scope.suggestions[0]);
                                //console.log('scanning:' + scope.scanning + ' keyupFiredCount:' + keyupFiredCount);
                                keyupFiredCount = 0;
                            }
                            else if ((keyupFiredCount <= 1) && (scope.searchParam && scope.searchParam !== '') && scope.searchParam.length >= 4) {
                                scope.scanning = true;
                                console.log('scanning:' + scope.scanning + ' keyupFiredCount:' + keyupFiredCount);
                                keyupFiredCount = 0;
                            }
                        }
                        scope.setIndex(-1);
                        $scopeApply();

                        break;
                    case key.space:
                        index = scope.getIndex();
                        break;
                    case key.esc:
                        // disable suggestions on escape
                        scope.select();
                        scope.setIndex(-1);
                        $scopeApply();
                        e.preventDefault();
                        break;
                    default:
                        return;
                }

                if (scope.getIndex() !== -1 || keycode == key.enter)
                    e.preventDefault();
            });

            var itemTemplate = $('#' + attrs.templateId).text();
            var arrTemplate = [];
            for (var i = 0; i < template.length; i++) {
                if (template[i] === '$AutocompleteTemplate$') {
                    arrTemplate.push(itemTemplate);
                }
                else {
                    arrTemplate.push(template[i]);
                }
            }

            //Compile Template
            element.append($compile(arrTemplate.join(''))(scope));
            //Focus Textbox
            //angular.element(element).find('input[type="text"]')[0].focus();
        }
        //templateUrl: ''
    };
}]);

app.directive('suggestion', function () {
    return {
        restrict: 'A',
        require: '^autocomplete', // ^look for controller on parents element
        link: function (scope, element, attrs, autoCtrl) {
            element.bind('mouseenter', function () {
                autoCtrl.preSelect(attrs.val);
                autoCtrl.setIndex(attrs.index);
            });

            element.bind('mouseleave', function () {
                autoCtrl.preSelectOff();
            });
        }
    };
});