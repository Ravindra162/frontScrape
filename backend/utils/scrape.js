import * as cheerio from 'cheerio';
import axios from "axios";

export async function getNews() {
    const response = await axios.get("https://news.ycombinator.com/");
    const $ = cheerio.load(response.data);

    const newsItems = [];
    
    $(".titleline").each((index, element) => {
        const $element = $(element);
        const $link = $element.find('a').first();
        const $sitebit = $element.find('.sitebit');
        
        const newsItem = {
            title: $link.text().trim(),
            url: $link.attr('href'),
            domain: $sitebit.find('.sitestr').text().trim()
        };
        
        newsItems.push(newsItem);
    });

    console.log(newsItems)
    return newsItems;
}
