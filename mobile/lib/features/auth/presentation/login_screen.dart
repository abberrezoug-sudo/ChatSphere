import 'dart:async';

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/gradient_button.dart';

/// Écran Login — "Welcome Back".
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String? _validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'L\'adresse e-mail est requise.';
    }
    final emailRegex = RegExp(r'^[\w.\-]+@([\w\-]+\.)+[\w\-]{2,}$');
    if (!emailRegex.hasMatch(value.trim())) return 'Adresse e-mail invalide.';
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'Le mot de passe est requis.';
    return null;
  }

  /// Connexion simulée puis navigation vers l'accueil.
  Future<void> _onSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    setState(() => _isSubmitting = false);
    context.go(AppRoutes.home);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.backgroundGradient),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              return SingleChildScrollView(
                padding:
                    const EdgeInsets.symmetric(horizontal: AppSizes.hPadding),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: constraints.maxHeight),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: AppSizes.gapLg),
                      _buildHeader(context),
                      const SizedBox(height: AppSizes.gapLg),
                      _buildCard(context),
                      const SizedBox(height: AppSizes.gapLg),
                      _buildSignUpFooter(context),
                      const SizedBox(height: AppSizes.gapLg),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  /// En-tête : logo + titre + sous-titre.
  Widget _buildHeader(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.logoSurface,
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Icon(LucideIcons.messageCircle,
              color: AppColors.primary, size: 24),
        ),
        const SizedBox(height: AppSizes.gap),
        Text('Welcome Back',
            style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 8),
        Text(
          'Log in to stay connected with your sphere.',
          textAlign: TextAlign.center,
          style: Theme.of(context)
              .textTheme
              .bodyMedium
              ?.copyWith(color: AppColors.primary),
        ),
      ],
    );
  }

  /// Carte contenant le formulaire.
  Widget _buildCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSizes.gapLg),
      decoration: BoxDecoration(
        color: AppColors.surface.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(AppSizes.radiusCard),
        border: Border.all(color: AppColors.border),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AppTextField(
              label: 'Email Address',
              icon: LucideIcons.mail,
              hint: 'name@company.com',
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              validator: _validateEmail,
              autofillHints: const [AutofillHints.email],
            ),
            const SizedBox(height: AppSizes.gap),
            AppTextField(
              label: 'Password',
              icon: LucideIcons.lock,
              hint: '••••••••',
              controller: _passwordController,
              obscureText: _obscurePassword,
              validator: _validatePassword,
              suffixWidget: IconButton(
                icon: Icon(
                  _obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye,
                  color: AppColors.textSecondary,
                  size: 20,
                ),
                onPressed: () =>
                    setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
            const SizedBox(height: 8),
            // Lien "Forgot Password?" aligné à droite.
            Align(
              alignment: Alignment.centerRight,
              child: GestureDetector(
                onTap: () => context.push(AppRoutes.forgotPassword),
                child: Text(
                  'Forgot Password?',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
            ),
            const SizedBox(height: AppSizes.gap),
            GradientButton(
              text: 'Sign In',
              isLoading: _isSubmitting,
              trailingIcon: LucideIcons.logIn,
              onPressed: _onSubmit,
            ),
            const SizedBox(height: AppSizes.gapLg),
            _buildDivider(context),
            const SizedBox(height: AppSizes.gapLg),
            _buildSocialButtons(context),
          ],
        ),
      ),
    );
  }

  Widget _buildDivider(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider(color: AppColors.border)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            'Or continue with',
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ),
        const Expanded(child: Divider(color: AppColors.border)),
      ],
    );
  }

  Widget _buildSocialButtons(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _socialButton(
            context,
            label: 'Google',
            brandGlyph: 'G',
            brandColor: const Color(0xFF4285F4),
          ),
        ),
        const SizedBox(width: AppSizes.gap),
        Expanded(
          child: _socialButton(
            context,
            label: 'GitHub',
            icon: LucideIcons.gitBranch,
            iconColor: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _socialButton(
    BuildContext context, {
    required String label,
    String? brandGlyph,
    Color? brandColor,
    IconData? icon,
    Color? iconColor,
  }) {
    return SizedBox(
      height: 52,
      child: Material(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSizes.radiusSocial),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppSizes.radiusSocial),
          onTap: () {},
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppSizes.radiusSocial),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null)
                  Icon(icon, color: iconColor, size: 20)
                else
                  Text(
                    brandGlyph!,
                    style: TextStyle(
                      color: brandColor,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                const SizedBox(width: 8),
                Text(label,
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontSize: 14)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Footer : "Don't have an account? Sign Up".
  Widget _buildSignUpFooter(BuildContext context) {
    final linkStyle = Theme.of(context).textTheme.bodyMedium?.copyWith(
          color: AppColors.primary,
          fontWeight: FontWeight.w600,
        );

    return Center(
      child: Text.rich(
        TextSpan(
          style: Theme.of(context).textTheme.bodyMedium,
          children: [
            const TextSpan(text: 'Don\'t have an account? '),
            TextSpan(
              text: 'Sign Up',
              style: linkStyle,
              recognizer: TapGestureRecognizer()
                ..onTap = () => context.go(AppRoutes.register),
            ),
          ],
        ),
      ),
    );
  }
}
