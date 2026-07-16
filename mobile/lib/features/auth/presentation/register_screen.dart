import 'dart:async';

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/gradient_button.dart';

/// Écran 2 — Create Account.
class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  bool _acceptedTerms = false;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  // --- Validators ---------------------------------------------------------

  String? _validateName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Le nom complet est requis.';
    }
    return null;
  }

  String? _validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'L\'adresse e-mail est requise.';
    }
    // Regex simple de validation d'e-mail.
    final emailRegex = RegExp(r'^[\w.\-]+@([\w\-]+\.)+[\w\-]{2,}$');
    if (!emailRegex.hasMatch(value.trim())) {
      return 'Adresse e-mail invalide.';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Le mot de passe est requis.';
    }
    if (value.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    return null;
  }

  String? _validateConfirm(String? value) {
    if (value == null || value.isEmpty) {
      return 'Veuillez confirmer le mot de passe.';
    }
    if (value != _passwordController.text) {
      return 'Les mots de passe ne correspondent pas.';
    }
    return null;
  }

  /// Le bouton Sign Up est actif seulement si les champs sont remplis
  /// et la checkbox cochée.
  bool get _canSubmit {
    return _acceptedTerms &&
        _nameController.text.isNotEmpty &&
        _emailController.text.isNotEmpty &&
        _passwordController.text.isNotEmpty &&
        _confirmController.text.isNotEmpty;
  }

  /// Soumission simulée (pas d'API pour l'instant).
  Future<void> _onSubmit() async {
    if (!_formKey.currentState!.validate() || !_acceptedTerms) return;

    setState(() => _isSubmitting = true);
    await Future.delayed(const Duration(seconds: 2)); // simulation réseau
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Compte créé (simulation).')),
    );
  }

  // --- UI -----------------------------------------------------------------

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
                  child: Form(
                    key: _formKey,
                    onChanged: () => setState(() {}), // rafraîchit _canSubmit
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: AppSizes.gapLg),
                        _buildHeader(context),
                        const SizedBox(height: AppSizes.gapLg),
                        AppTextField(
                          label: 'Full Name',
                          icon: LucideIcons.user,
                          hint: 'John Doe',
                          controller: _nameController,
                          validator: _validateName,
                          autofillHints: const [AutofillHints.name],
                        ),
                        const SizedBox(height: AppSizes.gap),
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
                          suffixWidget: _visibilityToggle(
                            isObscured: _obscurePassword,
                            onTap: () => setState(
                                () => _obscurePassword = !_obscurePassword),
                          ),
                        ),
                        const SizedBox(height: AppSizes.gap),
                        AppTextField(
                          label: 'Confirm Password',
                          icon: LucideIcons.shield,
                          hint: '••••••••',
                          controller: _confirmController,
                          obscureText: _obscureConfirm,
                          validator: _validateConfirm,
                          suffixWidget: _visibilityToggle(
                            isObscured: _obscureConfirm,
                            onTap: () => setState(
                                () => _obscureConfirm = !_obscureConfirm),
                          ),
                        ),
                        const SizedBox(height: AppSizes.gap),
                        _buildTermsCheckbox(context),
                        const SizedBox(height: AppSizes.gapLg),
                        GradientButton(
                          text: 'Sign Up',
                          isLoading: _isSubmitting,
                          onPressed: _canSubmit ? _onSubmit : null,
                        ),
                        const SizedBox(height: AppSizes.gapLg),
                        _buildDivider(context),
                        const SizedBox(height: AppSizes.gapLg),
                        _buildSocialButtons(context),
                        const SizedBox(height: AppSizes.gapLg),
                        _buildLoginFooter(context),
                        const SizedBox(height: AppSizes.gapLg),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  /// Bouton toggle de visibilité du mot de passe.
  Widget _visibilityToggle(
      {required bool isObscured, required VoidCallback onTap}) {
    return IconButton(
      icon: Icon(
        isObscured ? LucideIcons.eyeOff : LucideIcons.eye,
        color: AppColors.textSecondary,
        size: 20,
      ),
      onPressed: onTap,
    );
  }

  /// En-tête : icône app + titre + sous-titre.
  Widget _buildHeader(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Icon(LucideIcons.share2, color: Colors.white, size: 28),
        ),
        const SizedBox(height: AppSizes.gap),
        Text('Create Account',
            style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 8),
        Text(
          'Join ChatSphere and start connecting globally.',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      ],
    );
  }

  /// Checkbox d'acceptation des conditions (liens cliquables).
  Widget _buildTermsCheckbox(BuildContext context) {
    final linkStyle = Theme.of(context).textTheme.bodyMedium?.copyWith(
          color: AppColors.primary,
          fontWeight: FontWeight.w600,
          fontSize: 13,
        );
    final baseStyle =
        Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 13);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 24,
          height: 24,
          child: Checkbox(
            value: _acceptedTerms,
            onChanged: (v) => setState(() => _acceptedTerms = v ?? false),
            activeColor: AppColors.primary,
            side: const BorderSide(color: AppColors.border),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(6)),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text.rich(
            TextSpan(
              style: baseStyle,
              children: [
                const TextSpan(text: 'I agree to the '),
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
          ),
        ),
      ],
    );
  }

  /// Séparateur "OR REGISTER WITH".
  Widget _buildDivider(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider(color: AppColors.border)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            'OR REGISTER WITH',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontSize: 11,
                  letterSpacing: 1,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ),
        const Expanded(child: Divider(color: AppColors.border)),
      ],
    );
  }

  /// Boutons sociaux Google + Facebook côte à côte.
  ///
  /// Lucide ne fournit pas de logos de marque : on rend le "G" de Google et
  /// le "f" de Facebook sous forme de glyphes stylisés aux couleurs officielles.
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
            label: 'Facebook',
            brandGlyph: 'f',
            brandColor: const Color(0xFF1877F2),
          ),
        ),
      ],
    );
  }

  Widget _socialButton(
    BuildContext context, {
    required String label,
    required String brandGlyph,
    required Color brandColor,
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
                Text(
                  brandGlyph,
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

  /// Footer : "Already have an account? Log In".
  Widget _buildLoginFooter(BuildContext context) {
    final linkStyle = Theme.of(context).textTheme.bodyMedium?.copyWith(
          color: AppColors.primary,
          fontWeight: FontWeight.w600,
          decoration: TextDecoration.underline,
          decorationColor: AppColors.primary,
        );

    return Center(
      child: Text.rich(
        TextSpan(
          style: Theme.of(context).textTheme.bodyMedium,
          children: [
            const TextSpan(text: 'Already have an account? '),
            TextSpan(
              text: 'Log In',
              style: linkStyle,
              recognizer: TapGestureRecognizer()
                ..onTap = () => context.go(AppRoutes.login),
            ),
          ],
        ),
      ),
    );
  }
}
