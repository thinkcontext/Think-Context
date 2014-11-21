**thinkContext** is a web browser extension which aims to add contextually relevant information to users' web browsing experience.  Currently Chrome, Firefox and Safari are supported.

### Overview

**thinkContext** works by recognizing entities that are present on a page or if the page itself represents an entity.  Once entities are identified a document database is consulted to determine if there is any corresponding (user selected) information available.  If there is the software displays the information in some form to the user by inserting the information into the web page they are viewing.

To use an example, suppose the user does a Google search for "apple".  **thinkContext** examines the returned search results and looks up each url its document database.  It finds a match for "apple.com" and inserts an icon before the corresponding search result.  When the user hovers their mouse over the icon a dialog box appears which informs them how Apple scores on a number of scorecards which rate it according to climate change impact, human rights, and guarding its users' privacy, as well as its political donations.  

When a user visits Apple's website something similar happens, only the icon appears in the browser url bar.  The user has the option of whether a dialog will automatically appear or they need to click on the icon to summon it.  

### How it works

When the user installs **thinkContext** they are asked to configure which of the available information sources interest them.  After they make their selection the software downloads the entire dataset locally to the browser and stores it in an IndexedDB.

Storing the entire dataset locally has the advantage of being very low latency and also allows the software to be extremely aggressive when it attempts to identify entities, perhaps hundreds per page.  Having the software make remote API calls to a central server in such a mdoel would be extremely difficult to scale.

Entities are recognized primarily by url but they may be recognized by other means (eg text regular expressions).  Entities are currently recognized in the following contexts:

* In the browsers address bar
* Search engine results for Google, Google Maps, Bing, Yahoo, and DuckDuckGo
* Text ads on search engines, Facebook, Gmail and some ad networks that run on 3rd party sites (ie Google Adsense)
* On social media sites such as Facebook, Twitter, and Google+
* For members of Congress in any text when their name is preceded by their title (ie a news article mentions "Sen Elizabeth Warren")
* Hotels, restaurants and movies when they appear on some topical websites (ie Yelp, TripAdvisor, IMDB)
* Microformat tags

### 3rd party components

* CouchDB on the server
* db.js (Chrome, FF) or YDN-DB (safari) on the client
* jquery, jquery-ui

### License

This software is available under the terms of GPLv3, see the LICENSE file for more info.
