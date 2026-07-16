import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

void main() {
  // ProviderScope : racine du state management Riverpod.
  runApp(const ProviderScope(child: ChatSphereApp()));
}

/// Racine de l'application ChatSphere : branche le thème et le router.
class ChatSphereApp extends StatelessWidget {
  const ChatSphereApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'ChatSphere',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark,
      routerConfig: appRouter,
    );
  }
}
