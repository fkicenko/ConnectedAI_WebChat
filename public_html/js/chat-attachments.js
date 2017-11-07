/* Create a new instance of the eGainLibrarySettings Object */
var myLibrarySettings = new eGainLibrarySettings();
myLibrarySettings.CORSHost = $.cookie('corsHost');
myLibrarySettings.IsDevelopmentModeOn = false;
myLibrarySettings.eGainContextPath = "./";
/* Next create a new instance of the eGainLibrary */
/* passing in the settings you have just created. */
var myLibrary = new eGainLibrary(myLibrarySettings);
/* Now create an instance of the Chat Object */
var myChat = new myLibrary.Chat();
/* Next get the event handlers for chat. It is mandatory to provide definition for the mandatory event handlers before initializing chat */
var myEventHandlers = myChat.GetEventHandlers();

$(document).on('pageshow', "#SimpleAnonymousChat", function () {
    $('.CurrentCorsHost').each(function (index, value) {
        $(value).html($.cookie('corsHost'));
    });
});

$(document).on('pageinit', '#SimpleAnonymousChat', function () {
	var file = "";
	var fileName = "";
	var agentName = "";
	function sendAcceptChatAttachmentNotification(attachment){
		fileName = attachment.Name;
		myChat.SendAcceptChatAttachmentNotification(attachment.Id,attachment.Name);
		myChat.GetAttachment(attachment.Id);
	};

	$("#SendAttachment").on('click', function (evt) {
		var fileInput = document.getElementById("Attachment");
		if(fileInput.files.length>0){
			file = fileInput.files[0];
			myChat.SendCustomerAttachmentNotification(fileInput.files,"Customer");
		};
        
    });

	$("Attachment").on("change", function(event){
		var fileInput = document.getElementById("attachment");
		if(fileInput.files.length>0){
			file = event.target.files[0];
		}
	});

    $("#EndChat").on('click', function () {
        myChat.End();
        $.mobile.changePage("#SimpleAnonymousChatPostChatScreen");
    });


    $('#StartAnonymousChatButton').on('click', function () {
        /* Example browser alert when chat is connected */
        myEventHandlers.OnConnectSuccess = function () {
            alert('Chat Started!');
        };

		myEventHandlers.OnAgentJoined = function (agentJoinedEventArgs) {
            agentName = agentJoinedEventArgs.AgentName;
        };

        /* Example browser alert when there is a connection failure */
        myEventHandlers.OnConnectionFailure = function () {
            alert('Oops! Something went wrong');
        };
		
		/* Example browser alert when there is an error during chat */
        myEventHandlers.OnErrorOccurred = function () {
            alert('Oops! Something went wrong');
        };

        /* Example output of agent messages to a DIV named TransScript with jQuery */
        myEventHandlers.OnAgentMessageReceived = function (agentMessageReceivedEventArgs) {
            $('#TransScript').append("<br />Agent: " + agentMessageReceivedEventArgs.Message);
        };
        /* Example output of system messages to the same DIV */
        myEventHandlers.OnSystemMessageReceived = function (systemMessageReceivedEventArgs) {
            $('#TransScript').append("<br />" + systemMessageReceivedEventArgs.Message);
        };
        /* Example browser alert when agents are not available */
        myEventHandlers.OnAgentsNotAvailable = function (agentsNotAvailableEventArgs) {
            alert('Sorry no agents available');
        };
        /* Example browser alert when the chat is completed */
        myEventHandlers.OnConnectionComplete = function () {
            $.mobile.changePage("#SimpleAnonymousChatPostChatScreen")
        };
		/* Example of adding message in transcript when customer attachment invite is sent to server */
		myEventHandlers.OnCustomerAttachmentNotificationSent = function(customerAttachmentNotificationSentEventArgs){
			$('#TransScript').append("<br />" + "Waiting for agent to accept attachment");
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
			$('#TransScript').append("<br />" + attachmentInviteReceivedEventArgs.Attachment.AgentName + " has sent attachment "+attachmentInviteReceivedEventArgs.Attachment.Name);
			$('#TransScript').append("&nbsp;&nbsp;&nbsp;");
			$('#TransScript').append(acceptBtn);
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
			$('#TransScript').append("<br />");
			$('#TransScript').append(thumbnailElement);
		}
        /* Now call the Chat initialization method with your entry point and callbacks */
        myChat.Initialize($('#ChatEntryPointId').val(),'en', 'US', myEventHandlers, 'aqua', 'v11');
		/*Create an anonymous customer and set the customer for chat*/
		var customerObject =  new myLibrary.Datatype.CustomerObject();
        customerObject.SetPrimaryKey(customerObject.PrimaryKeyParams.PRIMARY_KEY_EMAIL, "anonymous@egain.com");
		myLibrary.SetCustomer(customerObject);
		/* Start chat */
        myChat.Start();

        $.mobile.changePage("#SimpleAnonymousChatInteractionScreen");
    });
});