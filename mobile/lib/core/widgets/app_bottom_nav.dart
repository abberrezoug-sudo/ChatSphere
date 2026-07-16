import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../router/app_router.dart';
import '../theme/app_theme.dart';

/// Onglets de la barre de navigation inférieure.
enum AppTab { home, chats, rooms, profile }

/// Barre de navigation inférieure réutilisable (Home / Chats / Rooms / Profile).
class AppBottomNav extends StatelessWidget {
  const AppBottomNav({super.key, required this.current});

  /// Onglet actuellement sélectionné (mis en évidence).
  final AppTab current;

  void _onTap(BuildContext context, AppTab tab) {
    if (tab == current) return;
    switch (tab) {
      case AppTab.home:
        context.go(AppRoutes.home);
      case AppTab.chats:
        context.go(AppRoutes.chat);
      case AppTab.rooms:
        // Placeholder : les rooms ne sont pas encore implémentées.
        break;
      case AppTab.profile:
        context.go(AppRoutes.profile);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _item(context, AppTab.home, LucideIcons.home, 'Home'),
              _item(context, AppTab.chats, LucideIcons.messageSquare, 'Chats'),
              _item(context, AppTab.rooms, LucideIcons.users, 'Rooms'),
              _item(context, AppTab.profile, LucideIcons.user, 'Profile'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _item(BuildContext context, AppTab tab, IconData icon, String label) {
    final bool selected = tab == current;
    final Color color = selected ? Colors.white : AppColors.textSecondary;

    return Expanded(
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSizes.radiusCard),
        onTap: () => _onTap(context, tab),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: selected ? AppColors.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(AppSizes.radiusCard),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 4),
              Text(
                label,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: color,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
