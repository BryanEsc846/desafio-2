import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAppSelector } from '@/store/hooks';

export default function MovieTable({ puedeAdministrar = false }: { puedeAdministrar?: boolean }) {
  const theme = useTheme();
  const peliculas = useAppSelector((state) => state.peliculas.lista);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const peliculasFiltradas = useMemo(() => {
    const texto = terminoBusqueda.toLowerCase();
    return peliculas.filter((pelicula) => {
      return (
        pelicula.nombre.toLowerCase().includes(texto) ||
        pelicula.genero.toLowerCase().includes(texto) ||
        pelicula.clasificacion.toLowerCase().includes(texto) ||
        pelicula.salaAsignada.toLowerCase().includes(texto) ||
        pelicula.hora.toLowerCase().includes(texto)
      );
    });
  }, [peliculas, terminoBusqueda]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Inventario de Películas</ThemedText>

      <TextInput
        value={terminoBusqueda}
        onChangeText={setTerminoBusqueda}
        placeholder="Buscar película, género, horario..."
        placeholderTextColor={theme.textSecondary}
        style={[styles.searchInput, { backgroundColor: theme.background, borderColor: theme.textSecondary, color: theme.text }]}
      />

      {peliculasFiltradas.length === 0 ? (
        <ThemedText type="small" style={styles.emptyText}>
          No se encontraron películas que coincidan con la búsqueda.
        </ThemedText>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.table, { borderColor: theme.textSecondary }]}>
            <View style={[styles.rowHeader, { backgroundColor: theme.backgroundSelected, borderBottomColor: theme.textSecondary }]}>
              <ThemedText type="smallBold" style={styles.cell}>Código</ThemedText>
              <ThemedText type="smallBold" style={styles.cell}>Nombre</ThemedText>
              <ThemedText type="smallBold" style={styles.cell}>Género</ThemedText>
              <ThemedText type="smallBold" style={styles.cell}>Duración</ThemedText>
              <ThemedText type="smallBold" style={styles.cell}>Clasif.</ThemedText>
              <ThemedText type="smallBold" style={styles.cell}>Sala</ThemedText>
              <ThemedText type="smallBold" style={styles.cell}>Hora</ThemedText>
              <ThemedText type="smallBold" style={styles.cell}>Precio</ThemedText>
              <ThemedText type="smallBold" style={styles.cell}>Estado</ThemedText>
              {puedeAdministrar && <ThemedText type="smallBold" style={styles.cell}>Acciones</ThemedText>}
            </View>

            {peliculasFiltradas.map((pelicula) => (
              <View key={pelicula.codigo} style={[styles.rowData, { backgroundColor: theme.background, borderBottomColor: theme.textSecondary }]}>
                <ThemedText type="small" style={styles.cell}>{pelicula.codigo}</ThemedText>
                <ThemedText type="small" style={styles.cell}>{pelicula.nombre}</ThemedText>
                <ThemedText type="small" style={styles.cell}>{pelicula.genero}</ThemedText>
                <ThemedText type="small" style={styles.cell}>{pelicula.duracion} min</ThemedText>
                <ThemedText type="small" style={styles.cell}>{pelicula.clasificacion}</ThemedText>
                <ThemedText type="small" style={styles.cell}>{pelicula.salaAsignada}</ThemedText>
                <ThemedText type="small" style={styles.cell}>{pelicula.hora}</ThemedText>
                <ThemedText type="small" style={styles.cell}>${pelicula.precioEntrada.toFixed(2)}</ThemedText>
                <ThemedText type="small" style={styles.cell}>{pelicula.estado}</ThemedText>
                {puedeAdministrar && (
                  <TouchableOpacity style={styles.actionButton}>
                    <ThemedText type="small" style={styles.actionText}>Editar</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
  },
  table: {
    minWidth: 920,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },
  rowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  rowData: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  cell: {
    minWidth: 90,
    padding: 10,
    flexShrink: 1,
  },
  actionButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
