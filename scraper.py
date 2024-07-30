import requests
from bs4 import BeautifulSoup as bs
import json


def scrape(offset):
    with open("links.json", "w") as f:
        f.seek(0)
        f.truncate()
        for i in range(offset * 10 + 1, (offset + 1) * 10):
            print(i)
            res = requests.get(f"https://news.ycombinator.com/?p={i}")
            soup = bs(res.text, "html.parser")
            links = {}
            titles = soup.find_all("span", {"class": "titleline"})
            for title in titles:
                link = title.find("a")
                if link:
                    links[link.text] = link["href"]

            f.write(json.dumps(links))

