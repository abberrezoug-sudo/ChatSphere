import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Champ de saisie réutilisable de ChatSphere.
///
/// Affiche un label au-dessus du champ, une icône préfixe, et gère
/// l'obscurcissement du texte (mots de passe) ainsi qu'un widget suffixe
/// optionnel (ex. bouton de visibilité).
class AppTextField extends StatelessWidget {
  const AppTextField({
    super.key,
    required this.label,
    required this.icon,
    this.hint,
    this.controller,
    this.obscureText = false,
    this.keyboardType,
    this.validator,
    this.suffixWidget,
    this.onChanged,
    this.autofillHints,
  });

  /// Label affiché au-dessus du champ.
  final String label;

  /// Icône préfixe affichée à gauche du champ.
  final IconData icon;

  /// Texte indicatif (placeholder).
  final String? hint;

  final TextEditingController? controller;

  /// Masque le texte saisi (mots de passe).
  final bool obscureText;

  final TextInputType? keyboardType;

  /// Fonction de validation Dart (retourne un message d'erreur ou null).
  final String? Function(String?)? validator;

  /// Widget suffixe optionnel (ex. toggle de visibilité du mot de passe).
  final Widget? suffixWidget;

  final ValueChanged<String>? onChanged;

  final List<String>? autofillHints;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label du champ (gris clair, medium).
        Text(label, style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          validator: validator,
          onChanged: onChanged,
          autofillHints: autofillHints,
          autovalidateMode: AutovalidateMode.onUserInteraction,
          style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
          cursorColor: AppColors.primary,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon, color: AppColors.textSecondary, size: 20),
            suffixIcon: suffixWidget,
          ),
        ),
      ],
    );
  }
}
