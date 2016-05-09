angular.module('td.tabs', [])
    .directive('tabs', function (TabsService) {
        return {
            scope: {
                tabDefault: '@'
            },
            restrict: 'E',
            transclude: true,

            controller: function tabsController($scope) {
                TabsService.setOpenTabIndex($scope.tabDefault);
            },

            link: function (scope, element, attrs) {
                const required = ['tabDefault'];
                const directiveTag = 'tabs';

                TabsService.validateAttributesForTag(attrs, required, directiveTag);
            },

            template: `
                <div class="td-tabs">
                    <ng-transclude></ng-transclude>
                </div>
            `
        };
    })
    .directive('tabNav', function () {
        return {
            scope: {},
            restrict: 'E',

            controller: function tabNavController($scope, TabsService, $interval) {
                /**
                 * Array of tab objects - {tabIndex, title}
                 * @type {Array}
                 */
                $scope.tabs = [];

                /**
                 * Initializes the tabbed navigation dynamically using
                 * the title and tab index specified for each <tab-content>
                 */
                (function initTabNav() {
                    let tabTitlesPollingInterval = $interval(() => {
                        let tabIndexTitlesMap = TabsService.getTabIndexTitlesMap();

                        if (Object.keys(tabIndexTitlesMap).length === 0) {
                            return;
                        }

                        $interval.cancel(tabTitlesPollingInterval);

                        angular
                            .forEach(tabIndexTitlesMap, (value, key) => {
                                $scope.tabs.push({ tabIndex: key, title: value });
                            });
                    }, 300);
                })();

                /**
                 * Sets the openTabIndex in the TabsService
                 * @param  {Number}
                 */
                $scope.openTab = (tabIndex) => TabsService.setOpenTabIndex(tabIndex);

                /**
                 * Gets an ng-style object containing the active class
                 * @param  {Number}
                 * @return {Object {active} }
                 */
                $scope.getActiveTabClass = (tabIndex) => ({
                    active: TabsService.getOpenTabIndex() === tabIndex
                });
            },

            template: `
                <div class="td-tab-nav">
                    <a  class="td-tab-link"
                        ng-repeat="tab in tabs"
                        ng-class="getActiveTabClass(tab.tabIndex)"
                        ng-click="openTab(tab.tabIndex)">
                        {{ tab.title }}
                    </a>
                </div>
            `
        }
    })
    .directive('tabContent', function (TabsService) {
        return {
            scope: {
                tabIndex: '@',
                tabTitle: '@'
            },
            restrict: 'E',
            transclude: true,

            controller: function tabContentController($scope) {
                (function initTabContentController() {
                    TabsService.setTabTitleForTabIndex($scope.tabTitle, $scope.tabIndex);
                })();

                /**
                 * Gets the tab index for the tab that should be open
                 * @return {Number}
                 */
                $scope.getOpenTabIndex = () => TabsService.getOpenTabIndex();

                /**
                 * Determines if a tab should be dislayed based on the tab's index
                 * @return {Boolean}
                 */
                $scope.shouldShowTab = () => $scope.getOpenTabIndex() === $scope.tabIndex;
            },

            link: function (scope, element, attrs) {
                const required = ['tabIndex', 'tabTitle'];
                const directiveTag = 'tab-content';

                TabsService.validateAttributesForTag(attrs, required, directiveTag);
            },

            template: `
                <div class="td-tab-content" ng-show="shouldShowTab()">
                    <ng-transclude></ng-transclude>
                </div>
            `
        };
    })
    .factory('TabsService', function () {
        let _tabServiceState = {
            openTabIndex: null,
            tabIndexTitlesMap: {}
        };

        /**
         * Validates that the user has included all of the required attributes
         * @param  {Object} `attrs` for NG link function
         * @param  {Array<String>} required attributes
         * @param  {String} directive tag name
         */
        const validateAttributesForTag = (attrs, requiredAttrs, directiveTag) => {
            const missingAttrs = requiredAttrs.filter((attr) => !attrs[attr]);

            if (missingAttrs.length) {
                console.warn(`<${directiveTag}> requires attributes: ${missingAttrs.join(', ')}`);
            }
        };

        /**
         * Sets the tab index that should currently be open
         * @return {Number}
         */
        const setOpenTabIndex = (tabIndex) => {
            _tabServiceState.openTabIndex = tabIndex;
        };

        /**
         * Returns the tab index that should currently be open
         * @return {Number} tabIndex
         */
        const getOpenTabIndex = () => _tabServiceState.openTabIndex;

        /**
         * Adds the tab index and title to the tabIndexTitlesMap
         * @param  {String} title
         * @param  {Number} tabIndex
         */
        const setTabTitleForTabIndex = (title, tabIndex) => {
            if (!title || !tabIndex) {
                throw new Error('Both tab title and tab index arguments need to be provided to setTabTitleForTabIndex(title, tabIndex)');
            };

            _tabServiceState.tabIndexTitlesMap[tabIndex] = title;
        };

        /**
         * Returns a hash map-like object of tab titles by tab index
         * @return {Object} hashMap { tabIndex: title }
         */
        const getTabIndexTitlesMap = () => _tabServiceState.tabIndexTitlesMap;

        /**
         * Gets the title for the corresponding tab index stored in tabIndexTitlesMap
         * @param  {Number} tabIndex
         * @return {String} title
         */
        const getTabTitle = (tabIndex) => _tabServiceState.tabIndexTitlesMap[tabIndex];

        return {
            validateAttributesForTag,
            setOpenTabIndex,
            getOpenTabIndex,
            setTabTitleForTabIndex,
            getTabIndexTitlesMap,
            getTabTitle
        };
    });
    ;
