app.factory('printer', ['$rootScope', '$compile', '$http', '$timeout', function ($rootScope, $compile, $http, $timeout) {
    var printHtml = function (html) {
        var htmlContent =
             "<!DOCTYPE HTML>" +
             "<html>" +
             "<head>" +
             '<meta charset="utf-8">' +
             '<meta http-equiv= "X-UA-Compatible" content="IE=edge">' +
             '<meta name="viewport" content="width=device-width, initial-scale=1">' +
             '<link rel="stylesheet" href="/Content/themes/ace/css/printOrderBarcode.css" type="text/css">' +
             '</head>' +
                        '<body onload="print();">' +

                            html +
                        '</body>' +
                    "</html>";

        var ua = window.navigator.userAgent.toLowerCase(),
        platform = window.navigator.platform.toLowerCase();
        platformName = ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (ua.match(/(?:webos|android)/) || platform.match(/mac|win|linux/) || ['other'])[0];
        var isMobile = /ios|android|webos/.test(platformName);
        if (isMobile) {
            openNewWindow(html);
            return;
        }
        var hiddenFrame = $('<iframe style="visibility: hidden; border: none; pointer-events: none;"></iframe>').appendTo('body')[0];

        var doc;
        if (hiddenFrame.contentDocument) { // DOM
            doc = hiddenFrame.contentDocument;
        } else if (hiddenFrame.contentWindow) { // IE win
            doc = hiddenFrame.contentWindow.document;
        } else {
            console.log('Could not print for browser ' + window.navigator.userAgent);
            return;
        }
        doc.write(htmlContent);
        doc.close();

        var print = function () {
            if (window.navigator.userAgent.indexOf("MSIE") > 0) {
                hiddenFrame.contentWindow.document.execCommand('print', false, null);
            }
            else {
                hiddenFrame.contentWindow.focus();
                hiddenFrame.contentWindow.print();
            }
            $(hiddenFrame).remove();
        }
    };

    var openNewWindow = function (html) {
        var newWindow = window.open("https://pos.suno.vn/print.html");
        newWindow.addEventListener('load', function () {

            $(newWindow.document.body).html(html);
        }, false);
        //var newWindow = window.open("print.html");

        var htmlContent =
     "<!DOCTYPE HTML>" +
     "<html>" +
     "<head>" +
     '<meta charset="utf-8">' +
     '<meta http-equiv= "X-UA-Compatible" content="IE=edge">' +
     '<meta name="viewport" content="width=device-width, initial-scale=1">' +
     '<link rel="stylesheet" href="/Content/themes/ace/css/printOrderBarcode.css" type="text/css">' +
     '</head>' +
                '<body onload="print();">' +

                    html +
                '</body>' +
            "</html>";

        newWindow.document.write(htmlContent);
        //newWindow.print();
    };

    var print = function (template, data) {
        var printScope = $rootScope.$new()
        angular.extend(printScope, data);
        var element = $compile($('<div>' + template + '</div>'))(printScope);
        var waitForRenderAndPrint = function () {
            if (printScope.$$phase || $http.pendingRequests.length) {
                $timeout(waitForRenderAndPrint);
            } else {
                // Replace printHtml with openNewWindow for debugging
                printHtml(element.html());
                //openNewWindow(element.html());
                printScope.$destroy();
            }
        }
        waitForRenderAndPrint();
    };

    var printMultiPages = function(templates, data)
    {
        var content = '';
        var object = { count: 0, content: '', templates: templates, data: data };
        var callback = function () {
            printHtml(object.content);
        }      
        appendContent(object, callback);
    }

    var appendContent = function(o, callback)
    {
        if (o.count == o.templates.length) {
            callback();
            return;
        }
        var printScope = $rootScope.$new();
        angular.extend(printScope, o.data[o.count]);
        var linkFunction = $compile(angular.element('<div><div>' + o.templates[o.count] + '</div></div>'));
        var element = linkFunction(printScope);
        //Preventing call $digest when angular $digest is calling.
        if(o.count > 0){
            $rootScope.$apply();
        }
        var waitForRenderAndPrint = function () {
            if (printScope.$$phase || $http.pendingRequests.length) {
                $timeout(waitForRenderAndPrint); 
            } else {
                o.content += element.html();
                if (o.count < o.templates.length - 1)
                {
                    o.content += '<p style="page-break-before : always;"></p>';
                }
                o.count++;
                printScope.$destroy();
                appendContent(o, callback);
            }
        }
        waitForRenderAndPrint();
    }

    var findSelectedTemplate = function (type) {
        for (var i = 0; i < PrintSetting.Templates.length; i++) {
            //if (PrintSetting.Templates[i].Type === type && PrintSetting.Templates[i].IsSelected)
            if (PrintSetting.Templates[i].Type === type)
                return PrintSetting.Templates[i];
        }
        return null;
    }

    var findTemplate = function (code, type) {
        for (var i = 0; i < PrintSetting.Templates.length; i++) {
            if (PrintSetting.Templates[i].Type === type && PrintSetting.Templates[i].Code === code)
                return PrintSetting.Templates[i];
        }
        return null;
    }

    var initializeTemplates = function (data) {
        if (data && data.templates && data.templates.length > 0) {
            var isSelected = false;
            for (var i = 0; i < data.templates.length; i++) {
                var template = findTemplate(data.templates[i].code, data.templates[i].type);
                if (template) {
                    template.Content = data.templates[i].content;
                    template.IsSelected = data.templates[i].isSelected;
                    if (template.IsSelected) isSelected = true;
                }
            }

            for (var i = 0; i < PrintSetting.Templates.length; i++) {
                if (PrintSetting.Templates[i].Content == '') {
                    PrintSetting.Templates[i].Content = PrintSetting.Templates[i].Original;
                    if (isSelected) PrintSetting.Templates[i].IsSelected = false;
                }
            }
        }
        else {
            for (var i = 0; i < PrintSetting.Templates.length; i++) {
                PrintSetting.Templates[i].Content = PrintSetting.Templates[i].Original;
            }
        }
    }

    function escapeRegExp(str) {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    }

    var initializeOrder = function (template, type) {
        var isTemplateError = false;
        if (!template) {
            if (!type) template = findSelectedTemplate(1);
            else template = findSelectedTemplate(type);
        }
        if (!template) return null;
        var content = Encoder.htmlDecode(template.Content);
        //Relplace E:expresion by M:model
        for (i = 0; i < template.TemplAttrs.length; i++) {
            //content = content.replace(template.TemplAttrs[i].E, template.TemplAttrs[i].M);
            content = replaceAll(content, template.TemplAttrs[i].E, template.TemplAttrs[i].M);
        }
        //For ng-repeat
        var el = $('<div>' + content + '</div>');
        

        //materials
        var materials = el.find("tr:contains('material.')");
        if (!materials || materials.length == 0) {
            materials = el.find("ul:contains('material.')");
        }

        if (!materials || materials.length == 0) {
            materials = el.find("div:contains('material.')");
        }

        if (materials != undefined && materials.length > 0) {
            if (materials.length == 1) {
                $(materials[0]).attr("ng-repeat", "material in item.materials");
            }
            else {
                if (materials[0].parentNode === materials[materials.length - 1].parentNode) {
                    $(materials[0]).attr("ng-repeat-start", "material in item.materials");
                    $(materials[materials.length - 1]).attr("ng-repeat-end", "");
                }
            }
        }

        var items = el.find("tr:contains('item.')");
        if (!items || items.length == 0) {
            items = el.find("ul:contains('item.')");
        }

        if (!items || items.length == 0) {
            items = el.find("div:contains('item.')");
        }

        if (items != undefined && items.length > 0) {
            if (items.length == 1) {
                $(items[0]).attr("ng-repeat", "item in orderDetails");
            }
            else {
                if (items[0].parentNode === items[items.length - 1].parentNode) {
                    $(items[0]).attr("ng-repeat-start", "item in orderDetails");
                    $(items[items.length - 1]).attr("ng-repeat-end", "");
                }
                else {
                    isTemplateError = true;
                }
            }
        }
        else {
            if (template.Type == 32 || template.Type == 128 || template.Type == 255 || template.Type == 257) isTemplateError = false;
            else isTemplateError = true;
        }
        return isTemplateError ? null : el.html();
    }

    return {
        print: print,
        printMultiPages: printMultiPages,
        initializeTemplates: initializeTemplates,
        initializeOrder: initializeOrder,
        findSelectedTemplate: findSelectedTemplate
    }
}]);

if (!window.PrintSetting) window.PrintSetting = PrintSetting = {
    PrintPageSizes: [
        { id: 3, name: 'Khổ in A58' },
        { id: 4, name: 'Khổ in A80' },
        { id: 2, name: 'Khổ in A5' },
        { id: 1, name: 'Khổ in A4' }
    ],
    Templates: [
        //Type: 1, //1: Ban hang POS
        {
            Code: 'Sale_order_small',
            Type: 1, //1: Ban hang POS
            Name: 'Hóa đơn bán hàng (POS)',
            Content: '',
            Original: '<table style="width:100%">' +
                        '<tbody>' +
                        '<tr> <td style="">{Ten_Cua_Hang}</td> </tr>' +
                        '<tr> <td style=""><span>Địa chỉ: {Dia_Chi_Cua_Hang}</span></td> </tr>' +
                        '<tr> <td style=""><span>Điện thoại: {SDT_Cua_Hang}</span></td> </tr>' +
                        '</tbody>' +
                        '</table>' +
                        '<div style="text-align:center;">' +
                        '<span><strong style="text-align:center;font-size:14px;">HÓA ĐƠN BÁN HÀNG</strong></span>' +
                        '<br/>' +
                        '<span><strong style="text-align:center;font-size:14px;">{Ma_Don_Hang}</strong></span>' +
                        '</div>' +
                        '<div style=""><span><strong>Ngày bán:</strong> {Ngay_Xuat}</span></div>' +
                        '<div style=""><span><strong>Khách hàng:</strong> {Khach_Hang}</span></div>' +
                        '<div style="" ng-if="applyEarningPoint"><span><strong>Điểm tích lũy:</strong> {Diem_Con_Lai}</span></div>' +
                        '<div style=""><span><strong>Thu ngân:</strong> {Nhan_Vien_Thu_Ngan}</span></div>' +
                        '<br />' +
                        '<table style="width:100%" padding="2">' +
                        '<tbody>' +
                        '<tr>' +
                        '<td style="width:35%;"><strong><span>Đơn giá</span></strong><br /></td>' +
                        '<td style="text-align:center;width:30%;"><strong><span>SL</span></strong><br /></td>' +
                        '<td style="text-align:center;"><strong><span>Đơn vị</span></strong><br /></td>' +
                        '<td style="text-align:right;padding-right:10px;"><strong><span>TT</span></strong><br /></td>' +
                        '</tr>' +
                        '<tr> <td colspan="4"><span>{Ten_Hang_Hoa}</span><br /></td></tr>' +
                        '<tr>' +
                        '<td style=""><span>{Don_Gia_Sau_Giam_Gia}</span><br /></td>' +
                        '<td style="text-align:center;"><span>{So_Luong}</span><br /></td>' +
                        '<td style="text-align:center;"><span>{Don_Vi_Hang_Hoa}</span><br /></td>' +
                        '<td style="text-align:right;padding-right:10px;"><span>{Thanh_Tien}</span><br /></td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style=""><span>&emsp; - {Ten_Thanh_Phan}</span><br /></td>' +
                        '<td style="text-align:center;"><span>{So_Luong_Thanh_Phan}</span><br /></td>' +
                        '<td style="text-align:center;"><span>{Don_Vi_Thanh_Phan}</span><br /></td>' +
                        '<td style="text-align:right;padding-right:10px;">{Thanh_Phan_Rong}</td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '<br/>' +
                        '<table style="width:100%">' +
                        '<tbody>' +
                        '<tr>' +
                        '<td style="text-align:right;"><span>Tổng tiền hàng:</span><br /></td>' +
                        '<td style="text-align:right;padding-right:10px;"><span>{Tong_Tien_Hang}</span><br /></td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="text-align:right;"><span>Giảm giá:</span><br /></td>' +
                        '<td style="text-align:right;padding-right:10px;"><span>{Giam_Gia_Tren_Hoa_Don}</span><br /></td>' +
                        '</tr>' +
                        '<tr ng-if="exchangedMoney > 0">' +
                        '<td style="text-align:right;"><span>Tiền đổi:</span><br /></td>' +
                        '<td style="text-align:right;padding-right:10px;"><span>{Tien_Quy_Doi}</span><br /></td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="text-align:right;"><span>Tổng thanh toán:</span><br /></td>' +
                        '<td style="text-align:right;padding-right:10px;"><strong><span>{Tong_Thanh_Toan}</span></strong><br /></td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '<p style="text-align:left;"><span>Ghi chú: </span> {Ghi_Chu}</p>' +
                        '<div style="text-align:left;">' +
                        '<span>Xin cảm ơn và hẹn gặp lại!</span>' +
                        '</div >',
            IsSelected: true,
            IsShow: true,
            TemplAttrs:
                [
                    { E: '{Ten_Cua_Hang}', M: '{{companyName}}' },
                    { E: '{Dia_Chi_Cua_Hang}', M: '{{companyAddress}}' },
                    { E: '{SDT_Cua_Hang}', M: '{{companyPhone}}' },
                    { E: '{Ten_Chi_Nhanh}', M: '{{storeName}}' },
                    { E: '{Dia_Chi_Chi_Nhanh}', M: '{{storeAddress}}' },
                    { E: '{SDT_Chi_Nhanh}', M: '{{storePhone}}' },
                    { E: '{Ngay_Xuat}', M: '{{saleDateString}}' },
                    { E: '{Ngay_Thang_Nam}', M: '{{Date | date:"dd/MM/yyyy HH:mm:ss"}}' },
                    { E: '{Ghi_Chu}', M: '{{comment}}' },
                    { E: '{Ma_Don_Hang}', M: '{{saleOrderCode}}' },
                    { E: '{Nhan_Vien_Ban_Hang}', M: '{{saleUserName}}' },
                    { E: '{Nhan_Vien_Thu_Ngan}', M: '{{cashierName}}' },
                    { E: '{Ma_Khach_Hang}', M: '{{customer.code}}' },
                    { E: '{Khach_Hang}', M: '{{customer.name}}' },
                    { E: '{So_Dien_Thoai}', M: '{{customer.phone}}' },
                    { E: '{Dia_Chi_Khach_Hang}', M: '{{customer.address}}' },
                    { E: '{Email_Khach_Hang}', M: '{{customer.emails != null && customer.emails.length > 0 ? customer.emails[0].email : ""}}' },
                    { E: '{STT}', M: '{{$index+1}}' },
                    { E: '{Ma_Hang}', M: '{{item.barcode}}' },
                    { E: '{Mon_phu}', M: '{{item.isChild}}' },
                    { E: '{Ten_Hang_Hoa}', M: '{{item.itemName}} <i style="display:block; width:95%; word-break:break-all;" data-ng-if="item.isSerial==true">(<span ng-repeat="s in item.serials">{{s.serial}}{{$last ? "" : ","}}</span>)</i>' },
                    { E: '{So_Luong}', M: '{{item.quantity}}' },
                    { E: '{Don_Gia_Sau_Giam_Gia}', M: '{{item.discountIsPercent ? item.unitPrice*(1-item.discount/100): item.unitPrice - item.discount | number:0}}' },
					{ E: '{Don_Gia}', M: '{{item.unitPrice | number:0}}' },
                    { E: '{Giam_Gia}', M: '{{item.discountIsPercent ? item.discount * item.unitPrice / 100 : item.discount | number:0}}' },
                    { E: '{Giam_Gia_HH}', M: '<span data-ng-if="item.discount > 0 && item.discountIsPercent">{{item.discount | number:2}}%</span><span data-ng-if="item.discount > 0 && !item.discountIsPercent">{{item.discount | number:0}}</span>' },
                    { E: '{Thanh_Tien}', M: '{{item.subTotal | number:0}}' },
                    { E: '{Tong_So_Luong}', M: '{{totalQuantity}}' },
                    { E: '{Tong_Tien_Hang}', M: '{{subTotal | number:0}}' },
                    { E: '{Giam_Gia_Tren_Hoa_Don}', M: '{{discount | number:0}}' },
                    { E: '{Giam_Gia_PT_Tren_Hoa_Don}', M: '{{(discount*100/subTotal) | number:2}}' },
                    { E: '{Phu_Phi}', M: '{{subFee | number:0}}' },
                    { E: '{Tong_Thanh_Toan}', M: '{{total | number:0}}' },
                    { E: '{Da_Thanh_Toan}', M: '{{amountPaid | number:0}}' },
                    { E: '{Chua_Thanh_Toan}', M: '{{paymentBalance | number:0}}' },
                    { E: '{Tien_Thua}', M: '{{amountPaid - total | number:0}}' },
                    { E: '{Tong_No_Khach_Hang}', M: '{{totalPaymentBalance | number:0}}' },
                    { E: '{No_Cu_Khach_Hang}', M: '{{totalOldBalance | number:0}}' },
                    { E: '{No_Con_Lai_Khach_Hang}', M: '{{totalRemainBalance | number:0}}' },
                    { E: '{Diem_Tich_Luy}', M: '{{convertPoint | number:0}}' },
                    { E: '{Diem_Quy_Doi}', M: '{{exchangedPoint | number:0}}' },
                    { E: '{Diem_Con_Lai}', M: '{{customer.remainPoint | number:0}}' },
                    { E: '{Tien_Quy_Doi}', M: '{{exchangedMoney | number: 0}}' },
                    { E: '{Tong_Tien_Bang_Chu}', M: '{{totalAsWords}}' },
                    { E: '{Tong_Giam_Gia_Tren_Hang_Hoa}', M: '{{totalDiscount | number:2}}' },
                    //VAT
                    { E: '{Vat_Hang_Hoa}', M: '{{item.vat | number:0}}' },
                    { E: '{Vat_Don_Hang}', M: '{{totalVat | number:0}}' },
                    { E: '{Don_Gia_Truoc_Vat}', M: '{{(item.discountIsPercent ? item.unitPrice*(1-item.discount/100): item.unitPrice - item.discount) - item.vat | number:0}}' },
                    { E: '{Thanh_Tien_Truoc_Vat}', M: '{{item.quantity * ((item.discountIsPercent ? item.unitPrice*(1-item.discount/100): item.unitPrice - item.discount) - item.vat) | number:0}}' },
                    { E: '{Tong_Tien_Hang_Truoc_Vat}', M: '{{subTotalWithoutVat | number:0}}' },
                    //Exchange quantity
                    { E: '{Don_Vi_Hang_Hoa}', M: '{{item.unit}}' },
                    //Produce
                    { E: '{Ten_Thanh_Phan}', M: '{{material.itemName}}' },
                    { E: '{So_Luong_Thanh_Phan}', M: '{{material.quantity}}' },
                    { E: '{Don_Vi_Thanh_Phan}', M: '{{material.unitName}}' },
                    { E: '{Thanh_Phan_Rong}', M: '{{item.empty}}' }
                ]
        },
        //Type: 2, //2:Don hang
        {
            Code: 'Sale_order_large',
            Name: 'Hóa đơn bán hàng (Đơn hàng)',
            Type: 2, //2:Don hang
            Content: '',
            Original: '<table style="width:100%;">' +
                                '<tbody>' +
                                '<tr> <td>{Ten_Cua_Hang}</td> </tr>' +
                                '<tr> <td><span>Địa chỉ: {Dia_Chi_Cua_Hang}</span></td> </tr>' +
                                '<tr> <td><span>Điện thoại: {SDT_Cua_Hang}</span></td> </tr>' +
                                '</tbody>' +
                                '</table>' +
                                '<div style="text-align:center;">' +
                                '<span><strong>HÓA ĐƠN BÁN HÀNG</strong></span>' +
                                '<br/>' +
                                '<span><strong>{Ma_Don_Hang}</strong></span>' +
                                '</div>' +
                                '<div><span><strong>Ngày bán:</strong> {Ngay_Xuat}</span></div>' +
                                '<div><span><strong>Khách hàng:</strong> {Khach_Hang}</span></div>' +
                                '<div ng-if="applyEarningPoint"><span><strong>Điểm tích lũy:</strong> {Diem_Con_Lai}</span></div>' +
                                '<div><span><strong>Thu ngân:</strong> {Nhan_Vien_Thu_Ngan}</span></div>' +
                                '<br />' +
                                '<table style="width:100%; border-collapse: collapse" border="1">' +
                                '<tbody>' +
                                '<tr>' +
                                '<td style="text-align:center;width:5%;"><strong><span>STT</span></strong></td>' +
                                '<td style="width:40%;padding-left:5px;"><strong><span>Tên hàng hóa</span></strong><br /></td>' +
                                '<td style="text-align:right;padding-right:5px;width:15%;"><strong><span>Đơn giá</span></strong><br /></td>' +
                                '<td style="text-align:right;padding-right:5px;width:15%;"><strong><span>Giảm giá</span></strong><br /></td>' +
                                '<td style="text-align:center;width:7%;"><strong><span>SL</span></strong><br /></td>' +
                                '<td style="text-align:center;"><strong><span>Đơn vị</span></strong><br /></td>' +
                                '<td style="text-align:right;padding-right:5px;width:18%;"><strong><span>Thành tiền</span></strong><br /></td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td style="text-align:center;width:5%;"><span>{STT}</span><br /></td>' +
                                '<td style="width:40%;padding-left:5px;"><span>{Ten_Hang_Hoa}</span><br /></td>' +
                                '<td style="text-align:right;padding-right:5px;"><span>{Don_Gia}</span><br /></td>' +
                                '<td style="text-align:right;padding-right:5px;"><span>{Giam_Gia}</span><br /></td>' +
                                '<td style="text-align:center;"><span>{So_Luong}</span><br /></td>' +
                                '<td style="text-align:center;"><span>{Don_Vi_Hang_Hoa}</span><br /></td>' +
                                '<td style="text-align:right;padding-right:5px;"><span>{Thanh_Tien}</span><br /></td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td style="text-align:center;"></td>' +
                                '<td style=""><span>&emsp; - {Ten_Thanh_Phan}</span><br /></td>' +
                                '<td style="text-align:center;"></td>' +
                                '<td style="text-align:center;"></td>' +
                                '<td style="text-align:center;"><span>{So_Luong_Thanh_Phan}</span><br /></td>' +
                                '<td style="text-align:center;"><span>{Don_Vi_Thanh_Phan}</span><br /></td>' +
                                '<td style="text-align:right;padding-right:10px;">{Thanh_Phan_Rong}</td>' +
                                '</tr>' +
                                '</tbody>' +
                                '</table>' +
                                '<br/>' +
                                '<table style="width:100%;">' +
                                '<tbody>' +
                                '<tr>' +
                                '<td style="text-align:right;"><span>Tổng tiền hàng:</span><br /></td>' +
                                '<td style="text-align:right;"><span>{Tong_Tien_Hang}</span><br /></td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td style="text-align:right;"><span>Giảm giá:</span><br /></td>' +
                                '<td style="text-align:right;"><span>{Giam_Gia_Tren_Hoa_Don}</span><br /></td>' +
                                '</tr>' +
                                '<tr ng-if="exchangedMoney > 0">' +
                                '<td style="text-align:right;"><span>Tiền đổi:</span><br /></td>' +
                                '<td style="text-align:right;"><span>{Tien_Quy_Doi}</span><br /></td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td style="text-align:right;"><span>Phí vận chuyển:</span><br /></td>' +
                                '<td style="text-align:right;"><span>{Phu_Phi}</span><br /></td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td style="text-align:right;"><strong><span>Tổng thanh toán:</span></strong><br /></td>' +
                                '<td style="text-align:right;"><strong><span>{Tong_Thanh_Toan}</span></strong><br /></td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td style="text-align:right;"><span>Đã thanh toán:</span><br /></td>' +
                                '<td style="text-align:right;"><span>{Da_Thanh_Toan}</span><br /></td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td style="text-align:right;"><span>Còn nợ:</span><br /></td>' +
                                '<td style="text-align:right;"><span>{Chua_Thanh_Toan}</span><br /></td>' +
                                '</tr>' +
                                '</tbody>' +
                                '</table>' +
                                '<p><span>Ghi chú: </span> {Ghi_Chu}</p>',
            IsSelected: false,
            IsShow: true,
            TemplAttrs:
                        [
                            { E: '{Ten_Cua_Hang}', M: '{{companyName}}' },
                            { E: '{Dia_Chi_Cua_Hang}', M: '{{companyAddress}}' },
                            { E: '{SDT_Cua_Hang}', M: '{{companyPhone}}' },
                            { E: '{Ten_Chi_Nhanh}', M: '{{storeName}}' },
                            { E: '{Dia_Chi_Chi_Nhanh}', M: '{{storeAddress}}' },
                            { E: '{SDT_Chi_Nhanh}', M: '{{storePhone}}' },
                            { E: '{Ngay_Xuat}', M: '{{saleDateString}}' },
                            { E: '{Ngay_Thang_Nam}', M: '{{Date | date:"dd/MM/yyyy HH:mm:ss"}}' },
                            { E: '{Ghi_Chu}', M: '{{comment}}' },
                            { E: '{Ma_Don_Hang}', M: '{{saleOrderCode}}' },
                            { E: '{Nhan_Vien_Ban_Hang}', M: '{{saleUserName}}' },
                            { E: '{Nhan_Vien_Thu_Ngan}', M: '{{cashierName}}' },
                            { E: '{Ma_Khach_Hang}', M: '{{customer.code}}' },
                            { E: '{Khach_Hang}', M: '{{customer.name}}' },
                            { E: '{So_Dien_Thoai}', M: '{{customer.phone}}' },
                            { E: '{Dia_Chi_Khach_Hang}', M: '{{customer.address}}' },
                            { E: '{Email_Khach_Hang}', M: '{{customer.emails != null && customer.emails.length > 0 ? customer.emails[0].email : ""}}' },
                            { E: '{STT}', M: '{{$index + 1}}' },
                            { E: '{Ma_Hang}', M: '{{item.barcode}}' },
                            { E: '{Ten_Hang_Hoa}', M: '{{item.itemName}} <i style="display:block; width:95%; word-break:break-all;" data-ng-if="item.isSerial==true">(<span ng-repeat="s in item.serials">{{s.serial}}{{$last ? "" : ","}}</span>)</i>' },
                            { E: '{So_Luong}', M: '{{item.quantity}}' },
                            { E: '{Don_Gia}', M: '{{item.unitPrice | number:0}}' },
                            { E: '{Don_Gia_Sau_Giam_Gia}', M: '{{item.discountIsPercent ? item.unitPrice*(1-item.discount/100): item.unitPrice - item.discount | number:0}}' },
                            { E: '{Giam_Gia}', M: '{{item.discountIsPercent ? item.discount * item.unitPrice / 100 : item.discount | number:0}}' },
                            { E: '{Giam_Gia_HH}', M: '<span data-ng-if="item.discount > 0 && item.discountIsPercent">{{item.discount | number:2}}%</span><span data-ng-if="item.discount > 0 && !item.discountIsPercent">{{item.discount | number:0}}</span>' },
                            { E: '{Thanh_Tien}', M: '{{item.subTotal | number:0}}' },
                            { E: '{Tong_So_Luong}', M: '{{totalQuantity}}' },
                            { E: '{Tong_Tien_Hang}', M: '{{subTotal | number:0}}' },
                            { E: '{Giam_Gia_Tren_Hoa_Don}', M: '{{discount | number:0}}' },
                            { E: '{Giam_Gia_PT_Tren_Hoa_Don}', M: '{{(discount * 100/subTotal) | number:2}}' },
                            { E: '{Phu_Phi}', M: '{{subFee | number:0}}' },
                            { E: '{Tong_Thanh_Toan}', M: '{{total | number:0}}' },
                            { E: '{Da_Thanh_Toan}', M: '{{amountPaid | number:0}}' },
                            { E: '{Chua_Thanh_Toan}', M: '{{paymentBalance | number:0}}' },
                            { E: '{Tien_Thua}', M: '{{amountPaid - total | number:0}}' },
                            { E: '{Tong_No_Khach_Hang}', M: '{{totalPaymentBalance | number:0}}' },
                            //Tuan
                            //27/6
                            //Case 247 & 248
                            { E: '{Tong_Tien_Bang_Chu}', M: '{{totalAsWords}}' },
                            { E: '{Tong_Giam_Gia_Tren_Hang_Hoa}', M: '{{totalDiscount | number:2}}' },
                            { E: '{No_Cu_Khach_Hang}', M: '{{totalOldBalance | number:0}}' },
                            { E: '{No_Con_Lai_Khach_Hang}', M: '{{totalRemainBalance | number:0}}' },
                            //Diem Tich Luy
                            { E: '{Diem_Tich_Luy}', M: '{{convertPoint | number:0}}' },
                            { E: '{Diem_Quy_Doi}', M: '{{exchangedPoint | number:0}}' },
                            { E: '{Diem_Con_Lai}', M: '{{customer.remainPoint | number:0}}' },
                            { E: '{Tien_Quy_Doi}', M: '{{exchangedMoney | number: 0}}' },
                            //VAT
                            { E: '{Vat_Hang_Hoa}', M: '{{item.vat | number:0}}' },
                            { E: '{Vat_Don_Hang}', M: '{{totalVat | number:0}}' },
                            { E: '{Don_Gia_Truoc_Vat}', M: '{{(item.discountIsPercent ? item.unitPrice*(1-item.discount/100): item.unitPrice - item.discount) - item.vat | number:0}}' },
                            { E: '{Thanh_Tien_Truoc_Vat}', M: '{{item.quantity * ((item.discountIsPercent ? item.unitPrice*(1-item.discount/100): item.unitPrice - item.discount) - item.vat) | number:0}}' },
                            { E: '{Tong_Tien_Hang_Truoc_Vat}', M: '{{subTotalWithoutVat | number:0}}' },
                            //Exchange quantity
                            { E: '{Don_Vi_Hang_Hoa}', M: '{{item.unit}}' },
                            //Produce
                            { E: '{Ten_Thanh_Phan}', M: '{{material.itemName}}' },
                            { E: '{So_Luong_Thanh_Phan}', M: '{{material.quantity}}' },
                            { E: '{Don_Vi_Thanh_Phan}', M: '{{material.unitName}}' },
                            { E: '{Thanh_Phan_Rong}', M: '{{item.empty}}' }
                        ]
        },
        //Type: 16, //16:Phiếu giao hàng
        {
            Code: 'Sale_orders_list',
            Name: 'Phiếu giao hàng',
            Type: 16, //16:Phiếu giao hàng
            Content: '',
            Original: '<table style="width:100%;">' +
                      '<tbody>' +
                      '<tr> <td>{Ten_Cua_Hang}</td> </tr>' +
                      '<tr> <td><span>Địa chỉ: {Dia_Chi_Cua_Hang}</span></td> </tr>' +
                      '<tr> <td><span>Điện thoại: {SDT_Cua_Hang}</span></td> </tr>' +
                      '</tbody>' +
                      '</table>' +
                      '<div style="text-align:center;">' +
                      '<span><strong>PHIẾU GIAO HÀNG</strong></span>' +
                      '<br/>' +
                      '<span><strong>{Ma_Don_Hang}</strong></span>' +
                      '</div>' +
                      '<table style="width:100%">' +
                      '<tr style="width:50%">' +
                      '<td><span>Khách hàng: {Khach_Hang}</span></td>' +
                      '<td><span>Ngày giao: {Ngay_Xuat}</span></td>' +

                      '</tr>' + '<tr style="width:50%">' +
                      '<td><span>Số ĐT: {So_Dien_Thoai}</span></td>' +
                      '<td><span>ĐV vận chuyển: {Don_Vi_Giao}</span></td>' +

                      '</tr>' +
                      '<tr style="width:50%">' +
                      '<td><span>Địa chỉ: {Dia_Chi_Khach_Hang}</span></td>' +
                      '<td><span>Nhân viên giao: {Nhan_Vien_Giao}</span></td>' +

                      '</tr></table>' +
                      '<br />' +
                      '<table style="width:100%; border-collapse: collapse" border="1">' +
                      '<tbody>' +
                      '<tr>' +
                      '<td style="text-align:center;width:5%;"><strong><span>STT</span></strong></td>' +
                      '<td style="width:40%;padding-left:5px;"><strong><span >Tên hàng hóa</span></strong></td>' +
                      '<td style="text-align:right;padding-right:5px;width:15%;"><strong><span >Đơn giá</span></strong></td>' +
                      '<td style="text-align:right;padding-right:5px;width:15%;"><strong><span >Giảm giá</span></strong></td>' +
                      '<td style="text-align:center;width:7%;"><strong><span >SL</span></strong></td>' +
                      '<td style="text-align:right;padding-right:5px;width:18%;"><strong><span >Thành tiền</span></strong></td>' +
                      '</tr> <tr>' +
                      '<td style="text-align:center;width:5%;"><span>{STT}</span></td>' +
                      '<td style="width:40%;padding-left:5px;"><span >{Ten_Hang_Hoa}</span></td>' +
                      '<td style="text-align:right;padding-right:5px;"><span >{Don_Gia}</span></td>' +
                      '<td style="text-align:right;padding-right:5px;"><span >{Giam_Gia}</span></td>' +
                      '<td style="text-align:center;"><span >{So_Luong}</span></td>' +
                      '<td style="text-align:right;padding-right:5px;"><span >{Thanh_Tien}</span></td>' +
                      '</tr>' +
                      '</tbody>' +
                      '</table>' +
                      '<br/>' +
                      '<table style="width:100%;">' +
                      '<tbody>' +
                      '<tr>' +
                      '<td style="text-align:right;"><span>Tổng tiền hàng:</span><br /></td>' +
                      '<td style="text-align:right;"><span>{Tong_Tien_Hang}</span><br /></td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td style="text-align:right;"><span>Giảm giá:</span><br /></td>' +
                      '<td style="text-align:right;"><span>{Giam_Gia_Tren_Hoa_Don}</span><br /></td>' +
                      '</tr>' +
                      '<tr ng-if="exchangedMoney > 0">' +
                      '<td style="text-align:right;"><span>Tiền đổi:</span><br /></td>' +
                      '<td style="text-align:right;"><span>{Tien_Quy_Doi}</span><br /></td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td style="text-align:right;"><span>Phí vận chuyển:</span><br /></td>' +
                      '<td style="text-align:right;"><span>{Phu_Phi}</span><br /></td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td style="text-align:right;"><strong><span>Tổng thanh toán:</span></strong><br /></td>' +
                      '<td style="text-align:right;"><strong><span>{Tong_Thanh_Toan}</span></strong><br /></td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td style="text-align:right;"><span>Đã thanh toán:</span><br /></td>' +
                      '<td style="text-align:right;"><span>{Da_Thanh_Toan}</span><br /></td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td style="text-align:right;"><span>Còn nợ:</span><br /></td>' +
                      '<td style="text-align:right;"><span>{Chua_Thanh_Toan}</span><br /></td>' +
                      '</tr>' +
                      '<tr>' +
                      '<td style="text-align:right;"><span>Khách trả thêm:</span><br /></td>' +
                      '<td style="text-align:right;">...........................<br /></td>' +
                      '</tr>' +
                      '</tbody>' +
                      '</table>' +
                      '<br/>' +
                      '<table style="width:100%">' +
                      '<tr>' +
                      '<td style="width:50%;text-align:center"> Chữ ký của người giao<br/>(Ký và ghi rõ họ tên)</td>' +
                      '<td style="width:50%;text-align:center"> Chữ ký Khách hàng<br/>(Ký và ghi rõ họ tên)</td>' +
                      '</tr>' +
                      '</table>',
            IsSelected: false,
            IsShow: true,
            TemplAttrs:
                [
                    { E: '{Ten_Cua_Hang}', M: '{{companyName}}' },
                    { E: '{Dia_Chi_Cua_Hang}', M: '{{companyAddress}}' },
                    { E: '{SDT_Cua_Hang}', M: '{{companyPhone}}' },
                    { E: '{Ten_Chi_Nhanh}', M: '{{storeName}}' },
                    { E: '{Dia_Chi_Chi_Nhanh}', M: '{{storeAddress}}' },
                    { E: '{SDT_Chi_Nhanh}', M: '{{storePhone}}' },
                    { E: '{Ngay_Xuat}', M: '{{saleDateString}}' },
                    { E: '{Ngay_Thang_Nam}', M: '{{Date | date:"dd/MM/yyyy HH:mm:ss"}}' },
                    { E: '{Ghi_Chu}', M: '{{comment}}' },
                    { E: '{Ma_Don_Hang}', M: '{{saleOrderCode}}' },
                    { E: '{Ma_Khach_Hang}', M: '{{customer.code}}' },
                    { E: '{Khach_Hang}', M: '{{customer.name}}' },
                    { E: '{So_Dien_Thoai}', M: '{{customer.phone}}' },
                    { E: '{Dia_Chi_Khach_Hang}', M: '{{customer.address}}' },
                    { E: '{Email_Khach_Hang}', M: '{{customer.emails != null && customer.emails.length > 0 ? customer.emails[0].email : ""}}' },
                    { E: '{STT}', M: '{{$index + 1}}' },
                    { E: '{Ma_Hang}', M: '{{item.barcode}}' },
                    { E: '{Ten_Hang_Hoa}', M: '{{item.itemName}}' },
                    { E: '{So_Luong}', M: '{{item.quantity}}' },
                    { E: '{Don_Gia}', M: '{{item.unitPrice | number:0}}' },
                    { E: '{Don_Gia_Sau_Giam_Gia}', M: '{{item.discountIsPercent ? item.unitPrice*(1-item.discount/100): item.unitPrice - item.discount | number:0}}' },
                    { E: '{Giam_Gia}', M: '{{item.discountIsPercent ? item.discount * item.unitPrice / 100 : item.discount | number:0}}' },
                    { E: '{Giam_Gia_HH}', M: '<span data-ng-if="item.discount > 0 && item.discountIsPercent">{{item.discount | number:2}}%</span><span data-ng-if="item.discount > 0 && !item.discountIsPercent">{{item.discount | number:0}}</span>' },
                    { E: '{Thanh_Tien}', M: '{{item.subTotal | number:0}}' },
                    { E: '{Tong_So_Luong}', M: '{{totalQuantity}}' },
                    { E: '{Tong_Tien_Hang}', M: '{{subTotal | number:0}}' },
                    { E: '{Giam_Gia_Tren_Hoa_Don}', M: '{{discount | number:0}}' },
                    { E: '{Giam_Gia_PT_Tren_Hoa_Don}', M: '{{(discount * 100/subTotal) | number:2}}' },
                    { E: '{Phu_Phi}', M: '{{subFee | number:0}}' },
                    { E: '{Tong_Thanh_Toan}', M: '{{total | number:0}}' },
                    { E: '{Da_Thanh_Toan}', M: '{{amountPaid | number:0}}' },
                    { E: '{Chua_Thanh_Toan}', M: '{{paymentBalance | number:0}}' },
                    { E: '{Don_Vi_Giao}', M: '{{shipper.name}}' },
                    { E: '{Nhan_Vien_Giao}', M: '{{shipper.shipper}}' },
                    { E: '{Tien_Thua}', M: '{{amountPaid - total | number:0}}' },
                    //Tuan
                    //27/6
                    //Case 247 & 248
                    { E: '{Tong_Tien_Bang_Chu}', M: '{{totalAsWords}}' },
                    { E: '{No_Cu_Khach_Hang}', M: '{{totalOldBalance | number:0}}' },
                    { E: '{No_Con_Lai_Khach_Hang}', M: '{{totalRemainBalance | number:0}}' },
                    //Diem Tich Luy
                    { E: '{Diem_Tich_Luy}', M: '{{convertPoint | number:0}}' },
                    { E: '{Diem_Quy_Doi}', M: '{{exchangedPoint | number:0}}' },
                    { E: '{Diem_Con_Lai}', M: '{{customer.remainPoint | number:0}}' },
                    { E: '{Tien_Quy_Doi}', M: '{{exchangedMoney | number: 0}}' },
                    { E: '{Ghi_Chu_Giao_Hang}', M: '{{shipper.comment}}' }
                ]
        },
        //Type: 257, //Địa chỉ giao hàng
        {
            Code: 'Address',
            Name: 'Địa chỉ giao hàng',
            Type: 257,
            Content: '',
            Original: '<table style="width:100%;">' +
                      '<tbody>' +
                      '<tr> <td>{Ten_Cua_Hang}</td> </tr>' +
                      '<tr> <td><span>Địa chỉ: {Dia_Chi_Cua_Hang}</span></td> </tr>' +
                      '<tr> <td><span>Điện thoại: {SDT_Cua_Hang}</span></td> </tr>' +
                      '<tr> <td><span>Ngày: {Ngay_Thang_Nam}</span></td> </tr>' +
                      '</tbody>' +
                      '</table>' +
                      '<br/>' +
                      '<div style="text-align:center;">' +
                      '<span><strong>DANH SÁCH ĐỊA CHỈ GIAO HÀNG</strong></span>' +
                      '</div>' +
                      '<br/>' +
                      '<table style="width:100%;">' +
                      '<tr>' +
                      '<td>' +
                      '{STT}. {Address} - ({Phone}) - Tiền hàng: {Total} {Balance}' +
                      '<td>' +
                      '</tr>' +
                      '</table>',
            IsSelected: false,
            IsShow: false,
            TemplAttrs:
                [
                    { E: '{Ten_Cua_Hang}', M: '{{companyName}}' },
                    { E: '{Dia_Chi_Cua_Hang}', M: '{{companyAddress}}' },
                    { E: '{SDT_Cua_Hang}', M: '{{companyPhone}}' },
                    { E: '{Ngay_Thang_Nam}', M: '{{Date | date:"dd/MM/yyyy HH:mm:ss"}}' },
                    { E: '{STT}', M: '{{$index + 1}}' },
                    { E: '{Address}', M: '{{item.address}}' },
                    { E: '{Phone}', M: '{{item.phone}}' },
                    { E: '{Balance}', M: '<span ng-if="item.balance > 0">- Phải thu: {{item.balance | number}} </span>' },
                    { E: '{Total}', M: '{{item.total | number:0}}' }
                ]
        }
    ],
    Expressions: [
        { M: '{Ten_Cua_Hang}', H: 'Hiển thị tên cửa hàng/công ty', T: 255 },
        { M: '{Dia_Chi_Cua_Hang}', H: 'Địa chỉ cửa hàng', T: 255 },
        { M: '{SDT_Cua_Hang}', H: 'Điện thoại cửa hàng', T: 255 },
        { M: '{Ten_Chi_Nhanh}', H: 'Hiển thị tên chi nhánh cửa hàng', T: 255 },
        { M: '{Dia_Chi_Chi_Nhanh}', H: 'Địa chỉ chi nhánh cửa hàng', T: 255 },
        { M: '{SDT_Chi_Nhanh}', H: 'Điện thoại chi nhánh cửa hàng', T: 255 },
        { M: '{Ngay_Xuat}', H: 'Ngày tháng năm xuất hàng', T: 19 },
        { M: '{Ngay_Nhap}', H: 'Ngày tháng năm nhập hàng', T: 4 },
        { M: '{Ngay_Thang_Nam}', H: 'Ngày tháng năm hiện tại', T: 255 },
        { M: '{Ghi_Chu}', H: 'Hiển thị ghi chú trong hóa đơn', T: 255 },
        { M: '{Ma_Don_Hang}', H: 'Hiển thị mã đơn hàng', T: 19 },
        { M: '{Ma_Phieu_Nhap}', H: 'Hiển thị mã phiếu nhập', T: 4 },
        { M: '{Ma_Phieu_Chuyen}', H: 'Hiển thị mã phiếu chuyển', T: 8 },
        { M: '{Nhan_Vien_Ban_Hang}', H: 'Hiển thị nhân viên bán hàng', T: 3 },
        { M: '{Nhan_Vien_Nhap_Hang}', H: 'Hiển thị nhân viên nhập hàng', T: 4 },
        { M: '{Nhan_Vien_Chuyen_Hang}', H: 'Hiển thị nhân viên chuyển hàng', T: 8 },
        { M: '{Nhan_Vien_Thu_Ngan}', H: 'Hiển thị nhân viên thu ngân', T: 3 },
        { M: '{Ma_Khach_Hang}', H: 'Hiển thị mã khách hàng', T: 19 },
        { M: '{Khach_Hang}', H: 'Hiển thị tên khách hàng', T: 255 },
        { M: '{So_Dien_Thoai}', H: 'Hiển thị số điện thoại khách hàng', T: 19 },
        { M: '{Dia_Chi_Khach_Hang}', H: 'Hiển thị địa chỉ khách hàng', T: 19 },
        { M: '{Email_Khach_Hang}', H: 'Hiển thị email khách hàng', T: 19 },
        { M: '{Nha_Cung_Cap}', H: 'Hiển thị tên khách hàng', T: 4 },
        { M: '{SDT_Nha_Cung_Cap}', H: 'Hiển thị số điện thoại nhà cung cấp', T: 4 },
        { M: '{Dia_Chi_Nha_Cung_Cap}', H: 'Hiển thị địa chỉ nhà cung cấp', T: 4 },
        { M: '{STT}', H: 'Hiển thị số thứ tự', T: 31 },
        { M: '{Ma_Hang}', H: 'Hiển thị mã hàng hóa', T: 31 },
        { M: '{Ten_Hang_Hoa}', H: 'Hiển thị tên hàng hóa', T: 31 },
        { M: '{So_Luong}', H: 'Hiển thị số lượng hàng hóa', T: 31 },
        { M: '{Don_Gia}', H: 'Hiển thị đơn giá', T: 23 },
        { M: '{Giam_Gia}', H: 'Hiển thị giảm giá trên hàng hóa đã thành tiền', T: 19 },
        { M: '{Giam_Gia_HH}', H: 'Hiển thị giảm giá trên hàng hóa đã nhập', T: 19 },
        { M: '{Don_Gia_Sau_Giam_Gia}', H: 'Hiển thị đơn giá bán đã trừ giảm giá trên hàng hóa', T: 19 },
        { M: '{Thanh_Tien}', H: 'Hiển thị thành tiền ', T: 39 },
        { M: '{Tong_So_Luong}', H: 'Hiển thị tổng số lượng', T: 31 },
        { M: '{Tong_Tien_Hang}', H: 'Hiển thị tổng tiền hàng bán', T: 7 },
        { M: '{Giam_Gia_Tren_Hoa_Don}', H: 'Hiển thị giảm giá trên tổng hóa đơn', T: 19 },
        { M: '{Giam_Gia_PT_Tren_Hoa_Don}', H: 'Hiển thị giảm giá theo phần trăm trên tổng hóa đơn', T: 19 },
        { M: '{Tong_Tien_Thue}', H: 'Hiển thị tổng tiền thuế cho phiếu nhập', T: 4 },
        { M: '{Phu_Phi}', H: 'Phụ phí khác như Phí vận chuyển, Phí dịch vụ', T: 19 },
        { M: '{Tong_Thanh_Toan}', H: 'Hiển thị tổng tiền cần thanh toán', T: 7 },
        { M: '{Da_Thanh_Toan}', H: 'Hiển thị số tiền khách hàng đã thanh toán', T: 23 },
        { M: '{Chua_Thanh_Toan}', H: 'Hiển thị số tiền khách hàng còn nợ', T: 23 },
        { M: '{Tien_Thua}', H: 'Hiển thị số tiền cần thối lại cho khách hàng', T: 19 },
        { M: '{Don_Vi_Giao}', H: 'Hiển thị đơn vị giao vận', T: 16 },
        { M: '{Nhan_Vien_Giao}', H: 'Hiển thị nhân viên giao vận đơn hàng', T: 16 },
        { M: '{Ngay_Chi}', H: 'Ngày tháng năm tạo phiếu chi', T: 32 },
        { M: '{Ma_Phieu_Chi}', H: 'Hiển thị mã phiếu chi', T: 32 },
        { M: '{Nguoi_Chi}', H: 'Hiển thị người tạo phiếu chi', T: 32 },
        { M: '{Ten_Chi_Phi}', H: 'Tên chi phí', T: 32 },
        { M: '{Loai_Chi_Phi}', H: 'Loai chi phí', T: 32 },
        { M: '{Tong_No_Khach_Hang}', H: 'Hiển thị tổng nợ của khách hàng', T: 3 },
        { M: '{So_Tien_Bang_Chu}', H: 'Hiển thị tổng tiền bằng chữ', T: 32 },
        //Tuan
        //27/6
        //Case 247 & 248
        { M: '{Tong_Tien_Bang_Chu}', H: 'Hiển thị tổng tiền bằng chữ', T: 87 },

        { M: '{Ngay_Thu}', H: 'Hiển thị ngày tháng năm tạo phiếu thu', T: 128 },
        { M: '{Nguoi_Thu}', H: 'Hiển thị nhân viên thu', T: 128 },
        { M: '{Ma_Phieu_Thu}', H: 'Hiển thị mã phiếu thu', T: 128 },
        { M: '{Loai_Thu}', H: 'Hiển thị loại thu', T: 128 },
        { M: '{Hinh_Thuc}', H: 'Hiển thị hình thức thanh toán', T: 128 },
        { M: '{Tong_Giam_Gia_Tren_Hang_Hoa}', H: 'Hiển thị tổng giảm giá trên hàng hóa', T: 19 },
        { M: '{No_Cu_Khach_Hang}', H: 'Hiển thị tổng nợ cũ của khách hàng', T: 3 },
        { M: '{No_Con_Lai_Khach_Hang}', H: 'Hiển thị tổng nợ còn lại của khách hàng', T: 255 },
        //Vat
        { M: '{Vat_Hang_Hoa}', H: 'Hiển thị VAT trên hàng hóa', T: 19 },
        { M: '{Vat_Don_Hang}', H: 'Hiển thị tổng VAT trên đơn hàng', T: 19 },
        { M: '{Don_Gia_Truoc_Vat}', H: 'Hiển thị đơn giá trước VAT', T: 19 },
        { M: '{Thanh_Tien_Truoc_Vat}', H: 'Hiển thị thành tiền trước khi có VAT', T: 19 },
        { M: '{Tong_Tien_Hang_Truoc_Vat}', H: 'Hiển thị tổng tiền hàng trước khi có VAT', T: 19 },
        { M: '{Diem_Tich_Luy}', H: 'Hiển thị điểm tích lũy cho hóa đơn', T: 17 },
        { M: '{Diem_Quy_Doi}', H: 'Hiển thị điểm quy đổi', T: 17 },
        { M: '{Diem_Con_Lai}', H: 'Hiển thị điểm còn lại của khách hàng', T: 17 },
        { M: '{Tien_Quy_Doi}', H: 'Hiển thị tiền quy đổi', T: 17 },
        { M: '{Ghi_Chu_Giao_Hang}', H: 'Hiển thị ghi chú giao hàng', T: 16 },
        { M: '{Don_Vi_Hang_Hoa}', H: 'Hiển thị đơn vị hàng hóa', T: 3 },
    ]
};