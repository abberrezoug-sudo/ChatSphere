# ChatSphere — Frontend Flutter

Interface Flutter de ChatSphere (messagerie sécurisée). Dark mode premium,
dégradés violet/indigo → cyan.

## Stack
- Flutter (stable) + Dart null-safety
- Architecture feature-first : `lib/features/<feature>/presentation/...`
- State management : Riverpod (`StateProvider` pour l'état local)
- Navigation : `go_router`
- Fonts : Google Fonts (Poppins titres, Inter corps)
- Icônes : `lucide_icons_flutter`
- Bordure pointillée : `dotted_border`

## Arborescence
```
lib/
├── main.dart                         # branche ThemeData + go_router
├── core/
│   ├── theme/app_theme.dart          # AppColors + AppSizes + AppTheme (ThemeData dark)
│   ├── router/app_router.dart        # go_router : /splash /register /login /forgot-password /home /chat /profile
│   └── widgets/
│       ├── app_text_field.dart       # champ réutilisable (label, icône, obscure, validator, suffix)
│       ├── gradient_button.dart      # bouton pill (gradient OU couleur pleine, isLoading)
│       ├── dashed_border_container.dart # bordure pointillée
│       └── app_bottom_nav.dart       # barre de navigation inférieure (Home/Chats/Rooms/Profile)
└── features/
    ├── splash/presentation/splash_screen.dart  # onboarding + StateProvider isSyncing
    ├── auth/presentation/
    │   ├── register_screen.dart      # Create Account (validation Dart)
    │   ├── login_screen.dart         # Welcome Back (login)
    │   └── forgot_password_screen.dart # Reset Password
    ├── home/presentation/home_screen.dart      # liste des conversations
    ├── chat/presentation/chat_screen.dart      # conversation / DM
    └── profile/presentation/profile_screen.dart # profil utilisateur
```

## Démarrage
```bash
flutter pub get
flutter run
```

## Écrans
- **Splash / Onboarding** (`/splash`) : logo + glow, loader "SYNCING ENCRYPTED
  NODE..." qui bascule vers le bouton "Get Started" via `isSyncingProvider`.
- **Create Account** (`/register`) : formulaire scrollable (Full Name, Email,
  Password, Confirm Password) avec validation, checkbox obligatoire, bouton
  "Sign Up" dégradé désactivé tant que le formulaire est invalide, boutons
  sociaux, lien vers `/login`.
- **Welcome Back** (`/login`) : Email + Password (toggle), "Forgot Password?",
  "Sign In" (→ `/home`), boutons sociaux Google/GitHub, lien vers `/register`.
- **Reset Password** (`/forgot-password`) : Email + "Send Reset Link",
  "Back to Login".
- **Home** (`/home`) : recherche, amis en ligne, activité récente, conversations
  favorites, barre de navigation inférieure.
- **Chat / DM** (`/chat`) : bulles envoyées/reçues, saisie de message (état local).
- **Profile** (`/profile`) : bannière, avatar, bio, "Edit Profile", stats,
  Shared Media.
