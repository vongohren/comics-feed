# Development of app itself

`yarn dev`

Need a DB url in the MONGODB_URI env variable

### Slack development
* You need a representation of the bot on slack apps.
* You need a localhost bridge

##### Localhost bridge
This can be done through `ngrok` or `serveo`    

##### Slack bot app
Need to change the auth, interactive and commands on slack app to a localhost bridge for this to aim to locally running code

# Testing the app
I need to check the rss feeds on the hosted page to see if the database flows
I need to see that it stores the newest comics.
I need to make sure it posts

# Documentation for app
## Hosting
Its currently hosted on (render)[https://render.com/], with free version. This turns itself off at times
I use (cron-job.org)[https://cron-job.org/en/] to wake it 3 times a morning, in case there are different posting routines
No-SQL is hosted on (mongoDb)[https://mongodb.com]
## Logs
I currently push things to (papertrail)[https://www.papertrail.com/] and use their filters for warnings.    
If I log error, slack message is sent to gjengen-ntnu.slack.com i kanalen #logging
