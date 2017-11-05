/* Create a new instance of the eGainLibrarySettings Object */
var myLibrarySettings = new eGainLibrarySettings();
myLibrarySettings.CORSHost = "http://eceweb.cc.com/system"; //$.cookie('corsHost');
myLibrarySettings.IsDevelopmentModeOn = false;
myLibrarySettings.eGainContextPath = "./";
/* Next create a new instance of the eGainLibrary */
/* passing in the settings you have just created. */
var myLibrary = new eGainLibrary(myLibrarySettings);
myLibrary.CORSHost = "http://eceweb.cc.com/system";
var myTranscript = [];
var chatIndex = 0;
var botIndex = 0;
var temp = {};
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
    //$('#messages').append("<br />Agent: " + agentMessageReceivedEventArgs.Message);
    //alert("Incomming: " + agentMessageReceivedEventArgs.Message);
    $('#messages ul').append( '<li><span class="left-chat">' + agentMessageReceivedEventArgs.Message + '</span><div class="clear"></div></li>');
    temp['Inbound Chat' + chatIndex++] = agentMessageReceivedEventArgs.Message;
    myTranscript.push(temp);
    alert("Transcript: " + agentMessageReceivedEventArgs.Message);
};
/* Example output of system messages to the same DIV */
myEventHandlers.OnSystemMessageReceived = function (systemMessageReceivedEventArgs) {
    $('#messages ul').append( '<li><span class="systemmsg-chat">' + systemMessageReceivedEventArgs.Message + '</span><div class="clear"></div></li>');
    //$('#messages').append("<br/>" + systemMessageReceivedEventArgs.Message);
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

$(document).on('pageinit', '#WithParametersChat', function () {
   $('.CurrentCorsHost').each(function (index, value) {
        $(value).html($.cookie('corsHost'));
    });
    $('#CustomerPrimaryKey').on('change', function () {
        if ($("#CustomerPrimaryKey").val() === "email") {
            $("#EmailAddress").show();
            $("#PhoneNumber").hide();
            $("#EmailAddressLabel").show();
            $("#PhoneNumberLabel").hide();
        } else {
            $("#EmailAddress").hide();
            $("#PhoneNumber").show();
            $("#EmailAddressLabel").hide();
            $("#PhoneNumberLabel").show();
        }
    });

    $('#StartChatButton').on('click', function () 
    {
        /* Create the customer object */
        var customerObject =  new myLibrary.Datatype.CustomerObject();
        if ($("#CustomerPrimaryKey").val() === "email") {
            customerObject.SetPrimaryKey(customerObject.PrimaryKeyParams.PRIMARY_KEY_EMAIL,$("#EmailAddress").val());
        } else {
            customerObject.SetPrimaryKey(customerObject.PrimaryKeyParams.PRIMARY_KEY_PHONE,$("#PhoneNumber").val());
        }
        
        var customerFirstName = new myLibrary.Datatype.CustomerParameter();
        customerFirstName.eGainParentObject = "casemgmt";
        customerFirstName.eGainChildObject = "individual_customer_data";
        customerFirstName.eGainAttribute = "first_name";
        customerFirstName.eGainValue = $("#FirstName").val();
		customerFirstName.eGainParamName = "first_name";
        customerFirstName.eGainMinLength = "1";
        customerFirstName.eGainMaxLength = "50";
		customerFirstName.eGainRequired = "1";
		customerFirstName.eGainFieldType = "1";
		customerFirstName.eGainPrimaryKey = "0";
		customerFirstName.eGainValidationString = "";
        customerObject.AddCustomerParameter(customerFirstName);
        
        var customerLastName = new myLibrary.Datatype.CustomerParameter();
        customerLastName.eGainParentObject = "casemgmt";
        customerLastName.eGainChildObject = "individual_customer_data";
        customerLastName.eGainAttribute = "last_name";
        customerLastName.eGainValue = $("#LastName").val();      
		customerLastName.eGainParamName = "last_name";
        customerLastName.eGainMinLength = "1";
        customerLastName.eGainMaxLength = "50";
		customerLastName.eGainRequired = "1";
		customerLastName.eGainFieldType = "1";
		customerLastName.eGainPrimaryKey = "0";
		customerLastName.eGainValidationString = "";
        customerObject.AddCustomerParameter(customerLastName);
        
	var customerEmail = new myLibrary.Datatype.CustomerParameter();
        customerEmail.eGainParentObject = "casemgmt";
        customerEmail.eGainChildObject = "email_address_contact_point_data";
        customerEmail.eGainAttribute = "email_address";
        customerEmail.eGainValue = $("#EmailAddress").val();      
	customerEmail.eGainParamName = "email_address";
        customerEmail.eGainMinLength = "1";
        customerEmail.eGainMaxLength = "50";
        customerEmail.eGainRequired = "1";
        customerEmail.eGainFieldType = "1";
        customerEmail.eGainPrimaryKey = "1";
        customerEmail.eGainValidationString = "";
        customerObject.AddCustomerParameter(customerEmail);
        
		/* Now call the Chat initiliaztion method with your entry point and callbacks */
        myChat.Initialize($('#ChatEntryPointId').val(),'en', 'US', myEventHandlers, 'aqua', 'v11');
		/*Now set the customer */
		myLibrary.SetCustomer(customerObject);
		myChat.Start();

        $.mobile.changePage("#WithParametersChatInteractionScreen");
    });
    
    
});
