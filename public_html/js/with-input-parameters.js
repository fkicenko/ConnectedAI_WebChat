/* Create a new instance of the eGainLibrarySettings Object */
var myLibrarySettings = new eGainLibrarySettings();
myLibrarySettings.CORSHost = "https://yourecewebserver/system";
myLibrarySettings.IsDevelopmentModeOn = false;
myLibrarySettings.eGainContextPath = "./";
/* Next create a new instance of the eGainLibrary */
/* passing in the settings you have just created. */
var myLibrary = new eGainLibrary(myLibrarySettings);
myLibrary.CORSHost = "https://yourecewebserver/system";
var myTranscript = [];
var chatIndex = 0;
var botIndex = 0;
var temp = {};
var file = "";
var fileName = "";
var agentName = "";
var cobrowseConfig = [];
/* Now create an instance of the Chat Object */
var myChat = new myLibrary.Chat();
/* Next get the event handlers for chat. It is mandatory to provide definition for the mandatory event handlers before initializing chat */
var myEventHandlers = myChat.GetEventHandlers();

/* Example browser alert when chat is connected */
myEventHandlers.OnConnectSuccess = function () {
    var welcomeMessage = "You are now connected to a Cumulus Financial Expert.";
    $('#messages ul').append( '<li><span class="left-chat">' + welcomeMessage + '</span><div class="clear"></div></li>');
};

/* Example browser alert when there is a connection failure */
myEventHandlers.OnConnectionFailure = function () {
    alert('Oops! Something went wrong');
};

/* Example output of agent messages to a DIV named TransScript with jQuery */
myEventHandlers.OnAgentMessageReceived = function (agentMessageReceivedEventArgs) {
    $('#messages ul').append( '<li><span class="left-chat">' + agentMessageReceivedEventArgs.Message + '</span><div class="clear"></div></li>');
    temp['Inbound Chat' + chatIndex++] = agentMessageReceivedEventArgs.Message;
    myTranscript.push(temp);
    //alert("Transcript: " + agentMessageReceivedEventArgs.Message);
};
/* Example output of system messages to the same DIV */
myEventHandlers.OnSystemMessageReceived = function (systemMessageReceivedEventArgs) {
    $('#messages ul').append( '<li><span class="systemmsg-chat">' + systemMessageReceivedEventArgs.Message + '</span><div class="clear"></div></li>');
    
};
/* Example browser alert when an error occurs */
myEventHandlers.OnErrorOccurred = function (chatErrorOccurredEventArgs) {
    alert('Oops! Something went wrong');
};
/* Example browser alert when agents are not available */
myEventHandlers.OnAgentsNotAvailable = function (agentsNotAvailableEventArgs) {
    alert('Sorry no agents available');
};
/* Example browser alert when the chat is completed */
myEventHandlers.OnConnectionComplete = function () {
    $.mobile.changePage("#WithParametersPostChatScreen")
};
/* Example of adding message in transcript when customer attachment invite is sent to server */
myEventHandlers.OnCustomerAttachmentNotificationSent = function(customerAttachmentNotificationSentEventArgs){
    $('#messages ul').append( '<li><span class="systemmsg-chat">' + "Waiting for agent to accept attachment" + '</span><div class="clear"></div></li>');

};
/* Example of uploading attachment to chat server when agent accepts attachment invite */
myEventHandlers.OnAttachmentAcceptedByAgent = function(attachmentAcceptedByAgentEventArgs){
    file.uniqueFileId = attachmentAcceptedByAgentEventArgs.uniqueFileId;
    myChat.UploadAttachment(file,attachmentAcceptedByAgentEventArgs.agentName);
};
/* Example of sending notification to chat server when customer accepts attachment invite */
myEventHandlers.OnAttachmentInviteReceived = function(attachmentInviteReceivedEventArgs){
    var acceptBtn = document.createElement('input');
    acceptBtn.type = "button";
    acceptBtn.value="Accept";
    acceptBtn.addEventListener('click', function(){
            sendAcceptChatAttachmentNotification(attachmentInviteReceivedEventArgs.Attachment);
    });
    $('#messages ul').append( '<li><span class="systemmsg-chat">' + attachmentInviteReceivedEventArgs.Attachment.AgentName + " has sent attachment "+attachmentInviteReceivedEventArgs.Attachment.Name + '</span><div class="clear"></div></li>');
    $('#messages ul').append(acceptBtn);
};
/* Example of downloading file when attachment is fetched from server */
myEventHandlers.OnGetAttachment = function(AgentAttachmentArgs){
    if (typeof fileName !== 'undefine' && fileName !== null) {
        if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(fileName)) {
                myChat.GetAttachmentImage(AgentAttachmentArgs.fileId,AgentAttachmentArgs.uniqueFileId);
        }
        else{
                var data = AgentAttachmentArgs.data;
                var blob = new Blob([data]);  
                url = window.URL || window.webkitURL;
                var fileUrl = url.createObjectURL(blob);
                window.open(fileUrl);
        }
    }

};
/* Example of downloading file when attachment thumbnail is fetched from server */
myEventHandlers.OnGetAttachmentImageThumbnail = function(thumbnailArgs){
    var thumbnailElement = document.createElement('img');
    thumbnailElement.src = thumbnailArgs.data;
    $('#messages ul').append("<br />");
    $('#messages ul').append(thumbnailElement);
};
function sendAcceptChatAttachmentNotification(attachment){
    fileName = attachment.Name;
    myChat.SendAcceptChatAttachmentNotification(attachment.Id,attachment.Name);
    myChat.GetAttachment(attachment.Id);
};
// We need to get a shortcode first from REM
function getShort() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState == 4) {
            if(request.status == 200) {
                var shortcode = JSON.parse(request.responseText).shortCode;
                start(shortcode);
            }
        }
    }
    request.open('PUT', 'https://remobile.cc.com:8443/assistserver/shortcode/create', true);
    request.send();
}
var start = function(shortcode) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState == 4) {
            if(request.status == 200) {
                var response = JSON.parse(request.responseText);
                //myChat.SendMessageToAgent("Cobrowse code: " + shortcode);
                cobrowseConfig.sessionToken = response['session-token'];
                alert("ShortCode: " + shortcode);
                cobrowseConfig.correlationId = response['cid'];
                //alert("Correlation Id: " + cobrowseConfig.correlationId);
                AssistSDK.startSupport({correlationId : cobrowseConfig.correlationId});
            }
        }
    }
    request.open('GET', 'https://remobile.cc.com:8443/assistserver/shortcode/consumer?appkey=' + shortcode, true);
    request.send();
}

