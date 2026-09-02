
/* =========================================================
   MATEMATIK ADVENTURE
   TIMER + FIREBASE
   SISTEM ASAL — TIMER MULA APABILA KLIK MULA MISI
   SK JABI
   ========================================================= */


/* =========================================================
   FIREBASE IMPORT
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getDatabase,
    ref,
    update
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyCL_Qo_85H7syg9upgFV6oiqOp_MwJZL0k",

    authDomain:
        "cabaran-matematik-sk-jabi.firebaseapp.com",

    databaseURL:
        "https://cabaran-matematik-sk-jabi-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "cabaran-matematik-sk-jabi",

    storageBucket:
        "cabaran-matematik-sk-jabi.firebasestorage.app",

    messagingSenderId:
        "215473379431",

    appId:
        "1:215473379431:web:4d76691fd5ca026a9b5cc2"

};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app =
    initializeApp(
        firebaseConfig
    );

const database =
    getDatabase(app);


/* =========================================================
   TIMER VARIABLES
========================================================= */

let gameTimer = null;

let backupTimer = null;

let successObserver = null;

let timerStartTime = null;

let timerElapsed = 0;

let timerRunning = false;

let missionSaved = false;


/* =========================================================
   STORAGE PREFIX
========================================================= */

const TIMER_PREFIX =
    "mathAdventureTimer_";

const PLAYER_ID_KEY =
    "mathAdventurePlayerId";


/* =========================================================
   SENARAI 8 MISI
========================================================= */

const MISSIONS = [

    "nombor1",

    "tambah1",

    "tolak1",

    "darab1",

    "bahagi1",

    "pecahan1",

    "masa1",

    "wang1"

];


/* =========================================================
   NAMA FIREBASE SETIAP MISI
========================================================= */

const MISSION_FIREBASE_KEYS = {

    nombor1:
        "masaNombor",

    tambah1:
        "masaTambah",

    tolak1:
        "masaTolak",

    darab1:
        "masaDarab",

    bahagi1:
        "masaBahagi",

    pecahan1:
        "masaPecahan",

    masa1:
        "masaMasa",

    wang1:
        "masaWang"

};


/* =========================================================
   DAPATKAN NAMA MISI DARIPADA NAMA FAIL
========================================================= */

function getMissionName() {

    const fileName =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    return fileName.replace(
        ".html",
        ""
    );

}


/* =========================================================
   DAPATKAN KEY TIMER
========================================================= */

function getTimerKey() {

    return (
        TIMER_PREFIX +
        getMissionName()
    );

}


/* =========================================================
   MAKLUMAT PELAJAR
========================================================= */

function getStudentInfo() {

    return {

        nama:
            localStorage.getItem(
                "nama"
            ) || "",

        kelas:
            localStorage.getItem(
                "kelas"
            ) || "",

        jantina:
            localStorage.getItem(
                "jantina"
            ) || ""

    };

}


/* =========================================================
   CIPTA PLAYER ID
========================================================= */

function createPlayerId() {

    let playerId =
        localStorage.getItem(
            PLAYER_ID_KEY
        );


    if (!playerId) {

        playerId =

            Date.now().toString(36)

            +

            "_"

            +

            Math.random()
                .toString(36)
                .substring(2, 8);


        localStorage.setItem(
            PLAYER_ID_KEY,
            playerId
        );

    }


    return playerId;

}


/* =========================================================
   DAPATKAN PLAYER ID
========================================================= */

function getPlayerId() {

    return localStorage.getItem(
        PLAYER_ID_KEY
    );

}


/* =========================================================
   CIPTA PAPARAN TIMER
========================================================= */

function createTimerDisplay() {

    if (
        document.getElementById(
            "gameTimer"
        )
    ) {

        return;

    }


    const timerBox =
        document.createElement(
            "div"
        );


    timerBox.id =
        "gameTimer";


    timerBox.innerHTML = `

        <span class="timer-icon">
            ⏱️
        </span>

        <span class="timer-label">
            MASA:
        </span>

        <span id="timerValue">
            00:00
        </span>

    `;


    document.body.appendChild(
        timerBox
    );


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "gameTimerStyle";


    style.innerHTML = `

        #gameTimer {

            position: fixed;

            top: 20px;

            right: 20px;

            z-index: 999999;

            display: flex;

            align-items: center;

            gap: 5px;

            background:
                rgba(255,255,255,0.96);

            padding:
                10px 18px;

            border-radius:
                16px;

            border:
                3px solid #ffd54f;

            box-shadow:
                0 5px 0 #d69b3b,
                0 8px 18px rgba(0,0,0,0.22);

            font-family:
                "Comic Sans MS",
                Arial,
                sans-serif;

            font-size:
                20px;

            font-weight:
                bold;

            color:
                #5a4636;

            user-select:
                none;

            pointer-events:
                none;

        }


        #gameTimer .timer-icon {

            font-size:
                22px;

        }


        #gameTimer .timer-label {

            font-size:
                18px;

        }


        #timerValue {

            min-width:
                58px;

            text-align:
                center;

            color:
                #e67e22;

            font-size:
                21px;

        }

    `;


    document.head.appendChild(
        style
    );


    updateTimerDisplay();

}


/* =========================================================
   FORMAT MASA
========================================================= */

function formatTime(seconds) {

    seconds =
        Math.max(
            0,
            Math.floor(
                Number(seconds) || 0
            )
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const secs =
        seconds % 60;


    return (

        String(minutes)
            .padStart(2, "0")

        +

        ":"

        +

        String(secs)
            .padStart(2, "0")

    );

}


/* =========================================================
   UPDATE PAPARAN TIMER
========================================================= */

function updateTimerDisplay() {

    const timerValue =
        document.getElementById(
            "timerValue"
        );


    if (!timerValue) {

        return;

    }


    timerValue.textContent =
        formatTime(
            getTimerSeconds()
        );

}


/* =========================================================
   MULA TIMER
   EDIT:
   TIMER TIDAK LAGI AUTO START
========================================================= */

function startTimer() {

    if (timerRunning) {

        return;

    }


    /*
       Jika timer belum pernah bermula,
       mula dari masa sekarang.
    */

    if (
        timerStartTime === null
    ) {

        timerStartTime =
            Date.now();

        timerElapsed =
            0;

    }


    timerRunning =
        true;

    missionSaved =
        false;


    updateTimerDisplay();


    if (gameTimer) {

        clearInterval(
            gameTimer
        );

        gameTimer = null;

    }


    gameTimer =
        setInterval(

            function() {

                if (!timerRunning) {

                    return;

                }


                timerElapsed =
                    Math.floor(

                        (
                            Date.now()
                            -
                            timerStartTime
                        )
                        /
                        1000

                    );


                updateTimerDisplay();

            },

            250

        );


    console.log(
        "⏱️ TIMER BERMULA:",
        getMissionName()
    );

}


/* =========================================================
   ⭐ BARU
   FUNCTION UNTUK BUTANG "MULA MISI"
========================================================= */

function mulaMisi() {

    console.log("🟢 BUTANG MULA MISI DITEKAN");

    startTimer();

    watchForSuccessMessage();

}

window.mulaMisi = mulaMisi;
/* =========================================================
   DAPATKAN MASA SEMASA
========================================================= */

function getTimerSeconds() {

    if (timerRunning) {

        return Math.floor(

            (
                Date.now()
                -
                timerStartTime
            )
            /
            1000

        );

    }


    return timerElapsed;

}


/* =========================================================
   SIMPAN MASA MISI KE LOCAL STORAGE
========================================================= */

function saveMissionTimeLocal(
    seconds
) {

    const timerKey =
        getTimerKey();


    localStorage.setItem(

        timerKey,

        String(
            seconds
        )

    );


    localStorage.setItem(

        timerKey +
        "_formatted",

        formatTime(
            seconds
        )

    );


    console.log(
        "💾 MASA AKHIR LOCAL:",
        getMissionName(),
        formatTime(
            seconds
        )
    );

}


/* =========================================================
   DAPATKAN SEMUA MASA MISI
========================================================= */

function getAllMissionTimes() {

    const times = {};


    MISSIONS.forEach(

        function(mission) {

            const value =
                localStorage.getItem(

                    TIMER_PREFIX +
                    mission

                );


            if (
                value !== null
            ) {

                times[mission] =

                    parseInt(
                        value,
                        10
                    ) || 0;

            }

            else {

                times[mission] =
                    0;

            }

        }

    );


    return times;

}


/* =========================================================
   JUMLAHKAN MASA SEMUA MISI
========================================================= */

function getTotalMissionTime() {

    const times =
        getAllMissionTimes();


    let total =
        0;


    Object.values(
        times
    ).forEach(

        function(seconds) {

            total +=
                Number(
                    seconds
                ) || 0;

        }

    );


    return total;

}


/* =========================================================
   JUMLAH MASA FORMAT
========================================================= */

function getTotalMissionTimeFormatted() {

    return formatTime(
        getTotalMissionTime()
    );

}


/* =========================================================
   SEMAK 8 MISI
========================================================= */

function allMissionTimesCompleted() {

    const times =
        getAllMissionTimes();


    return MISSIONS.every(

        function(mission) {

            return (
                times[mission] > 0
            );

        }

    );

}


/* =========================================================
   HANTAR MASA MISI KE FIREBASE
========================================================= */

async function saveMissionTimeFirebase(
    seconds
) {

    const student =
        getStudentInfo();


    const mission =
        getMissionName();


    const firebaseKey =
        MISSION_FIREBASE_KEYS[
            mission
        ];


    if (!firebaseKey) {

        console.error(
            "❌ Misi tidak dikenali:",
            mission
        );

        return false;

    }


    if (!student.nama) {

        console.error(
            "❌ Nama pelajar tiada."
        );

        return false;

    }


    const playerId =
        getPlayerId();


    if (!playerId) {

        console.error(
            "❌ ID pelajar tiada."
        );

        return false;

    }


    try {

        const playerRef =
            ref(

                database,

                "rekod_pelajar/" +
                playerId

            );


        await update(

            playerRef,

            {

                nama:
                    student.nama,

                kelas:
                    student.kelas,

                jantina:
                    student.jantina,

                [firebaseKey]:
                    seconds,

                lastUpdated:
                    Date.now()

            }

        );


        console.log(
            "🔥 MASA MISI DISIMPAN:",
            firebaseKey,
            formatTime(
                seconds
            )
        );


        return true;

    }

    catch(error) {

        console.error(
            "❌ GAGAL SIMPAN MASA MISI:",
            error
        );


        return false;

    }

}


/* =========================================================
   SIMPAN REKOD AKHIR 8 MISI
========================================================= */

async function saveFinalRecord() {

    if (
        !allMissionTimesCompleted()
    ) {

        console.log(
            "⏳ Belum semua 8 misi selesai."
        );

        return false;

    }


    const student =
        getStudentInfo();


    const playerId =
        getPlayerId();


    if (!playerId) {

        console.error(
            "❌ Player ID tiada."
        );

        return false;

    }


    const times =
        getAllMissionTimes();


    const totalSeconds =
        getTotalMissionTime();


    const totalFormatted =
        formatTime(
            totalSeconds
        );


    try {

        const playerRef =
            ref(

                database,

                "rekod_pelajar/" +
                playerId

            );


        await update(

            playerRef,

            {

                nama:
                    student.nama,

                kelas:
                    student.kelas,

                jantina:
                    student.jantina,


                masaNombor:
                    times.nombor1,

                masaTambah:
                    times.tambah1,

                masaTolak:
                    times.tolak1,

                masaDarab:
                    times.darab1,

                masaBahagi:
                    times.bahagi1,

                masaPecahan:
                    times.pecahan1,

                masaMasa:
                    times.masa1,

                masaWang:
                    times.wang1,


                jumlahSaat:
                    totalSeconds,

                jumlahMasa:
                    totalFormatted,

                selesai8Misi:
                    true,

                timestamp:
                    Date.now()

            }

        );


        console.log(
            "🏆 REKOD AKHIR BERJAYA DISIMPAN!"
        );


        console.log(
            "👤 Nama:",
            student.nama
        );


        console.log(
            "⏱️ Jumlah:",
            totalFormatted
        );


        return true;

    }

    catch(error) {

        console.error(
            "❌ GAGAL SIMPAN REKOD AKHIR:",
            error
        );


        return false;

    }

}


/* =========================================================
   STOP TIMER
   HANYA BERHENTI APABILA MISI BERJAYA
========================================================= */

async function stopTimer() {

    if (missionSaved) {

        return timerElapsed;

    }


    if (!timerRunning) {

        return timerElapsed;

    }


    timerElapsed =
        getTimerSeconds();


    timerRunning =
        false;


    if (gameTimer) {

        clearInterval(
            gameTimer
        );

        gameTimer = null;

    }


    if (backupTimer) {

        clearInterval(
            backupTimer
        );

        backupTimer = null;

    }


    saveMissionTimeLocal(
        timerElapsed
    );


    missionSaved =
        true;


    updateTimerDisplay();


    console.log(
        "⏹️ TIMER BERHENTI:",
        getMissionName(),
        formatTime(
            timerElapsed
        )
    );


    const firebaseSaved =
        await saveMissionTimeFirebase(
            timerElapsed
        );


    if (!firebaseSaved) {

        console.warn(
            "⚠️ Masa belum berjaya dihantar ke Firebase."
        );

    }


    if (
        allMissionTimesCompleted()
    ) {

        await saveFinalRecord();

    }


    return timerElapsed;

}


/* =========================================================
   RESET TIMER
========================================================= */

function resetTimer() {

    if (gameTimer) {

        clearInterval(
            gameTimer
        );

        gameTimer = null;

    }


    if (backupTimer) {

        clearInterval(
            backupTimer
        );

        backupTimer = null;

    }


    if (successObserver) {

        successObserver.disconnect();

        successObserver = null;

    }


    timerStartTime =
        null;


    timerElapsed =
        0;


    timerRunning =
        false;


    missionSaved =
        false;


    localStorage.removeItem(
        getTimerKey()
    );


    localStorage.removeItem(
        getTimerKey() +
        "_formatted"
    );


    updateTimerDisplay();


    console.log(
        "🔄 TIMER RESET:",
        getMissionName()
    );

}


/* =========================================================
   RESET TIMER UNTUK CUBA SEMULA
   GAGAL → ULANG SEMULA → 00:00 → TIMER TERUS BERJALAN
========================================================= */

function resetTimerForRetry() {

    console.log(
        "🔄 CUBA SEMULA — RESET TIMER:",
        getMissionName()
    );

    /* Hentikan timer lama */
    if (gameTimer) {

        clearInterval(gameTimer);

        gameTimer = null;

    }

    /* Hentikan backup watcher */
    if (backupTimer) {

        clearInterval(backupTimer);

        backupTimer = null;

    }

    /* Reset masa */
    timerStartTime = null;

    timerElapsed = 0;

    timerRunning = false;

    missionSaved = false;

    /* Paparkan 00:00 */
    updateTimerDisplay();

    console.log(
        "⏱️ TIMER RESET: 00:00"
    );


    /* =====================================================
       MULA TIMER SEMULA
    ===================================================== */

    startTimer();

    /* Pantau semula mesej berjaya */
    watchForSuccessMessage();

    console.log(
        "▶️ TIMER MULA SEMULA:",
        getMissionName()
    );

}


/* Jadikan fungsi boleh dipanggil oleh HTML */
window.resetTimerForRetry =
    resetTimerForRetry;


/* =========================================================
   DAPATKAN MASA YANG SUDAH DISIMPAN
========================================================= */

function getSavedMissionTime() {

    const value =
        localStorage.getItem(
            getTimerKey()
        );


    if (value === null) {

        return null;

    }


    return parseInt(
        value,
        10
    );

}


/* =========================================================
   SEMAK ELEMEN BOLEH DILIHAT
========================================================= */

function isElementVisible(
    element
) {

    if (!element) {

        return false;

    }


    const style =
        window.getComputedStyle(
            element
        );


    return (

        style.display !==
        "none"

        &&

        style.visibility !==
        "hidden"

        &&

        style.opacity !==
        "0"

        &&

        element.offsetWidth > 0

        &&

        element.offsetHeight > 0

    );

}


/* =========================================================
   SEMAK MESEJ KEJAYAAN
========================================================= */

function containsSuccessMessage(
    text
) {

    if (!text) {

        return false;

    }


    const message =
        text
            .replace(
                /\s+/g,
                " "
            )
            .trim()
            .toLowerCase();


    const successWords = [

        "misi berjaya",

        "misi selesai",

        "misi tamat",

        "berjaya diselesaikan",

        "berjaya menyelesaikan",

        "semua soalan betul",

        "tahniah",

        "syabas"

    ];


    return successWords.some(

        function(word) {

            return message.includes(
                word
            );

        }

    );

}


/* =========================================================
   HENTIKAN WATCHER
========================================================= */

function stopSuccessWatcher() {

    if (successObserver) {

        successObserver.disconnect();

        successObserver = null;

    }


    if (backupTimer) {

        clearInterval(
            backupTimer
        );

        backupTimer = null;

    }

}


/* =========================================================
   SEMAK MESEJ KEJAYAAN
========================================================= */

function checkForSuccessMessage() {

    if (!timerRunning) {

        return;

    }


    /* =====================================================
       WINBOX
    ===================================================== */

    const winBox =
        document.getElementById(
            "winBox"
        );


    if (

        winBox &&

        isElementVisible(
            winBox
        )

    ) {

        console.log(
            "🏆 winBox dikesan!"
        );


        stopTimer();

        stopSuccessWatcher();


        return;

    }


    /* =====================================================
       SUCCESSBOX
    ===================================================== */

    const successBox =
        document.getElementById(
            "successBox"
        );


    if (

        successBox &&

        isElementVisible(
            successBox
        )

    ) {

        console.log(
            "🏆 successBox dikesan!"
        );


        stopTimer();

        stopSuccessWatcher();


        return;

    }


    /* =====================================================
       CARI MESEJ KEJAYAAN
    ===================================================== */

    const elements =
        document.querySelectorAll(
            "body *"
        );


    for (
        const element of elements
    ) {

        if (

            element.tagName ===
            "SCRIPT"

            ||

            element.tagName ===
            "STYLE"

        ) {

            continue;

        }


        if (
            !isElementVisible(
                element
            )
        ) {

            continue;

        }


        const text =
            element.innerText ||
            element.textContent ||
            "";


        if (
            text.length > 500
        ) {

            continue;

        }


        if (
            containsSuccessMessage(
                text
            )
        ) {

            console.log(
                "🏆 MESEJ KEJAYAAN DIKESAN:",
                text
            );


            stopTimer();

            stopSuccessWatcher();


            return;

        }

    }

}


/* =========================================================
   PANTAU MESEJ KEJAYAAN
========================================================= */

function watchForSuccessMessage() {

    if (successObserver) {

        successObserver.disconnect();

        successObserver = null;

    }


    successObserver =
        new MutationObserver(

            function() {

                checkForSuccessMessage();

            }

        );


    successObserver.observe(

        document.body,

        {

            childList:
                true,

            subtree:
                true,

            attributes:
                true,

            characterData:
                true,

            attributeFilter: [

                "style",

                "class",

                "hidden"

            ]

        }

    );


    checkForSuccessMessage();


    backupTimer =
        setInterval(

            function() {

                checkForSuccessMessage();

            },

            500

        );

}


/* =========================================================
   EXPORT GLOBAL
========================================================= */

window.mathAdventureTimer = {

    startTimer:
        startTimer,

    stopTimer:
        stopTimer,

    resetTimer:
        resetTimer,

    getTimerSeconds:
        getTimerSeconds,

    getTimerFormatted:
        function() {

            return formatTime(
                getTimerSeconds()
            );

        },

    getSavedMissionTime:
        getSavedMissionTime,

    getAllMissionTimes:
        getAllMissionTimes,

    getTotalMissionTime:
        getTotalMissionTime,

    getTotalMissionTimeFormatted:
        getTotalMissionTimeFormatted,

    allMissionTimesCompleted:
        allMissionTimesCompleted,

    saveFinalRecord:
        saveFinalRecord,

    getStudentInfo:
        getStudentInfo,

    getPlayerId:
        getPlayerId

};

/* =========================================================
   GLOBAL FUNCTION UNTUK HTML GAME
========================================================= */

window.startTimer = startTimer;
window.stopTimer = stopTimer;

/* =========================================================
   AUTO START
   EDIT:
   TIMER TIDAK DIMULAKAN DI SINI
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function() {

        console.log(
            "================================"
        );


        console.log(
            "🎮 MATEMATIK ADVENTURE TIMER"
        );


        console.log(
            "🔥 FIREBASE AKTIF"
        );


        console.log(
            "📍 Misi:",
            getMissionName()
        );


        /*
           Pastikan Player ID wujud.
        */

        createPlayerId();


        /*
           Maklumat pelajar.
        */

        const student =
            getStudentInfo();


        console.log(
            "👤 Pelajar:",
            student.nama
        );


        console.log(
            "🏫 Kelas:",
            student.kelas
        );


        console.log(
            "⚥ Jantina:",
            student.jantina
        );


        /*
           Cipta timer.
        */

        createTimerDisplay();


        /*
           =================================================
           PENTING
           TIMER BELUM BERMULA.
           Tunggu pelajar tekan MULA MISI.
           =================================================
        */

        timerElapsed =
            0;

        timerStartTime =
            null;

        timerRunning =
            false;

        missionSaved =
            false;


        /*
           Pantau mesej kejayaan.
           Watcher hanya akan bertindak
           apabila timer sudah berjalan.
        */

        watchForSuccessMessage();


        console.log(
            "⏳ TIMER MENUNGGU BUTANG MULA MISI..."
        );


        console.log(
            "================================"
        );

    }

);

