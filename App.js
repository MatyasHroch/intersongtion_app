const clientId = "5715685e17054fdb818a86795f8bec1e";
const redirectUri = "https://intersongstionapp.vercel.app"; // Your redirect uri

const codeVerifier = "some_random_string"; // TODO - veifier will be generated and stored per request
const spotifyScopes =
  "user-read-private user-read-email user-read-private user-read-email user-library-read playlist-read-private";

const authEndpoint = "https://accounts.spotify.com/authorize";
const spotifyTokenEndpoint = "https://accounts.spotify.com/api/token";

async function exchangeToken(code) {
  console.log("Exchanging code for token:", code);
  // Here you would typically make a POST request to Spotify's token endpoint
  // to exchange the authorization code for an access token.
  const result = await fetch(spotifyTokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: new URLSearchParams({
      clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier localStorage.getItem("code_verifier"),
    }),
  });
  return result.json();
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export default {
  template: `
    <div>
      <h1>{{ message }}</h1>
      <button @click="count++">Clicked {{ count }} times</button>
      <button @click="getNewIdentifier">Clicked {{ identifier }} times</button>
      <button @click="logUser">Log new user in</button>
    </div>
  `,
  data() {
    return { message: "Hello Vue!", count: 0, users: [] };
  },
  methods: {
    async logUser() {
      const codeChallange = await generateCodeChallenge(codeVerifier);
      localStorage.setItem("code_verifier", codeVerifier);

      const authUrl = `${authEndpoint}?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
        spotifyScopes
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&code_challenge_method=S256&code_challenge=${codeChallange}`;
      console.log(authUrl);
      window.location.href = authUrl;
    },
    async handleSpotifyCallback() {
      console.log("inspects URL for spotify code");
      const args = new URLSearchParams(window.location.search);
      const code = args.get("code");
      if (code) {
        console.log("Authorization code:", code);
        // Here you would typically exchange the authorization code for an access token
        const tokenData = await exchangeToken(code);
        console.log("Token Data:", tokenData);
      } else {
        console.log("No authorization code found in the URL");
      }
    },
    getNewIdentifier() {
      this.newIdentifier = "user_" + this.users.length + 1;
    },
    loadUsers() {
      console.log("Gets users and information from localStorage");
    },
    addUser() {
      console.log("Adds a new user to localStorage and to the user list");
    },
    getLikedSongs(userIdentifier) {
      console.log("gets liked songs from spotify API");
    },
  },
  mounted() {
    this.handleSpotifyCallback();
    // this.loadUsers();
  },
};
