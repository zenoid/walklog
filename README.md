Walklog
========

How far have I walked lately?
Fitbit is counting my steps: calling its API, I'm grabbing and storing the distance data for future use.


## Setup

- **npm install**
- Register an app on Fitbit: https://dev.fitbit.com/apps
- Use the Fitbit API Debug Tool to get **client key**, **client secret**, **token** and **token secret** (and take also note of your **encoded_user_id**): https://dev.fitbit.com/apps/oauthtutorialpage
- Write down these 5 values (in this order: client key, client secret, token, token secret, encoded_user_id, separated by commas, without spaces) and save them in a text file called "fitbitApiData" in the **/private** folder
- Open "get.js" and set your "startingDay" (the first day logged on Fitbit, or any remote day in the past)
- Launch **node get** to store all the distances logged, day by day, in data/distances.json
- Launch **node update** to append the missing days to the lists (or create a Crontab job on your server to launch this script every day or every week)
