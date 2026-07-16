import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Palette de couleurs centrale de ChatSphere (dark mode premium).
///
/// Toutes les couleurs de l'application sont définies ici sous forme de
/// constantes afin de garantir la cohérence du design system.
class AppColors {
  AppColors._();

  // Fond : dégradé vertical noir bleuté -> indigo très sombre.
  static const Color bgTop = Color(0xFF0A0E1A);
  static const Color bgBottom = Color(0xFF151A2E);

  // Surfaces / champs de saisie.
  static const Color surface = Color(0xFF12172A);
  static const Color border = Color(0xFF232A45);

  // Accent principal (violet/indigo) + fin du dégradé (cyan).
  static const Color primary = Color(0xFF6C5CE7);
  static const Color cyan = Color(0xFF00C6FB);

  // Fond de la carte du logo.
  static const Color logoSurface = Color(0xFF1A1F35);

  // Textes.
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF8A93B2); // placeholders / sous-titres

  // États.
  static const Color success = Color(0xFF22C55E); // indicateur "online"
  static const Color error = Color(0xFFEF4444);

  /// Dégradé de fond plein écran (haut -> bas).
  static const LinearGradient backgroundGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [bgTop, bgBottom],
  );

  /// Dégradé CTA principal : violet -> cyan (bouton "Sign Up").
  static const LinearGradient ctaGradient = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [primary, cyan],
  );
}

/// Rayons, espacements et autres constantes de mise en page.
class AppSizes {
  AppSizes._();

  static const double radiusCard = 16.0; // cartes / champs
  static const double radiusPill = 28.0; // boutons pill
  static const double radiusSocial = 12.0; // boutons sociaux
  static const double hPadding = 24.0; // padding horizontal global
  static const double gap = 16.0; // espacement vertical standard
  static const double gapLg = 24.0; // espacement vertical large
}

/// Thème global de l'application (dark mode).
class AppTheme {
  AppTheme._();

  static ThemeData get dark {
    final base = ThemeData.dark(useMaterial3: true);

    // Typographie : Poppins pour les titres, Inter pour le corps.
    final textTheme = TextTheme(
      // H1 : Poppins Bold 26.
      headlineMedium: GoogleFonts.poppins(
        fontSize: 26,
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
      // Sous-titre : Inter Regular 14 gris.
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        color: AppColors.textSecondary,
      ),
      // Label de champ : Inter Medium 13.
      labelLarge: GoogleFonts.inter(
        fontSize: 13,
        fontWeight: FontWeight.w500,
        color: AppColors.textSecondary,
      ),
      // Texte des boutons : Inter SemiBold 16.
      titleMedium: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
    );

    return base.copyWith(
      scaffoldBackgroundColor: AppColors.bgTop,
      primaryColor: AppColors.primary,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.cyan,
        surface: AppColors.surface,
        error: AppColors.error,
      ),
      textTheme: textTheme,
      // Style commun à tous les TextFormField (voir AppTextField).
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        hintStyle:
            GoogleFonts.inter(color: AppColors.textSecondary, fontSize: 14),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusCard),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusCard),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusCard),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusCard),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusCard),
          borderSide: const BorderSide(color: AppColors.error, width: 1.5),
        ),
      ),
    );
  }
}
