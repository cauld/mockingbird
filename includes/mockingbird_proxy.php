<?PHP
/*
 * Mockingbird
 * Copyright (c) 2009 Chad Auld (opensourcepenguin.net)
 * Licensed under the MIT license.
 */
 
    define("YAID", "ADD YOUR ID HERE"); //Your Yahoo! Web Services App ID (https://developer.yahoo.com/wsregapp/)
    define("TERM_EXTRACTION_ENDPOINT", "http://search.yahooapis.com/ContentAnalysisService/V1/termExtraction");
    
    $pageToScrape = isset($_GET['page']) && !empty($_GET['page']) ? $_GET['page'] : ''; //pre-encoded with encodeURI
    $since_id = isset($_GET['since_id']) && !empty($_GET['since_id']) ? $_GET['since_id'] : '';    
    $yqlQuery = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" . $pageToScrape . "%22%20and%0A%20%20%20%20%20%20xpath%3D'%2F%2Fbody'&format=xml";
    
    //Call YQL for the raw page XML
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $yqlQuery);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    
    $yqlResult = curl_exec($curl);
    $cError = curl_errno($curl);
    curl_close($curl);
    
    if ($cError == 0) {
        //If we have a valid response from YQL, lets see if we can clean it up 
        //and grab the keywords from the Yahoo! Term Extraction service
        $pageBody  = simplexml_load_string($yqlResult);
        $cleanBody = strip_tags($pageBody->results->body->asXML());
        
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, TERM_EXTRACTION_ENDPOINT);
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_POSTFIELDS, 'appid=' . YAID . '&context=' . rawurlencode(utf8_encode($cleanBody)).'&output=php');
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        
        $yteResult = curl_exec($curl);
        $cError = curl_errno($curl);
        curl_close($curl);
        
        if ($cError == 0) {
            //If we are able to grab some keywords lets construct our Twitter search
            if ($yteResult) {
                $twitterSearchString = '';
                $keyTermsArray = unserialize($yteResult);
                $keyTerms = $keyTermsArray["ResultSet"]["Result"];
                $keyTerms = array_slice($keyTerms, 0, 3); //We take the first 3 since Twitter limits the query to 140 chars
                
                for($i=0; $i<count($keyTerms); $i++) {
                    if ($i<count($keyTerms) - 1) {
                       $twitterSearchString .= '"' . $keyTerms[$i] . '" OR '; 
                    } else {
                        $twitterSearchString .= '"' . $keyTerms[$i] . '"';
                    }
                }
            }
	    }    
    }
    
    $twitterSearchString = urlencode($twitterSearchString);
    
    if ($since_id != '') {
        $twitterSearchString .= '&since_id=' . $since_id;
    } 

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, "http://search.twitter.com/search.json?q=" . $twitterSearchString);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    $result = curl_exec($curl);
    curl_close($curl);

    header('Content-Type: application/json');
    echo $result;