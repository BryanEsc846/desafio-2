import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAppSelector } from '@/store/hooks';
import { eliminarPeliculaPersistida } from '@/store/store';
import type { Pelicula } from '@/types/pelicula';

interface MovieTableProps {
  puedeAdministrar?: boolean;
  onEditMovie?: (pelicula: Pelicula) => void;
}

export default function MovieTable({ puedeAdministrar = false, onEditMovie }: MovieTableProps) {
  const theme = useTheme();
  const peliculas = useAppSelector((state) => state.peliculas.lista);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const handleDeleteMovie = (pelicula: Pelicula) => {
    Alert.alert(
      'Eliminar película',
      `¿Deseas eliminar "${pelicula.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarPeliculaPersistida(pelicula.codigo),
        },
      ],
    );
  };

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScrollContainer}>
          <View style={[styles.table, { borderColor: theme.textSecondary }]}>
            <View style={[styles.rowHeader, { backgroundColor: theme.backgroundSelected, borderBottomColor: theme.textSecondary }]}>
              <ThemedText type="smallBold" style={[styles.cell, styles.headerCell]}>Código</ThemedText>
              <ThemedText type="smallBold" style={[styles.cell, styles.headerCell]}>Nombre</ThemedText>
              <ThemedText type="smallBold" style={[styles.cell, styles.headerCell]}>Género</ThemedText>
              <ThemedText type="smallBold" style={[styles.cell, styles.headerCell]}>Duración</ThemedText>
              <ThemedText type="smallBold" style={[styles.cell, styles.headerCell]}>Clasif.</ThemedText>
              <ThemedText type="smallBold" style={[styles.cell, styles.headerCell]}>Sala</ThemedText>
              <ThemedText type="smallBold" style={[styles.cell, styles.headerCell]}>Hora</ThemedText>
              <ThemedText type="smallBold" style={[styles.cell, styles.headerCell]}>Precio</ThemedText>
              <ThemedText type="smallBold" style={[styles.cell, styles.headerCell]}>Estado</ThemedText>
              {puedeAdministrar && <ThemedText type="smallBold" style={[styles.cell, styles.headerCell, styles.actionCell]}>Acciones</ThemedText>}
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
                  <View style={[styles.actionsCell, styles.actionCell, { backgroundColor: theme.backgroundElement, borderLeftColor: theme.textSecondary }]}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.backgroundSelected }, styles.editButton]}
                      onPress={() => onEditMovie?.(pelicula)}
                      accessibilityRole="button"
                    >
                      <ThemedText type="small" style={[styles.actionText, { color: theme.text }]}>✏️</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.backgroundElement }, styles.deleteButton]}
                      onPress={() => handleDeleteMovie(pelicula)}
                      accessibilityRole="button"
                    >
                      <ThemedText type="small" style={[styles.deleteText, { color: theme.textSecondary }]}>🗑️</ThemedText>
                    </TouchableOpacity>
                  </View>
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
  tableScrollContainer: {
    paddingBottom: 4,
  },
  table: {
    minWidth: 1100,
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
    alignItems: 'stretch',
  },
  rowData: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'stretch',
  },
  cell: {
    flex: 1,
    minWidth: 110,
    padding: 10,
    justifyContent: 'center',
    flexShrink: 1,
  },
  headerCell: {
    textAlign: 'center',
  },
  actionCell: {
    minWidth: 150,
    flexBasis: 150,
  },
  actionsCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
    borderLeftWidth: 1,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    opacity: 1,
  },
  deleteButton: {
    opacity: 1,
  },
  actionText: {
    fontWeight: '600',
  },
  deleteText: {
    fontWeight: '600',
  },
});
