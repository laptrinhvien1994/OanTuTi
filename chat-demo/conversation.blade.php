<li ng-repeat="item in conversations track by item.thread_id" ng-class="{'selected-conversation' : selectedConversation == item"}> <!--Thêm vào CSS phần hightlight cho conversation đang được chọn-->
    <a ng-click="selectConversation(item)">
        <span class="image"><img ng-src="https://graph.facebook.com/[[item.customer_id]]/picture?width=40&height=40" alt="" /></span>
        <span>
          <span>[[item.customer_name]]</span>
          <span class="time">[[ item.updated_at | dateToISO ]]</span>
        </span>
    </a>
</li>
