import feedparser
import requests
import json
from bs4 import BeautifulSoup
from datetime import datetime



       
def extract_content(url):
    try:
        response = requests.get(
            url,
            timeout=10,
            headers={
                "User-Agent": "Mozilla/5.0"
            }
        )

        soup = BeautifulSoup(response.text, "html.parser")

        paragraphs = soup.find_all("p")

        content = " ".join(
            paragraph.get_text(" ", strip=True)
            for paragraph in paragraphs
        )

        return content

    except Exception as error:
        print(f"Could not extract article: {error}")
        return ""
      


def format_date(date_string):
    try:
        date = datetime.strptime(
            date_string,
            "%a, %d %b %Y %H:%M:%S %Z"
        )

        return date.isoformat()

    except Exception:
        return ""


def get_keywords(article):
    text = article["title"] + " " + article["summary"]

    words = text.lower().split()

    stop_words = {
        "about",
        "after",
        "before",
        "their",
        "there",
        "which",
        "where",
        "while",
        "these",
        "those",
        "would",
        "could",
        "should",
        "being",
        "under",
        "from",
        "with",
        "that",
        "this",
        "have",
        "been",
        "will",
        "they",
        "them",
        "than",
        "into",
        "over",
        "also",
        "more",
        "some",
        "what",
        "when",
        "says",
        "said"
    }

    keywords = set()

    for word in words:
        word = word.strip(".,!?():;\"'")

        if len(word) > 4 and word not in stop_words:
            keywords.add(word)

    return keywords


def group_articles(articles):
    groups = []

    for article in articles:

        article_keywords = get_keywords(article)

        found_group = False

        for group in groups:

            group_keywords = group["keywords"]

            common_words = article_keywords.intersection(group_keywords)

            if len(common_words) >= 3:
                article["clusterId"] = group["clusterId"]

                group["articles"].append(article)
                group["keywords"].update(article_keywords)

                found_group = True
                break

        if not found_group:

            cluster_id = f"cluster-{len(groups) + 1}"

            article["clusterId"] = cluster_id

            groups.append({
                "clusterId": cluster_id,
                "keywords": article_keywords,
                "articles": [article]
            })

    return groups

feeds = [
    {
        "name": "BBC",
        "url": "https://feeds.bbci.co.uk/news/rss.xml"
    },
    {
        "name": "NPR",
        "url": "https://feeds.npr.org/1001/rss.xml"
    },
    {
        "name": "The Guardian",
        "url": "https://www.theguardian.com/world/rss"
    }
]
# article


# Articles
articles = []

def clean_html(text):
    soup = BeautifulSoup(text or "", "html.parser")
    return soup.get_text(" ", strip=True)

for feed_info in feeds:
    feed = feedparser.parse(feed_info["url"])
    print(feed_info["name"], "articles:", len(feed.entries))

    for item in feed.entries[:5]:
        image_url = ""

        # 1. Try RSS media thumbnail
        if item.get("media_thumbnail"):
            image_url = item["media_thumbnail"][0].get("url", "")

        # 2. Try RSS media content
        if not image_url and item.get("media_content"):
            for media in item["media_content"]:
                image_url = media.get("url", "")
                if image_url:
                    break

        # 3. Try enclosure links
        if not image_url:
            for enclosure in item.get("enclosures", []):
                image_url = (
                    enclosure.get("href", "")
                    or enclosure.get("url", "")
                )
                if image_url:
                    break

        # 4. Try image tags in RSS summary
        if not image_url:
            soup = BeautifulSoup(
                item.get("summary", ""), "html.parser"
            )
            img = soup.find("img")
            if img:
                image_url = img.get("src", "")

        # 5. Try image links in RSS entry
        if not image_url:
            for link in item.get("links", []):
                media_type = link.get("type", "")
                href = link.get("href", "")
                if media_type.startswith("image/") and href:
                    image_url = href
                    break

        print("Article:", item.get("title", "")[:50])
        print("Image URL:", image_url)

        # Create the article
        article = {
            "title": item.get("title", ""),
            "summary": clean_html(item.get("summary", "")),
            "content": extract_content(item.get("link", "")),
            "source": feed_info["name"],
            "url": item.get("link", ""),
            "publishedAt": format_date(item.get("published", "")),
            "imageUrl": image_url
        }

        articles.append(article)

print("Total articles:", len(articles))

if articles:
    print("First article:", articles[0]["title"])
    print("Image URL:", articles[0].get("imageUrl", ""))
else:
    print("No articles were collected.")



print("\nTotal articles:", len(articles))

print("\nFirst article:")
print("Title:", articles[0]["title"])
print("Source:", articles[0]["source"])
print("Content length:", len(articles[0]["content"]))
print("Published:", articles[0]["publishedAt"])

groups = group_articles(articles)

print("\nNumber of groups:", len(groups))

for group in groups:

    print("\nCluster:", group["clusterId"])
    print("Articles:", len(group["articles"]))

    for article in group["articles"]:
        print("-", article["title"])

with open("articles.json", "w", encoding="utf-8") as file:
    json.dump(articles, file, indent=2, ensure_ascii=False)

print("\nArticles saved to articles.json")