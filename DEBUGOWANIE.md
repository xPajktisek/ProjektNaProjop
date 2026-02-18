# Etap 5 – Debugowanie Aplikacji RETRO ARCADE

**Autor:** Piotr  
**Data:** 2026-02-18  
**Wersja przed debugowaniem:** 0.5.0  
**Wersja po debugowaniu:** 0.6.0  

---

## 1. Projekt metody debugowania

### 1.1 Wybrana metoda
**Manualna analiza statyczna kodu** wsparta **dynamiczną weryfikacją w przeglądarce** za pomocą Chrome DevTools.

### 1.2 Użyte narzędzia debugujące

| Narzędzie | Rola | Uzasadnienie |
|-----------|------|-------------|
| **VS Code** | Edytor kodu, analiza statyczna | Nawigacja po kodzie, wyszukiwanie duplikatów i błędów logicznych |
| **Chrome DevTools – Console** | Przechwytywanie wyjątków runtime | Monitorowanie błędów JavaScript w konsoli |
| **Chrome DevTools – Sources** | Debugger z breakpointami | Śledzenie wartości zmiennych krok po kroku |
| **Chrome DevTools – Performance** | Profiler wydajności | Wykrywanie wycieków pamięci i nadmiernego użycia CPU |
| **Git + GitHub** | Wersjonowanie i śledzenie zmian | Porównanie diff przed/po naprawie, historia commitów |

### 1.3 Uzasadnienie wyboru
Aplikacja jest w pełni kliencka (HTML/CSS/JS bez frameworka), dlatego:
- **Analiza statyczna** pozwala szybko wykryć duplikaty, błędy logiczne i niezgodności w kodzie
- **Chrome DevTools** to natywne narzędzie do debugowania JavaScript z wbudowanym profilerem
- **Brak testów jednostkowych** w projekcie wymaga manualnej weryfikacji każdej naprawy

---

## 2. Proces debugowania kodu

### 2.1 BUG-1: Zduplikowana funkcja `startGame()` ⚠️ ŚREDNI

#### Reprodukcja błędu
1. Otworzyć `index.html` w przeglądarce
2. Kliknąć grę **PAC-MAN** w menu
3. **Oczekiwane:** Uruchomienie gry Pac-Man
4. **Rzeczywiste:** Wyświetla się `alert("PACMAN - COMING SOON!")` – gra uznana za niedostępną

#### Wyizolowanie źródła błędu
Analiza statyczna pliku `script.js` ujawniła, że funkcja `startGame()` jest zdefiniowana **dwukrotnie**:
- **Linia 299–311**: Pierwsza definicja (bez obsługi Pac-Mana)
- **Linia 1818–1832**: Druga definicja (z obsługą Pac-Mana)

#### Identyfikacja przyczyny
W JavaScript, gdy dwie funkcje mają tę samą nazwę w tym samym zakresie (scope), **druga nadpisuje pierwszą** (function hoisting). Przy dodawaniu Pac-Mana programista utworzył nową kopię `startGame()` zamiast rozszerzyć istniejącą, co spowodowało zduplikowany, niespójny kod.

#### Usunięcie defektu
```diff
-function startGame(gameName) {
-    if (gameName === 'snake') { startSnakeGame(); }
-    else if (gameName === 'tetris') { startTetrisGame(); }
-    else if (gameName === 'pong') { startPongGame(); }
-    else if (gameName === 'invaders') { startInvadersGame(); }
-    else { alert(`${gameName.toUpperCase()} - COMING SOON!`); }
-}
+// Usunięto – zachowano jedną kompletną wersję z obsługą Pac-Mana
```

#### Weryfikacja
✅ Kliknięcie PAC-MAN w menu uruchamia grę poprawnie.

---

### 2.2 BUG-2: Zduplikowany `keydown` event listener ⚠️ ŚREDNI

#### Reprodukcja błędu
1. Uruchomić dowolną grę i otworzyć Chrome DevTools → Sources
2. Ustawić breakpoint na obsłudze klawiszy
3. Nacisnąć strzałkę – breakpoint trafia **dwa razy** na to samo zdarzenie

#### Wyizolowanie źródła błędu
Dwa osobne `document.addEventListener('keydown', ...)`:
- **Linia 1476**: Obsługuje Snake, Tetris, Pong, Invaders
- **Linia 1836**: Obsługuje Pac-Man

#### Identyfikacja przyczyny
Pac-Man został dodany później, a programista zamiast rozszerzyć istniejący listener, utworzył nowy. Oba nasłuchują jednocześnie, co może prowadzić do nieprzewidzianych interakcji i trudno wykrywalnych bugów.

#### Usunięcie defektu
Scalono oba listenery w jeden, dodając blok `if (currentGame === 'pacman')` do istniejącego listenera.

#### Weryfikacja
✅ Breakpoint trafia tylko raz na zdarzenie. Pac-Man reaguje na klawisze poprawnie.

---

### 2.3 BUG-3: Nieskończone przyspieszanie piłki w Pong 🔴 KRYTYCZNY

#### Reprodukcja błędu
1. Uruchomić grę Pong
2. Odbić piłkę ~20 razy
3. **Oczekiwane:** Piłka porusza się z rozsądną prędkością
4. **Rzeczywiste:** Piłka staje się niewidoczna (prędkość ~37 px/klatkę), przeskakuje paletki

#### Wyizolowanie źródła błędu
Funkcja `updatePong()`, linia 777:
```javascript
pongBall.vx *= 1.08;
```

#### Identyfikacja przyczyny
Przy każdym odbiciu prędkość rośnie o 8% **bez górnego limitu**. Wzrost jest **wykładniczy**:
- Odbicie 1: `8.0 px/kl`
- Odbicie 10: `17.3 px/kl`
- Odbicie 20: `37.3 px/kl` ← piłka przeskakuje paletkę
- Odbicie 30: `80.5 px/kl` ← gra nieplayable

#### Usunięcie defektu
```diff
 pongBall.vx = Math.abs(pongBall.vx) * (idx === 0 ? 1 : -1);
-pongBall.vx *= 1.08;
+pongBall.vx *= 1.05;
+const maxSpeed = 20;
+pongBall.vx = Math.max(-maxSpeed, Math.min(maxSpeed, pongBall.vx));
```

Zmniejszono mnożnik z 1.08 na 1.05 i dodano limit prędkości `maxSpeed = 20`.

#### Weryfikacja
✅ Po 30+ odbiciach piłka utrzymuje rozsądną prędkość, nie przeskakuje paletek.

---

### 2.4 BUG-4: Canvas nie resetuje rozmiaru po zmianie gry ⚠️ ŚREDNI

#### Reprodukcja błędu
1. Uruchomić Pong (canvas 600×400) lub Invaders (canvas 800×600)
2. Wrócić do menu
3. Uruchomić Snake
4. **Oczekiwane:** Plansza 400×400 px (kwadrat)
5. **Rzeczywiste:** Plansza ma proporcje Ponga/Invaders

#### Wyizolowanie źródła błędu
Funkcja `startSnakeGame()` nie ustawia rozmiaru canvas, zakładając stałe `400×400`.

#### Identyfikacja przyczyny
Canvas `<canvas id="gameCanvas">` jest współdzielony między wszystkimi grami. Pong zmienia go na `600×400`, Invaders na `800×600`, ale Snake nie resetuje do `400×400`.

#### Usunięcie defektu
```diff
 function startSnakeGame() {
+    canvas.width = gridSize * tileCount;  // 20 * 20 = 400
+    canvas.height = gridSize * tileCount; // 20 * 20 = 400
     currentGame = 'snake';
```

#### Weryfikacja
✅ Po grze w Pong → powrót → Snake: plansza ma poprawne proporcje 400×400.

---

### 2.5 BUG-5: Tetris `clearTetrisLines` pomija wiersze ⚠️ ŚREDNI

#### Reprodukcja błędu
1. Uruchomić Tetris
2. Wypełnić 2 sąsiednie wiersze jednocześnie
3. **Oczekiwane:** Oba wiersze zostają usunięte, wynik +200
4. **Rzeczywiste:** Tylko 1 wiersz zostaje usunięty, wynik +100

#### Wyizolowanie źródła błędu
Funkcja `clearTetrisLines()`, pętla `for`:
```javascript
for (let row = tetrisHeight - 1; row >= 0; row--) {
    if (tetrisBoard[row].every(cell => cell)) {
        tetrisBoard.splice(row, 1);
        tetrisBoard.unshift(Array(tetrisWidth).fill(0));
    }
}
```

#### Identyfikacja przyczyny
Po `splice(row, 1)` i `unshift(...)`, indeksy wiersza się przesuwają. Wiersz, który był pod usuniętym, przesuwa się na pozycję `row`, ale pętla `for` wykonuje `row--`, pomijając go.

#### Usunięcie defektu
```diff
 if (tetrisBoard[row].every(cell => cell)) {
     tetrisBoard.splice(row, 1);
     tetrisBoard.unshift(Array(tetrisWidth).fill(0));
     linesCleared++;
+    row++; // ponowne sprawdzenie tej samej pozycji
 }
```

#### Weryfikacja
✅ Wypełnienie 2+ wierszy naraz powoduje usunięcie wszystkich i poprawne naliczenie punktów.

---

### 2.6 BUG-6: Krytyczny błąd – `endGame()` nie zatrzymuje pętli gry 🔴🔴 KRYTYCZNY

#### Reprodukcja błędu
1. Uruchomić dowolną grę (np. Snake)
2. Przegrać (wjechać w ścianę)
3. Kliknąć „PLAY AGAIN"
4. Przegrać ponownie
5. **Oczekiwane:** Gra działa normalnie
6. **Rzeczywiste:** Gra przyspiesza z każdą śmiercią, przeglądarka się wiesza

#### Szczegóły reprodukcji (Chrome DevTools):
```
Po 1. śmierci: 1 pętla gry → normalna prędkość
Po 2. śmierci: 2 pętle gry → 2x prędkość
Po 3. śmierci: 4 pętle gry → 4x prędkość
Po 5. śmierci: 16+ pętli → przeglądarka crashuje
```

CPU w zakładce Performance rośnie wykładniczo:
- 1 pętla: ~3% CPU
- 5 śmierci: ~48% CPU
- 8 śmierci: 100% CPU → karta przeglądarki "nie odpowiada"

#### Wyizolowanie źródła błędu
Funkcja `endGame()`, linia 1414:
```javascript
function endGame(gameName) {
    gameRunning = true;  // ← BUG!
```

#### Identyfikacja przyczyny
Zmienna `gameRunning` ustawiana na `true` zamiast `false`. Powoduje to, że:

1. Pętla gry (`snakeGameLoop`, `tetrisGameLoop`, itd.) sprawdza `if (!gameRunning) return;` – ale `gameRunning === true`, więc **pętla się nie zatrzymuje**
2. Po kliknięciu „Play Again" wywoływana jest nowa `startSnakeGame()`, która uruchamia **dodatkową** pętlę
3. Dodatkowe pętle akumulują się z każdą „śmiercią"
4. Prowadzi to do **wycieku pamięci** i **przeciążenia CPU**

Typ błędu: **Błąd logiczny (Boolean Logic Error)**

#### Usunięcie defektu
```diff
 function endGame(gameName) {
-    gameRunning = true;
+    gameRunning = false;
```

#### Weryfikacja
✅ Po przegraniu i kliknięciu „Play Again" gra działa z normalną prędkością.  
✅ Chrome DevTools → Performance: CPU stabilne na ~3% niezależnie od liczby rozegranych rund.  
✅ Brak wycieków pamięci po wielokrotnych rozgrywkach.

---

## 3. Aktualizacja dokumentacji

### Zmienione elementy dokumentacji:

| Element | Status | Opis |
|---------|--------|------|
| `DEBUGOWANIE.md` | **[NOWY]** | Pełny raport z procesu debugowania Etapu 5 |
| `README.md` | **[ZAKTUALIZOWANY]** | Dodano sekcję o historii wersji |
| `script.js` | **[ZMIENIONY]** | Naprawiono 6 błędów (5 średnich + 1 krytyczny) |

---

## 4. Wersjonowanie aplikacji

### Schemat wersjonowania
Projekt stosuje **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`

### Historia wersji

| Wersja | Data | Zakres zmian |
|--------|------|------|
| **0.5.0** | 2026-02-18 | Początkowa wersja z 5 grami arcade |
| **0.6.0-rc1** | 2026-02-18 | Naprawiono 5 bugów, wprowadzono regresję w `endGame()` |
| **0.6.0** | 2026-02-18 | Naprawiono krytyczny bug w `endGame()` – wersja stabilna |

### Changelog v0.6.0

```
## [0.6.0] - 2026-02-18

### Naprawione (Fixed)
- [KRYTYCZNY] endGame() nie zatrzymywała pętli gry → wyciek pamięci i crash przeglądarki
- [KRYTYCZNY] Piłka w Pong przyspieszała nieskończenie → dodano limit prędkości
- [ŚREDNI] Zduplikowana funkcja startGame() → usunięto duplikat
- [ŚREDNI] Zduplikowany keydown listener → scalono w jeden
- [ŚREDNI] Canvas nie resetował rozmiaru po przejściu Snake → Pong → Snake
- [ŚREDNI] Tetris clearTetrisLines pomijał wiersze przy jednoczesnym usunięciu
```

### Proces wersjonowania
```bash
# Commit z bugiem (v0.6.0-rc1):
git commit -m "v0.6.0-rc1: Fix 5 bugs + critical regression in endGame"
git push origin main

# Naprawa krytycznego buga:
git commit -m "v0.6.0: Fix critical endGame bug - gameRunning not set to false"
git push origin main
git tag v0.6.0
git push origin v0.6.0
```
