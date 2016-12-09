# Scraper Service
Scraper service written with nodejs to fetch all HyperLinks present within a Website

![Code Preview](https://raw.githubusercontent.com/harshitanand/Scrape-Service/master/img/2.png)

## Prerequisities
Just run following command to begin 
```
npm install
```
## Running and Viewing results
Saving all hyperlinks according to depth level setted
```
node ScrapeAsync.js or node ScrapeAsync.js <website url> <depth Level>
 
node Scraper.js or node Scraper.js <website url> <depth level>
```
Viewing all hyperlinks stored
```
cd data
cat temp-sync.csv
cat temp-async.csv
```
## License
>You can check out the full license [here](https://github.com/harshitanand/Scrape-Service/blob/master/LICENSE)

This project is licensed under the terms of the **MIT** license.
