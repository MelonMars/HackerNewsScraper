import json
import feedparser

feed = ""
with open("feed.txt", "r") as f:
    for line in f.readlines():
        try:
            j = json.loads(line[5:])
            feed += j["choices"][0]["delta"]["content"]
        except:
            pass

with open("output.txt", "w") as f:
    f.write(feed)


def parse_rss_feed(rss_feed_xml):
    # Parse the RSS feed XML
    feed = feedparser.parse(rss_feed_xml)

    # Extract the list of articles
    articles = []
    for entry in feed.entries:
        article = {
            'title': entry.title,
            'link': entry.link,
            'description': entry.summary,
            'published': entry.published
        }
        articles.append(article)

    return articles


articles = parse_rss_feed(feed)
print("Articles:", articles)
for article in articles:
    print(f"Title: {article['title']}")
    print(f"Link: {article['link']}")
    print(f"Summary: {article['description']}")
    print(f"Published: {article['published']}")
    print()
