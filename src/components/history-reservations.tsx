import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppSelector } from '@/store/hooks';

export default function HistoryReservations() {
  const reservas = useAppSelector((state) => state.reservas.historial);
  const peliculas = useAppSelector((state) => state.peliculas.lista);
  const [codigosQr, setCodigosQr] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    const generarCodigosQr = async () => {
      const resultados = await Promise.all(
        reservas.map(async (reserva) => {
          const contenido = JSON.stringify({
            codigoReserva: reserva.id,
            pelicula: reserva.peliculaId,
            sala: reserva.salaId,
            funcion: reserva.funcion,
            asientos: reserva.asientosSeleccionados.map((asiento) => asiento.id),
            total: reserva.totalPago,
          });

          return [reserva.id, await QRCode.toString(contenido, { type: 'svg', width: 180, margin: 2 })] as const;
        }),
      );

      if (!cancelled) {
        setCodigosQr(Object.fromEntries(resultados));
      }
    };

    void generarCodigosQr();

    return () => {
      cancelled = true;
    };
  }, [reservas]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Historial de Compras</ThemedText>
      <ThemedText type="small" style={styles.subtitle}>
        Consulta el detalle de tus boletos comprados en este dispositivo.
      </ThemedText>

      {reservas.length === 0 ? (
        <ThemedView type="backgroundElement" style={styles.emptyCard}>
          <ThemedText type="small">Aún no tienes compras registradas.</ThemedText>
        </ThemedView>
      ) : (
        <ScrollView style={styles.list}>
          {[...reservas].reverse().map((reserva) => {
            const pelicula = peliculas.find((item) => item.codigo === reserva.peliculaId);

            return (
              <ThemedView key={reserva.id} type="backgroundElement" style={styles.card}>
                <View style={styles.rowBetween}>
                  <ThemedText type="smallBold">{pelicula?.nombre || 'Película no disponible'}</ThemedText>
                  <ThemedText type="smallBold" style={styles.totalText}>
                    ${reserva.totalPago.toFixed(2)}
                  </ThemedText>
                </View>

                <ThemedText type="small">Función: {reserva.funcion}</ThemedText>
                <ThemedText type="small">
                  Asientos: {reserva.asientosSeleccionados.map((asiento) => asiento.id).join(', ')}
                </ThemedText>
                <ThemedText type="small">Código de reserva: {reserva.id}</ThemedText>

                {codigosQr[reserva.id] && (
                  <View style={styles.qrSection}>
                    <ThemedText type="smallBold">Código QR del boleto</ThemedText>
                    <SvgXml
                      xml={codigosQr[reserva.id]}
                      width={180}
                      height={180}
                      accessibilityLabel={`Código QR de la reserva ${reserva.id}`}
                    />
                  </View>
                )}
              </ThemedView>
            );
          })}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  subtitle: {
    opacity: 0.7,
  },
  emptyCard: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  list: {
    maxHeight: 520,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    gap: 8,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    color: '#16a34a',
  },
  qrSection: {
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
});
