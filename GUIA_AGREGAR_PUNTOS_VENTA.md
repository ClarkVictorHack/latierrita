# 📍 Guía para Agregar Nuevos Puntos de Venta - La Tierrita

## 🎯 Cómo Agregar un Nuevo Punto de Venta

Cuando tengas nuevos establecimientos que vendan tus productos, puedes agregarlos fácilmente al mapa siguiendo estos pasos:

### 📂 **Paso 1: Abrir el archivo main.js**

Navega al archivo: `c:\Users\yahir\Documents\GitHub\latierrita\main.js`

### 🔍 **Paso 2: Localizar el array puntosDeVenta**

Busca la línea que dice:

```javascript
const puntosDeVenta = [
```

### ➕ **Paso 3: Agregar el nuevo punto**

Al final del array (antes del `];`), agrega el nuevo punto siguiendo este formato:

```javascript
{
    id: 17, // ⚠️ IMPORTANTE: Usar el siguiente número disponible
    nombre: "Nombre del Establecimiento",
    tipo: "supermercado", // O "punto-venta"
    lat: -0.0000, // ⚠️ Reemplazar con latitud real
    lng: -00.0000, // ⚠️ Reemplazar con longitud real
    ciudad: "Ciudad",
    provincia: "Provincia",
    direccion: "Dirección completa del establecimiento",
    telefono: "00-0000000"
}
```

### 📋 **Tipos de Puntos Disponibles**

Solo existen **2 tipos** de puntos:

1. **`"supermercado"`** 🏪 (azul)

   - Para cadenas grandes como Supermaxi, Tía, Mi Comisariato, etc.

2. **`"punto-venta"`** 🏬 (verde)
   - Para tiendas locales, minimarkets, despensas, distribuidores

### 🌍 **Paso 4: Obtener Coordenadas (lat, lng)**

Para obtener las coordenadas exactas del establecimiento:

#### **Opción 1: Google Maps**

1. Ve a [Google Maps](https://maps.google.com)
2. Busca la dirección del establecimiento
3. Haz clic derecho en el marcador
4. Selecciona las coordenadas que aparecen
5. Formato: `latitud, longitud` (ej: `-2.1894, -79.8890`)

#### **Opción 2: GPS o Apps móviles**

- Usa apps como "GPS Coordinates" o similar
- Ve físicamente al establecimiento
- Obtén las coordenadas exactas

#### **Opción 3: Herramientas online**

- [LatLong.net](https://www.latlong.net/)
- [GPS Coordinates](https://gps-coordinates.org/)

### 💡 **Ejemplo Completo**

```javascript
const puntosDeVenta = [
  // ... puntos existentes ...

  // Nuevo punto - El Oro
  {
    id: 17,
    nombre: "Supermaxi Machala Centro",
    tipo: "supermercado",
    lat: -3.259,
    lng: -79.956,
    ciudad: "Machala",
    provincia: "El Oro",
    direccion: "Av. Bolivar y 9 de Mayo, Centro Comercial City Mall",
    telefono: "07-2933000",
  },

  // Nuevo punto - Esmeraldas
  {
    id: 18,
    nombre: "Tienda Las Palmas",
    tipo: "punto-venta",
    lat: 0.9593,
    lng: -79.6519,
    ciudad: "Esmeraldas",
    provincia: "Esmeraldas",
    direccion: "Malecón Las Palmas, Sector Centro",
    telefono: "06-2720123",
  },
];
```

### ⚠️ **Puntos Importantes**

1. **ID único**: Cada punto debe tener un ID diferente. Usar números consecutivos.

2. **Coma al final**: No olvides la coma `,` después de cada punto (excepto el último).

3. **Coordenadas precisas**: Las coordenadas deben ser exactas para que el marcador aparezca en el lugar correcto.

4. **Formato de teléfono**: Usar formato ecuatoriano (ej: "04-2680000").

5. **Guardar el archivo**: Después de agregar puntos, guarda el archivo (`Ctrl + S`).

### 🔄 **Paso 5: Verificar los cambios**

1. Refresca la página web (`F5`)
2. Ve a la sección "Puntos de Venta"
3. Verifica que el nuevo marcador aparece en el mapa
4. Haz clic en el marcador para confirmar que la información es correcta

### 🎨 **Características Visuales**

- **Supermercados** 🏪: Marcador azul con icono de tienda
- **Puntos de Venta** 🏬: Marcador verde con icono de edificio comercial

### 📊 **Filtros del Mapa**

Los usuarios pueden filtrar por:

- **"Todos los puntos"**: Muestra todos los marcadores
- **"Supermercados"**: Solo muestra supermercados

### 🔧 **Solución de Problemas**

**Si el marcador no aparece:**

1. Verifica que las coordenadas sean válidas
2. Confirma que el ID sea único
3. Revisa que no falten comas o comillas
4. Verifica que el tipo sea exactamente `"supermercado"` o `"punto-venta"`

**Si hay errores en JavaScript:**

1. Abre las herramientas de desarrollador (`F12`)
2. Ve a la pestaña "Console"
3. Revisa si hay errores de sintaxis

### 📈 **Mantenimiento Regular**

**Se recomienda:**

- Actualizar información de contacto regularmente
- Verificar que los establecimientos sigan activos
- Agregar nuevos puntos de venta según crezca la red
- Eliminar puntos que ya no vendan los productos

### 🌟 **Consejos Adicionales**

1. **Organización por provincias**: Mantén los puntos agrupados por provincia con comentarios
2. **Nombres descriptivos**: Usa nombres que los clientes reconozcan fácilmente
3. **Direcciones completas**: Incluye referencias conocidas cuando sea posible
4. **Verificación**: Confirma con el establecimiento antes de agregarlos

---

**¡Con esta guía podrás mantener tu mapa de puntos de venta siempre actualizado y ayudar a tus clientes a encontrar fácilmente dónde comprar los productos de La Tierrita!** 🎉
