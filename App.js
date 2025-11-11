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
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: localStorage.getItem("code_verifier"),
    }),
  });
  return result.json();
}

// helper: base64url encode
function base64UrlEncode(uint8Array) {
  let str = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    str += String.fromCharCode.apply(
      null,
      Array.from(uint8Array.subarray(i, i + chunkSize))
    );
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateCodeVerifier() {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  // return a base64url string of length between 43 and 128
  return base64UrlEncode(array).slice(0, 128);
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
        <h1>Spotify Intersongtion</h1>
        <button @click="logUser">Log new user in</button>
        <button @click="getLikedSOngs">Get songs in common</button>
        <ul>
            <li v-for="user in users" :key="user.userIdentifier">
          {{ user.userIdentifier }} - {{ user.accessToken }}
            </li>
        </ul>
    </div>
  `,
  data() {
    return { message: "Hello Vue!", count: 0, users: [] };
  },
  methods: {
    async logUser() {
      // generate and store verifier, compute challenge from it
      const verifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(verifier);
      localStorage.setItem("code_verifier", verifier); // store ORIGINAL verifier

      const authUrl = `${authEndpoint}?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
        spotifyScopes
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
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
        this.addUser(tokenData.access_token);
      } else {
        console.log("No authorization code found in the URL");
      }
    },
    getNewIdentifier() {
      return "user_" + this.users.length + 1;
    },
    loadUsers() {
      const users = localStorage.getItem("users");
      if (users) {
        try {
          this.users = JSON.parse(users);
        } catch (error) {
          console.error("Error parsing users from localStorage:", error);
        }
      }
    },
    addUser(accessToken) {
      const userIdentifier = this.getNewIdentifier();
      this.users.push({ accessToken, userIdentifier });
      localStorage.setItem("users", JSON.stringify(this.users));
    },
    async getLikedSongs() {
      console.log("fetches liked songs for users");
      console.log(this.users);
    },
  },
  mounted: async () => {
    debugger;
    this.loadUsers();
    await this.handleSpotifyCallback();
  },
};
