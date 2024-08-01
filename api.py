from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scraper import scrape
import feedparser

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/links/")
async def read_links(page):
    return scrape(page)


@app.get("/checkFeed/")
async def checkFeed(feed):
    paths = ["rss.xml", "feed", ".rss", ".feed", "feed.xml"]
    for path in paths:
        feed = feedparser.parse(f"{feed}/{path}")

        if not feed.bozo:
            return {"response": feed}

    return {"response": "BOZO"}
