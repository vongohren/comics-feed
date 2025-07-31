require('dotenv').config()

// Environment variable validation
function validateEnvironmentVariables() {
  const required = {
    // Core database - required for basic functionality
    MONGODB_URI: 'MongoDB connection string'
  };
  
  const optional = {
    // Production features - optional in development
    STORAGE_KEY: 'Google Cloud Storage credentials (base64)',
    SLACK_CLIENT_ID: 'Slack app client ID',
    SLACK_CLIENT_SECRET: 'Slack app client secret', 
    SLACK_URL: 'Slack webhook URL',
    
    // Optional configuration
    PORT: 'Server port (defaults to 4000)',
    NODE_ENV: 'Node environment (defaults to development)',
    CRON_TIME: 'Cron schedule (defaults to "0 * * * *")',
    TIME_ZONE: 'Timezone (defaults to "Europe/Oslo")',
    CHECK_INTERVAL: 'Check interval (defaults to "1 hour")',
    LOGHOST: 'Papertrail log host',
    LOGPORT: 'Papertrail log port',
    LOGNAME: 'Log name'
  };

  // Check required variables
  const missing = [];
  for (const [key, description] of Object.entries(required)) {
    if (!process.env[key]) {
      missing.push(`${key}: ${description}`);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(item => console.error(`  - ${item}`));
    console.error('\n💡 Please check your .env file in the project root.');
    console.error('📖 See .env file for all available configuration options.');
    process.exit(1);
  }

  // Log optional missing variables for information
  const missingOptional = [];
  for (const [key, description] of Object.entries(optional)) {
    if (!process.env[key]) {
      missingOptional.push(`${key}: ${description}`);
    }
  }

  console.log('✅ Environment variables loaded successfully');
  if (missingOptional.length > 0) {
    console.log('ℹ️  Optional environment variables not set (this is normal in development):');
    missingOptional.forEach(item => console.log(`  - ${item}`));
  }
}

validateEnvironmentVariables();

import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import Slackbot from './slackbot';
import bodyParser from 'body-parser';
import logger from './utils/logger';
import comicsStorage from './comics';
import bluebird from 'bluebird';

mongoose.Promise = bluebird;

// Fix mongoose deprecation warnings
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

var comics = comicsStorage.available

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('landingpage'))

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+"/../landingpage/index.html"));
});

app.get('/policy', function (req, res) {
    res.sendFile(path.join(__dirname+"/../landingpage/policy.html"));
});

app.get('/comics', function (req, res) {
    res.json(comics)
})

app.get('/slackurl', function (req, res) {
    res.send(process.env.SLACK_URL)
})

for(var comic of comics) {
  app.get(`/${comic.name}`, comic.routeFunction.bind(comic));
}

new Slackbot(app);

var port = process.env.PORT || 4000;

app.listen(port, function () {
  logger.log('info', 'Comics app listening on port '+port)
});
