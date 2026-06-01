import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIGHT_COLORS } from '../constants/theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconWrap}>
              <Ionicons name="bug-outline" size={48} color={LIGHT_COLORS.danger} />
            </View>
            <Text style={styles.title}>حدث خطأ غير متوقع</Text>
            <Text style={styles.subtitle}>Unexpected Error</Text>
            <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
              <Ionicons name="refresh-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT_COLORS.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  iconWrap: { width: 80, height: 80, borderRadius: 20, backgroundColor: LIGHT_COLORS.dangerLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: LIGHT_COLORS.text, marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 14, color: LIGHT_COLORS.textSecondary, marginBottom: 24, textAlign: 'center' },
  button: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: LIGHT_COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
