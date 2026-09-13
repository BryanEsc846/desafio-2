import * as LocalAuthentication from 'expo-local-authentication';
import { useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import CinemaDashboard from '@/components/cinema-dashboard';
import HistoryReservations from '@/components/history-reservations';
import MovieForm from '@/components/movie-form';
import MovieTable from '@/components/movie-table';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import TicketBooking from '@/components/ticket-booking';

const ADMIN_PIN = '1234';

export default function CinemaHomeScreen() {
  const [activeTab, setActiveTab] = useState<'peliculas' | 'ventas' | 'historial' | 'administrador'>('peliculas');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'peliculas' | 'ventas'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isCheckingBiometric, setIsCheckingBiometric] = useState(false);

  const currentTab = activeTab === 'administrador' ? adminTab : activeTab;

  const tabs = [
    { key: 'peliculas', label: 'Películas' },
    { key: 'ventas', label: 'Ventas' },
    { key: 'historial', label: 'Historial' },
    { key: 'administrador', label: 'Administrador' },
  ] as const;

  const adminTabs = [
    { key: 'dashboard', label: 'Inicio' },
    { key: 'peliculas', label: 'Películas' },
    { key: 'ventas', label: 'Ventas' },
  ] as const;

  const handleAdminUnlock = async () => {
    if (isAdminUnlocked) {
      setActiveTab('administrador');
      return;
    }

    const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

    if (isMobile) {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          setIsCheckingBiometric(true);
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Autentícate para acceder al panel de administrador',
            cancelLabel: 'Cancelar',
            fallbackLabel: 'Usar PIN',
          });
          setIsCheckingBiometric(false);

          if (result.success) {
            setIsAdminUnlocked(true);
            setActiveTab('administrador');
            setIsAdminPinModalOpen(false);
            setPinInput('');
            setPinError('');
            return;
          }
        }
      } catch {
        // Fallback al PIN si la biometría falla o no está disponible.
      }
    }

    setPinError('');
    setPinInput('');
    setIsAdminPinModalOpen(true);
  };

  const handleAdminPinSubmit = () => {
    const sanitized = pinInput.replace(/\D/g, '');

    if (!/^[1234]{4}$/.test(sanitized)) {
      setPinError('El código debe tener 4 dígitos del 1 al 4.');
      return;
    }

    if (sanitized !== ADMIN_PIN) {
      setPinError('Código incorrecto. Inténtalo de nuevo.');
      return;
    }

    setIsAdminUnlocked(true);
    setIsAdminPinModalOpen(false);
    setPinInput('');
    setPinError('');
    setActiveTab('administrador');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedView type="backgroundElement" style={styles.header}>
          <ThemedText type="subtitle" style={styles.brand}>🎬 CineApp</ThemedText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => {
                  if (tab.key === 'administrador') {
                    handleAdminUnlock();
                    return;
                  }

                  setActiveTab(tab.key);
                }}
                style={[styles.tabButton, activeTab === tab.key && styles.tabSelected]}>
                <ThemedText type="smallBold" style={activeTab === tab.key ? styles.tabTextSelected : styles.tabText}>
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {activeTab === 'administrador' && (
            <View style={styles.adminTabs}>
              {adminTabs.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setAdminTab(tab.key)}
                  style={[styles.adminTab, currentTab === tab.key && styles.adminTabSelected]}>
                  <ThemedText type="smallBold" style={currentTab === tab.key ? styles.adminTabTextSelected : styles.adminTabText}>
                    {tab.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {currentTab === 'dashboard' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle">DASHBOARD</ThemedText>
                <TouchableOpacity onPress={() => setActiveTab('ventas')} style={styles.primaryButton}>
                  <ThemedText type="smallBold" style={styles.primaryButtonText}>+ NUEVA VENTA</ThemedText>
                </TouchableOpacity>
              </View>
              <CinemaDashboard />
            </View>
          )}

          {currentTab === 'peliculas' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle">GESTIÓN DE PELÍCULAS</ThemedText>
                {activeTab === 'administrador' && (
                  <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.primaryButton}>
                    <ThemedText type="smallBold" style={styles.primaryButtonText}>+ AGREGAR PELÍCULA</ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              <MovieTable puedeAdministrar={activeTab === 'administrador'} />
            </View>
          )}

          {currentTab === 'ventas' && (
            <View style={styles.section}>
              <ThemedText type="subtitle">VENTA DE ENTRADAS</ThemedText>
              <TicketBooking />
            </View>
          )}

          {activeTab === 'historial' && <HistoryReservations />}
        </ScrollView>

        <Modal visible={isModalOpen} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <ThemedView type="backgroundElement" style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">FORMULARIO PELÍCULA</ThemedText>
                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                  <ThemedText type="smallBold" style={styles.closeText}>✕</ThemedText>
                </TouchableOpacity>
              </View>

              <MovieForm onSuccess={() => setIsModalOpen(false)} />
            </ThemedView>
          </View>
        </Modal>

        <Modal visible={isAdminPinModalOpen} transparent animationType="fade">
          <View style={styles.pinModalOverlay}>
            <ThemedView type="backgroundElement" style={styles.pinModalCard}>
              <ThemedText type="subtitle">Acceso del administrador</ThemedText>

              <ThemedText type="small" style={styles.pinDescription}>
                {Platform.OS === 'android' || Platform.OS === 'ios'
                  ? 'Usa la huella o ingresa el PIN de 4 dígitos (solo 1-4).'
                  : 'Ingresa el código de 4 dígitos (solo 1-4) para continuar.'}
              </ThemedText>

              <TextInput
                value={pinInput}
                onChangeText={(value) => {
                  const cleanValue = value.replace(/[^1-4]/g, '').slice(0, 4);
                  setPinInput(cleanValue);
                  if (pinError) {
                    setPinError('');
                  }
                }}
                placeholder="1234"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                style={styles.pinInput}
              />

              {pinError ? <ThemedText type="small" style={styles.pinError}>{pinError}</ThemedText> : null}

              <View style={styles.pinActions}>
                {Platform.OS === 'android' || Platform.OS === 'ios' ? (
                  <TouchableOpacity onPress={handleAdminUnlock} style={styles.secondaryButton} disabled={isCheckingBiometric}>
                    <ThemedText type="smallBold" style={styles.secondaryButtonText}>
                      {isCheckingBiometric ? 'Verificando...' : 'Usar huella'}
                    </ThemedText>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity onPress={handleAdminPinSubmit} style={styles.primaryButton}>
                  <ThemedText type="smallBold" style={styles.primaryButtonText}>Entrar</ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => {
                setIsAdminPinModalOpen(false);
                setPinInput('');
                setPinError('');
              }} style={styles.cancelButton}>
                <ThemedText type="smallBold" style={styles.cancelButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  brand: {
    marginBottom: 12,
  },
  tabRow: {
    gap: 8,
    paddingBottom: 4,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  tabSelected: {
    backgroundColor: '#dbeafe',
  },
  tabText: {
    color: '#4b5563',
  },
  tabTextSelected: {
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  adminTabs: {
    flexDirection: 'row',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 6,
  },
  adminTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  adminTabSelected: {
    backgroundColor: '#1d4ed8',
  },
  adminTabText: {
    color: '#4b5563',
  },
  adminTabTextSelected: {
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  closeText: {
    color: '#6b7280',
    fontSize: 26,
  },
  pinModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pinModalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    padding: 20,
    gap: 12,
  },
  pinDescription: {
    opacity: 0.8,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 24,
    letterSpacing: 12,
    textAlign: 'center',
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  pinError: {
    color: '#dc2626',
  },
  pinActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#111827',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  cancelButtonText: {
    color: '#6b7280',
  },
});
