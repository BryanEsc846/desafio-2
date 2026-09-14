import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { agregarPelicula, editarPelicula } from '@/store/slices/peliculasSlice';
import type { EstadoPelicula, Pelicula } from '@/types/pelicula';

interface MovieFormProps {
  onSuccess?: () => void;
  initialData?: Pelicula | null;
}

const emptyFormData: Pelicula = {
  codigo: '',
  nombre: '',
  genero: '',
  duracion: 0,
  clasificacion: '',
  salaAsignada: '',
  hora: '',
  precioEntrada: 0,
  estado: 'Disponible',
};

export default function MovieForm({ onSuccess, initialData }: MovieFormProps) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const peliculas = useAppSelector((state) => state.peliculas.lista);

  const [formData, setFormData] = useState<Pelicula>(emptyFormData);
  const [error, setError] = useState<string>('');
  const isEditing = Boolean(initialData);

  useEffect(() => {
    setFormData(initialData ?? emptyFormData);
    setError('');
  }, [initialData]);

  const salas = [
    { value: '1', label: 'Sala 1' },
    { value: '2', label: 'Sala 2' },
    { value: '3', label: 'Sala VIP' },
  ];

  const horarios = ['10:00', '12:00', '13:30', '14:00', '16:30', '19:00', '21:30'];
  const estados: EstadoPelicula[] = ['Disponible', 'No disponible'];
  const generos = ['Acción', 'Comedia', 'Drama', 'Ciencia Ficción', 'Animación'];
  const clasificaciones = [
    { value: 'A', label: 'A (Todo público)' },
    { value: 'B', label: 'B (+12 años)' },
    { value: 'C', label: 'C (+18 años)' },
  ];

  const handleChange = (field: keyof Pelicula, value: string) => {
    const nextValue = field === 'duracion' || field === 'precioEntrada' ? Number(value || 0) : value;
    setFormData((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleSubmit = () => {
    setError('');

    const codigoNormalizado = formData.codigo.trim();

    if (!codigoNormalizado) {
      setError('Error: El código de la película es obligatorio.');
      return;
    }

    if (!formData.nombre.trim()) {
      setError('Error: El nombre de la película es obligatorio.');
      return;
    }

    if (formData.duracion < 0) {
      setError('Error: La duración de la película no puede ser negativa.');
      return;
    }

    if (formData.precioEntrada < 0) {
      setError('Error: El precio de la entrada no puede ser negativo.');
      return;
    }

    const codigoDuplicado = peliculas.some(
      (p) =>
        p.codigo.trim().toLowerCase() === codigoNormalizado.toLowerCase() &&
        p.codigo.trim().toLowerCase() !== initialData?.codigo.trim().toLowerCase(),
    );
    if (codigoDuplicado) {
      setError('Error: Ya existe una película registrada con este código.');
      return;
    }

    const horarioDuplicado = peliculas.some(
      (p) =>
        p.salaAsignada === formData.salaAsignada &&
        p.hora === formData.hora &&
        (!initialData || p.codigo !== initialData.codigo),
    );
    if (horarioDuplicado) {
      setError('Error: Ya existe una película registrada en esa sala a esa hora.');
      return;
    }

    const peliculaGuardada = { ...formData, codigo: codigoNormalizado };

    if (isEditing && initialData) {
      dispatch(editarPelicula({ codigoAnterior: initialData.codigo, pelicula: peliculaGuardada }));
      Alert.alert('¡Película actualizada con éxito!');
    } else {
      dispatch(agregarPelicula(peliculaGuardada));
      Alert.alert('¡Película agregada con éxito!');
      setFormData(emptyFormData);
    }

    onSuccess?.();
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator
      contentContainerStyle={styles.formScrollContent}
      style={styles.formScrollView}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.container}>
        {error ? (
          <ThemedView type="backgroundElement" style={styles.errorBox}>
            <ThemedText type="small" style={styles.errorText}>{error}</ThemedText>
          </ThemedView>
        ) : null}

        <View style={styles.grid}>
          <TextInput
            value={formData.codigo}
            onChangeText={(value) => handleChange('codigo', value)}
            placeholder="Código (Ej. PEL-01)"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.textSecondary, color: theme.text }]}
          />
          <TextInput
            value={formData.nombre}
            onChangeText={(value) => handleChange('nombre', value)}
            placeholder="Nombre de la película"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.textSecondary, color: theme.text }]}
          />
        </View>

        <View style={styles.grid}>
          <View style={[styles.selectBox, { backgroundColor: theme.background, borderColor: theme.textSecondary }]}>
            <ThemedText type="small" style={[styles.label, { color: theme.text }]}>Género</ThemedText>
            {generos.map((genero) => (
              <TouchableOpacity
                key={genero}
                onPress={() => handleChange('genero', genero)}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.textSecondary },
                  formData.genero === genero && styles.selectedOption,
                ]}>
                <ThemedText type="small" style={formData.genero === genero ? styles.selectedOptionText : undefined}>{genero}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.selectBox, { backgroundColor: theme.background, borderColor: theme.textSecondary }]}>
            <ThemedText type="small" style={[styles.label, { color: theme.text }]}>Clasificación</ThemedText>
            {clasificaciones.map((clasificacion) => (
              <TouchableOpacity
                key={clasificacion.value}
                onPress={() => handleChange('clasificacion', clasificacion.value)}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.textSecondary },
                  formData.clasificacion === clasificacion.value && styles.selectedOption,
                ]}
              >
                <ThemedText type="small" style={formData.clasificacion === clasificacion.value ? styles.selectedOptionText : undefined}>{clasificacion.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.grid}>
          <TextInput
            value={String(formData.duracion || '')}
            onChangeText={(value) => handleChange('duracion', value)}
            placeholder="Duración (minutos)"
            keyboardType="numeric"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.textSecondary, color: theme.text }]}
          />
          <TextInput
            value={String(formData.precioEntrada || '')}
            onChangeText={(value) => handleChange('precioEntrada', value)}
            placeholder="Precio ($)"
            keyboardType="decimal-pad"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.textSecondary, color: theme.text }]}
          />
        </View>

        <View style={styles.grid}>
          <View style={[styles.selectBox, { backgroundColor: theme.background, borderColor: theme.textSecondary }]}>
            <ThemedText type="small" style={[styles.label, { color: theme.text }]}>Sala</ThemedText>
            {salas.map((sala) => (
              <TouchableOpacity
                key={sala.value}
                onPress={() => handleChange('salaAsignada', sala.value)}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.textSecondary },
                  formData.salaAsignada === sala.value && styles.selectedOption,
                ]}
              >
                <ThemedText type="small" style={formData.salaAsignada === sala.value ? styles.selectedOptionText : undefined}>{sala.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.selectBox, { backgroundColor: theme.background, borderColor: theme.textSecondary }]}>
            <ThemedText type="small" style={[styles.label, { color: theme.text }]}>Hora</ThemedText>
            {horarios.map((hora) => (
              <TouchableOpacity
                key={hora}
                onPress={() => handleChange('hora', hora)}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.textSecondary },
                  formData.hora === hora && styles.selectedOption,
                ]}
              >
                <ThemedText type="small" style={formData.hora === hora ? styles.selectedOptionText : undefined}>{hora}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.selectBox, { backgroundColor: theme.background, borderColor: theme.textSecondary }]}>
          <ThemedText type="small" style={[styles.label, { color: theme.text }]}>Estado</ThemedText>
          {estados.map((estado) => (
            <TouchableOpacity
              key={estado}
              onPress={() => handleChange('estado', estado)}
              style={[
                styles.optionButton,
                { backgroundColor: theme.backgroundElement, borderColor: theme.textSecondary },
                formData.estado === estado && styles.selectedOption,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: formData.estado === estado }}
            >
              <ThemedText type="small" style={formData.estado === estado ? styles.selectedOptionText : undefined}>{estado}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <ThemedText type="smallBold" style={styles.submitText}>
            {isEditing ? 'Guardar cambios' : 'Guardar Película'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formScrollView: {
    maxHeight: 560,
  },
  formScrollContent: {
    paddingBottom: 8,
  },
  container: {
    gap: 12,
  },
  errorBox: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  errorText: {
    color: '#b91c1c',
  },
  grid: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectBox: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  label: {
    fontWeight: '700',
    marginBottom: 4,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  selectedOptionText: {
    color: '#000000',
  },
  optionSelected: {
    backgroundColor: '#dbeafe',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#ffffff',
  },
});
