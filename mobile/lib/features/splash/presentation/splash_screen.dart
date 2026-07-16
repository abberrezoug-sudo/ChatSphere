import 'dart:async';

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/legacy.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/dashed_border_container.dart';

/// État de synchronisation initiale de l'écran de splash.
///
/// `true` : on affiche le loader "SYNCING ENCRYPTED NODE...".
/// `false` : on affiche le bouton "Get Started".
final isSyncingProvider = StateProvider<bool>((ref) => true);

/// Écran 1 — Splash / Onboarding.
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    // Simule la synchronisation initiale puis affiche le CTA.
    _timer = Timer(const Duration(seconds: 3), () {
      if (mounted) ref.read(isSyncingProvider.notifier).state = false;
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isSyncing = ref.watch(isSyncingProvider);

    return Scaffold(
      body: Container(
        // Fond dégradé sombre plein écran.
        decoration: const BoxDecoration(gradient: AppColors.backgroundGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSizes.hPadding),
            child: Column(
              children: [
                const Spacer(flex: 3),
                _buildLogo(context),
                const SizedBox(height: AppSizes.gapLg),
                // Titre H1.
                Text(
                  'ChatSphere',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 12),
                // Sous-titre gris centré (2 lignes).
                Text(
                  'Secure, fluid, and premium\ncommunication for the modern world.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const Spacer(flex: 3),
                // Bascule loader <-> CTA selon isSyncing.
                _buildStatusArea(context, isSyncing),
                const SizedBox(height: AppSizes.gapLg),
                _buildLegalText(context),
                const SizedBox(height: AppSizes.gap),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Logo : carré arrondi avec glow radial violet derrière.
  Widget _buildLogo(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Glow radial violet derrière le logo.
        Container(
          width: 180,
          height: 180,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [Color(0x556C5CE7), Colors.transparent],
            ),
          ),
        ),
        // Carte du logo : icône bulle de chat + texte "ChatSphere".
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: AppColors.logoSurface,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(LucideIcons.messageCircle,
                  color: AppColors.primary, size: 24),
              const SizedBox(width: 8),
              Text(
                'ChatSphere',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// Zone qui bascule entre le loader et le bouton "Get Started".
  Widget _buildStatusArea(BuildContext context, bool isSyncing) {
    if (isSyncing) {
      return Column(
        children: [
          const SizedBox(
            width: 28,
            height: 28,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
            ),
          ),
          const SizedBox(height: AppSizes.gap),
          Text(
            'SYNCING ENCRYPTED NODE...',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontSize: 11,
                  letterSpacing: 2,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      );
    }

    // Bouton "Get Started" : fond violet plein + bordure pointillée claire.
    return DashedBorderContainer(
      color: Colors.white.withValues(alpha: 0.6),
      child: SizedBox(
        width: double.infinity,
        height: 56,
        child: Material(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(AppSizes.radiusPill),
          child: InkWell(
            borderRadius: BorderRadius.circular(AppSizes.radiusPill),
            onTap: () => context.go(AppRoutes.register),
            child: Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Get Started',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(color: Colors.white),
                  ),
                  const SizedBox(width: 8),
                  const Icon(LucideIcons.arrowRight,
                      color: Colors.white, size: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Texte légal avec liens cliquables violets.
  Widget _buildLegalText(BuildContext context) {
    final linkStyle = Theme.of(context).textTheme.bodyMedium?.copyWith(
          color: AppColors.primary,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        );
    final baseStyle =
        Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 12);

    return Text.rich(
      TextSpan(
        style: baseStyle,
        children: [
          const TextSpan(text: 'By continuing, you agree to our '),
          TextSpan(
            text: 'Terms of Service',
            style: linkStyle,
            recognizer: TapGestureRecognizer()..onTap = () {},
          ),
          const TextSpan(text: ' and '),
          TextSpan(
            text: 'Privacy Policy',
            style: linkStyle,
            recognizer: TapGestureRecognizer()..onTap = () {},
          ),
          const TextSpan(text: '.'),
        ],
      ),
      textAlign: TextAlign.center,
    );
  }
}
