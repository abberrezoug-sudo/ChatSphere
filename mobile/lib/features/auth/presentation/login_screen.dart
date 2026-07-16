import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';

/// Écran /login — placeholder pour l'instant (UI complète à venir).
class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.backgroundGradient),
        child: Center(
          child: Text(
            'Login (à venir)',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
        ),
      ),
    );
  }
}
