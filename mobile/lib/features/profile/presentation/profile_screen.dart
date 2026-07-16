import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_bottom_nav.dart';
import '../../../core/widgets/gradient_button.dart';

/// Écran Profile.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  static const _stats = [
    ('1.2k', 'Friends'),
    ('84', 'Rooms'),
    ('429', 'Media'),
  ];

  static const _mediaColors = [
    Color(0xFF6C5CE7),
    Color(0xFF06B6D4),
    Color(0xFFEC4899),
    Color(0xFF8B5CF6),
    Color(0xFFF59E0B),
    Color(0xFF22C55E),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: const AppBottomNav(current: AppTab.profile),
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.backgroundGradient),
        child: SafeArea(
          bottom: false,
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: AppSizes.hPadding, vertical: AppSizes.gap),
                child: _buildAppBar(context),
              ),
              _buildBanner(context),
              const SizedBox(height: 44),
              _buildIdentity(context),
              const SizedBox(height: AppSizes.gapLg),
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: AppSizes.hPadding),
                child: _buildActions(context),
              ),
              const SizedBox(height: AppSizes.gapLg),
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: AppSizes.hPadding),
                child: _buildStats(context),
              ),
              const SizedBox(height: AppSizes.gapLg),
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: AppSizes.hPadding),
                child: _buildSharedMedia(context),
              ),
              const SizedBox(height: AppSizes.gapLg),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return Row(
      children: [
        const CircleAvatar(
          radius: 18,
          backgroundColor: AppColors.primary,
          child: Icon(LucideIcons.user, color: Colors.white, size: 18),
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

  /// Bannière + avatar en superposition.
  Widget _buildBanner(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      alignment: Alignment.center,
      children: [
        Container(
          height: 120,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF1E1B4B), Color(0xFF0E7490)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        Positioned(
          bottom: -44,
          child: Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: AppColors.bgBottom,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                gradient: AppColors.ctaGradient,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(LucideIcons.user, color: Colors.white, size: 40),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildIdentity(BuildContext context) {
    return Column(
      children: [
        Text('Alex Rivera',
            style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 4),
        Text('Exploring the Aether',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                )),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSizes.hPadding),
          child: Text(
            'UI/UX enthusiast, lover of dark mode, and a frequent traveler in the digital sphere.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
      ],
    );
  }

  Widget _buildActions(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: GradientButton(
            text: 'Edit Profile',
            trailingIcon: LucideIcons.pencil,
            height: 52,
            onPressed: () {},
          ),
        ),
        const SizedBox(width: AppSizes.gap),
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(AppSizes.radiusCard),
            border: Border.all(color: AppColors.border),
          ),
          child: const Icon(LucideIcons.settings,
              color: AppColors.textPrimary, size: 22),
        ),
      ],
    );
  }

  Widget _buildStats(BuildContext context) {
    return Row(
      children: _stats
          .map((s) => Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(AppSizes.radiusCard),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: [
                      Text(s.$1,
                          style: Theme.of(context)
                              .textTheme
                              .titleMedium
                              ?.copyWith(fontSize: 18)),
                      const SizedBox(height: 4),
                      Text(s.$2, style: Theme.of(context).textTheme.bodyMedium),
                    ],
                  ),
                ),
              ))
          .toList(),
    );
  }

  Widget _buildSharedMedia(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Shared Media',
                style: Theme.of(context).textTheme.titleMedium),
            Text('See all',
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    )),
          ],
        ),
        const SizedBox(height: AppSizes.gap),
        GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
          children: _mediaColors
              .map((c) => Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [c, c.withValues(alpha: 0.5)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(LucideIcons.image,
                        color: Colors.white24, size: 28),
                  ))
              .toList(),
        ),
      ],
    );
  }
}
