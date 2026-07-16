import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_bottom_nav.dart';

/// Ami en ligne (données factices).
class _Friend {
  const _Friend(this.name, this.color);
  final String name;
  final Color color;
}

/// Carte d'activité récente (données factices).
class _Activity {
  const _Activity(this.title, this.subtitle, this.time, this.tags, this.color);
  final String title;
  final String subtitle;
  final String time;
  final List<String> tags;
  final Color color;
}

/// Conversation favorite (données factices).
class _Chat {
  const _Chat(this.name, this.message, this.time, this.color, this.unread);
  final String name;
  final String message;
  final String time;
  final Color color;
  final int unread;
}

/// Écran Home — liste des conversations.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  static const _friends = [
    _Friend('Sarah', Color(0xFFEC4899)),
    _Friend('Alex', Color(0xFF8B5CF6)),
    _Friend('Jordyn', Color(0xFF06B6D4)),
    _Friend('Marcus', Color(0xFFF59E0B)),
  ];

  static const _activities = [
    _Activity('Product Launch 2024', 'David: The final assets are ready t...',
        '2m ago', ['Urgent', 'Project A'], AppColors.primary),
    _Activity('Design Team', 'Elena: Check the new mockups', '10m ago',
        ['Design'], AppColors.surface),
  ];

  static const _chats = [
    _Chat('Sarah Miller', 'Hey, did you see the updat...', '10:45 AM',
        Color(0xFFEC4899), 2),
    _Chat('Alex Thompson', 'The shader is looking incredib...', '09:12 AM',
        Color(0xFF8B5CF6), 0),
    _Chat('Jordyn Lee', 'Let\'s lock in the 8px grid.', 'Yesterday',
        Color(0xFF06B6D4), 5),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: const AppBottomNav(current: AppTab.home),
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.backgroundGradient),
        child: SafeArea(
          bottom: false,
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: AppSizes.hPadding),
            children: [
              const SizedBox(height: AppSizes.gap),
              _buildAppBar(context),
              const SizedBox(height: AppSizes.gap),
              _buildSearchBar(context),
              const SizedBox(height: AppSizes.gapLg),
              _buildSectionHeader(context, 'Online Friends', 'View All'),
              const SizedBox(height: AppSizes.gap),
              _buildFriends(context),
              const SizedBox(height: AppSizes.gapLg),
              Text('Recent Activity',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: AppSizes.gap),
              _buildActivities(context),
              const SizedBox(height: AppSizes.gapLg),
              _buildSectionHeader(context, 'Favorite Chats', '•••'),
              const SizedBox(height: AppSizes.gap),
              ..._chats.map((c) => _buildChatTile(context, c)),
              const SizedBox(height: AppSizes.gap),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return Row(
      children: [
        GestureDetector(
          onTap: () => context.go(AppRoutes.profile),
          child: const CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.primary,
            child: Icon(LucideIcons.user, color: Colors.white, size: 18),
          ),
        ),
        const SizedBox(width: 12),
        Text('ChatSphere',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(color: AppColors.primary, fontSize: 18)),
        const Spacer(),
        const Icon(LucideIcons.bell, color: AppColors.textPrimary, size: 22),
      ],
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSizes.radiusCard),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          const Icon(LucideIcons.search, color: AppColors.textSecondary, size: 20),
          const SizedBox(width: 12),
          Text('Search conversations...',
              style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title, String action) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        Text(action,
            style: Theme.of(context)
                .textTheme
                .labelLarge
                ?.copyWith(color: AppColors.primary, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildFriends(BuildContext context) {
    return SizedBox(
      height: 84,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _friends.length,
        separatorBuilder: (_, _) => const SizedBox(width: AppSizes.gap),
        itemBuilder: (context, i) {
          final f = _friends[i];
          return Column(
            children: [
              Stack(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: f.color,
                    child: Text(f.name[0],
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                  // Pastille "en ligne".
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: AppColors.success,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.bgTop, width: 2),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(f.name,
                  style: Theme.of(context)
                      .textTheme
                      .labelLarge
                      ?.copyWith(color: AppColors.textPrimary, fontSize: 12)),
            ],
          );
        },
      ),
    );
  }

  Widget _buildActivities(BuildContext context) {
    return SizedBox(
      height: 130,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _activities.length,
        separatorBuilder: (_, _) => const SizedBox(width: AppSizes.gap),
        itemBuilder: (context, i) {
          final a = _activities[i];
          final bool highlighted = a.color == AppColors.primary;
          return Container(
            width: 240,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: a.color,
              borderRadius: BorderRadius.circular(AppSizes.radiusCard),
              border: highlighted ? null : Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Icon(
                      highlighted ? LucideIcons.zap : LucideIcons.rocket,
                      color: Colors.white,
                      size: 18,
                    ),
                    Text(a.time,
                        style: Theme.of(context)
                            .textTheme
                            .labelLarge
                            ?.copyWith(color: Colors.white70, fontSize: 11)),
                  ],
                ),
                const Spacer(),
                Text(a.title,
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(color: Colors.white, fontSize: 15)),
                const SizedBox(height: 4),
                Text(a.subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: Colors.white70, fontSize: 12)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  children: a.tags
                      .map((t) => Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(t,
                                style: const TextStyle(
                                    color: Colors.white, fontSize: 10)),
                          ))
                      .toList(),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildChatTile(BuildContext context, _Chat c) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSizes.gap),
      child: Material(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSizes.radiusCard),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppSizes.radiusCard),
          onTap: () => context.go(AppRoutes.chat),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppSizes.radiusCard),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 22,
                  backgroundColor: c.color,
                  child: Text(c.name[0],
                      style: const TextStyle(
                          color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(c.name,
                          style: Theme.of(context)
                              .textTheme
                              .titleMedium
                              ?.copyWith(fontSize: 15)),
                      const SizedBox(height: 4),
                      Text(c.message,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodyMedium),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(c.time,
                        style: Theme.of(context)
                            .textTheme
                            .labelLarge
                            ?.copyWith(fontSize: 11)),
                    const SizedBox(height: 6),
                    if (c.unread > 0)
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: Text('${c.unread}',
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold)),
                      )
                    else
                      const SizedBox(height: 12),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
