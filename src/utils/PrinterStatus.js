import {NativeEventEmitter, NativeModules} from 'react-native';
import BleManager from 'react-native-ble-manager';

const PT210_SERVICE   = '000018f0-0000-1000-8000-00805f9b34fb';
const PT210_CHAR_WRITE  = '00002af1-0000-1000-8000-00805f9b34fb';
const PT210_CHAR_NOTIFY = '00002af0-0000-1000-8000-00805f9b34fb';
const STATUS_COMMAND  = [0x10, 0x04, 0x01];
const TIMEOUT_MS      = 5000;
const STALE_FLUSH_MS  = 500;

async function forceDisconnect(deviceId) {
  try {
    await BleManager.disconnect(deviceId);
  } catch (_) {}
  await new Promise(r => setTimeout(r, 400));
}

/**
 * Consulta el estado de la impresora PT-210 via BLE.
 * Retorna {coverOpen, paperNearEnd} si responde, null si no responde o falla.
 */
export async function getPrinterStatusBLE(deviceId) {
  const emitter = new NativeEventEmitter(NativeModules.BleManager);
  let subscription = null;

  console.log('[PrinterStatus] Iniciando consulta BLE para', deviceId);
  await forceDisconnect(deviceId);

  try {
    console.log('[PrinterStatus] Conectando...');
    await BleManager.connect(deviceId);
    console.log('[PrinterStatus] Conectado. Recuperando servicios...');
    await BleManager.retrieveServices(deviceId);
    console.log('[PrinterStatus] Servicios recuperados. Esperando notificación...');

    const statusByte = await new Promise(resolve => {
      const timer = setTimeout(() => {
        console.log('[PrinterStatus] Timeout — la impresora no respondió');
        resolve(null);
      }, TIMEOUT_MS);

      let commandSent = false;

      // Escuchar TODAS las notificaciones BLE para diagnosticar
      subscription = emitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        ({peripheral, characteristic, value}) => {
          const byteHex = value.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ');
          console.log(
            `[PrinterStatus] Notificación recibida — peripheral=${peripheral}` +
            ` char=${characteristic} commandSent=${commandSent} bytes=[${byteHex}]`,
          );

          if (
            commandSent &&
            peripheral === deviceId &&
            characteristic.toLowerCase() === PT210_CHAR_NOTIFY &&
            value.length > 0
          ) {
            console.log('[PrinterStatus] Notificación aceptada, byte=0x' + value[0].toString(16));
            clearTimeout(timer);
            resolve(value[0]);
          }
        },
      );

      BleManager.startNotification(deviceId, PT210_SERVICE, PT210_CHAR_NOTIFY)
        .then(() => {
          console.log('[PrinterStatus] Notificación activa. Esperando ' + STALE_FLUSH_MS + 'ms...');
          return new Promise(r => setTimeout(r, STALE_FLUSH_MS));
        })
        .then(() => {
          console.log('[PrinterStatus] Enviando comando DLE EOT 1...');
          commandSent = true;
          return BleManager.writeWithoutResponse(
            deviceId,
            PT210_SERVICE,
            PT210_CHAR_WRITE,
            STATUS_COMMAND,
          );
        })
        .then(() => console.log('[PrinterStatus] Comando enviado, esperando respuesta...'))
        .catch(err => {
          console.log('[PrinterStatus] Error en flujo:', err?.message ?? err);
          clearTimeout(timer);
          resolve(null);
        });
    });

    if (statusByte === null) {
      console.log('[PrinterStatus] Sin respuesta → se permite imprimir');
      return null;
    }

    const result = {
      coverOpen:    (statusByte & 0x04) !== 0,
      paperNearEnd: (statusByte & 0x60) !== 0,
    };
    console.log(
      '[PrinterStatus] Resultado — byte=0x' + statusByte.toString(16) +
      ' coverOpen=' + result.coverOpen +
      ' paperNearEnd=' + result.paperNearEnd,
    );
    return result;
  } catch (err) {
    console.log('[PrinterStatus] Excepción general:', err?.message ?? err);
    return null;
  } finally {
    if (subscription) {
      subscription.remove();
    }
    try {
      await BleManager.stopNotification(deviceId, PT210_SERVICE, PT210_CHAR_NOTIFY);
    } catch (_) {}
    try {
      await BleManager.disconnect(deviceId);
    } catch (_) {}
    console.log('[PrinterStatus] Limpieza BLE completada');
  }
}
