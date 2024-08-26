# Genial Feed
Genial Feed is an App and Website designed to improve people's ability to read longer stuff. The end goal is an app that offers prizes to people for reading more and more long form content (outside of mandatory activities) and then passing AI generated tests on that content.

Currently, it features a Server based (hoping to eventually become serverless) backend, which is able to contain users and RSS feeds which the user subscribes to, and then fetch those feeds.
It also uses Google Firebase for the DB, both for feed storage, folder storage, and for authentication purposes.

TODO Frontend:

	- Get invalid modal and feed adding modal working in App
	- Add feed list display in App
	- Add add folder and feed in App
 	- Add settings page in App
	- Add drag and drop for folders in App
	- Add reading feeds and folders in App
	- Make folders fold down in App
	- Add Login with google to App
	- Style App
	- Add website loading icon for feed adding when feeds are already being read
	- Make website feed url modal cleared after stuff is inputted

TODO Backend:

 	- Add AI generated feeds from websites
	- Make docker and serverless and run from Google
	- Make AI generated exams



## Demo of the browser version
![[Web demo](https://cloud-nxhxe0zhe-hack-club-bot.vercel.app/0screenshot_2024-08-25_224350.png)](https://www.youtube.com/watch?v=ML2GIfpMsqs)

## Demo of the mobile version
[Mobile demo](https://www.youtube.com/shorts/ag2VDNotW9k)

### To run:
You gotta go to the backend, and then go `uvicorn api:app --host 0.0.0.0 --reload`. Then for the website you run it through JetBrains webstorm (at least that's how I've been doing it)
For the App you also need to install Expo and React Native/npx and run `npx expo start --tunnel` (The --tunnel is not necessary, but it helps for some reason)
