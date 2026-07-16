import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Bouton pill réutilisable de ChatSphere.
///
/// Peut afficher soit un dégradé ([gradient]), soit une couleur pleine
/// ([color]). Gère l'état de chargement ([isLoading]) et l'état désactivé
/// (quand [onPressed] est null).
class GradientButton extends StatelessWidget {
  const GradientButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.gradient,
    this.color,
    this.trailingIcon,
    this.height = 56,
  }) : assert(gradient == null || color == null,
            'Utiliser soit un gradient, soit une couleur pleine, pas les deux.');

  final String text;

  /// Callback du bouton. Si null, le bouton est désactivé (grisé).
  final VoidCallback? onPressed;

  /// Affiche un loader interne et bloque les interactions.
  final bool isLoading;

  /// Dégradé de fond (prioritaire sur [color]).
  final Gradient? gradient;

  /// Couleur pleine de fond (utilisée si [gradient] est null).
  final Color? color;

  /// Icône optionnelle affichée à droite du texte (ex. flèche).
  final IconData? trailingIcon;

  final double height;

  @override
  Widget build(BuildContext context) {
    final bool isDisabled = onPressed == null || isLoading;

    // Décoration : dégradé par défaut, sinon couleur pleine.
    final Gradient? effectiveGradient =
        color != null ? null : (gradient ?? AppColors.ctaGradient);

    return Opacity(
      // Le bouton désactivé est grisé.
      opacity: isDisabled ? 0.5 : 1,
      child: SizedBox(
        width: double.infinity,
        height: height,
        child: DecoratedBox(
          decoration: BoxDecoration(
            gradient: effectiveGradient,
            color: color,
            borderRadius: BorderRadius.circular(AppSizes.radiusPill),
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(AppSizes.radiusPill),
              onTap: isDisabled ? null : onPressed,
              child: Center(
                child: isLoading
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            text,
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(color: Colors.white),
                          ),
                          if (trailingIcon != null) ...[
                            const SizedBox(width: 8),
                            Icon(trailingIcon, color: Colors.white, size: 20),
                          ],
                        ],
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
