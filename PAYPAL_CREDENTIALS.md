# PayPal Configuration - CONFIDENCIAL

## ⚠️ INFORMACIÓN SENSIBLE - NO COMPARTIR

### Credenciales de PayPal para La Tierrita

**Client ID (público - usado en frontend):**

```
BAA9dIdaO89f8zanzO-8S1Rsz7F7Vx16kiP2IfcmjZhonAuzDpwE8MPgz0CHZr4f0vAgIGj95q-CqJYxho
```

**Client Secret (privado - SOLO para backend):**

```
EN6SKqkXYJHOatV0n0tT_3jb1OpVqJuPsc-92ag4tgW5_Nl2R9fTNEP8hAPZIdiOa8RJbDlHfSpD_6y8
```

### 🔒 Notas de Seguridad

1. **Client ID**: Se puede usar públicamente en el frontend (ya configurado en `paypal-config.js`)
2. **Client Secret**: NUNCA debe exponerse en el frontend. Solo usar en backend si implementas verificación de webhooks.

### 📝 Estado Actual

- ✅ Client ID configurado en `paypal-config.js`
- ✅ Integración frontend completa
- ✅ Botones PayPal funcionando
- ⚠️ Actualmente en modo SANDBOX (pruebas)

### 🚀 Para Producción

Cuando estés listo para recibir pagos reales:

1. Cambiar `environment: 'production'` en `paypal-config.js`
2. Usar las credenciales de LIVE (no sandbox)
3. Probar con pagos pequeños primero
4. Configurar webhooks si necesitas verificación en backend

### 📞 Contacto PayPal

- Developer Portal: https://developer.paypal.com/
- Documentación: https://developer.paypal.com/docs/
- Soporte: Desde tu dashboard de PayPal

---

**MANTENER ESTE ARCHIVO PRIVADO Y SEGURO**
