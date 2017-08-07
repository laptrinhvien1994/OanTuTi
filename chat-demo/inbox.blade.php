@extends('layouts.app')
@section('title','Quản lý inbox')
@section('js')
    <script src="{{URL::asset('../build/js/angular.min.js')}}"></script>

    <script src="{{URL::asset('../build/js/fbchat.js')}}"></script>
@endsection
@section('content')
<div ng-app="fbchat">
    <div ng-controller="Conversations" class="row">
        <div class="col-md-3 col-sm-3 col-xs-12 row conversation-list">
            <div id="conversation-list">
                <ul class="list-unstyled msg_list">
                    <li ng-repeat="item in conversations track by item.thread_id" ng-class="{'selected-conversation' : selectedConversation == item"}> <!--Thêm vào CSS phần hightlight cho conversation đang được chọn-->
                        <a ng-click="selectConversation(item)">
                            <span class="image"><img ng-src="https://graph.facebook.com/[[item.customer_id]]/picture?width=40&height=40" alt="" /></span>
                            <span>
                              <span>[[item.customer_name]]</span>
                              <span class="time">[[ item.updated_at | dateToISO ]]</span>
                            </span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="col col-sm-9" ng-if="isExistingSelectedConversation && selectedChatData.data.length > 0">
            <div class="col col-sm-6">
                <div class="headder-chat-list">
                    <div class="u-info">
                        <img src="http://graph.facebook.com/1466951893357705/picture?width=40&height=40" class="u-avar">
                        <p class="u-name">[[selectedConversation.customer_name]]</p>
                        <a target="_blank" href="https://facebook.com/[[selectedConversation.link]]"><small>Xem trang cá nhân</small></a>
                    </div>
                    <div class="o-info">
                        <p><small>Lần cuối mua hàng</small></p>
                        <p><small class="pull-right">16/06/2017</small></p>
                    </div>
                </div>
                <div class="content-chat-list">
                    <div class="w-body-chat" id="message-list">
                        <div class="linechat" ng-repeat="message in selectedChatData.data | orderBy: '-created_time':true track by $index" ng-class="{'me' : message.from.id == pId, 'you' : message.from.id != pId }">
                            <div class="chatavar">
                                <img src="http://graph.facebook.com/1466951893357705/picture?width=40&height=40">
                            </div>
                            <div class="chatcontent">
                                [[message.message]]
                            </div>
                            <div class="chattime">
                                <small>11:22</small>
                            </div>
                        </div>
                    </div>
                    <div class="reply-form">
                        <textarea ng-model="msgContent" ng-key-down enter-handler="sendMsg()" typing-handler="sendIsTypingSignal()" placeholder="Nhập nội dung tin nhắn"></textarea>
                        <button ng-click="sendMsg()" class="btn btn-link btn-upload-img"><i class="fa fa2 fa-camera"></i></button>
                    </div>
                </div>
            </div>
            <div class="col col-sm-6">
                <div class="customer-info" ng-if="isLoadedOrder && !isCreatingOrder">
                    <div class="header-c-info">
                        <h4>Thông tin khách hàng</h4>
                        <p><i class="fa fa-user"></i> [[ customerName ]]</p>
                        <p><i class="fa fa-phone"></i> [[ customerPHone ]]</p>
                        <p><i class="fa fa-location-arrow"></i> [[ customerAddress ]].</p>
                        <!-- <p>Chưa có thông tin khách hàng</p>
                        <button class="btn btn-primary btn-sm">Tìm khách hàng trên Suno.vn</button> -->
                    </div>
                    <div class="order-c-info">
                        <h4>
                            Thông tin mua hàng
                        </h4>
                        <p>Lần cuối mua hàng: [[ lastPurchasing ]]</p>
                        <p>Đã mua: [[ totalOrders ]] đơn hàng</p>
                        <p>Tổng giá trị mua hàng: [[ total ]] đ</p>
                    </div>
                    <div class="text-center">
                        <button ng-click="createOrder()" class="btn btn-success">Tạo đơn hàng</button>
                    </div>
                </div>
                <div ng-if="!isLoadedOrder">[[ getOrderInfoOfCustomerErrorDescription ]]</div>
            </div>
        </div>
        <div class="col col-sm-9" ng-if="!isExistingSelectedConversation">
            <div class="text-center">Chọn một cuộc hội thoại để bắt đầu trò chuyện.</div>
        </div>
    </div>
</div>
@endsection
