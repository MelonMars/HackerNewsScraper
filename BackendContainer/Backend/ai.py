import requests
import json


def get_rss_feed_from_html(message):
    # The endpoint URL
    url = "http://localhost:1234/v1/chat/completions"

    # The headers for the request
    headers = {
        "Content-Type": "application/json"
    }

    # The data payload

    data = {
        "messages": [
            {
                "role": "system",
                "content": "You are an AI with the job of making an RSS feed from a site. You will be given some HTML code. If the site can have an RSS feed made from it, then reply with the RSS feed made from the data. Otherwise, reply with 'No'. Do not include extraneous tokens."
            },
            {
                "role": "user",
                "content": "Test\\n\\n"
            },
            {
                "role": "assistant",
                "content": "No"
            },
            {
                "role": "user",
                "content": message
            }
        ],
        "temperature": 0.7,
        "max_tokens": -1,
        "stream": True
    }
    # Send the request
    response = requests.post(url, headers=headers, data=json.dumps(data), stream=True)

    # Handle the response
    if response.status_code == 200:
        response_text = ""
        for chunk in response.iter_content(chunk_size=None):
            response_text += chunk.decode('utf-8')
        return response_text
    else:
        return f"Error: {response.status_code}, {response.text}"


# User input
message = []
print("Enter your HTML code below (end input with three newlines):")
while True:
    line = input()
    if line == '' and message[-2:] == ['', '']:
        break
    message.append(line)

message = '\n'.join(message)

# Get the response from the API
rss_feed = get_rss_feed_from_html(message)
print("\nRSS Feed Response:")
print(rss_feed)
with open("feed.txt", "w") as f:
    f.write(rss_feed)