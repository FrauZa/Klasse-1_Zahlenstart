/* ============================================================
   Zahlen-Start - Mathe Klasse 1, Anfangsunterricht

   Aufbau:
     1. Grundlagen      - Navigation, Vorlesen, Zufall, Ergebnis
     2. Mengenbilder    - Wuerfel, Finger, Zehnerfeld, Punkte
     3. Modul 1         - Mengen erfassen (auch als Blitzblick)
     4. Modul 2         - Ziffern schreiben (nachspuren)
     5. Modul 3         - Dazulegen oder wegstreichen
     6. Kartenmotor     - tippen oder ziehen, fuer Modul 4 und 5
     7. Modul 4         - Zahlen der Groesse nach ordnen
     8. Modul 5         - Mengenbilder und Zahlen zuordnen

   Erstklaesser lesen noch nicht. Darum wird jede Aufgabenstellung
   vorgelesen und jede Rueckmeldung bleibt kurz und bildhaft.
   ============================================================ */


/* ============================================
   1. Grundlagen
   ============================================ */

const RUNDE_AUFGABEN = 10;      // so viele Aufgaben hat eine Runde

let wartezeit = null;           // laufender setTimeout zwischen zwei Aufgaben
let vorlesenAn = true;

function showScreen(screenId) {
    /* Alles stoppen, was noch aus dem verlassenen Bildschirm laeuft -
       sonst blitzt ein Bild auf oder eine Aufgabe springt weiter,
       waehrend das Kind schon woanders ist. */
    if (wartezeit) { clearTimeout(wartezeit); wartezeit = null; }
    if (m1.timer) { clearTimeout(m1.timer); m1.timer = null; }
    if (m2.demo) { clearInterval(m2.demo); m2.demo = null; }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    karteAbwaehlen();

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const ziel = document.getElementById(screenId);
    if (ziel) ziel.classList.add('active');
    window.scrollTo(0, 0);
}

/* ---------- Vorlesen ---------- */

function kannVorlesen() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function deutscheStimme() {
    const stimmen = window.speechSynthesis.getVoices();
    return stimmen.find(s => s.lang && s.lang.toLowerCase().startsWith('de')) || null;
}

function lesVor(text) {
    if (!kannVorlesen() || !text) return;
    window.speechSynthesis.cancel();
    const spruch = new SpeechSynthesisUtterance(String(text).replace(/\s+/g, ' ').trim());
    const stimme = deutscheStimme();
    if (stimme) spruch.voice = stimme;
    spruch.lang = 'de-DE';
    spruch.rate = 0.85;     // langsamer als normal, die Kinder hoeren noch mit
    window.speechSynthesis.speak(spruch);
}

/* Alle Aufgabentexte laufen hierueber, damit ein Schalter genuegt. */
function sprich(text) {
    if (vorlesenAn) lesVor(text);
}

function toggleVorlesen() {
    vorlesenAn = !vorlesenAn;
    if (!vorlesenAn && kannVorlesen()) window.speechSynthesis.cancel();
    document.querySelectorAll('.vorlese-toggle').forEach(b => {
        b.textContent = vorlesenAn ? '🔊 Vorlesen an' : '🔇 Vorlesen aus';
    });
}

/* ---------- Zufall ---------- */

function zufallZahl(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function zufallAus(liste) {
    return liste[Math.floor(Math.random() * liste.length)];
}

function mische(liste) {
    const kopie = [...liste];
    for (let i = kopie.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
    }
    return kopie;
}

/* Verschiedene Zahlen ohne Wiederholung ziehen. */
function zieheZahlen(anzahl, min, max) {
    const vorrat = [];
    for (let i = min; i <= max; i++) vorrat.push(i);
    return mische(vorrat).slice(0, Math.min(anzahl, vorrat.length));
}

/* Vier Antwortknoepfe: die richtige Zahl und drei Nachbarn. */
function zahlOptionen(richtig, min, max, anzahl = 4) {
    anzahl = Math.min(anzahl, max - min + 1);
    const menge = new Set([richtig]);
    let versuche = 0;
    while (menge.size < anzahl && versuche < 300) {
        versuche++;
        const abstand = zufallZahl(1, 3) * (Math.random() < .5 ? -1 : 1);
        const kandidat = richtig + abstand;
        if (kandidat >= min && kandidat <= max) menge.add(kandidat);
    }
    while (menge.size < anzahl) menge.add(zufallZahl(min, max));
    return mische([...menge]);
}

/* ---------- Dinge fuer die Mengenbilder ---------- */

const DINGE = [
    { emoji: '🐶', ein: 'Hund',        viele: 'Hunde' },
    { emoji: '🐱', ein: 'Katze',       viele: 'Katzen' },
    { emoji: '🍎', ein: 'Apfel',       viele: 'Äpfel' },
    { emoji: '🚗', ein: 'Auto',        viele: 'Autos' },
    { emoji: '⭐', ein: 'Stern',       viele: 'Sterne' },
    { emoji: '🌸', ein: 'Blume',       viele: 'Blumen' },
    { emoji: '🐟', ein: 'Fisch',       viele: 'Fische' },
    { emoji: '🎈', ein: 'Luftballon',  viele: 'Luftballons' },
    { emoji: '🍓', ein: 'Erdbeere',    viele: 'Erdbeeren' },
    { emoji: '🦆', ein: 'Ente',        viele: 'Enten' },
    { emoji: '🐸', ein: 'Frosch',      viele: 'Frösche' },
    { emoji: '🌳', ein: 'Baum',        viele: 'Bäume' },
    { emoji: '🐝', ein: 'Biene',       viele: 'Bienen' },
    { emoji: '🧸', ein: 'Teddy',       viele: 'Teddys' },
    { emoji: '⚽', ein: 'Ball',        viele: 'Bälle' },
    { emoji: '🚌', ein: 'Bus',         viele: 'Busse' }
];

function dingWort(ding, anzahl) {
    return anzahl === 1 ? ding.ein : ding.viele;
}

/* ---------- Belohnung ---------- */

function konfetti(menge = 40) {
    const farben = ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#fb8c00'];
    for (let i = 0; i < menge; i++) {
        const schnipsel = document.createElement('div');
        schnipsel.className = 'konfetti';
        schnipsel.style.left = Math.random() * 100 + 'vw';
        schnipsel.style.background = farben[i % farben.length];
        schnipsel.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(schnipsel);
        setTimeout(() => schnipsel.remove(), 3200);
    }
}

/* ---------- Einstellungen der Module ---------- */

const einstellungen = {
    m1: { raum: 5,  modus: 'zeit' },
    m3: { raum: 5,  art: 'gemischt' },
    m4: { raum: 10, anzahl: 3, karten: 'zahlen', richtung: 'auf' },
    m5: { raum: 5,  gruppen: 3 }
};

function setzeWahl(btn, modul, schluessel, wert) {
    einstellungen[modul][schluessel] = wert;
    btn.parentElement.querySelectorAll('.wahl-btn').forEach(b => b.classList.remove('aktiv'));
    btn.classList.add('aktiv');
}

/* ---------- Gemeinsamer Ergebnis-Bildschirm ---------- */

let ergebnisNochmal = null;

function zeigeErgebnis(titel, richtig, gesamt, farbklasse, nochmalFn) {
    const anteil = gesamt > 0 ? richtig / gesamt : 0;
    const sterne = richtig === 0 ? 0 : Math.max(1, Math.round(anteil * 5));

    let lob = 'Übe ruhig noch ein bisschen weiter.';
    if (anteil >= 1)        lob = 'Alles richtig! Du bist ein Zahlenprofi. 🏆';
    else if (anteil >= .8)  lob = 'Das war richtig stark!';
    else if (anteil >= .5)  lob = 'Gut gemacht! Weiter so.';

    document.getElementById('resultTitel').textContent = titel;
    document.getElementById('resultTitel').className = 'exercise-title ' + farbklasse;
    document.getElementById('resultRichtig').textContent = richtig;
    document.getElementById('resultGesamt').textContent = gesamt;
    document.getElementById('resultSterne').textContent = '★'.repeat(sterne) + '☆'.repeat(5 - sterne);
    document.getElementById('resultLob').textContent = lob;
    document.getElementById('resultNochmalBtn').className = 'check-btn ' + farbklasse.replace('-color', '-btn');

    ergebnisNochmal = nochmalFn;
    showScreen('resultScreen');
    if (anteil >= .6) konfetti();
    sprich(lob);
}

function resultNochmal() {
    if (ergebnisNochmal) ergebnisNochmal();
}

/* Kurzhelfer fuer Rueckmeldungen unter der Aufgabe. */
function setzeFeedback(id, text, art) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'feedback-text' + (art ? ' ' + art : '');
}


/* ============================================================
   2. Mengenbilder

   Vier Darstellungen derselben Anzahl. Das Kind soll die Zahl
   nicht nur in Punkten, sondern auch am Wuerfelbild, an den
   Fingern und im Zehnerfeld wiedererkennen.
   ============================================================ */

const WUERFELBILDER = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [25, 75], [75, 25], [75, 75]],
    5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
    6: [[25, 20], [25, 50], [25, 80], [75, 20], [75, 50], [75, 80]]
};

function wuerfelSVG(augen) {
    const punkte = (WUERFELBILDER[augen] || []).map(p =>
        `<circle cx="${p[0]}" cy="${p[1]}" r="10" fill="#2f3542"/>`).join('');
    return `<div class="dice"><svg width="100%" height="100%" viewBox="0 0 100 100">${punkte}</svg></div>`;
}

function wuerfelbildHTML(n) {
    if (n <= 6) return `<div class="dice-container">${wuerfelSVG(n)}</div>`;
    // Ueber sechs braucht es zwei Wuerfel - das uebt gleich das Buendeln mit.
    const ersterWuerfel = zufallZahl(Math.max(1, n - 6), 6);
    return `<div class="dice-container">${wuerfelSVG(ersterWuerfel)}${wuerfelSVG(n - ersterWuerfel)}</div>`;
}

/* Zeichnet eine Hand aus der Perspektive Handruecken.
   Uebernommen aus der App "Mathe Klasse 1". */
function drawHandSVG(extendedCount, uid = 'h') {
    const thumbExtended = extendedCount >= 1;
    const indexExtended = extendedCount >= 2;
    const middleExtended = extendedCount >= 3;
    const ringExtended = extendedCount >= 4;
    const pinkyExtended = extendedCount >= 5;

    let pPinky = pinkyExtended
        ? "C 24 94, 16 70, 8 50 C 5 40, 18 36, 23 43 C 28 50, 36 76, 42 100 "
        : "C 27 104, 29 95, 37 91 C 43 89, 47 93, 46 98 C 45 103, 42 106, 38 107 ";

    let pRing = ringExtended
        ? "C 38 80, 32 50, 33 32 C 34 22, 48 20, 51 29 C 55 42, 56 68, 59 92 "
        : "C 42 102, 46 91, 54 85 C 60 81, 64 85, 63 91 C 62 97, 58 102, 54 104 ";

    let pMiddle = middleExtended
        ? "C 58 72, 60 40, 61 16 C 62 5, 76 5, 77 16 C 78 40, 78 68, 79 90 "
        : "C 58 99, 62 87, 70 82 C 76 78, 80 82, 79 88 C 78 94, 74 99, 70 101 ";

    let pIndex = indexExtended
        ? "C 80 72, 86 46, 89 27 C 91 17, 105 21, 104 31 C 103 50, 101 78, 101 106 "
        : "C 74 98, 80 87, 88 83 C 94 80, 99 85, 98 91 C 97 97, 91 102, 86 105 C 93 107, 99 111, 101 118 ";

    let pThumb = thumbExtended
        ? "C 110 114, 124 106, 136 105 C 144 105, 148 111, 145 117 C 140 124, 128 134, 114 144 C 105 152, 99 155, 94 158 "
        : "C 106 118, 108 132, 104 144 C 100 152, 97 155, 94 158 ";

    let dPerimeter = `M 42 225 L 38 185 C 33 158, 28 135, 25 115 ${pPinky}${pRing}${pMiddle}${pIndex}C 101 110, 101 114, 101 118 ${pThumb}L 90 185 L 90 225 Z`;

    let details = '';

    if (pinkyExtended) {
        details += `<path d="M 11 54 C 10 48, 17 44, 21 46 C 23 49, 23 54, 18 57 Z" fill="#faeedd" stroke="#231f20" stroke-width="1.8"/>`;
        details += `<path d="M 18 70 C 20 72, 23 72, 25 70" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round"/>`;
        details += `<path d="M 22 80 C 24 82, 27 82, 29 80" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round"/>`;
    } else {
        details += `<path d="M 32 98 C 33 104, 34 110, 35 116" fill="none" stroke="#442a1d" stroke-width="1.5" stroke-linecap="round"/>`;
    }

    if (ringExtended) {
        details += `<path d="M 35 34 C 35 27, 45 25, 47 30 C 48 35, 44 40, 38 38 Z" fill="#faeedd" stroke="#231f20" stroke-width="1.8"/>`;
        details += `<path d="M 39 54 C 42 56, 47 56, 50 54" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round"/>`;
        details += `<path d="M 42 66 C 45 68, 49 68, 52 66" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round"/>`;
    } else {
        details += `<path d="M 48 88 C 49 94, 50 102, 51 108" fill="none" stroke="#442a1d" stroke-width="1.5" stroke-linecap="round"/>`;
    }

    if (middleExtended) {
        details += `<path d="M 63 20 C 63 13, 73 13, 74 18 C 75 24, 71 28, 65 27 Z" fill="#faeedd" stroke="#231f20" stroke-width="1.8"/>`;
        details += `<path d="M 64 46 C 67 48, 72 48, 74 46" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round"/>`;
        details += `<path d="M 65 62 C 68 64, 73 64, 75 62" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round"/>`;
    } else {
        details += `<path d="M 67 82 C 68 88, 68 96, 69 104" fill="none" stroke="#442a1d" stroke-width="1.5" stroke-linecap="round"/>`;
    }

    if (indexExtended) {
        details += `<path d="M 92 30 C 93 24, 102 26, 103 31 C 104 36, 99 39, 95 38 Z" fill="#faeedd" stroke="#231f20" stroke-width="1.8"/>`;
        details += `<path d="M 87 52 C 90 54, 95 54, 97 52" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round"/>`;
        details += `<path d="M 89 66 C 92 68, 96 68, 98 66" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round"/>`;
    } else {
        details += `<path d="M 88 84 C 88 90, 87 98, 86 106" fill="none" stroke="#442a1d" stroke-width="1.5" stroke-linecap="round"/>`;
        details += `<path d="M 98 100 C 96 108, 95 118, 96 126" fill="none" stroke="#442a1d" stroke-width="1.6" stroke-linecap="round"/>`;
    }

    if (thumbExtended) {
        details += `<path d="M 137 107 C 142 105, 149 108, 150 113 C 151 117, 145 119, 139 117 Z" fill="#faeedd" stroke="#231f20" stroke-width="1.8"/>`;
        details += `<path d="M 124 122 C 126 126, 130 128, 133 126" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round"/>`;
    } else {
        details += `<path d="M 101 126 C 103 132, 102 140, 99 146" fill="none" stroke="#331e14" stroke-width="1.8" stroke-linecap="round"/>`;
    }

    details += `
        <path d="M 37 116 C 38 120, 41 120, 42 117" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M 52 110 C 53 114, 56 114, 57 111" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M 68 108 C 69 112, 72 112, 73 109" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M 84 112 C 85 116, 88 116, 89 113" fill="none" stroke="#5a3520" stroke-width="1.6" stroke-linecap="round"/>
    `;

    return `
        <defs>
            <linearGradient id="${uid}Skin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#f7ceb0"/>
                <stop offset="60%" stop-color="#eeb48f"/>
                <stop offset="100%" stop-color="#d6966f"/>
            </linearGradient>
        </defs>
        <path d="${dPerimeter}" fill="url(#${uid}Skin)" stroke="#231f20" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
        ${details}
    `;
}

/* Bis fuenf reicht eine Hand - die Kraft der Fuenf bleibt so sichtbar. */
function fingerbildHTML(n) {
    const links = Math.min(5, n);
    const rechts = Math.max(0, n - 5);
    const uid = 'h' + n + '_' + Math.floor(Math.random() * 1000);

    let html = `<div class="hands-container">
        <div class="hand-card">
            <svg class="hand-svg" viewBox="0 0 160 230">${drawHandSVG(links, uid + 'l')}</svg>
            <span class="hand-label">linke Hand</span>
        </div>`;
    if (n > 5) {
        html += `<div class="hand-card">
            <svg class="hand-svg" viewBox="0 0 160 230">
                <g transform="translate(160, 0) scale(-1, 1)">${drawHandSVG(rechts, uid + 'r')}</g>
            </svg>
            <span class="hand-label">rechte Hand</span>
        </div>`;
    }
    return html + '</div>';
}

function zehnerfeldHTML(n) {
    let html = '<div class="zehnerfeld">';
    const bloecke = n > 10 ? 2 : 1;
    for (let b = 0; b < bloecke; b++) {
        const gefuellt = Math.max(0, Math.min(10, n - b * 10));
        html += '<div class="zehnerfeld-block">';
        for (let i = 0; i < 10; i++) {
            html += `<div class="zehnerfeld-zelle${i < gefuellt ? ' voll' : ''}"></div>`;
        }
        html += '</div>';
    }
    return html + '</div>';
}

/* Ungeordnete Punkte: hier muss wirklich gezaehlt oder gebuendelt werden. */
function punktebildHTML(n) {
    const breite = 260, hoehe = 170, rand = 24;
    const mindestAbstand = n > 12 ? 30 : 38;
    const punkte = [];
    let versuche = 0;
    while (punkte.length < n && versuche < 1200) {
        versuche++;
        const x = rand + Math.random() * (breite - 2 * rand);
        const y = rand + Math.random() * (hoehe - 2 * rand);
        if (punkte.every(p => Math.hypot(p.x - x, p.y - y) > mindestAbstand)) punkte.push({ x, y });
    }
    /* Notfalls auffuellen - lieber ein Gitterpunkt als ein fehlender Punkt. */
    let i = 0;
    while (punkte.length < n) {
        punkte.push({ x: rand + (i % 6) * 38, y: rand + Math.floor(i / 6) * 38 });
        i++;
    }
    const kreise = punkte.map(p =>
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="13" fill="#37474f"/>`).join('');
    return `<svg class="punktebild" viewBox="0 0 ${breite} ${hoehe}" width="${breite}" height="${hoehe}">${kreise}</svg>`;
}

function mengenbildHTML(n, art) {
    if (art === 'wuerfel')    return wuerfelbildHTML(n);
    if (art === 'finger')     return fingerbildHTML(n);
    if (art === 'zehnerfeld') return zehnerfeldHTML(n);
    return punktebildHTML(n);
}

function passendeDarstellungen(n) {
    const arten = ['punkte', 'zehnerfeld'];
    if (n <= 12) arten.push('wuerfel');
    if (n <= 10) arten.push('finger');
    return arten;
}


/* ============================================================
   3. Modul 1: Mengen erfassen
   ============================================================ */

const m1 = { aufgabe: 0, richtig: 0, zahl: 0, art: 'punkte', timer: null, blitz: false };

function m1Start() {
    m1.aufgabe = 0;
    m1.richtig = 0;
    showScreen('m1GameScreen');
    m1Neu();
}

function m1Neu() {
    m1.aufgabe++;
    if (m1.aufgabe > RUNDE_AUFGABEN) {
        zeigeErgebnis('Mengen erfassen', m1.richtig, RUNDE_AUFGABEN, 'modul1-color', m1Start);
        return;
    }

    const raum = einstellungen.m1.raum;
    m1.blitz = einstellungen.m1.modus === 'blitz';
    m1.zahl = zufallZahl(1, raum);
    m1.art = zufallAus(passendeDarstellungen(m1.zahl));

    document.getElementById('m1Score').textContent = m1.richtig;
    document.getElementById('m1Nummer').textContent = m1.aufgabe;
    document.getElementById('m1Next').hidden = true;
    document.getElementById('m1BlitzArea').hidden = !m1.blitz;
    setzeFeedback('m1Feedback', '');

    const frage = m1.blitz ? 'Gut aufpassen! Wie viele waren es?' : 'Wie viele sind es?';
    document.getElementById('m1Prompt').textContent = frage;

    m1Zeigen();

    const optionen = zahlOptionen(m1.zahl, 1, raum);
    document.getElementById('m1Optionen').innerHTML = optionen.map(z =>
        `<button class="zahl-option" onclick="m1Antwort(${z}, this)">${z}</button>`).join('');

    sprich(frage);
}

function m1Zeigen() {
    const buehne = document.getElementById('m1Buehne');
    buehne.classList.remove('verdeckt');
    buehne.innerHTML = mengenbildHTML(m1.zahl, m1.art);

    if (m1.blitz) {
        /* Beim Blitzblick verschwindet das Bild wieder. Das zwingt zum
           Erfassen auf einen Blick statt zum Abzaehlen mit dem Finger. */
        const dauer = einstellungen.m1.raum <= 5 ? 1800 : 2400;
        if (m1.timer) clearTimeout(m1.timer);
        m1.timer = setTimeout(m1Verdecken, dauer);
    }
}

function m1Verdecken() {
    const buehne = document.getElementById('m1Buehne');
    buehne.classList.add('verdeckt');
    buehne.innerHTML = '<span class="verdeckt-hinweis">🙈</span>';
    m1.timer = null;
}

function m1NochmalBlitzen() {
    m1Zeigen();
}

function m1Antwort(zahl, btn) {
    document.querySelectorAll('#m1Optionen .zahl-option').forEach(b => b.disabled = true);
    if (m1.timer) { clearTimeout(m1.timer); m1.timer = null; }

    if (zahl === m1.zahl) {
        btn.classList.add('richtig');
        m1.richtig++;
        document.getElementById('m1Score').textContent = m1.richtig;
        setzeFeedback('m1Feedback', 'Richtig! Es sind ' + m1.zahl + '. ⭐', 'richtig');
        sprich('Richtig! Es sind ' + m1.zahl + '.');
        wartezeit = setTimeout(m1Neu, 1400);
    } else {
        btn.classList.add('falsch');
        document.querySelectorAll('#m1Optionen .zahl-option').forEach(b => {
            if (Number(b.textContent) === m1.zahl) b.classList.add('richtig');
        });
        /* Das Bild wieder aufdecken: das Kind soll sehen, warum es anders war. */
        document.getElementById('m1Buehne').classList.remove('verdeckt');
        document.getElementById('m1Buehne').innerHTML = mengenbildHTML(m1.zahl, m1.art);
        setzeFeedback('m1Feedback', 'Es sind ' + m1.zahl + '. Schau noch einmal hin.', 'falsch');
        sprich('Es sind ' + m1.zahl + '. Schau noch einmal hin.');
        document.getElementById('m1Next').hidden = false;
    }
}

function m1Weiter() {
    m1Neu();
}


/* ============================================================
   4. Modul 2: Ziffern schreiben

   Jede Ziffer ist eine Folge von Strichen, jeder Strich eine
   Punktkette. Daraus entstehen Bahn, Startpunkt und die
   Kontrollpunkte, die der Reihe nach getroffen werden muessen -
   so faellt auch eine spiegelverkehrt geschriebene Ziffer auf.
   ============================================================ */

function linie(p1, p2, schritte = 12) {
    const punkte = [];
    for (let i = 0; i <= schritte; i++) {
        punkte.push([p1[0] + (p2[0] - p1[0]) * i / schritte, p1[1] + (p2[1] - p1[1]) * i / schritte]);
    }
    return punkte;
}

function bogen(cx, cy, rx, ry, vonGrad, bisGrad, schritte = 24) {
    const punkte = [];
    for (let i = 0; i <= schritte; i++) {
        const grad = vonGrad + (bisGrad - vonGrad) * i / schritte;
        const bog = grad * Math.PI / 180;
        punkte.push([cx + rx * Math.cos(bog), cy + ry * Math.sin(bog)]);
    }
    return punkte;
}

/* Haengt Teilstuecke zu einem Strich zusammen, ohne den Nahtpunkt doppelt. */
function kette(...teile) {
    const alle = [];
    teile.forEach(teil => teil.forEach((p, i) => {
        if (alle.length && i === 0) return;
        alle.push(p);
    }));
    return alle;
}

const ZIFFERN = {
    0: {
        spruch: 'Oben anfangen, nach links herum und einmal rundherum: die Null.',
        striche: [bogen(50, 70, 32, 52, -90, -450, 40)]
    },
    1: {
        spruch: 'Schräg nach oben und gerade nach unten: die Eins.',
        striche: [kette(linie([28, 42], [52, 14], 8), linie([52, 14], [52, 126], 18))]
    },
    2: {
        spruch: 'Ein Bogen nach rechts, schräg nach unten und ein Strich: die Zwei.',
        striche: [kette(bogen(50, 40, 30, 26, 180, 360, 20), linie([80, 40], [20, 120], 16), linie([20, 120], [84, 120], 10))]
    },
    3: {
        spruch: 'Zwei Bögen nach rechts: einer oben, einer unten. Das ist die Drei.',
        striche: [kette(bogen(50, 40, 28, 26, 200, 450, 26), bogen(50, 96, 28, 28, 270, 520, 26))]
    },
    4: {
        spruch: 'Schräg nach unten, nach rechts, und dann von oben nach unten: die Vier.',
        striche: [kette(linie([64, 14], [16, 88], 14), linie([16, 88], [88, 88], 12)), linie([64, 14], [64, 126], 18)]
    },
    5: {
        spruch: 'Erst nach unten, dann ein dicker Bauch, zum Schluss der Hut: die Fünf.',
        striche: [kette(linie([30, 18], [36, 72], 12), bogen(55, 92, 26, 26, 230, 520, 28)), linie([30, 18], [80, 18], 10)]
    },
    6: {
        spruch: 'Von oben schräg nach unten und ein Bäuchlein: die Sechs.',
        striche: [kette(bogen(52, 74, 28, 54, -72, -270, 26), bogen(52, 100, 28, 28, 90, -160, 26))]
    },
    7: {
        spruch: 'Ein Strich nach rechts und schräg nach unten: die Sieben.',
        striche: [kette(linie([18, 20], [84, 20], 12), linie([84, 20], [40, 126], 18))]
    },
    8: {
        spruch: 'Nach links oben herum, unten herum und wieder hinauf: die Acht.',
        striche: [kette(bogen(50, 46, 25, 25, -51, -270, 18), bogen(50, 99, 28, 28, -90, -450, 30), bogen(50, 46, 25, 25, -270, -411, 18))]
    },
    9: {
        spruch: 'Ein Kringel nach links herum und ein Strich nach unten: die Neun.',
        striche: [kette(bogen(50, 44, 26, 28, 0, -360, 30), linie([76, 44], [76, 126], 18))]
    }
};

const M2_TOLERANZ = 15;         // so nah muss der Finger am Kontrollpunkt sein
const M2_START_TOLERANZ = 20;   // beim gruenen Startpunkt etwas grosszuegiger

const m2 = {
    liste: [1], index: 0, ziffer: 1,
    durchgang: 1, durchgaenge: 3, ohneHilfe: false,
    strich: 0, ziel: 0, zeichnend: false, spur: [],
    punkte: [], fertig: false, demo: null,
    geschafft: 0, versuche: 0
};

function abstand(a, b) {
    return Math.hypot(a.x - b[0], a.y - b[1]);
}

function strichLaenge(strich) {
    let laenge = 0;
    for (let i = 1; i < strich.length; i++) {
        laenge += Math.hypot(strich[i][0] - strich[i - 1][0], strich[i][1] - strich[i - 1][1]);
    }
    return laenge;
}

/* Kontrollpunkte im gleichen Abstand auf dem Strich verteilen. */
function gleichmaessigePunkte(strich, anzahl) {
    const laengen = [0];
    for (let i = 1; i < strich.length; i++) {
        laengen.push(laengen[i - 1] + Math.hypot(strich[i][0] - strich[i - 1][0], strich[i][1] - strich[i - 1][1]));
    }
    const gesamt = laengen[laengen.length - 1];
    const ergebnis = [];
    for (let k = 0; k < anzahl; k++) {
        const ziel = gesamt * k / (anzahl - 1);
        let i = 1;
        while (i < laengen.length - 1 && laengen[i] < ziel) i++;
        const spanne = laengen[i] - laengen[i - 1] || 1;
        const t = (ziel - laengen[i - 1]) / spanne;
        ergebnis.push([
            strich[i - 1][0] + (strich[i][0] - strich[i - 1][0]) * t,
            strich[i - 1][1] + (strich[i][1] - strich[i - 1][1]) * t
        ]);
    }
    return ergebnis;
}

function pfadAus(punkte) {
    return punkte.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
}

function pfadAusSpur(spur) {
    return spur.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
}

function m2Aufbauen() {
    const gitter = document.getElementById('m2ZiffernGitter');
    const reihenfolge = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    gitter.innerHTML = reihenfolge.map(z =>
        `<button class="ziffer-kachel" onclick="m2Start(${z})">${z}</button>`).join('');
}

function m2Start(was) {
    m2.liste = was === 'alle' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] : [was];
    m2.durchgaenge = m2.liste.length > 1 ? 1 : 3;
    m2.index = 0;
    m2.durchgang = 1;
    m2.geschafft = 0;
    showScreen('m2GameScreen');
    m2Laden();
}

function m2Laden() {
    m2.ziffer = m2.liste[m2.index];
    /* Der letzte Durchgang laeuft ohne graue Bahn - dann schreibt das
       Kind die Ziffer aus dem Gedaechtnis. */
    m2.ohneHilfe = m2.durchgaenge > 1 && m2.durchgang === m2.durchgaenge;

    const daten = ZIFFERN[m2.ziffer];
    m2.punkte = daten.striche.map(s => {
        const anzahl = Math.max(4, Math.min(10, Math.round(strichLaenge(s) / 22)));
        return gleichmaessigePunkte(s, anzahl);
    });

    document.getElementById('m2Prompt').textContent = 'Schreibe die ' + m2.ziffer;
    document.getElementById('m2Spruch').textContent = daten.spruch;
    document.getElementById('m2Fortschritt').textContent = m2.liste.length > 1
        ? 'Ziffer ' + (m2.index + 1) + ' von ' + m2.liste.length
        : 'Durchgang ' + m2.durchgang + ' von ' + m2.durchgaenge;

    m2Neu();
    sprich('Schreibe die ' + m2.ziffer + '. ' + daten.spruch);
}

/* Setzt nur die Spur zurueck, die Ziffer bleibt dieselbe. */
function m2Neu() {
    m2.strich = 0;
    m2.ziel = 0;
    m2.spur = [];
    m2.zeichnend = false;
    m2.fertig = false;
    m2.versuche = 0;
    document.getElementById('m2Next').hidden = true;
    setzeFeedback('m2Feedback', '');
    m2Zeichnen();
}

function m2Zeichnen() {
    const svg = document.getElementById('m2Svg');
    const daten = ZIFFERN[m2.ziffer];
    let html = '';

    html += '<line class="ziffer-hilfslinie" x1="-8" y1="14" x2="108" y2="14"/>';
    html += '<line class="ziffer-hilfslinie" x1="-8" y1="126" x2="108" y2="126"/>';

    daten.striche.forEach(s => {
        html += `<path class="ziffer-bahn${m2.ohneHilfe ? ' blass' : ''}" d="${pfadAus(s)}"/>`;
    });
    daten.striche.forEach((s, i) => {
        html += `<path class="ziffer-spur" id="m2Spur${i}" d=""/>`;
    });
    m2.punkte.forEach((liste, si) => liste.forEach((p, pi) => {
        html += `<circle class="ziffer-punkt" id="m2P${si}_${pi}" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.5"/>`;
    }));
    /* Sichtbar ist immer nur der Startpunkt des Striches, der gerade dran
       ist. Bei der Vier liegen beide Startpunkte fast uebereinander - zwei
       gruene Punkte auf einmal wuerden das Kind nur verwirren. */
    daten.striche.forEach((s, i) => {
        html += `<g id="m2Start${i}">
                    <circle class="ziffer-start" cx="${s[0][0].toFixed(1)}" cy="${s[0][1].toFixed(1)}" r="9"/>
                    <text class="ziffer-startzahl" x="${s[0][0].toFixed(1)}" y="${s[0][1].toFixed(1)}">${i + 1}</text>
                 </g>`;
    });
    html += '<circle id="m2DemoPunkt" class="ziffer-demo" cx="0" cy="0" r="7" style="display:none"/>';

    svg.innerHTML = html;
    m2Marken();
}

function m2Marken() {
    ZIFFERN[m2.ziffer].striche.forEach((s, i) => {
        const marke = document.getElementById('m2Start' + i);
        if (marke) marke.style.display = (i === m2.strich && !m2.fertig) ? '' : 'none';
    });
    m2.punkte.forEach((liste, si) => liste.forEach((p, pi) => {
        const kreis = document.getElementById('m2P' + si + '_' + pi);
        if (!kreis) return;
        kreis.classList.remove('erledigt', 'ziel');
        if (si < m2.strich || (si === m2.strich && pi < m2.ziel)) kreis.classList.add('erledigt');
        else if (si === m2.strich && pi === m2.ziel) kreis.classList.add('ziel');
    }));
}

/* Bildschirmpunkt in das Koordinatensystem der Ziffer umrechnen. */
function svgPunkt(svg, ev) {
    const kasten = svg.getBoundingClientRect();
    const box = svg.viewBox.baseVal;
    const skala = Math.min(kasten.width / box.width, kasten.height / box.height);
    const randX = (kasten.width - box.width * skala) / 2;
    const randY = (kasten.height - box.height * skala) / 2;
    return {
        x: (ev.clientX - kasten.left - randX) / skala + box.x,
        y: (ev.clientY - kasten.top - randY) / skala + box.y
    };
}

function m2Down(ev) {
    if (m2.fertig || m2.demo) return;
    const svg = document.getElementById('m2Svg');
    const p = svgPunkt(svg, ev);
    const start = m2.punkte[m2.strich][0];

    if (abstand(p, start) > M2_START_TOLERANZ) {
        setzeFeedback('m2Feedback', 'Fang beim grünen Punkt an. 🟢', 'falsch');
        sprich('Fang beim grünen Punkt an.');
        return;
    }

    ev.preventDefault();
    m2.zeichnend = true;
    m2.spur = [p];
    m2.ziel = 0;
    setzeFeedback('m2Feedback', '');
    svg.setPointerCapture(ev.pointerId);
    m2Fortsetzen(p);
}

function m2Move(ev) {
    if (!m2.zeichnend) return;
    ev.preventDefault();
    const svg = document.getElementById('m2Svg');
    const p = svgPunkt(svg, ev);
    m2.spur.push(p);
    const spurPfad = document.getElementById('m2Spur' + m2.strich);
    if (spurPfad) spurPfad.setAttribute('d', pfadAusSpur(m2.spur));
    m2Fortsetzen(p);
}

function m2Fortsetzen(p) {
    const liste = m2.punkte[m2.strich];
    while (m2.ziel < liste.length && abstand(p, liste[m2.ziel]) <= M2_TOLERANZ) m2.ziel++;
    m2Marken();
    if (m2.ziel >= liste.length) m2StrichFertig();
}

function m2StrichFertig() {
    m2.zeichnend = false;
    if (m2.strich + 1 < ZIFFERN[m2.ziffer].striche.length) {
        m2.strich++;
        m2.ziel = 0;
        m2.spur = [];
        m2Marken();
        setzeFeedback('m2Feedback', 'Gut! Jetzt der zweite Strich. ✌️', 'richtig');
        sprich('Gut! Jetzt der zweite Strich.');
    } else {
        m2Geschafft();
    }
}

function m2Up() {
    if (!m2.zeichnend) return;
    m2.zeichnend = false;
    /* Mitten im Strich losgelassen: der Strich wird neu begonnen. Eine
       Ziffer entsteht in einem Zug, sonst prägt sich der Weg nicht ein. */
    const spurPfad = document.getElementById('m2Spur' + m2.strich);
    if (spurPfad) spurPfad.setAttribute('d', '');
    const hatteBegonnen = m2.ziel > 1;
    m2.spur = [];
    m2.ziel = 0;
    m2Marken();
    /* Ein blosses Antippen des Startpunktes ist kein Fehlversuch - sonst
       wird ein Kind getadelt, das nur kurz hingetippt hat. */
    if (!hatteBegonnen) return;
    m2.versuche++;
    setzeFeedback('m2Feedback', 'Bleib auf der Bahn und lass nicht los. Noch einmal! 💪', 'falsch');
    if (m2.versuche === 2) sprich('Schau dir an, wie es geht. Tippe auf: Zeig mir wie.');
}

function m2Geschafft() {
    m2.fertig = true;
    m2.geschafft++;
    m2Marken();
    setzeFeedback('m2Feedback', 'Super! Das ist eine schöne ' + m2.ziffer + '. ⭐', 'richtig');
    sprich('Super! Das ist eine schöne ' + m2.ziffer + '.');
    konfetti(20);
    document.getElementById('m2Next').hidden = false;
}

function m2Weiter() {
    if (m2.durchgang < m2.durchgaenge) {
        m2.durchgang++;
    } else {
        m2.durchgang = 1;
        m2.index++;
    }
    if (m2.index >= m2.liste.length) {
        const gesamt = m2.liste.length * m2.durchgaenge;
        zeigeErgebnis('Ziffern schreiben', m2.geschafft, gesamt, 'modul2-color',
            () => m2Start(m2.liste.length > 1 ? 'alle' : m2.liste[0]));
        return;
    }
    m2Laden();
}

/* Zeigt den Schreibweg als wandernden Punkt. */
function m2Vormachen() {
    if (m2.demo) return;
    m2Neu();
    const alle = [];
    ZIFFERN[m2.ziffer].striche.forEach((s, si) => s.forEach(p => alle.push({ x: p[0], y: p[1], si })));
    const punkt = document.getElementById('m2DemoPunkt');
    const spuren = {};
    let i = 0;
    punkt.style.display = '';
    sprich(ZIFFERN[m2.ziffer].spruch);

    m2.demo = setInterval(() => {
        if (i >= alle.length) {
            clearInterval(m2.demo);
            m2.demo = null;
            punkt.style.display = 'none';
            /* Nur aufraeumen, wenn das Kind nicht schon selbst losgelegt hat. */
            wartezeit = setTimeout(() => { if (!m2.zeichnend && m2.ziel === 0) m2Neu(); }, 900);
            return;
        }
        const p = alle[i++];
        punkt.setAttribute('cx', p.x.toFixed(1));
        punkt.setAttribute('cy', p.y.toFixed(1));
        (spuren[p.si] = spuren[p.si] || []).push(p);
        const pfad = document.getElementById('m2Spur' + p.si);
        if (pfad) pfad.setAttribute('d', pfadAusSpur(spuren[p.si]));
    }, 45);
}


/* ============================================================
   5. Modul 3: Dazulegen oder wegstreichen
   ============================================================ */

const m3 = { aufgabe: 0, richtig: 0, ziel: 0, ding: null, plaetze: [], versuche: 0, fertig: false };

function m3Start() {
    m3.aufgabe = 0;
    m3.richtig = 0;
    showScreen('m3GameScreen');
    m3Neu();
}

function m3Neu() {
    m3.aufgabe++;
    if (m3.aufgabe > RUNDE_AUFGABEN) {
        zeigeErgebnis('Dazulegen und wegstreichen', m3.richtig, RUNDE_AUFGABEN, 'modul3-color', m3Start);
        return;
    }

    const raum = einstellungen.m3.raum;
    const art = einstellungen.m3.art === 'gemischt' ? zufallAus(['dazu', 'weg']) : einstellungen.m3.art;

    m3.ziel = zufallZahl(2, raum);
    m3.ding = zufallAus(DINGE);
    m3.versuche = 0;
    m3.fertig = false;

    let vorhanden;
    if (art === 'dazu') vorhanden = Math.max(0, m3.ziel - zufallZahl(1, 3));
    else                vorhanden = Math.min(raum + 3, m3.ziel + zufallZahl(1, 3));

    /* Immer in Fuenferreihen - so bleibt die Struktur beim Zaehlen erhalten. */
    const plaetze = Math.ceil(Math.max(raum, vorhanden + 1) / 5) * 5;
    m3.plaetze = [];
    for (let i = 0; i < plaetze; i++) {
        m3.plaetze.push({ voll: i < vorhanden, gestrichen: false });
    }

    const wort = dingWort(m3.ding, m3.ziel);
    document.getElementById('m3Prompt').textContent = 'Es sollen ' + m3.ziel + ' ' + wort + ' sein.';
    document.getElementById('m3Zahl').textContent = m3.ziel;
    document.getElementById('m3Score').textContent = m3.richtig;
    document.getElementById('m3Nummer').textContent = m3.aufgabe;
    document.getElementById('m3Next').hidden = true;
    document.getElementById('m3Check').hidden = false;
    setzeFeedback('m3Feedback', '');

    m3Zeichnen();
    sprich('Es sollen ' + m3.ziel + ' ' + wort + ' sein. Lege dazu oder streiche durch.');
}

function m3Zeichnen() {
    document.getElementById('m3Feld').innerHTML = m3.plaetze.map((platz, i) => {
        const klassen = ['objekt-platz'];
        if (platz.voll) klassen.push('voll');
        if (platz.gestrichen) klassen.push('gestrichen');
        return `<div class="${klassen.join(' ')}" onclick="m3Tippe(${i})">${platz.voll ? m3.ding.emoji : ''}</div>`;
    }).join('');
}

function m3Tippe(i) {
    if (m3.fertig) return;
    const platz = m3.plaetze[i];
    if (platz.voll) {
        platz.gestrichen = !platz.gestrichen;
    } else {
        platz.voll = true;
        platz.gestrichen = false;
    }
    m3Zeichnen();
    if (platz.voll && !platz.gestrichen) {
        const feld = document.getElementById('m3Feld');
        if (feld.children[i]) feld.children[i].classList.add('neu');
    }
    setzeFeedback('m3Feedback', '');
}

function m3Anzahl() {
    return m3.plaetze.filter(p => p.voll && !p.gestrichen).length;
}

function m3Pruefen() {
    if (m3.fertig) return;
    const anzahl = m3Anzahl();

    if (anzahl === m3.ziel) {
        m3.fertig = true;
        m3.richtig++;
        document.getElementById('m3Score').textContent = m3.richtig;
        setzeFeedback('m3Feedback', 'Richtig! Genau ' + m3.ziel + '. ⭐', 'richtig');
        sprich('Richtig! Genau ' + m3.ziel + '.');
        konfetti(20);
        document.getElementById('m3Check').hidden = true;
        wartezeit = setTimeout(m3Neu, 1600);
        return;
    }

    m3.versuche++;
    const zuViel = anzahl > m3.ziel;

    if (m3.versuche === 1) {
        const tipp = zuViel
            ? 'Da sind zu viele. Streiche welche durch.'
            : 'Da sind noch zu wenige. Lege noch welche dazu.';
        setzeFeedback('m3Feedback', 'Du hast ' + anzahl + '. ' + tipp, 'falsch');
        sprich('Du hast ' + anzahl + '. ' + tipp);
        return;
    }

    /* Nach dem zweiten Versuch loest sich die Aufgabe selbst auf -
       kein Kind soll vor einer verschlossenen Tuer sitzen bleiben. */
    m3.fertig = true;
    let offen = m3.ziel;
    m3.plaetze.forEach(platz => {
        if (offen > 0) { platz.voll = true; platz.gestrichen = false; offen--; }
        else if (platz.voll) { platz.gestrichen = true; }
    });
    m3Zeichnen();
    setzeFeedback('m3Feedback', 'So sehen ' + m3.ziel + ' aus. Zähle mit: 1, 2, 3 …', 'falsch');
    sprich('So sehen ' + m3.ziel + ' aus.');
    document.getElementById('m3Check').hidden = true;
    document.getElementById('m3Next').hidden = false;
}

function m3Weiter() {
    m3Neu();
}


/* ============================================================
   6. Kartenmotor fuer Modul 4 und 5

   Die Karten lassen sich antippen und dann auf einen Platz
   tippen - oder mit Finger und Maus hinueberziehen. Erstklaessern
   faellt das Tippen leichter, das Ziehen macht mehr Freude.
   ============================================================ */

let gewaehlteKarte = null;
let aktiverTisch = null;
const zieh = { karte: null, geist: null, x0: 0, y0: 0, bewegt: false };

function karteAbwaehlen() {
    if (gewaehlteKarte) gewaehlteKarte.classList.remove('gewaehlt');
    gewaehlteKarte = null;
    document.querySelectorAll('.karten-slot').forEach(s => s.classList.remove('bereit'));
}

function karteWaehlen(karte) {
    if (gewaehlteKarte === karte) { karteAbwaehlen(); return; }
    karteAbwaehlen();
    gewaehlteKarte = karte;
    karte.classList.add('gewaehlt');
    document.querySelectorAll('#' + aktiverBereich() + ' .karten-slot').forEach(s => s.classList.add('bereit'));
}

/* Welche Slots gerade gefuellt werden koennen, haengt am aktiven Modul. */
function aktiverBereich() {
    return document.getElementById('m4GameScreen').classList.contains('active') ? 'm4Leine' : 'm5Gruppen';
}

/* Sobald eine Karte wandert, verschwinden alle gruenen und roten Raender -
   sonst leuchtet noch die Rueckmeldung der letzten Pruefung. */
function markenLoeschen() {
    document.querySelectorAll('.karten-slot').forEach(s => s.classList.remove('richtig', 'falsch'));
}

function kartePlatzieren(karte, slot) {
    const alt = slot.querySelector('.zahl-karte');
    if (alt && alt !== karte && aktiverTisch) aktiverTisch.appendChild(alt);
    slot.appendChild(karte);
    markenLoeschen();
    karteAbwaehlen();
}

function karteZurueck(karte) {
    if (aktiverTisch) aktiverTisch.appendChild(karte);
    markenLoeschen();
    karteAbwaehlen();
}

function kartenDown(ev) {
    const karte = ev.target.closest('.zahl-karte');
    if (karte) {
        zieh.karte = karte;
        zieh.x0 = ev.clientX;
        zieh.y0 = ev.clientY;
        zieh.bewegt = false;
        document.addEventListener('pointermove', kartenZiehen);
        document.addEventListener('pointerup', kartenLoslassen, { once: true });
        ev.preventDefault();
        return;
    }
    const slot = ev.target.closest('.karten-slot');
    if (slot) slotTippen(slot);
}

function kartenZiehen(ev) {
    if (!zieh.karte) return;
    if (!zieh.bewegt && Math.hypot(ev.clientX - zieh.x0, ev.clientY - zieh.y0) < 8) return;

    if (!zieh.bewegt) {
        zieh.bewegt = true;
        zieh.geist = zieh.karte.cloneNode(true);
        zieh.geist.classList.add('karte-geist');
        zieh.geist.classList.remove('gewaehlt');
        document.body.appendChild(zieh.geist);
        zieh.karte.classList.add('wird-gezogen');
    }
    zieh.geist.style.left = ev.clientX + 'px';
    zieh.geist.style.top = ev.clientY + 'px';
}

function kartenLoslassen(ev) {
    document.removeEventListener('pointermove', kartenZiehen);
    const karte = zieh.karte;
    zieh.karte = null;
    if (!karte) return;

    if (!zieh.bewegt) {
        /* Kurzes Tippen: Karte im Platz geht zurueck, Karte auf dem
           Tisch wird ausgewaehlt. */
        if (karte.parentElement.classList.contains('karten-slot')) {
            karte.parentElement.classList.remove('richtig', 'falsch');
            karteZurueck(karte);
        } else {
            karteWaehlen(karte);
        }
        return;
    }

    karte.classList.remove('wird-gezogen');
    if (zieh.geist) { zieh.geist.remove(); zieh.geist = null; }
    zieh.bewegt = false;

    const unten = document.elementFromPoint(ev.clientX, ev.clientY);
    const slot = unten && unten.closest ? unten.closest('.karten-slot') : null;
    if (slot) kartePlatzieren(karte, slot);
    else if (unten && unten.closest && unten.closest('.karten-tisch')) karteZurueck(karte);
    else karteAbwaehlen();
}

function slotTippen(slot) {
    if (gewaehlteKarte) {
        kartePlatzieren(gewaehlteKarte, slot);
        return;
    }
    const karte = slot.querySelector('.zahl-karte');
    if (karte) { slot.classList.remove('richtig', 'falsch'); karteZurueck(karte); }
}

/* Zahlenkarte: entweder die Ziffer oder ein Punktebild im Zehnerfeld. */
function karteHTML(zahl, alsPunkte) {
    if (!alsPunkte || zahl > 10) {
        return `<div class="zahl-karte" data-zahl="${zahl}">${zahl}</div>`;
    }
    let kreise = '';
    for (let i = 0; i < 10; i++) {
        const x = 9 + (i % 5) * 13;
        const y = 24 + Math.floor(i / 5) * 22;
        kreise += i < zahl
            ? `<circle cx="${x}" cy="${y}" r="5.5" fill="#37474f"/>`
            : `<circle cx="${x}" cy="${y}" r="5.5" fill="none" stroke="#dfe6ec" stroke-width="1.5"/>`;
    }
    return `<div class="zahl-karte" data-zahl="${zahl}"><svg viewBox="0 0 70 70">${kreise}</svg></div>`;
}


/* ============================================================
   7. Modul 4: Zahlen der Groesse nach ordnen
   ============================================================ */

const m4 = { aufgabe: 0, richtig: 0, loesung: [], versuche: 0, fertig: false };

function m4Start() {
    m4.aufgabe = 0;
    m4.richtig = 0;
    showScreen('m4GameScreen');
    m4Neu();
}

function m4Neu() {
    m4.aufgabe++;
    if (m4.aufgabe > RUNDE_AUFGABEN) {
        zeigeErgebnis('Zahlen ordnen', m4.richtig, RUNDE_AUFGABEN, 'modul4-color', m4Start);
        return;
    }

    const s = einstellungen.m4;
    const richtung = s.richtung === 'gemischt' ? zufallAus(['auf', 'ab']) : s.richtung;
    const zahlen = zieheZahlen(s.anzahl, 1, s.raum);
    m4.loesung = [...zahlen].sort((a, b) => richtung === 'auf' ? a - b : b - a);
    m4.versuche = 0;
    m4.fertig = false;

    const frage = richtung === 'auf'
        ? 'Ordne die Karten von klein nach groß.'
        : 'Ordne die Karten von groß nach klein.';
    document.getElementById('m4Prompt').textContent = frage;
    document.getElementById('m4Score').textContent = m4.richtig;
    document.getElementById('m4Nummer').textContent = m4.aufgabe;
    document.getElementById('m4Next').hidden = true;
    document.getElementById('m4Check').hidden = false;
    setzeFeedback('m4Feedback', '');

    let leine = '';
    for (let i = 0; i < s.anzahl; i++) {
        leine += `<div class="karten-slot"><span class="slot-nummer">${i + 1}.</span></div>`;
    }
    document.getElementById('m4Leine').innerHTML = leine;

    const tisch = document.getElementById('m4Tisch');
    tisch.innerHTML = mische(zahlen).map(z => {
        const alsPunkte = s.karten === 'punkte' || (s.karten === 'gemischt' && Math.random() < .5);
        return karteHTML(z, alsPunkte);
    }).join('');
    aktiverTisch = tisch;
    karteAbwaehlen();

    sprich(frage);
}

function m4Gelegt() {
    return [...document.querySelectorAll('#m4Leine .karten-slot')].map(slot => {
        const karte = slot.querySelector('.zahl-karte');
        return karte ? Number(karte.dataset.zahl) : null;
    });
}

function m4Pruefen() {
    if (m4.fertig) return;
    const gelegt = m4Gelegt();

    if (gelegt.includes(null)) {
        setzeFeedback('m4Feedback', 'Es ist noch ein Platz frei.', 'falsch');
        sprich('Es ist noch ein Platz frei.');
        return;
    }

    const slots = [...document.querySelectorAll('#m4Leine .karten-slot')];
    const stimmt = gelegt.every((z, i) => z === m4.loesung[i]);
    slots.forEach((slot, i) => slot.classList.add(gelegt[i] === m4.loesung[i] ? 'richtig' : 'falsch'));

    if (stimmt) {
        m4.fertig = true;
        m4.richtig++;
        document.getElementById('m4Score').textContent = m4.richtig;
        setzeFeedback('m4Feedback', 'Richtig geordnet! ⭐', 'richtig');
        sprich('Richtig geordnet! ' + m4.loesung.join(', '));
        konfetti(20);
        document.getElementById('m4Check').hidden = true;
        wartezeit = setTimeout(m4Neu, 1900);
        return;
    }

    m4.versuche++;
    if (m4.versuche === 1) {
        setzeFeedback('m4Feedback', 'Fast! Die roten Karten sitzen noch falsch.', 'falsch');
        sprich('Fast! Die roten Karten sitzen noch falsch. Suche die ' +
            (m4.loesung[0] < m4.loesung[1] ? 'kleinste' : 'größte') + ' Zahl für den ersten Platz.');
        return;
    }

    /* Zweiter Fehlversuch: die App legt selbst richtig und zeigt es. */
    m4.fertig = true;
    const karten = {};
    document.querySelectorAll('#m4GameScreen .zahl-karte').forEach(k => {
        karten[k.dataset.zahl] = k;
        aktiverTisch.appendChild(k);   // erst alle Plaetze raeumen, sonst
    });                                // landen zwei Karten im selben Platz
    slots.forEach((slot, i) => {
        slot.classList.remove('richtig', 'falsch');
        slot.appendChild(karten[m4.loesung[i]]);
    });
    setzeFeedback('m4Feedback', 'So ist es richtig: ' + m4.loesung.join(' – '), 'falsch');
    sprich('So ist es richtig: ' + m4.loesung.join(', '));
    document.getElementById('m4Check').hidden = true;
    document.getElementById('m4Next').hidden = false;
}

function m4Weiter() {
    m4Neu();
}


/* ============================================================
   8. Modul 5: Mengenbilder und Zahlen zuordnen

   Drei oder vier Bildgruppen (3 Hunde, 5 Äpfel ...) und dazu
   die Zahlenkarten. Hier wird das Zaehlergebnis zur Ziffer.
   ============================================================ */

const m5 = { aufgabe: 0, richtig: 0, gruppen: [], versuche: 0, fertig: false };

function m5Start() {
    m5.aufgabe = 0;
    m5.richtig = 0;
    showScreen('m5GameScreen');
    m5Neu();
}

function m5Neu() {
    m5.aufgabe++;
    if (m5.aufgabe > RUNDE_AUFGABEN) {
        zeigeErgebnis('Bilder und Zahlen', m5.richtig, RUNDE_AUFGABEN, 'modul5-color', m5Start);
        return;
    }

    const s = einstellungen.m5;
    const zahlen = zieheZahlen(s.gruppen, 1, s.raum);
    const dinge = mische(DINGE).slice(0, s.gruppen);
    m5.gruppen = zahlen.map((n, i) => ({ zahl: n, ding: dinge[i] }));
    m5.versuche = 0;
    m5.fertig = false;

    document.getElementById('m5Score').textContent = m5.richtig;
    document.getElementById('m5Nummer').textContent = m5.aufgabe;
    document.getElementById('m5Next').hidden = true;
    document.getElementById('m5Check').hidden = false;
    setzeFeedback('m5Feedback', '');

    document.getElementById('m5Gruppen').innerHTML = m5.gruppen.map(g => {
        const bilder = Array.from({ length: g.zahl }, () => `<span>${g.ding.emoji}</span>`).join('');
        return `<div class="bild-gruppe">
                    <div class="bild-menge">${bilder}</div>
                    <div class="karten-slot" data-zahl="${g.zahl}"><span class="slot-nummer">?</span></div>
                </div>`;
    }).join('');

    /* Bei groesserem Zahlenraum kommt eine Karte zu viel dazu, damit die
       letzte Zuordnung nicht einfach uebrig bleibt. */
    const kartenZahlen = [...zahlen];
    if (s.raum > 5) {
        const rest = [];
        for (let i = 1; i <= s.raum; i++) if (!zahlen.includes(i)) rest.push(i);
        if (rest.length) kartenZahlen.push(zufallAus(rest));
    }

    const tisch = document.getElementById('m5Tisch');
    tisch.innerHTML = mische(kartenZahlen).map(z => karteHTML(z, false)).join('');
    aktiverTisch = tisch;
    karteAbwaehlen();

    sprich('Zähle die Bilder. Lege zu jedem Bild die passende Zahl.');
}

function m5Pruefen() {
    if (m5.fertig) return;
    const slots = [...document.querySelectorAll('#m5Gruppen .karten-slot')];
    const belegt = slots.map(slot => slot.querySelector('.zahl-karte'));

    if (belegt.includes(null)) {
        setzeFeedback('m5Feedback', 'Zu einem Bild fehlt noch die Zahl.', 'falsch');
        sprich('Zu einem Bild fehlt noch die Zahl.');
        return;
    }

    let alleRichtig = true;
    slots.forEach((slot, i) => {
        const stimmt = Number(belegt[i].dataset.zahl) === Number(slot.dataset.zahl);
        slot.classList.add(stimmt ? 'richtig' : 'falsch');
        if (!stimmt) alleRichtig = false;
    });

    if (alleRichtig) {
        m5.fertig = true;
        m5.richtig++;
        document.getElementById('m5Score').textContent = m5.richtig;
        setzeFeedback('m5Feedback', 'Alles richtig zugeordnet! ⭐', 'richtig');
        sprich('Alles richtig zugeordnet!');
        konfetti(20);
        document.getElementById('m5Check').hidden = true;
        wartezeit = setTimeout(m5Neu, 1800);
        return;
    }

    m5.versuche++;
    if (m5.versuche === 1) {
        setzeFeedback('m5Feedback', 'Schau die roten noch einmal an. Zähle mit dem Finger mit.', 'falsch');
        sprich('Schau die roten noch einmal an. Zähle mit dem Finger mit.');
        return;
    }

    m5.fertig = true;
    const karten = {};
    document.querySelectorAll('#m5GameScreen .zahl-karte').forEach(k => {
        karten[k.dataset.zahl] = k;
        aktiverTisch.appendChild(k);   // erst alle Plaetze raeumen, sonst
    });                                // landen zwei Karten im selben Platz
    slots.forEach(slot => {
        slot.classList.remove('richtig', 'falsch');
        const passende = karten[slot.dataset.zahl];
        if (passende) slot.appendChild(passende);
    });
    setzeFeedback('m5Feedback', 'So gehören die Zahlen zu den Bildern.', 'falsch');
    sprich('So gehören die Zahlen zu den Bildern.');
    document.getElementById('m5Check').hidden = true;
    document.getElementById('m5Next').hidden = false;
}

function m5Weiter() {
    m5Neu();
}


/* ============================================
   Start
   ============================================ */

m2Aufbauen();

const m2Svg = document.getElementById('m2Svg');
m2Svg.addEventListener('pointerdown', m2Down);
m2Svg.addEventListener('pointermove', m2Move);
m2Svg.addEventListener('pointerup', m2Up);
m2Svg.addEventListener('pointercancel', m2Up);

['m4Leine', 'm4Tisch', 'm5Gruppen', 'm5Tisch'].forEach(id => {
    document.getElementById(id).addEventListener('pointerdown', kartenDown);
});

if (kannVorlesen()) window.speechSynthesis.onvoiceschanged = () => deutscheStimme();
