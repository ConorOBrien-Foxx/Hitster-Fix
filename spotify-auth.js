import { setLocal, getLocal } from "./local-storage.js";

const clientId = "87f83568b4534541aa1d220d6a65d80e";
const redirectUri = 
    window.location.toString().includes("localhost")
        ? "http://localhost:8080"
        : "http://conorobrien-foxx.github.io/Hitster-Fix";

const OUR_HITSTER_PLAYLIST = "1iEIBawC4HzKJbFAiRimhz";

const generateRandomString = (length) => {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest("SHA-256", data)
};

const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};

export const verifyUser = async () => {
    const codeVerifier = generateRandomString(64);
    
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    // const scope = "user-read-private user-read-email";
    const scope = "user-modify-playback-state app-remote-control";
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    
    setLocal("code_verifier", codeVerifier);
    
    const params =  {
        response_type: "code",
        client_id: clientId,
        scope,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    };
    
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
    // redirects the user
};

export const getToken = async code => {
    // stored in the previous step
    let codeVerifier = getLocal("code_verifier");

    const payload = {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        }),
    };
    
    const url = "https://accounts.spotify.com/api/token";

    const body = await fetch(url, payload);
    const response = await body.json();
    
    console.log("Response:", response);
    
    setLocal("access_token", response.access_token);
    setLocal("access_token_expires", +new Date() + 1000 * response.expires_in);
    
    return response;
};

export const getPlaylist = async (playlistId) => {
    playlistId ??= "1iEIBawC4HzKJbFAiRimhz";
    /*
    let playlist;
    if(playlist = getLocal(`playlist_${playlistId}`)) {
        return playlist;
    }
    */
    
    const url = `https://api.spotify.com/v1/playlists/${playlistId}`;
    const payload = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getLocal("access_token")}`,
        },
    };
    
    const body = await fetch(url, payload);
    const response = await body.json();
    let songs = response.tracks.items;
    
    let offset;
    let result = songs.map(obj => {
        let result = {
            // available: obj.track.album.available_markets.length > 0,
            name: obj.track.name,
            artist: obj.track.album.artists.map(artist => artist.name).join(" / "),
            // year is not given by the spotify API :)
        };
        result.base = obj;
        if(result.available) {
            result.offset = offset;
            offset++;
        }
        else {
            result.offset = null;
        }
        return result;
    });
    console.log("Result:", result);
    return result;
};

export const playSongInPlaylist = async (playlistId, songOffset) => {
    const url = `https://api.spotify.com/v1/me/player/play`;
    playlistId ??= "1iEIBawC4HzKJbFAiRimhz";
    const body = {
        "context_uri": `spotify:playlist:${playlistId}`,
        "offset": {
            "position": songOffset,
        },
        "position_ms": 0
    };
    const payload = {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${getLocal("access_token")}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    };
    
    console.log(payload);
    
    const result = await fetch(url, payload);
    console.log("Result:", result);
    if(!result.ok) {
        const response = await result.json();
        console.log("Here's what went wrong:", response);
    }
};

export const pauseSong = async () => {
    const url = "https://api.spotify.com/v1/me/player/pause";
    const payload = {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${getLocal("access_token")}`,
        },
    };
    const result = await fetch(url, payload);
    console.log("Result:", result);
};
