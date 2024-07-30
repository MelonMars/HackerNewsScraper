import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scraper import scrape
from jsonFixer import fix

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
