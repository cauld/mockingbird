/*
 * Mockingbird
 * Copyright (c) 2009 Chad Auld (opensourcepenguin.net)
 * Licensed under the MIT license.
 */
 
/**
* Mockingbird requires the following YUI components:
* yahoo-dom-event, connection, animation, json (http://developer.yahoo.com/yui/articles/hosting/?animation&connection&json&yahoo-dom-event&MIN)
*/
YAHOO.namespace("mockingbird");

/**
* Standard utility functions
*/
YAHOO.mockingbird.util = function() {
    return {
        /**
        * Basic error handling helper function used in place of multiple if statements
        * @param {String} condition - condition(s) that should evaluate to true
        * @param {String} message - what to display if a condition fails
        */
        assert : function(condition, message) {
            if (condition === false) {
                throw new Error(message);
            }
        },	 

        /**
         * Used to fade DOM elements
         * @param {Object (or dom id)} elementToFade
         * @param direction - Which way to fade?  In or out...
         * @param duration - How long should the effect last (default is 1 sec)
         * @param onStartCallback - A function to call before starting the animation
         * @param onCompleteCallback - A function to call after completing the animation
         * @param removeItToo - Optionally removes element from DOM after hiding (so only valid for fade out)
         */
        fadeElement : function (elementToFade, direction, duration, onStartCallback, onCompleteCallback, removeItToo) {
            var fadeAnim,
                animAttributes,
                animElement = elementToFade;

            //Make sure we have a DOM node to process  
            if (!YAHOO.lang.isObject(animElement)) {
                animElement = YAHOO.util.Dom.get(animElement);

                YAHOO.mockingbird.util.assert(!YAHOO.lang.isNull(animElement) && !YAHOO.lang.isUndefined(animElement), "function fadeElement: Unable to identify element to fade!");
            }

            YAHOO.mockingbird.util.assert(direction === 'out' || direction === 'in', "function fadeElement: A valid direction must be given to perfom the fade animation!");
            if (direction === 'out') {
                animAttributes = { opacity: { from: 1, to: 0 } };
            } else if (direction === 'in') {
                animAttributes = { opacity: { from: 0, to: 1 } };
            }

        	fadeAnim = new YAHOO.util.Anim(elementToFade, animAttributes, duration, YAHOO.util.Easing.easeOut);

        	//Is there an onStart event?
        	if (YAHOO.lang.isFunction(onStartCallback)) {
        	    fadeAnim.onStart.subscribe(onStartCallback);
        	}

        	//Once the fade out is finished we hide the element completely
        	fadeAnim.onComplete.subscribe(function () {
        		if (!YAHOO.lang.isNull(removeItToo) && removeItToo !== false) {
        			YAHOO.mockingbird.util.remove(animElement);
        		}

        		//Are there additional onComplete events?
        		if (YAHOO.lang.isFunction(onCompleteCallback)) {
        		    onCompleteCallback();
        		}
        	});

            fadeAnim.animate();
            return animElement;
        },
        
        /**
        * Make dates nice and pretty (e.g.) 8 mins ago, 1 day ago, etc
        * @param dateObject a JavaScript date object
        *
        * Note: this is a modified very John Resig's prettyDate (under MIT)
        * (http://ejohn.org/files/pretty.js).  It mostly just removes the ISO
        * input format requirement and the jQuery plugin bit.
        */
        prettyDate : function (dateObject){
        	var date = dateObject,
        		diff = (((new Date()).getTime() - date.getTime()) / 1000),
        		day_diff = Math.floor(diff / 86400);

        	if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 ) {
        	   return;
        	}

        	return day_diff === 0 && (
        			diff < 60 && "just now" ||
        			diff < 120 && "1 minute ago" ||
        			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
        			diff < 7200 && "1 hour ago" ||
        			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
        		day_diff == 1 && "Yesterday" ||
        		day_diff < 7 && day_diff + " days ago" ||
        		day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
        }
    };
}();

YAHOO.util.Event.on(window, "load", function() {
    var maxId, 
        mockingbirdDiv = YAHOO.util.Dom.get('mockingbird-container') || 'undefined',
        crtPage    = window.location.href,
        callbacks  = {
            timeout : 10000,
            // Successful XHR response handler
            success : function (o) {
                var messages = [];

                //Use the JSON Utility to parse the data returned from Twitter
                try {
                    messages = YAHOO.lang.JSON.parse(o.responseText);
                } catch (x) {
                    //alert("JSON parse failed!");
                }

                var tweetResults = '',
                    tweetResultCount,
                    mText, 
                    tDate,
                    crtTweets = YAHOO.util.Dom.getElementsByClassName("mockingbird-body"),
                    crtTweetCount = crtTweets.length;

                if (YAHOO.lang.isObject(messages.results) && !YAHOO.lang.isUndefined(messages.results)) {
                    tweetResultCount = messages.results.length;

                    //Fade in new tweets
                    for(var i = 0; i < tweetResultCount && i < 5; i++) {
                        //We will be showing just the 5 latest tweets
                        var LastChild = YAHOO.util.Dom.getLastChild('mockingbird-container');
                	    YAHOO.mockingbird.util.fadeElement(LastChild, "out", 1, null, null, true);

                        //Format date
                        tDate = new Date(messages.results[i].created_at);
                        tPrettyDate = YAHOO.mockingbird.util.prettyDate(tDate);

                        //Replace link-look-alikes
            			mText = messages.results[i].text;
            			mText = mText.replace(/((\w+):\/\/[\S]+\b)/gim, '<a class="mockingbird-link" target="_blank" href="$1" target="_blank">$1</a>');
            			//Replace replies (i.e.) @someone
            			mText = mText.replace(/@(\w+)/gim, '<a class="mockingbird-link" target="_blank" href="http://twitter.com/$1" target="_blank">@$1</a>');
                        tweetResults += '<div class="mockingbird-body" id="tweet-' + messages.results[i].id + '">' +
                                            '<div class="mockingbird-container-left">' +
                                                '<img height="48" width="48" class="mockingbird-profile-image" src="' + messages.results[i].profile_image_url + '" alt="' + messages.results[i].from_user + '" />' +
                                            '</div>' +
                                            '<div class="mockingbird-container-right">' +
                                            	'<p class="mockingbird-text" id="' + messages.results[i].id + '">' +
                                            	    '<a class="mockingbird-link" target="_blank" href="http://twitter.com/' + encodeURIComponent(messages.results[i].from_user) + '">' + messages.results[i].from_user + '</a>&nbsp;' + mText +
                                            	    '<br><span class="mockingbird-date">' + tPrettyDate + '</span>' +
                                            	'</p>' +
                                            '</div>' +
                                        '</div>';

                        mockingbirdDiv.innerHTML = tweetResults; //update list
                    }
                }
            }
        };
    
    //Define the actual tweet fetcher function
    function relatedTweetFetcher() {
        var tmp_since_id,
            since_id   = '',
            firstChild = YAHOO.util.Dom.getFirstChild('mockingbird-container') || 'undefined';

        if (!YAHOO.lang.isUndefined(firstChild) && firstChild !== 'undefined') {
            tmp_since_id = firstChild.id.split("-")[1];
            if (!YAHOO.lang.isUndefined(tmp_since_id)) {
               since_id = tmp_since_id;
            }
        }

    	//Make the call to the server for JSON data
    	var request = YAHOO.util.Connect.asyncRequest('GET', "includes/mockingbird_proxy.php?page=" + encodeURI(crtPage) + "&since_id=" + since_id, callbacks);
    }
    
    //Do initial run and then schedule the Tweet fetcher
    relatedTweetFetcher();
    setInterval(function() {
        relatedTweetFetcher();
    }, 60000);
});
