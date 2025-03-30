import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { generateComparisonReport } from '../api/conversion.api';

/**
 * Process DAT file and extract machine data with improved headercard mapping
 * @param {File} file - The DAT file to process
 * @param {Object} dbMachines - Database machines map for headercard lookup
 * @returns {Promise<Array>} Array of machine data objects
 */
export const processDatFileLocally = (file, dbMachines = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const lines = content.split('\n');

        // Extract headers (first line that starts with H)
        const headerLine = lines.find(line => line.startsWith('H;'));
        if (!headerLine) {
          reject(new Error('No se encontró la línea de encabezado (H) en el archivo DAT'));
          return;
        }

        const headerParts = headerLine.split(';');

        // Bill denominations according to header
        const denominaciones = [
          parseInt(headerParts[5]) || 20,
          parseInt(headerParts[6]) || 50,
          parseInt(headerParts[7]) || 100,
          parseInt(headerParts[8]) || 200,
          parseInt(headerParts[9]) || 500,
          parseInt(headerParts[10]) || 1000,
          parseInt(headerParts[11]) || 2000,
          parseInt(headerParts[12]) || 10000
        ];

        // Crear un mapeo de headercard a ID de máquina desde dbMachines
        const headerCardToMachine = {};
        Object.entries(dbMachines).forEach(([machineId, machineData]) => {
          if (machineData.headercard) {
            // Asegurarse de que headercard sea string y esté normalizado
            const headerCardStr = String(machineData.headercard).trim();
            headerCardToMachine[headerCardStr] = machineId;
          }
        });

        console.log("Mapeo de headercard a máquina:", headerCardToMachine);

        // Extract data from lines starting with 'D;'
        const machineData = lines
          .filter(line => line.startsWith('D;'))
          .map(line => {
            const parts = line.split(';');
            if (parts.length < 21) return null; // Verify enough data

            // Obtener el headercard del archivo DAT
            const headercard = parts[1].trim();
            
            // Intentar obtener el ID de máquina correcto usando el headercard
            // Si no se encuentra, usar el ID interno del DAT como fallback
            const datInternalId = parts[2].trim();
            const mappedMachineId = headerCardToMachine[headercard];
            
            // Usar el ID mapeado si existe, de lo contrario usar el ID interno
            const machineId = mappedMachineId || datInternalId;
            
            console.log(`Procesando DAT - HeaderCard: ${headercard}, ID interno: ${datInternalId}, ID mapeado: ${mappedMachineId || 'No encontrado'}`);

            // Physical bills (columns 5-12)
            let totalFisico = 0;
            const billetesFisicos = {};
            for (let i = 0; i < 8; i++) {
              const cantidad = parseInt(parts[i + 5]) || 0;
              const valor = denominaciones[i];
              billetesFisicos[`B${valor}`] = cantidad;
              totalFisico += cantidad * valor;
            }

            // Virtual bills (columns 13-20)
            let totalVirtual = 0;
            const billetesVirtuales = {};
            for (let i = 0; i < 8; i++) {
              const cantidad = parseInt(parts[i + 13]) || 0;
              const valor = denominaciones[i];
              billetesVirtuales[`IM${valor}`] = cantidad;
              totalVirtual += cantidad * valor;
            }

            return {
              headercard,
              internalDatId: datInternalId, // Guardar el ID interno del DAT para referencia
              machineId,  // Este es el ID correcto (mapeado o interno)
              date: parts[3].trim(),
              time: parts[4].trim(),
              billetesFisicos,
              billetesVirtuales,
              totalFisico,
              totalVirtual,
              totalCounted: totalFisico + totalVirtual
            };
          })
          .filter(item => item !== null);

        // Registrar un resumen de las máquinas procesadas
        console.log(`Procesadas ${machineData.length} máquinas del archivo DAT`);
        console.log("Ejemplos de máquinas procesadas:", machineData.slice(0, 3));

        resolve(machineData);
      } catch (error) {
        console.error('Error procesando archivo DAT:', error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
};

/**
 * Process XLS file and extract machine data
 * @param {File} file - The XLS file to process
 * @returns {Promise<Array>} Array of machine data objects
 */
export const processXlsFileLocally = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Try to automatically detect columns
        let machineIdField = '';
        let valueField = '';
        let locationField = '';
        let zoneField = '';
        let headerCardField = '';

        // If there's at least one row, examine its properties
        if (jsonData.length > 0) {
          const firstRow = jsonData[0];
          const headers = Object.keys(firstRow);

          // Look for common headers more exhaustively
          for (const header of headers) {
            const headerLower = header.toLowerCase();

            if (headerLower.includes('maq') || headerLower.includes('machine') || headerLower.includes('id')) {
              machineIdField = header;
            } else if (headerLower.includes('val') || headerLower.includes('monto') || headerLower.includes('amount') || headerLower.includes('total')) {
              valueField = header;
            } else if (headerLower.includes('loc') || headerLower.includes('ubic')) {
              locationField = header;
            } else if (headerLower.includes('zona') || headerLower.includes('zone') || headerLower.includes('area')) {
              zoneField = header;
            } else if (headerLower.includes('serie') || headerLower.includes('header') || headerLower.includes('card') || headerLower.includes('serial')) {
              headerCardField = header;
            }
          }

          // If not detected automatically, use the first available fields
          if (!machineIdField && headers.length > 0) machineIdField = headers[0];
          if (!valueField && headers.length > 1) valueField = headers[1];
          if (!locationField && headers.length > 2) locationField = headers[2];
          if (!zoneField && headers.length > 3) zoneField = headers[3];
        }

        console.log("Campos detectados en XLS:", {
          machineIdField, valueField, locationField, zoneField, headerCardField
        });

        // Process and normalize data with improved headercard search
        const processedData = jsonData.map(row => {
          // Try to get machine ID
          let machineId = '';
          if (machineIdField && row[machineIdField] !== undefined) {
            machineId = row[machineIdField].toString().trim();
          } else {
            // Look for any field that might contain a machine ID
            for (const field in row) {
              if (field.toLowerCase().includes('maq') || field.toLowerCase().includes('machine') || field.toLowerCase().includes('id')) {
                machineId = row[field].toString().trim();
                break;
              }
            }

            // If still no ID, try with the first property
            if (!machineId && Object.keys(row).length > 0) {
              machineId = row[Object.keys(row)[0]].toString().trim();
            }
          }

          // Get serial number if available
          let headercard = '';
          if (headerCardField && row[headerCardField] !== undefined) {
            headercard = row[headerCardField].toString().trim();
          } else {
            // Search more exhaustively
            for (const field in row) {
              const fieldLower = field.toLowerCase();
              if (fieldLower.includes('serie') || fieldLower.includes('header') ||
                fieldLower.includes('card') || fieldLower.includes('serial') ||
                fieldLower.includes('nro') || fieldLower.includes('num')) {
                headercard = row[field].toString().trim();
                break;
              }
            }
          }

          // Get expected value
          let expectedAmount = 0;
          if (valueField && row[valueField] !== undefined) {
            // Intentar convertir a número limpiando formatos monetarios
            const valueStr = row[valueField].toString().replace(/[^\d.-]/g, '');
            expectedAmount = parseFloat(valueStr) || 0;
          } else {
            // Look for any field that seems to be a monetary value
            for (const field in row) {
              if (field.toLowerCase().includes('val') || field.toLowerCase().includes('monto') ||
                field.toLowerCase().includes('amount') || field.toLowerCase().includes('total')) {
                const valueStr = row[field].toString().replace(/[^\d.-]/g, '');
                expectedAmount = parseFloat(valueStr) || 0;
                break;
              }
            }

            // If still no value and there are at least two fields, try with the second
            if (expectedAmount === 0 && Object.keys(row).length > 1) {
              const secondField = Object.keys(row)[1];
              const valueStr = row[secondField].toString().replace(/[^\d.-]/g, '');
              expectedAmount = parseFloat(valueStr) || 0;
            }
          }

          // Get location and zone
          let location = '';
          if (locationField && row[locationField] !== undefined) {
            location = row[locationField].toString().trim();
          }

          let zona = '';
          if (zoneField && row[zoneField] !== undefined) {
            zona = row[zoneField].toString().trim();
          }

          return {
            machineId,
            headercard,
            expectedAmount,
            location,
            zona
          };
        }).filter(item => item.machineId); // Solo permitir items con ID de máquina

        console.log(`Procesadas ${processedData.length} máquinas del archivo XLS`);
        console.log("Ejemplos de máquinas procesadas:", processedData.slice(0, 3));

        resolve(processedData);
      } catch (error) {
        console.error('Error procesando archivo Excel:', error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Compare data from DAT and XLS files with database data
 * @param {Array} datData - Processed DAT file data
 * @param {Array} xlsData - Processed XLS file data
 * @param {Object} dbMachines - Database machines map
 * @returns {Object} Results and summary
 */
export const compareDataLocally = (datData, xlsData, dbMachines) => {
    console.log("============ INICIANDO CONCILIACIÓN ============");
    console.log(`Datos DAT: ${datData.length} registros, XLS: ${xlsData.length} registros`);
    
    // Crear un mapa de máquinas del archivo XLS para búsqueda rápida por ID
    const xlsMachineMap = {};
    xlsData.forEach(item => {
      if (item.machineId) {
        // Normalizar ID para comparaciones más consistentes
        const normalizedId = item.machineId.toString().trim();
        xlsMachineMap[normalizedId] = {
          ...item,
          found: false
        };
        
        // También guardar una versión sin ceros a la izquierda para comparaciones alternativas
        const numericId = parseInt(normalizedId.replace(/^0+/, ''), 10).toString();
        if (numericId !== normalizedId) {
          xlsMachineMap[numericId] = {
            ...item,
            found: false
          };
        }
      }
    });
  
    console.log("XLS Machine Map creado con IDs normalizados:", Object.keys(xlsMachineMap));
  
    // Crear un mapa inverso de headercard a ID de máquina para referencia
    const headercardToMachineMap = {};
    for (const machineId in dbMachines) {
      const machine = dbMachines[machineId];
      if (machine && machine.headercard) {
        const headercard = machine.headercard.toString().trim();
        headercardToMachineMap[headercard] = machineId;
      }
    }
  
    console.log("Mapa de headercard a ID:", headercardToMachineMap);
  
    // Arreglos y contadores para los resultados
    const results = [];
    let totalExpected = 0;
    let totalCounted = 0;
    let matchingCount = 0;
    let nonMatchingCount = 0;
    let missingCount = 0;
    let extraCount = 0;
  
    // Totalizar valores esperados del XLS
    xlsData.forEach(item => {
      totalExpected += item.expectedAmount || 0;
    });
  
    // Primera pasada: procesar los registros DAT y encontrar coincidencias directas
    datData.forEach(datItem => {
      // Normalizar el ID para ser más consistente
      const normalizedId = datItem.machineId.toString().trim();
      const numericId = parseInt(normalizedId.replace(/^0+/, ''), 10).toString();
      
      console.log(`Procesando máquina DAT - ID: ${normalizedId}, Headercard: ${datItem.headercard}, ` +
                  `ID interno: ${datItem.internalDatId}, ID numérico: ${numericId}`);
      
      // Buscar en XLS usando diferentes variantes del ID
      let xlsItem = xlsMachineMap[normalizedId];
      let matchKeyUsed = normalizedId;
      
      // Si no se encuentra con el ID directo, intentar con el ID numérico
      if (!xlsItem && normalizedId !== numericId) {
        xlsItem = xlsMachineMap[numericId];
        matchKeyUsed = numericId;
      }
      
      // Si aún no se encuentra, intentar buscar por headercard en la base de datos
      if (!xlsItem && datItem.headercard) {
        const mappedId = headercardToMachineMap[datItem.headercard];
        if (mappedId && xlsMachineMap[mappedId]) {
          xlsItem = xlsMachineMap[mappedId];
          matchKeyUsed = mappedId;
          console.log(`  ✓ Encontrada coincidencia por headercard: ${datItem.headercard} → ${mappedId}`);
        }
      }
      
      // Última opción: buscar en todas las claves con parseInt
      if (!xlsItem) {
        const datItemNumeric = parseInt(normalizedId);
        for (const key in xlsMachineMap) {
          if (parseInt(key) === datItemNumeric && !xlsMachineMap[key].found) {
            xlsItem = xlsMachineMap[key];
            matchKeyUsed = key;
            console.log(`  ✓ Encontrada coincidencia numérica: ${datItemNumeric} ≈ ${key}`);
            break;
          }
        }
      }
      
      // Obtener datos de la DB
      let dbItem = dbMachines[normalizedId] || dbMachines[numericId];
      
      // Si aún no se encuentra en DB, buscar por headercard
      if (!dbItem && datItem.headercard) {
        const mappedId = headercardToMachineMap[datItem.headercard];
        if (mappedId) {
          dbItem = dbMachines[mappedId];
        }
      }
      
      const matchFound = !!xlsItem;
      console.log(`  ${matchFound ? '✓ Coincidencia encontrada' : '✗ No se encontró coincidencia'} usando ID: ${matchKeyUsed}`);
      
      if (matchFound) {
        // Marcar como encontrado para evitar duplicados
        xlsItem.found = true;
        
        // Procesar la máquina que tiene datos en DAT y XLS
        const difference = datItem.totalCounted - xlsItem.expectedAmount;
        const match = Math.abs(difference) < 1; // Tolerancia de 1 peso
  
        if (match) {
          matchingCount++;
        } else {
          nonMatchingCount++;
        }
  
        results.push({
          machineId: datItem.machineId,
          headercard: datItem.headercard,
          internalDatId: datItem.internalDatId,
          location: xlsItem.location || (dbItem?.location || 'Sin ubicación'),
          zona: xlsItem.zona || (dbItem?.zona || ''),
          expectedAmount: xlsItem.expectedAmount || 0,
          countedAmount: datItem.totalCounted || 0,
          countedPhysical: datItem.totalFisico || 0,
          countedVirtual: datItem.totalVirtual || 0,
          difference,
          match,
          status: match ? 'match' : 'mismatch',
          date: datItem.date,
          time: datItem.time,
          billetesFisicos: datItem.billetesFisicos,
          billetesVirtuales: datItem.billetesVirtuales,
          dbData: dbItem || null,
          matchKeyUsed  // Guardar la clave que se usó para encontrar la coincidencia
        });
  
        totalCounted += datItem.totalCounted || 0;
        
        console.log(`  Máquina: ${datItem.machineId}, Valor esperado: ${xlsItem.expectedAmount}, ` +
                    `Valor contado: ${datItem.totalCounted}, Diferencia: ${difference}, ` +
                    `Coincide: ${match ? 'Sí' : 'No'}`);
      } else {
        // Máquina en DAT pero no en XLS (extra)
        extraCount++;
  
        results.push({
          machineId: datItem.machineId,
          headercard: datItem.headercard,
          internalDatId: datItem.internalDatId,
          location: dbItem?.location || 'Desconocida',
          zona: dbItem?.zona || 'Desconocida',
          expectedAmount: 0,
          countedAmount: datItem.totalCounted || 0,
          countedPhysical: datItem.totalFisico || 0,
          countedVirtual: datItem.totalVirtual || 0,
          difference: datItem.totalCounted,
          match: false,
          status: 'extra',
          date: datItem.date,
          time: datItem.time,
          billetesFisicos: datItem.billetesFisicos,
          billetesVirtuales: datItem.billetesVirtuales,
          dbData: dbItem || null
        });
  
        totalCounted += datItem.totalCounted || 0;
        
        console.log(`  Máquina adicional (solo en DAT): ${datItem.machineId}, ` +
                    `Valor contado: ${datItem.totalCounted}`);
      }
    });
  
    // Segunda pasada: revisar máquinas que están en XLS pero no en DAT
    Object.entries(xlsMachineMap).forEach(([key, item]) => {
      // Solo procesar cada máquina una vez (por la forma en que construimos el mapa)
      if (!item.found && !Object.values(xlsMachineMap).some(
          other => other !== item && other.found && other.machineId === item.machineId)) {
        
        console.log(`Máquina en XLS pero no en DAT: ${key} (${item.machineId})`);
        
        // Verificar si la máquina existe en la base de datos
        let dbItem = dbMachines[key] || dbMachines[item.machineId];
  
        // Máquina en XLS pero no en DAT
        missingCount++;
  
        results.push({
          machineId: item.machineId,
          headercard: item.headercard || '',
          location: item.location || (dbItem?.location || 'Sin ubicación'),
          zona: item.zona || (dbItem?.zona || ''),
          expectedAmount: item.expectedAmount || 0,
          countedAmount: 0,
          countedPhysical: 0,
          countedVirtual: 0,
          difference: -item.expectedAmount,
          match: false,
          status: 'missing',
          date: '',
          time: '',
          billetesFisicos: {},
          billetesVirtuales: {},
          dbData: dbItem || null
        });
      }
    });
  
    // Sort results
    const sortedResults = results.sort((a, b) => {
      // First discrepancies, then missing, then extra, finally matching
      if (a.status !== b.status) {
        if (a.status === 'mismatch') return -1;
        if (b.status === 'mismatch') return 1;
        if (a.status === 'missing') return -1;
        if (b.status === 'missing') return 1;
        if (a.status === 'extra') return -1;
        if (b.status === 'extra') return 1;
      }
      return a.machineId.localeCompare(b.machineId);
    });
  
    console.log("============ RESUMEN DE CONCILIACIÓN ============");
    console.log(`Total esperado: ${totalExpected}`);
    console.log(`Total contado: ${totalCounted}`);
    console.log(`Máquinas coincidentes: ${matchingCount}`);
    console.log(`Máquinas con discrepancias: ${nonMatchingCount}`);
    console.log(`Máquinas faltantes (solo en XLS): ${missingCount}`);
    console.log(`Máquinas adicionales (solo en DAT): ${extraCount}`);
    console.log("================================================");
  
    return {
      results: sortedResults,
      summary: {
        totalExpected,
        totalCounted,
        matchingMachines: matchingCount,
        nonMatchingMachines: nonMatchingCount,
        missingMachines: missingCount,
        extraMachines: extraCount
      }
    };
  };

/**
 * Show machine details in a modal
 * @param {Object} machine - Machine data
 * @param {boolean} isMobile - Whether the device is mobile
 */
export const showMachineDetails = (machine, isMobile) => {
  // Get additional data from database
  const dbData = machine.dbData || {};

  // Create content for modal dialog with additional data
  let detailsContent = `
    <div style="text-align: left; padding: 16px;">
      <h3 style="margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
        Detalles de Máquina #${machine.machineId}
      </h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div>
          <p style="font-weight: bold; margin: 0; color: #1976d2;">Número de Serie:</p>
          <p style="font-size: 16px;">${machine.headercard || 'No disponible'}</p>
        </div>
        <div>
          <p style="font-weight: bold; margin: 0;">Ubicación:</p>
          <p>${machine.location || 'Desconocida'}</p>
        </div>
        <div>
          <p style="font-weight: bold; margin: 0;">Fecha:</p>
          <p>${machine.date || 'No disponible'}</p>
        </div>
        <div>
          <p style="font-weight: bold; margin: 0;">Hora:</p>
          <p>${machine.time || 'No disponible'}</p>
        </div>
  `;

  // Agregar información de ID interno si existe
  if (machine.internalDatId && machine.internalDatId !== machine.machineId) {
    detailsContent += `
        <div>
          <p style="font-weight: bold; margin: 0; color: #ff9800;">ID Interno DAT:</p>
          <p style="font-size: 16px;">${machine.internalDatId}</p>
        </div>
    `;
  }

  detailsContent += `
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div style="border: 1px solid #ddd; padding: 12px; border-radius: 4px; background-color: #f9f9f9;">
          <p style="font-weight: bold; margin: 0; color: #1976d2;">Esperado:</p>
          <p style="font-size: 18px; font-weight: bold;">$${machine.expectedAmount.toLocaleString('es-AR')}</p>
        </div>
        <div style="border: 1px solid #ddd; padding: 12px; border-radius: 4px; background-color: #f9f9f9;">
          <p style="font-weight: bold; margin: 0; color: #2e7d32;">Contado:</p>
          <p style="font-size: 18px; font-weight: bold;">$${machine.countedAmount.toLocaleString('es-AR')}</p>
        </div>
        <div style="border: 1px solid #ddd; padding: 12px; border-radius: 4px; background-color: ${machine.difference >= 0 ? '#e8f5e9' : '#ffebee'};">
          <p style="font-weight: bold; margin: 0; color: ${machine.difference >= 0 ? '#2e7d32' : '#d32f2f'};">Diferencia:</p>
          <p style="font-size: 18px; font-weight: bold; color: ${machine.difference >= 0 ? '#2e7d32' : '#d32f2f'};">
            ${machine.difference >= 0 ? '+' : ''}$${machine.difference.toLocaleString('es-AR')}
          </p>
        </div>
      </div>
  `;

  // Add database data section if it exists
  if (Object.keys(dbData).length > 0) {
    detailsContent += `
      <div style="margin-top: 24px; border: 1px solid #bbdefb; padding: 16px; border-radius: 4px; background-color: #e3f2fd;">
        <h4 style="margin-top: 0; margin-bottom: 12px; color: #1976d2;">Datos registrados en sistema</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <p style="font-weight: bold; margin: 0; color: #555;">Bill en Sistema:</p>
            <p style="font-size: 16px; margin: 4px 0;">$${dbData.bill ? parseFloat(dbData.bill).toLocaleString('es-AR') : '0'}</p>
          </div>
          <div>
            <p style="font-weight: bold; margin: 0; color: #555;">Estado:</p>
            <p style="font-size: 16px; margin: 4px 0; color: ${dbData.finalizado === 'Completa' ? '#2e7d32' :
        dbData.finalizado === 'Pendiente' ? '#ed6c02' : '#757575'
      };">${dbData.finalizado || 'No registrado'}</p>
          </div>
          <div>
            <p style="font-weight: bold; margin: 0; color: #555;">Asistente 1:</p>
            <p style="font-size: 16px; margin: 4px 0;">${dbData.asistente1 || 'Ninguno'}</p>
          </div>
          <div>
            <p style="font-weight: bold; margin: 0; color: #555;">Asistente 2:</p>
            <p style="font-size: 16px; margin: 4px 0;">${dbData.asistente2 || 'Ninguno'}</p>
          </div>
        </div>
        ${dbData.comentario ? `
          <div style="margin-top: 12px;">
            <p style="font-weight: bold; margin: 0; color: #555;">Comentario:</p>
            <p style="font-size: 16px; margin: 4px 0; padding: 8px; background-color: #f5f5f5; border-radius: 4px;">${dbData.comentario}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Add physical bills section if available
  if (machine.billetesFisicos && Object.keys(machine.billetesFisicos).length > 0) {
    let billetesFisicosHtml = `
      <h4 style="margin-top: 16px; margin-bottom: 8px;">Billetes Físicos</h4>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
    `;

    // Sort denominations for display
    const denominaciones = Object.keys(machine.billetesFisicos)
      .sort((a, b) => parseInt(a.replace('B', '')) - parseInt(b.replace('B', '')));

    let totalFisico = 0;

    denominaciones.forEach(denom => {
      const valor = parseInt(denom.replace('B', ''));
      const cantidad = machine.billetesFisicos[denom];
      const subtotal = valor * cantidad;
      totalFisico += subtotal;

      if (cantidad > 0) {
        billetesFisicosHtml += `
          <div style="border: 1px solid #ddd; padding: 8px; border-radius: 4px; background-color: #f9f9f9; text-align: center;">
            <p style="font-weight: bold; margin: 0; color: #555;">${valor}</p>
            <p style="font-size: 16px; margin: 4px 0;">${cantidad} unidades</p>
            <p style="font-size: 14px; color: #777;">${subtotal.toLocaleString('es-AR')}</p>
          </div>
        `;
      }
    });

    billetesFisicosHtml += `
      </div>
      <p style="font-weight: bold; text-align: right; margin-bottom: 16px;">
        Total Físico: ${totalFisico.toLocaleString('es-AR')}
      </p>
    `;

    detailsContent += billetesFisicosHtml;
  }

  // Add virtual bills section if available
  if (machine.billetesVirtuales && Object.keys(machine.billetesVirtuales).length > 0) {
    let billetesVirtualesHtml = `
      <h4 style="margin-top: 16px; margin-bottom: 8px;">Billetes Virtuales</h4>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
    `;

    // Sort denominations for display
    const denominaciones = Object.keys(machine.billetesVirtuales)
      .sort((a, b) => parseInt(a.replace('IM', '')) - parseInt(b.replace('IM', '')));

    let totalVirtual = 0;

    denominaciones.forEach(denom => {
      const valor = parseInt(denom.replace('IM', ''));
      const cantidad = machine.billetesVirtuales[denom];
      const subtotal = valor * cantidad;
      totalVirtual += subtotal;

      if (cantidad > 0) {
        billetesVirtualesHtml += `
          <div style="border: 1px solid #ddd; padding: 8px; border-radius: 4px; background-color: #f9f9f9; text-align: center;">
            <p style="font-weight: bold; margin: 0; color: #555;">${valor} Virtual</p>
            <p style="font-size: 16px; margin: 4px 0;">${cantidad} unidades</p>
            <p style="font-size: 14px; color: #777;">${subtotal.toLocaleString('es-AR')}</p>
          </div>
        `;
      }
    });

    billetesVirtualesHtml += `
      </div>
      <p style="font-weight: bold; text-align: right; margin-bottom: 16px;">
        Total Virtual: ${totalVirtual.toLocaleString('es-AR')}
      </p>
    `;

    detailsContent += billetesVirtualesHtml;
  }

  // Close the main div
  detailsContent += '</div>';

  // Show modal using SweetAlert2
  Swal.fire({
    title: `Máquina #${machine.machineId}`,
    html: detailsContent,
    width: isMobile ? '95%' : '700px',
    showCloseButton: true,
    showConfirmButton: false
  });
};

/**
 * Export results to Excel
 * @param {Object} data - The comparison results and summary
 * @returns {Promise} Promise resolving to export result
 */
export const exportToExcel = async (data) => {
  if (!data || !data.results || data.results.length === 0) {
    throw new Error('No hay resultados para exportar.');
  }
  
  try {
    // Use the imported function from API module
    const response = await generateComparisonReport(data);
    
    if (response && response.success) {
      return { success: true, message: 'Reporte generado correctamente' };
    } else {
      throw new Error(response?.message || 'Error al generar el reporte');
    }
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    throw error;
  }
};