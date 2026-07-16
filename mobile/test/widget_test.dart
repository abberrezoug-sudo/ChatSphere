// Test de fumée basique : l'application démarre sur l'écran de splash.
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:chatsphere/main.dart';

void main() {
  testWidgets('L\'application démarre et affiche l\'onboarding',
      (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: ChatSphereApp()));
    await tester.pump();

    // Le titre "ChatSphere" doit être visible sur l'écran de splash.
    expect(find.text('ChatSphere'), findsWidgets);
  });
}
