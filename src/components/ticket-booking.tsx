import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import SeatMap from '@/components/seat-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { agregarReserva } from '@/store/slices/reservasSlice';
import { limpiarAsientosReservados } from '@/store/slices/salasSlice';

const generarIdReserva = () => `RES-${Date.now()}`;

export default function TicketBooking() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const peliculas = useAppSelector((state) => state.peliculas.lista);
  const salas = useAppSelector((state) => state.salas.lista);
  const reservas = useAppSelector((state) => state.reservas.historial);

  const peliculasDisponibles = peliculas.filter((p) => p.estado === 'Disponible');

  const [peliculaNombre, setPeliculaNombre] = useState('');
  const [funcion, setFuncion] = useState('');
  const [salaId, setSalaId] = useState('');
  const [isPeliculaOpen, setIsPeliculaOpen] = useState(false);
  const [isFuncionOpen, setIsFuncionOpen] = useState(false);

  const nombresPeliculasUnicas = useMemo(
    () => Array.from(new Set(peliculasDisponibles.map((p) => p.nombre))),
    [peliculasDisponibles],
  );

  const registrosPorNombre = peliculaNombre
    ? peliculasDisponibles.filter((p) => p.nombre === peliculaNombre)
    : [];

  const horasDisponibles = Array.from(new Set(registrosPorNombre.map((p) => p.hora)));
  const salasDisponibles = funcion
    ? Array.from(new Set(registrosPorNombre.filter((p) => p.hora === funcion).map((p) => p.salaAsignada)))
    : [];

  const peliculaSeleccionada = peliculasDisponibles.find(
    (p) => p.nombre === peliculaNombre && p.hora === funcion && p.salaAsignada === salaId,
  );

  const salaSeleccionada = salas.find((s) => s.id === salaId);
  const asientosSeleccionados =
    salaSeleccionada?.asientos.filter((asiento) => asiento.estado === 'Reservado') ?? [];
  const totalAPagar = asientosSeleccionados.length * (peliculaSeleccionada?.precioEntrada || 0);

  const handlePeliculaChange = (value: string) => {
    setPeliculaNombre(value);
    setFuncion('');
    setSalaId('');

    const registros = peliculasDisponibles.filter((p) => p.nombre === value);
    const horas = Array.from(new Set(registros.map((p) => p.hora)));
    if (horas.length === 1) {
      setFuncion(horas[0]);
      const sala = Array.from(new Set(registros.filter((p) => p.hora === horas[0]).map((p) => p.salaAsignada)));
      if (sala.length === 1) {
        setSalaId(sala[0]);
      }
    }
  };

  const handleFuncionChange = (value: string) => {
    setFuncion(value);
    setSalaId('');

    const registrosHora = registrosPorNombre.filter((p) => p.hora === value);
    const salasHora = Array.from(new Set(registrosHora.map((p) => p.salaAsignada)));
    if (salasHora.length === 1) {
      setSalaId(salasHora[0]);
    }
  };

  const handleConfirmarReserva = () => {
    if (!peliculaSeleccionada || !funcion || !salaSeleccionada || asientosSeleccionados.length === 0) {
      Alert.alert('Completa los campos', 'Selecciona una película, hora, sala y al menos un asiento.');
      return;
    }

    const conflicto = reservas.some(
      (reserva) =>
        reserva.salaId === salaSeleccionada.id &&
        reserva.funcion === funcion &&
        reserva.peliculaId !== peliculaSeleccionada.codigo,
    );

    if (conflicto) {
      Alert.alert('Conflicto de horario', 'No se puede reservar otra película en esta sala a la misma hora.');
      return;
    }

    const nuevaReserva = {
      id: generarIdReserva(),
      peliculaId: peliculaSeleccionada.codigo,
      salaId: salaSeleccionada.id,
      funcion,
      asientosSeleccionados,
      totalPago: totalAPagar,
    };

    dispatch(agregarReserva(nuevaReserva));
    dispatch(limpiarAsientosReservados(salaSeleccionada.id));

    Alert.alert('Reserva confirmada', `Total pagado: $${totalAPagar.toFixed(2)}`);
    setPeliculaNombre('');
    setSalaId('');
    setFuncion('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="subtitle">Venta de Entradas</ThemedText>

      <View style={styles.row}>
        <View style={styles.field}>
          <ThemedText type="smallBold">1. Película</ThemedText>
          <TouchableOpacity
            onPress={() => setIsPeliculaOpen((value) => !value)}
            style={[styles.selectBox, { backgroundColor: theme.backgroundElement, borderColor: theme.textSecondary }]}>
            <ThemedText type="small" style={[styles.selectText, { color: theme.text }]}>
              {peliculaNombre || 'Elige una película'}
            </ThemedText>
          </TouchableOpacity>

          {isPeliculaOpen && (
            <View style={[styles.optionsList, { backgroundColor: theme.background, borderColor: theme.textSecondary }]}>
              {nombresPeliculasUnicas.length === 0 ? (
                <ThemedText type="small" style={styles.emptyOption}>Sin películas disponibles</ThemedText>
              ) : (
                nombresPeliculasUnicas.map((nombre) => (
                  <TouchableOpacity
                    key={nombre}
                    onPress={() => {
                      handlePeliculaChange(nombre);
                      setIsPeliculaOpen(false);
                    }}
                    style={[
                      styles.optionButton,
                      { backgroundColor: theme.background, borderColor: theme.textSecondary },
                      peliculaNombre === nombre && styles.selectedOption,
                    ]}>
                    <ThemedText type="small" style={peliculaNombre === nombre ? styles.selectedOptionText : undefined}>{nombre}</ThemedText>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold">2. Función</ThemedText>
          <TouchableOpacity
            onPress={() => peliculaNombre && setIsFuncionOpen((value) => !value)}
            disabled={!peliculaNombre}
            style={[
              styles.selectBox,
              { backgroundColor: theme.backgroundElement, borderColor: theme.textSecondary },
              !peliculaNombre && styles.selectBoxDisabled,
            ]}>
            <ThemedText type="small" style={[styles.selectText, { color: theme.text }]}>
              {funcion || 'Elige una hora'}
            </ThemedText>
          </TouchableOpacity>

          {isFuncionOpen && peliculaNombre && (
            <View style={[styles.optionsList, { backgroundColor: theme.background, borderColor: theme.textSecondary }]}>
              {horasDisponibles.length === 0 ? (
                <ThemedText type="small" style={styles.emptyOption}>Sin horarios disponibles</ThemedText>
              ) : (
                horasDisponibles.map((hora) => (
                  <TouchableOpacity
                    key={hora}
                    onPress={() => {
                      handleFuncionChange(hora);
                      setIsFuncionOpen(false);
                    }}
                    style={[
                      styles.optionButton,
                      { backgroundColor: theme.background, borderColor: theme.textSecondary },
                      funcion === hora && styles.selectedOption,
                    ]}
                    disabled={!peliculaNombre}>
                    <ThemedText type="small" style={funcion === hora ? styles.selectedOptionText : undefined}>{hora}</ThemedText>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.field}>
          <ThemedText type="smallBold">3. Sala</ThemedText>
          <View style={[styles.selectBox, { backgroundColor: theme.backgroundElement, borderColor: theme.textSecondary }]}>
            <ThemedText type="small" style={[styles.selectText, { color: theme.text }]}>
              {salaId ? salas.find((s) => s.id === salaId)?.nombre : 'Elige una sala'}
            </ThemedText>
          </View>
          {salasDisponibles.map((id) => (
            <TouchableOpacity
              key={id}
              onPress={() => setSalaId(id)}
              style={[
                styles.optionButton,
                { backgroundColor: theme.background, borderColor: theme.textSecondary },
                salaId === id && styles.selectedOption,
              ]}>
              <ThemedText type="small" style={salaId === id ? styles.selectedOptionText : undefined}>{salas.find((s) => s.id === id)?.nombre}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {peliculaSeleccionada && funcion && salaSeleccionada && (
        <View style={styles.bookingLayout}>
          <SeatMap salaId={salaSeleccionada.id} funcion={funcion} />

          <ThemedView type="backgroundElement" style={styles.summary}>
            <ThemedText type="smallBold">Resumen de Compra</ThemedText>
            <ThemedText type="small">Película: {peliculaSeleccionada.nombre}</ThemedText>
            <ThemedText type="small">Función: {funcion}</ThemedText>
            <ThemedText type="small">Sala: {salaSeleccionada.nombre}</ThemedText>
            <ThemedText type="small">Precio unitario: ${peliculaSeleccionada.precioEntrada.toFixed(2)}</ThemedText>
            <ThemedText type="small">
              Asientos: {asientosSeleccionados.length > 0 ? asientosSeleccionados.map((a) => a.id).join(', ') : 'Ninguno'}
            </ThemedText>

            <ThemedText type="title" style={styles.totalText}>
              ${totalAPagar.toFixed(2)}
            </ThemedText>

            <TouchableOpacity onPress={handleConfirmarReserva} style={styles.confirmButton}>
              <ThemedText type="smallBold" style={styles.confirmText}>
                Confirmar Reserva
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  row: {
    gap: 12,
  },
  field: {
    gap: 8,
  },
  selectBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectBoxDisabled: {
    opacity: 0.5,
  },
  selectText: {
    color: '#374151',
  },
  optionsList: {
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  emptyOption: {
    color: '#6b7280',
    paddingVertical: 4,
  },
  optionButtonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#60a5fa',
  },
  selectedOption: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  selectedOptionText: {
    color: '#000000',
  },
  bookingLayout: {
    gap: 16,
  },
  summary: {
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  totalText: {
    fontSize: 30,
    lineHeight: 34,
    color: '#16a34a',
    marginTop: 8,
  },
  confirmButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmText: {
    color: '#ffffff',
  },
});
