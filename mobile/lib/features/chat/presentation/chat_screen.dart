import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/theme/app_theme.dart';

/// Message d'une conversation (données factices).
class _Message {
  const _Message(this.text, this.time, this.isMe);
  final String text;
  final String time;
  final bool isMe;
}

/// Écran Chat / DM.
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();

  final List<_Message> _messages = [
    const _Message(
        'Hey! Did you see the latest designs for the ChatSphere update? '
        'The glassmorphism effects look incredible.',
        '10:42 AM',
        false),
    const _Message(
        'I just checked them! The new navigation flow is so much smoother. '
        'I love the indigo accents.',
        '10:45 AM',
        true),
    const _Message(
        'Exactly. We should definitely implement the animated shader '
        'backgrounds for the messaging area. It adds that premium "pro-tool" '
        'feel we\'re aiming for. What do you think about the 8px grid system?',
        '10:47 AM',
        false),
    const _Message('Agreed. Let\'s lock it in.', '10:48 AM', true),
  ];

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add(_Message(text, 'Now', true));
      _controller.clear();
    });
    // Fait défiler vers le dernier message.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgTop,
      appBar: _buildAppBar(context),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              controller: _scrollController,
              padding: const EdgeInsets.all(AppSizes.gap),
              children: [
                Center(
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text('TODAY',
                        style: Theme.of(context)
                            .textTheme
                            .labelLarge
                            ?.copyWith(fontSize: 10, letterSpacing: 1)),
                  ),
                ),
                const SizedBox(height: AppSizes.gap),
                ..._messages.map((m) => _buildBubble(context, m)),
              ],
            ),
          ),
          _buildInputBar(context),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.surface,
      elevation: 0,
      leadingWidth: 40,
      leading: IconButton(
        icon: const Icon(LucideIcons.arrowLeft, color: Colors.white, size: 20),
        onPressed: () => context.pop(),
      ),
      title: Row(
        children: [
          Stack(
            children: [
              const CircleAvatar(
                radius: 18,
                backgroundColor: Color(0xFF8B5CF6),
                child: Icon(LucideIcons.user, color: Colors.white, size: 18),
              ),
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: AppColors.success,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.surface, width: 2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Alex Rivera',
                  style: Theme.of(context)
                      .textTheme
                      .titleMedium
                      ?.copyWith(fontSize: 15)),
              Text('ONLINE NOW',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: AppColors.success,
                        fontSize: 10,
                        letterSpacing: 0.5,
                      )),
            ],
          ),
        ],
      ),
      actions: const [
        Icon(LucideIcons.video, color: AppColors.textSecondary, size: 20),
        SizedBox(width: 16),
        Icon(LucideIcons.phone, color: AppColors.textSecondary, size: 20),
        SizedBox(width: 16),
        Icon(LucideIcons.moreVertical, color: AppColors.textSecondary, size: 20),
        SizedBox(width: 12),
      ],
    );
  }

  Widget _buildBubble(BuildContext context, _Message m) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSizes.gap),
      child: Column(
        crossAxisAlignment:
            m.isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Container(
            constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.72),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: m.isMe ? AppColors.primary : AppColors.surface,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(AppSizes.radiusCard),
                topRight: const Radius.circular(AppSizes.radiusCard),
                bottomLeft: Radius.circular(m.isMe ? AppSizes.radiusCard : 4),
                bottomRight: Radius.circular(m.isMe ? 4 : AppSizes.radiusCard),
              ),
            ),
            child: Text(
              m.text,
              style: const TextStyle(color: Colors.white, fontSize: 14),
            ),
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(m.time,
                  style: Theme.of(context)
                      .textTheme
                      .labelLarge
                      ?.copyWith(fontSize: 10)),
              if (m.isMe) ...[
                const SizedBox(width: 4),
                const Icon(LucideIcons.checkCheck,
                    color: AppColors.primary, size: 14),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInputBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            const Icon(LucideIcons.smile,
                color: AppColors.textSecondary, size: 22),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _controller,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                cursorColor: AppColors.primary,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _sendMessage(),
                decoration: InputDecoration(
                  hintText: 'Type a message...',
                  hintStyle: Theme.of(context).textTheme.bodyMedium,
                  filled: true,
                  fillColor: AppColors.bgTop,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppSizes.radiusPill),
                    borderSide: const BorderSide(color: AppColors.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppSizes.radiusPill),
                    borderSide: const BorderSide(color: AppColors.border),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppSizes.radiusPill),
                    borderSide: const BorderSide(color: AppColors.primary),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            const Icon(LucideIcons.paperclip,
                color: AppColors.textSecondary, size: 20),
            const SizedBox(width: 12),
            GestureDetector(
              onTap: _sendMessage,
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: const BoxDecoration(
                  gradient: AppColors.ctaGradient,
                  shape: BoxShape.circle,
                ),
                child: const Icon(LucideIcons.send, color: Colors.white, size: 18),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
