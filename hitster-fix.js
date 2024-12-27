import QrScanner from "./qr-scanner.min.js";
import { setLocal, getLocal, deleteLocal } from "./local-storage.js";
import {
    getToken,
    verifyUser,
    // getPlaylist,
    playSongInPlaylist,
    pauseSong,
} from "./spotify-auth.js";

// const HITSTER_USA_PLAYLIST = "https://open.spotify.com/playlist/3r4Rx7OnTGfIM4Cboxnv7p";
// const HITSTER_USA_BACKUP = "https://open.spotify.com/playlist/1iEIBawC4HzKJbFAiRimhz";

const PLAYLIST_ID = "1iEIBawC4HzKJbFAiRimhz";

let HitsterState = {
    get accessToken() {
        return getLocal("access_token");
    },
    get accessTokenExpires() {
        return +getLocal("access_token_expires");
    },
    get authenticated() {
        return this.accessToken && this.accessTokenExpires >= +new Date();
    },
    clear() {
        deleteLocal("access_token");
        deleteLocal("access_token_expires");
        deleteLocal("code_verifier");
    },
};

export default HitsterState;
// window.HitsterState = HitsterState;
// window.QrScanner = QrScanner;

// we now have authentication, read it

const urlParams = new URLSearchParams(window.location.search);
let code = urlParams.get("code");

if(!urlParams.get("debug")) {
    if(code) {
        await getToken(code);
        // we can now strip the url
        let url = window.location.href.toString();
        window.location.href = url.slice(0, url.indexOf("?"));
    }
    else {
        if(!HitsterState.authenticated) {
            deleteLocal("access_token");
            deleteLocal("access_token_expires");
            verifyUser();
            setTimeout(() => {
                alert("If you are seeing this, there is a bug. Please leave the page and return.");
            }, 50);
        }
        // otherwise, we good :)
    }

    if(HitsterState.authenticated) {
        console.log("We should be good - our access token is", HitsterState.accessToken, "which expires", HitsterState.accessTokenExpires, "in", (HitsterState.accessTokenExpires - +new Date()) / 1000 / 60, "minutes");
    }
    else {
        console.error("Reached end waiting for authentication");
    }
}

window.HitsterState = HitsterState;
window.playSongInPlaylist = playSongInPlaylist;

window.addEventListener("load", function () {
    const scanner = document.getElementById("scanner");
    const scanStart = document.getElementById("scanStart");
    const stopPlaying = document.getElementById("stopPlaying");
    const notification = document.getElementById("notification");
    
    const qrScanner = new QrScanner(
        scanner,
        result => console.log('decoded qr code:', result),
        { returnDetailedScanResult: true },
    );
    
    scanStart.addEventListener("click", async function () {
        scanner.classList.remove("hidden");
        qrScanner.start();
        const scanResult = await new Promise((resolve, reject) => {
            // TODO: max retries?
            // TODO: allow cancel
            setInterval(() => {
                QrScanner.scanImage(scanner, { returnDetailedScanResult: true })
                    .then(resolve)
                    .catch(error => {})
                // .catch(error => console.log(error || "No QR code found."));
            }, 100);
        });
        let url = scanResult.data;
        console.log("Received result:", url);
        qrScanner.stop();
        scanner.classList.add("hidden");
        let parts = url.split("/");
        let numIndex = parseInt(parts.at(-1), 10);
        
        // humans do not count from 0
        playSongInPlaylist(PLAYLIST_ID, numIndex - 1);
        
        stopPlaying.disabled = false;
        notification.textContent = "Playing song on your device.";
        // notification.textContent = `Received playlist index: ${numIndex}.`;
    });
    
    stopPlaying.addEventListener("click", async function () {
        pauseSong();
        stopPlaying.disabled = true;
    });
     
});
