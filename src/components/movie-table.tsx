import { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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

type Filtro = 'Todos' | string;
type FiltroAbierto = 'genero' | 'clasificacion' | 'sala' | 'estado' | null;
interface FiltroOpcion {
  value: string;
  label: string;
}

const GENEROS = ['Acción', 'Comedia', 'Drama', 'Ciencia Ficción', 'Animación'];
const CLASIFICACIONES: FiltroOpcion[] = [
  { value: 'A', label: 'A (Todo público)' },
  { value: 'B', label: 'B (+12 años)' },
  { value: 'C', label: 'C (+18 años)' },
];
const SALAS: FiltroOpcion[] = [
  { value: '1', label: 'Sala 1' },
  { value: '2', label: 'Sala 2' },
  { value: '3', label: 'Sala VIP' },
];
const ESTADOS: FiltroOpcion[] = [
  { value: 'Disponible', label: 'Disponible' },
  { value: 'No disponible', label: 'No disponible' },
];

export default function MovieTable({ puedeAdministrar = false, onEditMovie }: MovieTableProps) {
  const theme = useTheme();
  const peliculas = useAppSelector((state) => state.peliculas.lista);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroGenero, setFiltroGenero] = useState<Filtro>('Todos');
  const [filtroClasificacion, setFiltroClasificacion] = useState<Filtro>('Todos');
  const [filtroSala, setFiltroSala] = useState<Filtro>('Todos');
  const [filtroEstado, setFiltroEstado] = useState<Filtro>('Todos');
  const [filtroAbierto, setFiltroAbierto] = useState<FiltroAbierto>(null);

  const handleDeleteMovie = (pelicula: Pelicula) => {
    const confirmDelete = () => eliminarPeliculaPersistida(pelicula.codigo);

    if (Platform.OS === 'web') {
      const shouldDelete = window.confirm(`¿Deseas eliminar "${pelicula.nombre}"?`);
      if (shouldDelete) {
        confirmDelete();
      }
      return;
    }

    Alert.alert(
      'Eliminar película',
      `¿Deseas eliminar "${pelicula.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ],
    );
  };

  const peliculasFiltradas = useMemo(() => {
    const texto = terminoBusqueda.trim().toLowerCase();
    return peliculas.filter((pelicula) => {
      return (
        (pelicula.nombre.toLowerCase().includes(texto) ||
          pelicula.genero.toLowerCase().includes(texto) ||
          pelicula.clasificacion.toLowerCase().includes(texto) ||
          pelicula.salaAsignada.toLowerCase().includes(texto)) &&
        (filtroGenero === 'Todos' || pelicula.genero === filtroGenero) &&
        (filtroClasificacion === 'Todos' || pelicula.clasificacion === filtroClasificacion) &&
        (filtroSala === 'Todos' || pelicula.salaAsignada === filtroSala) &&
        (filtroEstado === 'Todos' || pelicula.estado === filtroEstado)
      );
    });
  }, [peliculas, terminoBusqueda, filtroGenero, filtroClasificacion, filtroSala, filtroEstado]);

  const generos: FiltroOpcion[] = GENEROS.map((genero) => ({ value: genero, label: genero }));

  const renderFilter = (
    key: Exclude<FiltroAbierto, null>,
    label: string,
    options: FiltroOpcion[],
    selected: Filtro,
    onSelect: (value: Filtro) => void,
  ) => (
    <View style={styles.filterGroup}>
      <ThemedText type="smallBold" style={styles.filterLabel}>{label}</ThemedText>
      <TouchableOpacity
        onPress={() => setFiltroAbierto(filtroAbierto === key ? null : key)}
        style={[styles.filterButton, { backgroundColor: theme.background, borderColor: theme.textSecondary }]}
        accessibilityRole="button"
        accessibilityState={{ expanded: filtroAbierto === key }}
      >
        <ThemedText type="small" style={styles.filterValue}>
          {options.find((option) => option.value === selected)?.label ?? 'Todos'}
        </ThemedText>
        <ThemedText type="small" style={styles.filterChevron}>{filtroAbierto === key ? '⌃' : '⌄'}</ThemedText>
      </TouchableOpacity>

      {filtroAbierto === key && (
        <View style={[styles.dropdownMenu, { backgroundColor: theme.background, borderColor: theme.textSecondary }]}>
          {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => {
              onSelect(option.value);
              setFiltroAbierto(null);
            }}
            style={[
              styles.dropdownOption,
              selected === option.value && styles.selectedOption,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === option.value }}
          >
            <ThemedText
              type="small"
              style={selected === option.value ? [styles.filterButtonSelected, styles.selectedOptionText] : undefined}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Inventario de Películas</ThemedText>

      <TextInput
        value={terminoBusqueda}
        onChangeText={setTerminoBusqueda}
        placeholder="Buscar por nombre, género, clasificación o sala..."
        placeholderTextColor={theme.textSecondary}
        accessibilityLabel="Buscar películas"
        style={[styles.searchInput, { backgroundColor: theme.background, borderColor: theme.textSecondary, color: theme.text }]}
      />

      <View style={styles.filters}>
        {renderFilter('genero', 'Género', [{ value: 'Todos', label: 'Todos' }, ...generos], filtroGenero, setFiltroGenero)}
        {renderFilter('clasificacion', 'Clasificación', [{ value: 'Todos', label: 'Todos' }, ...CLASIFICACIONES], filtroClasificacion, setFiltroClasificacion)}
        {renderFilter('sala', 'Sala', [{ value: 'Todos', label: 'Todas' }, ...SALAS], filtroSala, setFiltroSala)}
        {renderFilter('estado', 'Estado', [{ value: 'Todos', label: 'Todos' }, ...ESTADOS], filtroEstado, setFiltroEstado)}
      </View>

      {peliculasFiltradas.length === 0 ? (
        <ThemedText type="small" style={styles.emptyText}>
          No se encontraron películas que coincidan con la búsqueda.
        </ThemedText>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScrollContainer}>
          <View style={[styles.table, { borderColor: theme.textSecondary }]}>
            <View style={[styles.rowHeader, { backgroundColor: theme.backgroundSelected, borderBottomColor: theme.textSecondary }]}>
              <ThemedText type="smallBold" style={[styles.fixedCell, styles.headerCell]}>Código</ThemedText>
              <ThemedText type="smallBold" style={[styles.fixedCell, styles.headerCell]}>Nombre</ThemedText>
              <ThemedText type="smallBold" style={[styles.fixedCell, styles.headerCell]}>Género</ThemedText>
              <ThemedText type="smallBold" style={[styles.fixedCell, styles.headerCell]}>Duración</ThemedText>
              <ThemedText type="smallBold" style={[styles.fixedCell, styles.headerCell]}>Clasif.</ThemedText>
              <ThemedText type="smallBold" style={[styles.fixedCell, styles.headerCell]}>Sala</ThemedText>
              <ThemedText type="smallBold" style={[styles.fixedCell, styles.headerCell]}>Hora</ThemedText>
              <ThemedText type="smallBold" style={[styles.fixedCell, styles.headerCell]}>Precio</ThemedText>
              <ThemedText type="smallBold" style={[styles.fixedCell, styles.headerCell]}>Estado</ThemedText>
              {puedeAdministrar && <ThemedText type="smallBold" style={[styles.fixedCell, styles.headerCell, styles.actionCell]}>Acciones</ThemedText>}
            </View>

            {peliculasFiltradas.map((pelicula) => (
              <View key={pelicula.codigo} style={[styles.rowData, { backgroundColor: theme.background, borderBottomColor: theme.textSecondary }]}>
                <ThemedText type="small" style={[styles.fixedCell]}>{pelicula.codigo}</ThemedText>
                <ThemedText type="small" style={[styles.fixedCell]}>{pelicula.nombre}</ThemedText>
                <ThemedText type="small" style={[styles.fixedCell]}>{pelicula.genero}</ThemedText>
                <ThemedText type="small" style={[styles.fixedCell]}>{pelicula.duracion} min</ThemedText>
                <ThemedText type="small" style={[styles.fixedCell]}>{pelicula.clasificacion}</ThemedText>
                <ThemedText type="small" style={[styles.fixedCell]}>{pelicula.salaAsignada}</ThemedText>
                <ThemedText type="small" style={[styles.fixedCell]}>{pelicula.hora}</ThemedText>
                <ThemedText type="small" style={[styles.fixedCell]}>${pelicula.precioEntrada.toFixed(2)}</ThemedText>
                <ThemedText type="small" style={[styles.fixedCell]}>{pelicula.estado}</ThemedText>
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
  filters: {
    gap: 10,
  },
  filterGroup: {
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
  },
  filterButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterValue: {
    flex: 1,
  },
  filterChevron: {
    marginLeft: 8,
    fontWeight: '700',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  filterButtonSelected: {
    fontWeight: '700',
  },
  selectedOption: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  selectedOptionText: {
    color: '#000000',
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
  fixedCell: {
    width: 120,
    minWidth: 120,
    maxWidth: 120,
    padding: 10,
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  headerCell: {
    textAlign: 'center',
  },
  actionCell: {
    minWidth: 150,
    width: 150,
    maxWidth: 150,
    flexShrink: 0,
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
