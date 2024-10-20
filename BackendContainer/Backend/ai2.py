# You are an AI with a job to do. You will be provided with the HTML code of a webpage, and it is your job to make a brief summary/TL;DR of the webpage.
import requests
import json

def get_summary(message):
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
                "content": "You are an AI with a job to do. You will be provided with the HTML code of a webpage, and it is your job to make a brief summary/TL;DR of the webpage."
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

    if response.status_code == 200:
        response_text = ""
        for chunk in response.iter_content(chunk_size=None):
            response_text += chunk.decode('utf-8')
        return response_text
    else:
        return f"Error: {response.status_code}, {response.text}"


message = []
print("Enter your HTML code below (end input with three newlines):")
while True:
    line = input()
    if line == '' and message[-2:] == ['', '']:
        break
    message.append(line)

message = '\n'.join(message)

summ = get_summary(message)
with open("summary.txt", "w") as f:
    f.write(summ)

print(summ)