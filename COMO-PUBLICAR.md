# Cómo publicar tu app y convertirla en APK

## Antes de nada — configura 2 cosas en `src/App.jsx`
Busca estas líneas casi al inicio del archivo y cámbialas:

```
const SUBSCRIBE_LINK = "#";                                    // tu link de Stripe/Gumroad
const FORMSPREE_ENDPOINT = "https://formspree.io/f/TU_ID_AQUI"; // ver paso 0
```

## Paso 0 — Crea tu Formspree (recibir solicitudes de plan)
1. Ve a formspree.io y crea cuenta gratis (50 envíos/mes gratis)
2. "New Form" → te da un endpoint tipo `https://formspree.io/f/xxxxxxx`
3. Pégalo en `FORMSPREE_ENDPOINT` en `src/App.jsx`
4. Cada vez que alguien pida un plan personalizado, te llega a tu email

## Paso 1 — Sube el código a GitHub
1. Crea cuenta en github.com (gratis)
2. Crea un repositorio nuevo, ej. "cuartel-de-finanzas"
3. Sube esta carpeta completa (arrastra los archivos en la web de GitHub, o usa GitHub Desktop si prefieres interfaz visual)

## Paso 2 — Publica en Vercel
1. Ve a vercel.com → "Sign up" con tu cuenta de GitHub
2. "Add New Project" → selecciona tu repositorio
3. Vercel detecta que es un proyecto Vite automáticamente → dale "Deploy"
4. En 1-2 minutos te da un link real, ej. `cuartel-de-finanzas.vercel.app`
5. Pruébalo en tu celular — ya deberías poder "Añadir a pantalla de inicio" desde Chrome

## Paso 3 — Genera el APK con PWABuilder
1. Ve a pwabuilder.com
2. Pega el link de tu app (el de Vercel del paso 2)
3. Dale "Start" — analiza tu PWA
4. Click en "Package for stores" → elige "Android"
5. Te genera un archivo APK descargable, listo para instalar en cualquier Android
   (o el paquete .aab si luego quieres subirlo a Google Play Store)

## Notas
- El ícono de la app ya está incluido (verde, con "$") en `public/icon-192.png` y `icon-512.png`
- Si quieres cambiar el nombre/colores del ícono que ve la gente al instalar, edita el bloque `manifest` en `vite.config.js`
- Los datos de la calculadora se guardan en el navegador/dispositivo de cada persona — si borran caché del navegador, se pierden (es normal en apps sin cuenta de usuario)
