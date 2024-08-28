import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import feedparser
from urllib.parse import urljoin

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/checkFeed/")
async def checkFeed(feedUrl):
    print(feedUrl)
    apaths = ["rss.xml", "feed", ".rss", ".feed", "feed.xml", "rss", ""]
    bpaths = ["https://", "http://", "https://www.", "http://www.", ""]
    for path in apaths:
        for bpath in bpaths:
            url = urljoin(str(bpath)+str(feedUrl), str(path))
            print(url)
            feed = feedparser.parse(urljoin(str(bpath)+str(feedUrl), str(path)))
            if not feed.bozo:
                return {"response": urljoin(str(bpath)+str(feedUrl), str(path))}
            time.sleep(0.1)
    return {"response": "BOZO"}


@app.get("/feed/")
async def read_feed(feed):
    print(feed)
    feed = feedparser.parse(feed)
    if feed.bozo:
        return {"response": "FEEDBROKE"}
    print(feed)
    return {
        "response": {
            "feedInfo": {
                "title": feed.feed.get("title"),
                "link": feed.feed.get("link"),
                "description": feed.feed.get("description"),
                "published": feed.feed.get("published"),
            },
            "entries": [
                {
                    "title": entry.get("title"),
                    "link": entry.get("link"),
                    "description": entry.get("description"),
                    "published": entry.get("published"),
                }
                for entry in feed.entries
            ]
        }
    }
