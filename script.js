console.log("We are in the script.js file");

// // this function redirects to spotify sign in page
// function logUser() {
//   const clientId = "5715685e17054fdb818a86795f8bec1e"; // replace with your Spotify client ID
//   const redirectUri = "https://intersongstionapp.vercel.app/api/auth/callback"; // replace with your redirect URI
//   const scopes = "user-read-private user-read-email"; // define scopes as needed
//   const authEndpoint = "https://accounts.spotify.com/authorize";

//   const authUrl = `${authEndpoint}?client_id=${clientId}&redirect_uri=${encodeURIComponent(
//     redirectUri
//   )}&scope=${encodeURIComponent(scopes)}&response_type=token&show_dialog=true`;
//   //   window.location.href = authUrl;
//   console.log(authUrl);
// }

// here i handle the spotify callback after login
function handleCallback() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const accessToken = urlParams.get("access_token");
  if (accessToken) {
    console.log("Access Token:", accessToken);
    // You can now use the access token to make API calls
  } else {
    console.log("No access token found in the URL");
  }
}



handleCallback();
