require('dotenv').config();
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const readline = require('readline');

// Get client ID and secret from .env file
const clientId = process.env.GMAIL_CLIENT_ID || process.env.id;
const clientSecret = process.env.GMAIL_CLIENT_SECRET || process.env.secret;
const redirectUri = 'http://localhost:3000/oauth2callback'; // You can change this to any URL you control

console.log('Using client ID:', clientId);
console.log('Using client secret:', clientSecret ? 'Found' : 'Not found');

if (!clientId || !clientSecret) {
  console.error('Error: Client ID or Client Secret not found in .env file');
  process.exit(1);
}

const oauth2Client = new OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

// Generate authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent', // This ensures you get a refresh token every time
  scope: [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.send'
  ]
});

console.log('Authorize this app by visiting this URL in your browser:');
console.log(authUrl);
console.log('\nAfter authorization, you will be redirected to a URL that might not exist.');
console.log('Copy the "code" parameter from that URL and paste it below.');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the authorization code from the user
rl.question('\nEnter the code from that page here: ', async (code) => {
  rl.close();
  
  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n===== OAuth2 Tokens =====');
    console.log('\nAccess Token:');
    console.log(tokens.access_token);
    
    console.log('\nRefresh Token:');
    console.log(tokens.refresh_token);
    
    console.log('\nExpiry Date:');
    console.log(new Date(tokens.expiry_date).toLocaleString());
    
    console.log('\n===== Add these to your .env file =====');
    console.log(`GMAIL_CLIENT_ID=${clientId}`);
    console.log(`GMAIL_CLIENT_SECRET=${clientSecret}`);
    console.log(`GMAIL_REDIRECT_URI=${redirectUri}`);
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GMAIL_ACCESS_TOKEN=${tokens.access_token}`);
  } catch (error) {
    console.error('Error getting tokens:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
});
