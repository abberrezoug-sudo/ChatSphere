import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Conteneur à bordure pointillée réutilisable.
///
/// Utilisé pour reproduire la bordure "dashed" du bouton "Get Started"
/// de l'écran d'onboarding. Enveloppe [child] dans une bordure pointillée
/// aux coins arrondis.
class DashedBorderContainer extends StatelessWidget {
  const DashedBorderContainer({
    super.key,
    required this.child,
    this.radius = AppSizes.radiusPill,
    this.color = Colors.white,
    this.dashPattern = const [6, 4],
    this.strokeWidth = 1.4,
    this.padding = const EdgeInsets.all(4),
  });

  final Widget child;
  final double radius;
  final Color color;
  final List<double> dashPattern;
  final double strokeWidth;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return DottedBorder(
      options: RoundedRectDottedBorderOptions(
        radius: Radius.circular(radius),
        color: color,
        strokeWidth: strokeWidth,
        dashPattern: dashPattern,
        padding: padding,
      ),
      child: child,
    );
  }
}
