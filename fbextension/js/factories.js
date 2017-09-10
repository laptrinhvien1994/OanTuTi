factory("settingsGlobal", ['$q', '$timeout', '$rootScope', 'settingService', 'printer', function ($q, $timeout, $rootScope, posimSettingService, printer) {
    return {
        initializeSetting: function (localtion) {
            var deferred = $q.defer();
            //if (localtion == 'home' || localStorage.settings == undefined) {
            if (localStorage.settings == undefined) {
                $.ajax({
                    type: "POST",
                    url: "/api/auth/GetSettings",
                }).done(function (dataResponse) {
                    POSIM.settings.clientSession.accessToken = dataResponse.accessToken;
                    localStorage.setItem("settings", JSON.stringify(dataResponse));
                    $rootScope.setting = angular.copy(dataResponse);
                    /*IsAdmin*/
                    if ($rootScope.setting.allUsers.UserProfiles.length > 0) {
                        var users = $rootScope.setting.allUsers.UserProfiles.filter(function (u) {
                            return u.UserId == $rootScope.setting.userProfile.UserId;
                        });
                        if (users.length > 0) {
                            $rootScope.isAdmin = users[0].IsAdmin;
                        }
                    }
                    deferred.resolve(dataResponse);
                    //Print Template
                    //Initialize Print Templates
                    var request = {};
                    posimSettingService.getPrintTemplates(request,
                        function (data) {
                            printer.initializeTemplates(data);
                            if (data && data.templates && data.templates.length > 0) {
                                printTemplate = data.templates[0].content;
                                localStorage.setItem('printTemplateList_' + $rootScope.setting.companyInfo.CompanyId, JSON.stringify(data));
                            }
                            else {
                                printTemplate = '';
                            }
                            localStorage.setItem('printTemplate', printTemplate);
                        },
                        function (error) {
                            printer.initializeTemplates();
                            console.log(error);
                        });
                });
            }
            else {
                var settings = JSON.parse(localStorage.settings);
                POSIM.settings.clientSession.accessToken = settings.accessToken;
                $rootScope.setting = angular.copy(settings);
                /*IsAdmin*/
                if ($rootScope.setting.allUsers.UserProfiles.length > 0) {
                    var users = $rootScope.setting.allUsers.UserProfiles.filter(function (u) {
                        return u.UserId == $rootScope.setting.userProfile.UserId;
                    });
                    if (users.length > 0) {
                        $rootScope.isAdmin = users[0].IsAdmin;
                    }
                }
                deferred.resolve(settings);
                
                //Load default print template
                var localPrintStorage = 'printTemplateList_' + $rootScope.setting.companyInfo.CompanyId;
                if (localStorage.getItem(localPrintStorage) != null && localStorage.getItem(localPrintStorage) != undefined) {
                    var printTemplateList = JSON.parse(localStorage.getItem(localPrintStorage));
                    printer.initializeTemplates(printTemplateList);
                }
                else {
                    printer.initializeTemplates();
                }
            }

            if ($rootScope.pageOptions == undefined ||  $rootScope.pageOptions == null) {
                $rootScope.pageOptions = {
                    path: '/dashboard',
                    pageIndex: 1,
                    pageSize: 10,
                    keyword: '',
                }
            }
            return deferred.promise;
        },
        getSetting: function () {
            if (!localStorage.settings) return null;
            var settings = JSON.parse(localStorage.settings);
            return settings;
        },
        setSetting: function (setting) {
            localStorage.setItem("settings", JSON.stringify(setting));
            $rootScope.setting = setting;
        },
        setPageOptions: function(optionPath, options)
        {
            $rootScope.pageOptions = {};
            $rootScope.pageOptions = options;
            $rootScope.pageOptions.path = optionPath;
        }
    };
}]);