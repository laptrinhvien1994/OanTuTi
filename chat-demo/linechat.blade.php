<div class="linechat" ng-repeat="message in selectedChatData | orderBy: '-created_time':true track by $index" ng-class="isMine ? 'me' : 'you'">
    <div class="chatavar">
        <img src="http://graph.facebook.com/1466951893357705/picture?width=40&height=40">
    </div>
    <div class="chatcontent">
        [[message.message]]
    </div>
    <div class="chattime">
        <small>[[message.createdTime]]</small>
    </div>
</div>
