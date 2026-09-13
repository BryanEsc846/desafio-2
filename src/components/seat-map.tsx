import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { actualizarEstadoAsiento } from '@/store/slices/salasSlice';
import type { EstadoAsiento } from '@/types/asiento';

interface Props {
  salaId: string;
  funcion?: string;
}

export default function SeatMap({ salaId, funcion }: Props) {
  const dispatch = useAppDispatch();
  const sala = useAppSelector((state) => state.salas.lista.find((s) => s.id === salaId));
  const reservas = useAppSelector((state) => state.reservas.historial);

  if (!sala) {
    return <ThemedText style={styles.error}>Sala no encontrada.</ThemedText>;
  }

  const handleToggleAsiento = (asientoId: string, estadoActual: EstadoAsiento) => {
    if (estadoActual === 'Ocupado') {
      return;
    }

    const nuevoEstado: EstadoAsiento = estadoActual === 'Disponible' ? 'Reservado' : 'Disponible';

    dispatch(
      actualizarEstadoAsiento({
        salaId: sala.id,
        asientoId,
        nuevoEstado,
      }),
    );
  };

  const filas = ['A', 'B', 'C', 'D', 'E'];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.screenTitle}>
        Pantalla - {sala.nombre}
      </ThemedText>

      <View style={styles.screen}>
        <ThemedText type="small" style={styles.screenLabel}>Pantalla</ThemedText>
      </View>

      <View style={styles.grid}>
        {filas.map((fila) => (
          <View key={fila} style={styles.row}>
            {sala.asientos
              .filter((asiento) => asiento.id.startsWith(fila))
              .map((asiento) => {
                const ocupadoPorReserva = Boolean(
                  funcion &&
                    reservas.some(
                      (res) =>
                        res.salaId === salaId &&
                        res.funcion === funcion &&
                        res.asientosSeleccionados.some((a) => a.id === asiento.id),
                    ),
                );

                const displayEstado: EstadoAsiento = ocupadoPorReserva ? 'Ocupado' : asiento.estado;
                const isReserved = displayEstado === 'Reservado';
                const isOccupied = displayEstado === 'Ocupado';

                return (
                  <Pressable
                    key={asiento.id}
                    onPress={() => handleToggleAsiento(asiento.id, asiento.estado)}
                    disabled={isOccupied}
                    style={({ pressed }) => [
                      styles.seat,
                      isOccupied && styles.seatOccupied,
                      isReserved && styles.seatReserved,
                      !isReserved && !isOccupied && styles.seatAvailable,
                      pressed && !isOccupied && styles.seatPressed,
                    ]}>
                    <ThemedText
                      type="small"
                      style={[
                        styles.seatText,
                        isOccupied && styles.seatTextOccupied,
                        isReserved && styles.seatTextReserved,
                        !isReserved && !isOccupied && styles.seatTextAvailable,
                      ]}>
                      {asiento.id}
                    </ThemedText>
                  </Pressable>
                );
              })}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.availableLegend]} />
          <ThemedText type="small">Disponible</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.reservedLegend]} />
          <ThemedText type="small">Seleccionado</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.occupiedLegend]} />
          <ThemedText type="small">Ocupado</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 18,
    gap: 16,
  },
  error: {
    color: '#dc2626',
    fontWeight: '700',
  },
  screenTitle: {
    textAlign: 'center',
  },
  screen: {
    width: '80%',
    height: 28,
    alignSelf: 'center',
    backgroundColor: '#d1d5db',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#9ca3af',
    marginBottom: 20,
  },
  screenLabel: {
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    width: 290,
    alignSelf: 'center',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seat: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  seatAvailable: {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
  },
  seatReserved: {
    backgroundColor: '#facc15',
    borderColor: '#eab308',
  },
  seatOccupied: {
    backgroundColor: '#ef4444',
    borderColor: '#b91c1c',
  },
  seatPressed: {
    opacity: 0.8,
  },
  seatText: {
    fontWeight: '700',
    color: '#111827',
  },
  seatTextAvailable: {
    color: '#111827',
  },
  seatTextReserved: {
    color: '#4b2e00',
  },
  seatTextOccupied: {
    color: '#ffffff',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
  },
  availableLegend: {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
  },
  reservedLegend: {
    backgroundColor: '#facc15',
    borderColor: '#eab308',
  },
  occupiedLegend: {
    backgroundColor: '#ef4444',
    borderColor: '#b91c1c',
  },
});
