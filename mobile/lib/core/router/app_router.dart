import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/splash/presentation/splash_screen.dart';

/// Noms/chemins des routes de l'application.
class AppRoutes {
  AppRoutes._();

  static const String splash = '/splash';
  static const String register = '/register';
  static const String login = '/login';
}

/// Configuration go_router de ChatSphere.
///
/// L'application démarre sur l'écran de splash/onboarding.
final GoRouter appRouter = GoRouter(
  initialLocation: AppRoutes.splash,
  routes: [
    GoRoute(
      path: AppRoutes.splash,
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: AppRoutes.register,
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: AppRoutes.login,
      builder: (context, state) => const LoginScreen(),
    ),
  ],
);
