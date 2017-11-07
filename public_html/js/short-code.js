/**
 * Support starting a co-browse session by sharing generated short code.
 *
 * @type {{startSupport: Window.ShortCodeAssist.startSupport}}
 */

window.ShortCodeAssist = 
{
    startSupport: function(callback, failure, configuration, shortCode) {
    // get a cid/session token via the short code servlet
        var startWithShortCode = function(shortCode) 
        {
            var tokenRequest = new XMLHttpRequest();
            
            tokenRequest.onreadystatechange = function () 
            {
                if (tokenRequest.readyState == 4) 
                {
                    if (tokenRequest.status == 200) 
                    {
                        var tokenResponse = JSON.parse(tokenRequest.responseText);
                        if (typeof (configuration) === 'string' || typeof (configuration) === 'undefined') {
                            configuration = {};
                        }
                        configuration.sessionToken = tokenResponse["session-token"];
                        configuration.correlationId = tokenResponse.cid;
                        delete configuration.destination;
                        if (!configuration.scaleFactor) 
                        {
                            configuration.scaleFactor = tokenResponse.scaleFactor;
                        }
                        configuration.allowedIframeOrigins = false; 
                        // important: disable iframe messaging if not required for security
                        AssistSDK.startSupport(configuration);
                        callback && callback(shortCode);
                    } 
                    else if (tokenRequest.status == 403) 
                    {
                        failure();
                    } 
                    else {
                        // TODO Report failure to start
                    }
                }
            };
            var url = "https://remobile.cc.com:8443/assistserver/shortcode/consumer?appkey=" + shortCode;

            tokenRequest.open("GET", url, true);
            tokenRequest.send();
        };
        if (shortCode) 
        {
            startWithShortCode(shortCode);
        } 
        else 
        {
            var shortCodeRequest = new XMLHttpRequest();
            shortCodeRequest.onreadystatechange = function () 
            {
                if (shortCodeRequest.readyState == 4) 
                {
                    if (shortCodeRequest.status == 200) 
                    {
                        var shortCodeResponse = JSON.parse(shortCodeRequest.responseText);
                        var shortCode = shortCodeResponse.shortCode;
                        //alert("Shortcode: " + shortCode);
                        startWithShortCode(shortCode);
                        $('#input').val(shortCode);
                    } 
                    else 
                    {
                        // TODO Report failure to start
                    }
                }
            };
            shortCodeRequest.open("PUT", "https://remobile.cc.com:8443/assistserver/shortcode/create", true);
            shortCodeRequest.send();
        }
    }
};


