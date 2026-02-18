# 🛠️ Etap 5 – Debugowanie aplikacji Retro Arcade

**Data:** 2026-02-18  
**Aplikacja:** Retro Arcade (wersja 0.6.0 → 0.7.0)  
**Plik z błędem:** `script.js`  
**Krytyczność:** 🔴 KRYTYCZNY – blokuje działanie całej aplikacji

---

## 1. Projekt metody debugowania

### 1.1 Wybrana metoda

**Metoda manualna** z wykorzystaniem narzędzi deweloperskich przeglądarki.

### 1.2 Użyte narzędzia debugujące

| Narzędzie | Wersja / Opis | Zastosowanie |
|-----------|---------------|--------------|
| **Google Chrome DevTools** | Chrome 121+ | Główny debugger – konsola (Console), inspekcja kodu (Sources), breakpointy |
| **Console (panel Konsola)** | wbudowany w Chrome | Odczyt komunikatów `TypeError`, analiza stack trace |
| **Sources (panel Źródła)** | wbudowany w Chrome | Ustawienie breakpointów, krokowe wykonanie kodu (Step Over / Step Into) |
| **Edytor kodu (VS Code)** | VS Code 1.96+ | Analiza statyczna kodu, wyszukiwanie w pliku, edycja i naprawa |

### 1.3 Uzasadnienie wyboru

1. **Metoda manualna** jest odpowiednia, ponieważ aplikacja jest kliencka (front-end), uruchamiana bezpośrednio w przeglądarce – nie wymaga serwerowego środowiska testowego.
2. **Chrome DevTools** to standard branżowy do debugowania JavaScript – oferuje natychmiastowy wgląd w stack trace błędu, inspekcję wartości zmiennych i krokowe wykonanie kodu.
3. **Breakpointy w panelu Sources** pozwalają zatrzymać wykonanie dokładnie w miejscu błędu i przeanalizować kontekst (wartości zmiennych, stos wywołań).
4. **Visual Studio Code** zapewnia wygodne wyszukiwanie i edycję kodu z podświetlaniem składni, co przyspiesza lokalizację i naprawę defektu.

---

## 2. Proces debugowania kodu

### 2.1 Reprodukcja błędu

**Kroki reprodukcji:**

1. Otworzyć plik `index.html` w przeglądarce Google Chrome
2. Doczekać pełnego załadowania menu głównego (neonowe menu z listą 5 gier)
3. Za pomocą klawiszy strzałek `↑ ↓` wybrać dowolną grę (np. **Snake**)
4. Nacisnąć klawisz **ENTER** aby uruchomić grę

**Oczekiwane zachowanie:**
- Gra powinna się uruchomić, widać canvas z rozgrywką

**Rzeczywiste zachowanie:**
- Wyświetla się ekran gry, ale canvas jest pusty
- W konsoli przeglądarki pojawia się błąd krytyczny:

```
Uncaught TypeError: Cannot read properties of undefined (reading 'toUpperCase')
    at startGame (script.js:1849)
    at HTMLDocument.<anonymous> (script.js:272)
```

- Żadna z 5 gier (Snake, Tetris, Pong, Space Invaders, Pac-Man) nie uruchamia się
- Użytkownik jest zmuszony nacisnąć przycisk **BACK** lub odświeżyć stronę

**Warunki występowania:**
- Błąd występuje **zawsze** – przy każdej próbie uruchomienia dowolnej gry
- Niezależny od przeglądarki, systemu operacyjnego, rozdzielczości ekranu
- Niezależny od stanu `localStorage` (wyniki, monety, motyw)

---

### 2.2 Wyizolowanie źródła błędu

**Metoda izolacji:** Analiza stack trace z konsoli Chrome DevTools.

1. Otworzyłem Chrome DevTools (`F12`) → zakładka **Console**
2. Odczytałem stack trace błędu – wskazywał linię w funkcji `startGame()` w pliku `script.js`
3. Przeszedłem do zakładki **Sources** → otworzyłem `script.js`
4. Ustawiłem **breakpoint** na linii 1835 (początek funkcji `startGame`)
5. Powtórzyłem reprodukcję (nacisnąłem ENTER na Snake)
6. Debugger zatrzymał wykonanie na breakpoincie

**Zlokalizowany fragment kodu (linie 1835–1850):**

```javascript
function startGame(gameName) {
    gameName = undefined; // ← LINIA Z BŁĘDEM
    if (gameName === 'snake') {
        startSnakeGame();
    } else if (gameName === 'tetris') {
        startTetrisGame();
    } else if (gameName === 'pong') {
        startPongGame();
    } else if (gameName === 'invaders') {
        startInvadersGame();
    } else if (gameName === 'pacman') {
        startPacmanGame();
    } else {
        alert(`${gameName.toUpperCase()} - COMING SOON!`);
    }
}
```

**Moduł:** Główny dispatcher gier (`startGame`)  
**Funkcja:** `startGame(gameName)` – linia 1836

---

### 2.3 Identyfikacja przyczyny awarii

**Typ błędu:** Błąd logiczny prowadzący do `TypeError` (wyjątku runtime)

**Szczegółowa analiza:**

| Aspekt | Opis |
|--------|------|
| **Kategoria** | Błąd logiczny (nadpisanie parametru) + wyjątek runtime (TypeError) |
| **Przyczyna bezpośrednia** | Linia `gameName = undefined;` nadpisuje wartość parametru przekazanego do funkcji |
| **Skutek pośredni** | Żaden warunek `if/else if` nie jest spełniony (bo `undefined !== 'snake'` itd.) |
| **Skutek końcowy** | Kod wchodzi w gałąź `else` → `gameName.toUpperCase()` → `undefined.toUpperCase()` → **TypeError** |
| **Zasięg awarii** | Blokuje uruchomienie **wszystkich 5 gier** – cała aplikacja jest niegrywalna |

**Przebieg wykonania kodu z błędem:**

```
1. Użytkownik naciska ENTER na grze "snake"
2. Event listener wywołuje: startGame('snake')
3. gameName = 'snake'  ← parametr prawidłowy
4. gameName = undefined ← NADPISANIE! Wartość utracona
5. if (undefined === 'snake') → FALSE
6. else if (undefined === 'tetris') → FALSE
7. else if (undefined === 'pong') → FALSE
8. else if (undefined === 'invaders') → FALSE
9. else if (undefined === 'pacman') → FALSE
10. else → alert(undefined.toUpperCase() + ...)
11. ❌ TypeError: Cannot read properties of undefined (reading 'toUpperCase')
```

---

### 2.4 Usunięcie defektu

**Naprawa:** Usunięcie linii `gameName = undefined;` z funkcji `startGame()`.

**Kod przed naprawą:**
```javascript
function startGame(gameName) {
    gameName = undefined; // BŁĄD KRYTYCZNY – nadpisanie parametru
    if (gameName === 'snake') {
        startSnakeGame();
    // ...
```

**Kod po naprawie:**
```javascript
function startGame(gameName) {
    if (gameName === 'snake') {
        startSnakeGame();
    // ...
```

**Diff zmian:**
```diff
 function startGame(gameName) {
-    gameName = undefined; // BŁĄD KRYTYCZNY – nadpisanie parametru
     if (gameName === 'snake') {
         startSnakeGame();
```

**Uzasadnienie naprawy:**  
Usunięto linię nadpisującą parametr `gameName`. Teraz parametr zachowuje swoją oryginalną wartość przekazaną z event listenera (`'snake'`, `'tetris'`, `'pong'`, `'invaders'`, `'pacman'`), dzięki czemu odpowiedni warunek `if/else if` zostaje spełniony i uruchamiana jest właściwa gra.

---

### 2.5 Weryfikacja poprawności naprawy

**Scenariusze testowe:**

| # | Gra | Akcja | Oczekiwany wynik | Status |
|---|-----|-------|------------------|--------|
| 1 | Snake | Wybranie Snake → ENTER | Gra Snake uruchamia się, wąż się pojawia | ✅ PASS |
| 2 | Tetris | Wybranie Tetris → ENTER | Gra Tetris uruchamia się, klocki spadają | ✅ PASS |
| 3 | Pong | Wybranie Pong → ENTER | Gra Pong uruchamia się, piłka się odbija | ✅ PASS |
| 4 | Space Invaders | Wybranie Space Invaders → ENTER | Gra SI uruchamia się, kosmici się pojawiają | ✅ PASS |
| 5 | Pac-Man | Wybranie Pac-Man → ENTER | Gra Pac-Man uruchamia się, Pac-Man rusza | ✅ PASS |
| 6 | Konsola | Sprawdzenie Console po uruchomieniu gier | Brak błędów TypeError | ✅ PASS |
| 7 | Powrót do menu | ESC lub BACK po uruchomieniu gry | Powrót do menu głównego | ✅ PASS |
| 8 | Play Again | Gra kończy się → PLAY AGAIN | Gra uruchamia się ponownie | ✅ PASS |

**Dodatkowa weryfikacja:**
- Przetestowano w przeglądarkach: Chrome, Firefox, Edge
- Zweryfikowano brak regresji w systemie monet i sklepu motywów
- Sprawdzono zapis wyników (localStorage) – działa poprawnie

---

## 3. Aktualizacja dokumentacji

### 3.1 Dodane elementy dokumentacji

| Dokument | Zmiana |
|----------|--------|
| **`DEBUGOWANIE_KRYTYCZNE.md`** (NOWY) | Pełny raport debugowania Etapu 5 – opis metody, reprodukcja, analiza, naprawa, weryfikacja |
| **`README.md`** (ZAKTUALIZOWANY) | Dodano wersję `0.7.0` do tabeli historii wersji z informacją o naprawie krytycznego błędu |

### 3.2 Opis zmian w dokumentacji

1. **`DEBUGOWANIE_KRYTYCZNE.md`** – nowy plik dokumentacji zawierający:
   - Projekt metody debugowania (narzędzia, uzasadnienie)
   - Pełny opis procesu debugowania w 5 krokach
   - Tabularne zestawienie testów weryfikacyjnych
   - Informacje o wersjonowaniu i changelogu

2. **`README.md`** – zaktualizowane sekcje:
   - Tabela „Historia wersji" – dodano wiersz z wersją `0.7.0`
   - Dodano odnośnik do dokumentu `DEBUGOWANIE_KRYTYCZNE.md`

---

## 4. Wersjonowanie aplikacji

### 4.1 Proces wersjonowania

Zastosowano **Semantic Versioning (SemVer)** w formacie `MAJOR.MINOR.PATCH`:

| Komponent | Wartość | Uzasadnienie |
|-----------|---------|--------------|
| MAJOR | 0 | Aplikacja w fazie rozwoju (pre-release) |
| MINOR | 7 | Nowa funkcjonalność: naprawa krytycznego błędu, nowy dokument debugowania |
| PATCH | 0 | Czysta zmiana minor – brak dodatkowych poprawek |

**Wersja poprzednia:** `0.6.0`  
**Wersja nowa:** `0.7.0`

### 4.2 Changelog

```
## [0.7.0] – 2026-02-18

### 🐛 Naprawione błędy
- [KRYTYCZNY] Naprawiono błąd w funkcji `startGame()`, który powodował
  TypeError i uniemożliwiał uruchomienie jakiejkolwiek gry z menu

### 📝 Dokumentacja
- Dodano `DEBUGOWANIE_KRYTYCZNE.md` – pełny raport z Etapu 5 debugowania
- Zaktualizowano `README.md` o nową wersję i odnośnik do raportu

### 📁 Zmienione pliki
- `script.js` – usunięto wadliwą linię `gameName = undefined`
  w funkcji `startGame()` (linia 1836)
- `README.md` – dodano wpis wersji 0.7.0
- `DEBUGOWANIE_KRYTYCZNE.md` – nowy plik
```

---

## 5. Podsumowanie

| Metryka | Wartość |
|---------|--------|
| Czas reprodukcji | < 1 minuta |
| Czas lokalizacji błędu | ~ 3 minuty |
| Czas naprawy | < 1 minuta |
| Zmienione pliki | 1 (`script.js`) |
| Usunięte linie kodu | 1 |
| Testy weryfikacyjne | 8/8 PASS |
| Regresje | 0 |
| Nowa wersja | 0.7.0 |
