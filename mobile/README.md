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
│   ├── router/app_router.dart        # go_router : /splash, /register, /login
│   └── widgets/
│       ├── app_text_field.dart       # champ réutilisable (label, icône, obscure, validator, suffix)
│       ├── gradient_button.dart      # bouton pill (gradient OU couleur pleine, isLoading)
│       └── dashed_border_container.dart # bordure pointillée (bouton "Get Started")
└── features/
    ├── splash/presentation/splash_screen.dart  # onboarding + StateProvider isSyncing
    └── auth/presentation/
        ├── register_screen.dart      # Create Account (validation Dart)
        └── login_screen.dart         # placeholder /login
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
