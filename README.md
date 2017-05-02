Twitter Cashtag Heatmap
=======================

A demonstration of using Node.js with Twitter's streaming capability to create a live heatmap via Socket.io!

Running Locally
=======================

Running this application locally requires that you input four twitter API keys. I cannot provide you with these
keys since only one streaming connection can be made for each. However, you can go to https://apps.twitter.com/,
create a new application, and use the API keys from that in this application. Don't worry, it's free ;)

Once you have the API keys you'll just need to insert them into the app.js file. The placeholders should be
easy to find as they're at the top of the file with a big IMPORTANT stamp on them.

To create the MySQL database and tables:

```
CREATE DATABASE twitterCashtagHeatmap;
USE twitterCashtagHeatmap;
CREATE TABLE watchList (symbol_id INT AUTO_INCREMENT KEY, cash_tag VARCHAR(7), active BOOL);
CREATE TABLE history (history_id INT AUTO_INCREMENT KEY, when_it_happened DATETIME, symbol_id INT, number_of_twitts INT);
CREATE TABLE history_diff (when_it_happened DATETIME, symbol INT, diff INT);
\q
```

Screenshot
=======================

![Screenshot](https://raw.github.com/thedillonb/twitter-cashtag-heatmap/master/screenshot.png)
