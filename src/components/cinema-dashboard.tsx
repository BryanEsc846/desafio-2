import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppSelector } from '@/store/hooks';

export default function CinemaDashboard() {
  const peliculas = useAppSelector((state) => state.peliculas.lista);
  const reservas = useAppSelector((state) => state.reservas.historial);
  const salas = useAppSelector((state) => state.salas.lista);

  const totalPeliculas = peliculas.length;
  const totalFunciones = reservas.length;
  const totalBoletosVendidos = reservas.reduce((total, reserva) => total + reserva.asientosSeleccionados.length, 0);
  const ingresosGenerados = reservas.reduce((total, reserva) => total + reserva.totalPago, 0);

  const capacidadTotalAsientos = peliculas.reduce((total, pelicula) => {
    const sala = salas.find((salaRegistrada) => salaRegistrada.id === pelicula.salaAsignada);
    return total + (sala?.asientos.length || 0);
  }, 0);

  const codigosPeliculas = new Set(peliculas.map((pelicula) => pelicula.codigo));
  const asientosOcupados = reservas.reduce((total, reserva) => {
    return codigosPeliculas.has(reserva.peliculaId) ? total + reserva.asientosSeleccionados.length : total;
  }, 0);

  const asientosDisponibles = Math.max(capacidadTotalAsientos - asientosOcupados, 0);

  const conteoBoletosPorPelicula: Record<string, number> = {};
  reservas.forEach((reserva) => {
    conteoBoletosPorPelicula[reserva.peliculaId] =
      (conteoBoletosPorPelicula[reserva.peliculaId] || 0) + reserva.asientosSeleccionados.length;
  });

  let peliMasReservadaId = '';
  let maxBoletos = 0;

  Object.entries(conteoBoletosPorPelicula).forEach(([id, cantidad]) => {
    if (cantidad > maxBoletos) {
      maxBoletos = cantidad;
      peliMasReservadaId = id;
    }
  });

  const nombrePeliculaMasReservada =
    peliculas.find((p) => p.codigo === peliMasReservadaId)?.nombre || 'Sin reservas aún';

  const cards = [
    { label: 'Total Películas', value: String(totalPeliculas) },
    { label: 'Total Funciones', value: String(totalFunciones) },
    { label: 'Ingresos Generados', value: `$${ingresosGenerados.toFixed(2)}` },
    { label: 'Boletos Vendidos', value: String(totalBoletosVendidos) },
    { label: 'Asientos Disponibles', value: String(asientosDisponibles) },
    { label: 'Asientos Vendidos', value: String(asientosOcupados) },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>Dashboard General</ThemedText>

      <View style={styles.grid}>
        {cards.map((card) => (
          <ThemedView key={card.label} type="backgroundElement" style={styles.card}>
            <ThemedText type="small" style={styles.label}>
              {card.label}
            </ThemedText>
            <ThemedText type="title" style={styles.value}>
              {card.value}
            </ThemedText>
          </ThemedView>
        ))}
      </View>

      <ThemedView type="backgroundElement" style={styles.featureCard}>
        <ThemedText type="small" style={styles.label}>
          Película más reservada
        </ThemedText>
        <ThemedText type="subtitle" style={styles.featureTitle}>
          {nombrePeliculaMasReservada}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flexBasis: '48%',
    padding: 16,
    borderRadius: 16,
    minHeight: 110,
    justifyContent: 'center',
  },
  label: {
    opacity: 0.7,
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    lineHeight: 32,
  },
  featureCard: {
    padding: 16,
    borderRadius: 16,
  },
  featureTitle: {
    marginTop: 8,
  },
});
