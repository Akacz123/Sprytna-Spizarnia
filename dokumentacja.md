# Sprytna Spiżarnia

**Sprytna Spiżarnia** to webowa aplikacja do zarządzania domowymi zapasami żywności. Umożliwia śledzenie dat ważności produktów, skanowanie kodów kreskowych przez telefon oraz otrzymywanie propozycji przepisów dopasowanych do produktów, którym kończy się termin przydatności. Aplikacja jest skierowana do każdego, kto chce ograniczyć marnowanie jedzenia i lepiej organizować produkty spożywcze w swoim domu.

**Jaki problem rozwiązuje?**
Aplikacja rozwiązuje problem marnowania jedzenia spowodowanego zapominaniem o datach ważności produktów przechowywanych w spiżarni/lodówce. Zamiast wyrzucać przeterminowane produkty, użytkownik dostaje powiadomienia o kończących się produktach i propozycje przepisów, które pozwolą je wykorzystać.

**Czym się wyróżnia?**
W przeciwieństwie do zwykłych list zakupów, Sprytna Spiżarnia oferuje skanowanie kodów kreskowych przez kod QR na telefonie (bez instalowania dodatkowych aplikacji), automatyczne pobieranie nazw produktów z globalnej bazy Open Food Facts oraz inteligentne sugestie przepisów dopasowane do psujących się składników.

---

## Uruchomienie projektu (developer)

### Użyte technologie

| Technologia | Wersja | Rola |
|---|---|---|
| [.NET](https://dotnet.microsoft.com/) | `10.0` | Backend Web API |
| [ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/) | `10.0` | Framework HTTP |
| [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/) | `10.0.5` | ORM / migracje bazy danych |
| [PostgreSQL](https://www.postgresql.org/) | `16+` | Relacyjna baza danych |
| [Npgsql](https://www.npgsql.org/) | `10.0.1` | Sterownik EF Core dla PostgreSQL |
| [Swashbuckle / Swagger](https://github.com/domaindrivendev/Swashbuckle.AspNetCore) | `10.1.7` | Dokumentacja i testowanie API |
| [React](https://react.dev/) | `19.x` | Frontend – biblioteka UI |
| [Vite](https://vite.dev/) | `8.x` | Bundler / serwer deweloperski |
| [Tailwind CSS](https://tailwindcss.com/) | `3.4.x` | Stylowanie komponentów |
| [React Router DOM](https://reactrouter.com/) | `7.x` | Routing po stronie klienta |
| [Axios](https://axios-http.com/) | `1.x` | Klient HTTP do komunikacji z API |
| [Lucide React](https://lucide.dev/) | `1.x` | Biblioteka ikon |
| [html5-qrcode](https://github.com/mebjas/html5-qrcode) | `2.3.x` | Skaner kodów kreskowych w przeglądarce |
| [qrcode.react](https://github.com/zpao/qrcode.react) | `4.x` | Generowanie kodów QR |
| [Open Food Facts API](https://world.openfoodfacts.org/data) | `v0` | Globalna baza danych produktów (publiczne API) |
| [DiceBear API](https://www.dicebear.com/) | `7.x` | Generowanie awatarów użytkowników |

### Wymagania programowe

- **System operacyjny**: Windows 10/11, macOS 13+, lub Linux (Ubuntu 22.04+)
- **Środowisko uruchomieniowe / SDK**:
  - [.NET SDK 10.0](https://dotnet.microsoft.com/download/dotnet/10.0)
  - [Node.js v20+](https://nodejs.org/) (dla frontendu)
  - npm `10+` (instalowany razem z Node.js)
- **Silnik bazy danych**:
  - [PostgreSQL 16+](https://www.postgresql.org/download/) — wymagany do działania backendu
- **Narzędzia opcjonalne**:
  - [pgAdmin 4](https://www.pgadmin.org/) — graficzny interfejs do zarządzania PostgreSQL
  - [Visual Studio 2022](https://visualstudio.microsoft.com/) lub [JetBrains Rider](https://www.jetbrains.com/rider/) — dla backendu C#
  - [Visual Studio Code](https://code.visualstudio.com/) — dla frontendu React

### Kroki uruchomienia

#### 1. Klonowanie repozytorium

```bash
git clone <url-repozytorium>
cd Sprytna_Spizarnia
```

#### 2. Konfiguracja backendu (ASP.NET Core)

Utwórz lub edytuj plik `SprytnaSpizarnia/SprytnaSpizarnia/appsettings.json` i ustaw connection string do swojej bazy PostgreSQL:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=sprytna_spizarnia;Username=postgres;Password=TwojeHaslo"
  }
}
```

Następnie zastosuj migracje bazy danych (tworzy tabele automatycznie):

```bash
cd SprytnaSpizarnia/SprytnaSpizarnia
dotnet ef database update
```

Uruchom serwer API (nasłuchuje na porcie `5289`):

```bash
dotnet run
```

Dokumentacja Swagger dostępna pod adresem: `http://localhost:5289/swagger`

#### 3. Konfiguracja frontendu (React + Vite)

```bash
cd spizarnia-front
npm install
npm run dev
```

Frontend dostępny pod adresem: `http://localhost:5173`

> **Ważne**: Backend musi być uruchomiony **przed** otwarciem frontendu, ponieważ frontend komunikuje się z API pod adresem `http://localhost:5289/api`.

---

## Architektura systemu

```
┌─────────────────────────────────────────────────────────┐
│                     Przeglądarka (klient)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │           React SPA (spizarnia-front)             │   │
│  │  - Routing: React Router DOM                      │   │
│  │  - Stylowanie: Tailwind CSS                       │   │
│  │  - Komunikacja: Axios → HTTP REST API             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │  HTTP (port 5289)
                          ▼
┌─────────────────────────────────────────────────────────┐
│             ASP.NET Core Web API (SprytnaSpizarnia)      │
│  - Kontrolery: Controllers/                              │
│  - Modele:     Models/                                   │
│  - DbContext:  Data/AppDbContext.cs                      │
│  - Swagger:    /swagger (tylko w Development)            │
└─────────────────────────┬───────────────────────────────┘
                          │  Npgsql / EF Core
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                     │
│  Tabele: Users, Products, Ingredients, Categories,       │
│          PantryItems, Recipes, RecipeIngredients         │
└─────────────────────────────────────────────────────────┘
```

---

## Diagram encji (ERD)

```
┌──────────────┐        ┌──────────────────┐
│    User      │1      *│   PantryItem      │
│──────────────│◄───────│──────────────────│
│ Id (Guid)    │        │ Id (Guid)         │
│ FirstName    │        │ UserId (FK)       │
│ LastName     │        │ ProductId (FK)    │
│ Email        │        │ Quantity          │
│ ThemePrefer  │        │ Unit              │
│ FontSizePref │        │ ExpirationDate    │
│ CreatedAt    │        │ CreatedAt         │
└──────────────┘        │ UpdatedAt         │
                        └────────┬──────────┘
                                 │* 1
                        ┌────────▼──────────┐        ┌──────────────────┐
                        │    Product        │        │   Ingredient     │
                        │───────────────────│*      1│──────────────────│
                        │ Id (int)          │───────►│ Id (int)         │
                        │ IngredientId (FK) │        │ CategoryId (FK)  │
                        │ Name              │        │ Name             │
                        │ Barcode (unique)  │        └────────┬─────────┘
                        └───────────────────┘                 │* 1
                                                     ┌────────▼─────────┐
                        ┌──────────────────┐         │    Category      │
                        │    Recipe        │         │──────────────────│
                        │──────────────────│         │ Id (int)         │
                        │ Id (int)         │         │ Name             │
                        │ Title            │         └──────────────────┘
                        │ Instructions     │
                        │ PrepTimeMinutes  │
                        └────────┬─────────┘
                                 │1
                                 │*
                        ┌────────▼──────────────┐
                        │   RecipeIngredient    │
                        │───────────────────────│
                        │ Id (int)              │
                        │ RecipeId (FK)         │
                        │ IngredientId (FK)     │
                        │ Quantity              │
                        │ Unit                  │
                        └───────────────────────┘
```

---

## Struktura projektu

```
Sprytna_Spizarnia/
├── SprytnaSpizarnia/               # Backend (C# / ASP.NET Core)
│   └── SprytnaSpizarnia/
│       ├── Controllers/            # Kontrolery API (endpointy REST)
│       ├── Data/
│       │   ├── AppDbContext.cs     # Kontekst bazy danych EF Core
│       │   └── AppDbContextFactory.cs
│       ├── Migrations/             # Migracje EF Core
│       ├── Models/                 # Encje / modele danych
│       │   ├── Category.cs
│       │   ├── Ingredient.cs
│       │   ├── PantryItem.cs
│       │   ├── Product.cs
│       │   ├── Recipe.cs
│       │   ├── RecipeIngredient.cs
│       │   └── User.cs
│       ├── Program.cs              # Konfiguracja DI i pipeline HTTP
│       ├── appsettings.json        # Konfiguracja produkcyjna
│       └── appsettings.Development.json
│
└── spizarnia-front/                # Frontend (React + Vite)
    └── src/
        ├── api.js                  # Klient Axios (baseURL, interceptory)
        ├── App.jsx                 # Routing aplikacji + ProtectedRoute
        ├── components/
        │   ├── Navbar.jsx          # Nawigacja (z awatarem)
        │   ├── AddProductModal.jsx # Modal dodawania produktu
        │   └── MobileScanner.jsx   # Skaner QR na urządzeniu mobilnym
        ├── pages/
        │   ├── LoginPage.jsx       # Logowanie / rejestracja
        │   ├── DashboardPage.jsx   # Pulpit – psujące się produkty + przepisy
        │   ├── PantryPage.jsx      # Lista spiżarni + filtrowanie + edycja
        │   ├── AddProductPage.jsx  # Formularz + skaner mobilny
        │   ├── SettingsPage.jsx    # Ustawienia konta i wyglądu
        │   └── RecipesPage.jsx     # Strona przepisów (w budowie)
        ├── index.css
        └── main.jsx
```

---

## Opis ekranów aplikacji

### Logowanie i rejestracja (`/login`)

Ekran startowy aplikacji umożliwiający zalogowanie się do istniejącego konta lub rejestrację nowego. Autentykacja odbywa się przez e-mail i hasło. Po zalogowaniu `userId` zapisywany jest w `localStorage` i dołączany do każdego żądania HTTP jako nagłówek `X-User-Id`.

### Pulpit (`/`)

Główny ekran podzielony na dwie sekcje:
- **Zjedz mnie wkrótce!** – lista produktów, które są przeterminowane (czerwone karty) lub których termin ważności upływa w ciągu 3 dni (żółte karty). Każdy produkt ma przyciski „Zjedzone" i „Wyrzucone/Zepsute", które usuwają go ze spiżarni.
- **Uratuj to, co masz!** – propozycje przepisów dopasowane do psujących się składników (pobierane z endpointu `/api/recipes/suggestions`). Przepisy wyświetlane są z obrazkami dobieranymi na podstawie słów kluczowych w nazwie.

### Moja Kuchnia (`/kuchnia`)

Pełna lista wszystkich produktów w spiżarni. Funkcjonalności:
- **Wyszukiwarka** po nazwie produktu
- **Filtry**: Wszystkie / Świeże / Krótka data / Przeterminowane
- **Kliknięcie w wiersz** otwiera modal edycji produktu (zmiana nazwy, kodu kreskowego, daty ważności, ilości i jednostki)
- **Usuwanie** produktu przyciskiem „Usuń"

### Dodaj Produkt (`/dodaj`)

Formularz dodawania nowego produktu. Pola:
- Nazwa produktu (wymagana)
- Kod kreskowy (opcjonalny)
- Data ważności (wymagana)
- Ilość i jednostka (szt./kg/g/l/ml/opak.)

**Skaner mobilny**: Po kliknięciu „Uruchom skaner w telefonie" generowany jest losowy identyfikator sesji i kod QR. Po zeskanowaniu kodu telefonem otwiera się strona `/scan/:sessionId` z kamerą. Zeskanowany kod kreskowy wysyłany jest do API `/api/scanner/:sessionId`, a strona na desktopie odpytuje API co 1,5 sekundy. Po wykryciu kodu aplikacja pobiera dane produktu z [Open Food Facts](https://world.openfoodfacts.org/) i uzupełnia formularz.

### Ustawienia (`/ustawienia`)

Dwie zakładki:
- **Profil i Konto**: wyświetlanie e-maila, wybór awatara z galerii 9 opcji (generowane przez DiceBear API), zmiana hasła (UI gotowe)
- **Wygląd**: przełącznik motywu (jasny/ciemny) i rozmiaru tekstu (mała/domyślna/duża). Zmiany zapisywane są w `localStorage` i natychmiast stosowane do całej aplikacji.

---

## Endpointy API

Dokumentacja interaktywna dostępna przez **Swagger UI** pod adresem `http://localhost:5289/swagger` podczas pracy w trybie deweloperskim.

| Metoda | Ścieżka | Opis |
|--------|---------|------|
| `POST` | `/api/auth/register` | Rejestracja nowego użytkownika |
| `POST` | `/api/auth/login` | Logowanie, zwraca userId |
| `PUT` | `/api/auth/avatar` | Aktualizacja awatara użytkownika |
| `GET` | `/api/pantry` | Pobierz wszystkie produkty z spiżarni |
| `POST` | `/api/pantry` | Dodaj nowy produkt do spiżarni |
| `PUT` | `/api/pantry/{id}` | Zaktualizuj produkt |
| `DELETE` | `/api/pantry/{id}` | Usuń produkt |
| `GET` | `/api/recipes/suggestions` | Pobierz przepisy dopasowane do psujących się produktów |
| `POST` | `/api/recipes/seed` | Wypełnij bazę przykładowymi przepisami |
| `GET` | `/api/scanner/{sessionId}` | Pobierz wynik skanowania (polling) |
| `POST` | `/api/scanner/{sessionId}` | Zapisz zeskanowany kod kreskowy |

---

## Bezpieczeństwo

Aplikacja używa prostego mechanizmu identyfikacji użytkownika opartego o nagłówek HTTP `X-User-Id`. Każde żądanie do API (z wyjątkiem `/api/auth/*`) powinno zawierać ten nagłówek z identyfikatorem zalogowanego użytkownika (UUID). Interceptor Axios w `api.js` dołącza ten nagłówek automatycznie.

> **Uwaga**: Mechanizm ten jest uproszczony na potrzeby projektu akademickiego. W środowisku produkcyjnym należałoby zastosować JWT (JSON Web Tokens) lub inny standardowy mechanizm autoryzacji.

---

## Znane ograniczenia i plany rozwoju

- Strona przepisów (`/kuchnia` → RecipesPage) jest obecnie w budowie – komponent nie zawiera jeszcze zawartości
- Zmiana hasła w ustawieniach jest widoczna w UI, ale endpoint backendowy nie jest jeszcze zaimplementowany
- Brak obsługi mobilnego menu nawigacyjnego (Navbar ukrywa linki na małych ekranach)
- Kategorie produktów są statycznie wyświetlane jako „Inne" – brak dynamicznego przypisywania kategorii
