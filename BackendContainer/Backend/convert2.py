import json

feed = ""
with open("summary.txt", "r") as f:
    for line in f.readlines():
        try:
            j = json.loads(line[5:])
            feed += j["choices"][0]["delta"]["content"]
        except:
            pass

with open("output2.txt", "w") as f:
    f.write(feed)
