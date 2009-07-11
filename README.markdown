Copyright (c) 2009 Chad Auld (opensourcepenguin.net)
Licensed under the MIT license
 
# Mockingbird README #

A JavaScript Twitter widget that displays related tweets based on the content of 
the page it lives on.

## SETUP ##

1.  Refer to index.html for example usage
2.  The mockingbird div is the main HTML snippet
3.  Update the YAID variable in mockingbird_proxy.php with 
    your Yahoo! Web Services App ID.
4.  Mockingbird auto refreshes client-side every 60 seconds.  If 
    you wish to adjust that rate you can find it at the 
    bottom of includes/js/mockingbird.js.
5.  Modify styles as needed in includes/css/mockingbird.css
6.  If you modify the CSS and/or JavaScript you'll need to
    reminify the files or point to the unminified versions.

## REQUIREMENTS ##
1.  PHP >=5.2 with json and curl support
2.  A Yahoo! Web Services App ID - https://developer.yahoo.com/wsregapp/

## HOW IT WORKS ##

1.  Mockingbird uses YQL (http://developer.yahoo.com/yql/) to get the contents of the 
    web page that it lives on
2.  The page content is them passed to the Yahoo! Term Extraction Web 
    Service (http://developer.yahoo.com/search/content/V1/termExtraction.html)
3.  The top 3 page keyword terms are then used to to construct a search 
    against Twitter (http://apiwiki.twitter.com/Twitter-API-Documentation)
4.  The JavaScript makes heavy use of the Yahoo! User Interface 
    library (YUI) - http://developer.yahoo.com/yui/

Being that Mockingbird makes use of these 3rd party services please make sure you 
have read and understood their TOS agreements.