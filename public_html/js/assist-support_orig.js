"use strict";
var config;
var activeSession = false;

/**
 * Provides a simple sdk call to integrate assist into the current page.
 *
 * By default a font-awesome support icon and the word Assist are appended inline at the end of the navbar.
 *
 * @type {{addAssistButton: Window.AssistBoot.addAssistButton, addAssistBehaviour: Window.AssistBoot.addAssistBehaviour}}
 */
window.AssistBoot = {
    /**
     * Begin the assist dialog process.
     */
    startAssistDialog: function startAssistDialog() {

        if(activeSession) {
             window.alert("A support call is already active");            
        }
        else {            
        config = assistConfig();
        
        if (config.cobrowseOnly && config.correlationId) {
            // Both the cobrowseOnly and cid URL parameters have been specified.
            // Start support immediately.
            config.allowedIframeOrigins = false; // important: disable iframe messaging if not required for security
            if (AssistSDK.isBrowserSupported()) {
                AssistSDK.startSupport(config);
            } else {
                window.alert("Your browser is not supported!"); 
            }
        } else {
            // Present the User with a dialog to choose to make Voice & Vide call,
            // or to use Short Code Assist.
            var helpModal = document.getElementById("assist-modal-help");
            helpModal.style.display = "block";
            document.getElementById("assist-modal-help").style.opacity = 1.0;
        }

            
        }

    },
    
    /**
     * Add start assists models and all the associated behaviour.
     */
    addAssistBehaviour: function addAssistBehaviour() {
        delete AssistSDK.onScreenshareRequest;
        
        document.body.appendChild(getHelpModal());
        document.body.appendChild(getShortCodeModal());
                 
        /**
         * Place a call to an Agent, cobrowsing can happen after the call is established.
         */
        document.getElementById('help-call-and-share').addEventListener('click', function () {
            var helpModal = document.getElementById("assist-modal-help");
            helpModal.style.opacity = 0;
            setTimeout(helpModal.style.display = "", 150);
            config.allowedIframeOrigins = false; // important: disable iframe messaging if not required for security
            if (AssistSDK.isBrowserSupported()) {
                AssistSDK.startSupport(config);
            } else {
                window.alert("Your browser is not supported!"); 
            }
        });

        /**
         *  Short Code Assist required.
         *  
         *  The Callback is used to present a modal dialog, prompting the user to read out the
         *  generated code to the Agent. The modal is defined 
         */
        document.getElementById('help-want-to-share').addEventListener('click', function () {
                config.cobrowseOnly = true;
            
                if (config.destination) {
                    // Remove the desintation attribute as it is not used in Short Code Assist.
                    delete config.destination;
                }
            
                if (config.sessionToken) {
                    // Short Code Assist will generate a Session Token, bound to the generated 
                    // Correlation ID (short code). In this scenario, the Session Token can not
                    // be provided.
                    delete config.sessionToken;
                }
            
                if (config.correlationId) {
                    // The Correlation ID (short code) will be auto-generated, as such a pre-configured
                    // Correlation ID that has been passed into the sample is cleared/ignored.
                    delete config.correlationId;
                }
           
                if (AssistSDK.isBrowserSupported()) {
                    ShortCodeAssist.startSupport(function (cid) {
                        var helpModal = document.getElementById("assist-modal-help");
                        helpModal.style.opacity = 0;
                        setTimeout(helpModal.style.display = "", 150);
                        dismissCidDisplay = function(){
                            var codeModal = document.getElementById("assist-modal-code");
                            codeModal.style.opacity = 0;
                            setTimeout(codeModal.style.display = "", 150);
                        };
                        AssistSDK.onScreenshareRequest = function () {
                            dismissCidDisplay();
                            localStorage.setItem("cid-only", "cid-only");
                            inSupport = true;
                            return true;
                        };
                        var codeModal = document.getElementById("assist-modal-code");
                        codeModal.querySelector('span.code').textContent = cid;
                        codeModal.style.display = "block";
                        codeModal.style.opacity = "1.0";
                    }, config);
                } else {
                    window.alert("Your browser is not supported!"); 
                }
        });
        
        /**
         * Cancel...
         */
        document.getElementById('help-no-help-needed').addEventListener('click', function () {
            var helpModal = document.getElementById("assist-modal-help");
            helpModal.style.opacity = 0;
            setTimeout(helpModal.style.display = "", 150);
        });
        
        /**
         * Cancel...
         */
        document.getElementById('code-no-help-needed').addEventListener('click', function () {
            var codeModal = document.getElementById("assist-modal-code");
            codeModal.style.opacity = 0;
            setTimeout(codeModal.style.display = "", 150);
            AssistSDK.endSupport();
        });

        /**
         * Cancel...
         */
        document.getElementById("assist-modal-help-close").addEventListener('click', function() {
            var helpModal = document.getElementById("assist-modal-help");
            helpModal.style.opacity = 0;
            setTimeout(helpModal.style.display = "", 150);
        });
        
        /**
         * Cancel...
         */
        document.getElementById("assist-modal-code-close").addEventListener('click', function() {
            var codeModal = document.getElementById("assist-modal-code");
            codeModal.style.opacity = 0;
            setTimeout(codeModal.style.display = "", 150);
            AssistSDK.endSupport();
        });
    }
};

var chunk = function chunk(str, n) {
    var ret = [];
    var i = undefined;
    var len = undefined;

    for (i = 0, len = str.length; i < len; i += n) {
        ret.push(str.substr(i, n));
    }

    return ret;
};

var forEach = function forEach(nodeList, callback, scope) {
    for (var i = 0; i < nodeList.length; i++) {
        callback.call(scope, i, nodeList[i]);
    }
};

var QueryString = function () {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]], pair[1] ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(pair[1]);
        }
    }
    return query_string;
} ();

function toHexString(str) {
    var hexStr = '';
    for (var i=0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        var hChar = c.toString(16);
        // Pad
        if (hChar.length < 2) {
            hexStr+= '0';
        }
        hexStr+= hChar;
    }
    return hexStr;
}

function assistConfig() {

    function selectMode() {

        var settings = {};

        if (QueryString.remoteServer) {
            settings.url = QueryString.remoteServer;
        }

        if (QueryString.username) {
            settings.username = QueryString.username;
        }

        if (QueryString.sessionToken) {
            settings.sessionToken = QueryString.sessionToken;
        }

        if (QueryString.videoMode) {
            settings.videoMode = QueryString.videoMode;
        }

        if (QueryString.cobrowseOnly == 'true') {
            console.log("Cobrowse-only mode enabled");
            settings.cobrowseOnly = true;
        } else {
            if (QueryString.agent) {
                console.log("Assist Calling agent: " + QueryString.agent);
                settings.destination = QueryString.agent;
            } else {
                console.log("Assist Calling agent: agent1");
                settings.destination = 'agent1';
            }
        }

        if (QueryString.cid) {
            console.log("Assist Calling correlationId: " + QueryString.cid);
            settings.correlationId = QueryString.cid;
        }
        if (QueryString.uui) {
            console.log("Assist call with UUI: " + QueryString.uui);
            settings.uui = toHexString(QueryString.uui);
        }
        if (QueryString.lang) {
            console.log("Assist UI elements using locale: " + QueryString.lang);
            settings.locale = QueryString.lang;
        }

        if (QueryString.debug == 'true') {
            console.log("Debug mode enabled");
            settings.debugMode = true;
        }
        return settings;
    }

    return selectMode();
}

/**
 * Callbacks for a support session, to hide show and hide co-browse assests.
 *
 * @type {{onConnectionEstablished: Window.AssistSDK.onConnectionEstablished, onInSupport: Window.AssistSDK.onInSupport, onEndSupport: Window.AssistSDK.onEndSupport, onAnnotationAdded: Window.AssistSDK.onAnnotationAdded, onAnnotationsCleared: Window.AssistSDK.onAnnotationsCleared}}
 */
var dismissCidDisplay = function(){};
var inSupport = false;
window.AssistSDK = {
    
    onConnectionEstablished : function() {
        activeSession = true;
        console.log("on connection established called");

        localStorage.removeItem("cid-only");

        if (config.cobrowseOnly == true) {
            addEndSupportGui();
            localStorage.setItem("cid-only", "cid-only");
        }
    },

    onInSupport : function() {
        console.log("on in support called");

        if (localStorage.getItem("cid-only") == "cid-only") {
            addEndSupportGui();
        }
        dismissCidDisplay();
        inSupport = true;
    },

    onEndSupport : function() {
        supportEnded();
    },

    onAnnotationAdded : function(annotation, sourceName) {
        if (QueryString.annotateCallback == 'true') {
            console.log("On annotation added called.");
            console.log("Source=" + sourceName);
            console.log("Stroke=" + annotation.stroke);
            console.log("Opacity=" + annotation.strokeOpacity);
            console.log("Width=" + annotation.strokeWidth);
            console.log("Path array length=" + annotation.points.length);
            var lastPoint = annotation.getLastPoint();
            if (lastPoint != null) {
                console.log("Last point (X,Y) is (" + annotation.getLastPoint().x + "," + annotation.getLastPoint().y + ")");
            }
        }
    },

    onAnnotationsCleared : function() {
        if (QueryString.annotateCallback == 'true') {
            console.log("On annotation cleared called");
        }
    }

  // Uncomment the following to provide co-browsing callbacks.
    //,
    //  onCobrowseActive : function() {
    //     console.log("Co-browsing is active");
    //  },
    
    //  onCobrowseInactive : function() {
    //     console.log("Co-browsing is inactive");
    // }

};

function getHelpModal() {
    var helpModal = document.createElement("div");
    helpModal.id = "assist-modal-help";
    helpModal.setAttribute("role", "dialog");
    helpModal.classList.add("modal");
    helpModal.classList.add("fade");
    helpModal.innerHTML = 
    "        <div class=\"modal background\"></div>\n" +
    "        <div class=\"modal-dialog text-center\">\n" +
    "            <div class=\"modal-content\">\n" +
    "                <div class=\"modal-header\">\n" +
    "                    <button type=\"button\"\n" +
    "                            class=\"close\"\n" +
    "                            id=\"assist-modal-help-close\">&times;</button>\n" +
    "                    <h4 class=\"modal-title\">Share my screen with the support agent</h4>\n" +
    "                </div>\n" +
    "                <div class=\"modal-body\">\n\n" +
    "                    <button type=\"button\"\n" +
    "                            id=\"help-call-and-share\"\n" +
    "                            class=\"btn btn-success btn-lg btn-block\">Call support and then share</button>\n" +
    "                    <br>\n" +
    "                    <button type=\"button\"\n" +
    "                            id=\"help-want-to-share\"\n" +
    "                            class=\"code btn btn-success btn-lg btn-block\">Already on the call, want to share</button>\n" +
    "                </div>\n" +
    "                <div class=\"modal-footer\">\n" +
    "                    <button type=\"button\"\n" +
    "                            id=\"help-no-help-needed\"\n" +
    "                            class=\"btn btn-default btn-block\">I don't need help</button>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n";
    return helpModal;
};

/**
 * Modal dialog displayed when a Short Code has been generated.
 */
function getShortCodeModal() {
    var shortCodeModal = document.createElement("div");
    shortCodeModal.id = "assist-modal-code";
    shortCodeModal.setAttribute("role", "dialog");
    shortCodeModal.classList.add("modal");
    shortCodeModal.classList.add("fade");
    shortCodeModal.innerHTML = 
    "        <div class=\"modal background\"></div>\n" +
    "        <div class=\"shortcode-modal-dialog text-center\">\n" +
    "            <div class=\"modal-content\">\n" +
    "                <div class=\"modal-header\">\n" +
    "                    <button type=\"button\"\n" +
    "                            class=\"close\"\n" +
    "                            id=\"assist-modal-code-close\">&times;</button>\n" +
    "                    <div align=\"left\" class=\"shortcode-modal-title\">" +
    "                        If you are not speaking to an Agent already, please call 800 123 4567 and give your Agent this code" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"modal-body client-title\">\n\n" +
    "                    <span class=\"code\"></span>\n\n" +
    "                </div>\n" +
    "                <div class=\"modal-footer\">\n" +
    "                    <button type=\"button\"\n" +
    "                            id=\"code-no-help-needed\"\n" +
    "                            class=\"btn btn-default btn-block\">I don't need help</button>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n";
    return shortCodeModal;
};

function supportEnded() {
    console.log("on end support called");
    removeEndSupportGui();    
    activeSession = false;
    inSupport = false;
    localStorage.removeItem("cid-only");
    
    delete AssistSDK.onScreenshareRequest;
}

function addEndSupportGui() {
    if (!document.getElementById("cid-gui")) {
        var endSupportDiv = document.createElement("div");
        endSupportDiv.id = "cid-gui";
        endSupportDiv.innerHTML = "Assist";

        var endButton = document.createElement("button");
        endButton.innerHTML = "End Support";

        endButton.addEventListener("click", function (event) {
            AssistSDK.endSupport();
        }, false);

        endSupportDiv.appendChild(endButton);
        document.body.appendChild(endSupportDiv);
    }
};

function removeEndSupportGui() {
    var cidGui = document.getElementById("cid-gui");
    
    if (cidGui) {
        cidGui.parentNode.removeChild(cidGui);
    }
};