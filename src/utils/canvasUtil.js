/**
 * Utilidad para configurar y trabajar con canvas en React
 */

/**
 * Configura un canvas de forma segura y obtiene su contexto 2D
 * @param {string} canvasId - ID del elemento canvas
 * @param {number} width - Ancho deseado del canvas
 * @param {number} height - Alto deseado del canvas
 * @returns {CanvasRenderingContext2D|null} - Contexto del canvas o null si hay error
 */
export function setupCanvas(canvasId, width, height) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`No se encontró el canvas con ID: ${canvasId}`);
      return null;
    }
    
    // Establecer dimensiones físicas del canvas
    canvas.width = width || canvas.offsetWidth || 400; 
    canvas.height = height || canvas.offsetHeight || 300;
    
    try {
      // Usar willReadFrequently como opción en getContext, no como prop de React
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      return ctx;
    } catch (e) {
      console.error("Error al obtener el contexto del canvas:", e);
      return null;
    }
  }
  
  /**
   * Dibuja un cuadro de detección de código de barras
   * @param {string} canvasId - ID del elemento canvas
   * @param {Array} box - Array de puntos del cuadro de detección
   * @param {string} color - Color del cuadro (formato CSS)
   */
  export function drawDetectionBox(canvasId, box, color = '#00FF00') {
    const ctx = setupCanvas(canvasId);
    if (!ctx || !box || !box.length) return;
  
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    // Validar si el box tiene el formato esperado
    if (Array.isArray(box[0])) {
      // Formato [[x1,y1], [x2,y2], ...]
      ctx.moveTo(box[0][0], box[0][1]);
      box.forEach(point => {
        ctx.lineTo(point[0], point[1]);
      });
    } else if (box.length >= 4) {
      // Formato alternativo {x1, y1, x2, y2, ...}
      ctx.rect(box.x, box.y, box.width, box.height);
    }
    
    ctx.closePath();
    ctx.stroke();
  }
  
  /**
   * Dibuja una línea de escaneo
   * @param {string} canvasId - ID del elemento canvas
   * @param {Object} line - Línea con formato {x: start.x, y: start.y} y {x: end.x, y: end.y}
   * @param {string} color - Color de la línea (formato CSS)
   */
  export function drawScanLine(canvasId, line, color = '#FF3B58') {
    const ctx = setupCanvas(canvasId);
    if (!ctx || !line) return;
  
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    if (line[0] && line[1]) {
      ctx.moveTo(line[0].x, line[0].y);
      ctx.lineTo(line[1].x, line[1].y);
    }
    ctx.stroke();
  }
  
  /**
   * Formatea información del código escaneado para mostrar en SweetAlert
   * @param {string} code - El código detectado
   * @param {string} format - El formato del código (ej: 'code_128', 'i2of5')
   * @param {string} readerType - Tipo de lector utilizado
   * @returns {string} - HTML formateado para mostrar en SweetAlert
   */
  export function formatBarcodeInfo(code, format, readerType) {
    // Mapa de formatos a nombres amigables
    const formatNames = {
      'code_128': 'Code 128',
      'code_39': 'Code 39',
      'code_39_vin': 'Code 39 VIN',
      'ean': 'EAN-13',
      'ean_8': 'EAN-8',
      'upc': 'UPC-A',
      'upc_e': 'UPC-E',
      'codabar': 'Codabar',
      'i2of5': 'Interleaved 2 of 5 (ITF)',
      '2of5': 'Standard 2 of 5',
      'code_93': 'Code 93'
    };
    
    // Obtener nombre amigable del formato
    const formatName = formatNames[format] || format;
    
    return `
      <div style="text-align: left; margin-bottom: 15px;">
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h3 style="margin-top: 0; color: #0d6efd;">Información del código</h3>
          <p style="margin-bottom: 8px;"><strong>Valor:</strong> <span style="font-family: monospace; font-size: 1.1em; background: #e9ecef; padding: 2px 6px; border-radius: 4px;">${code}</span></p>
          <p style="margin-bottom: 8px;"><strong>Formato:</strong> ${formatName}</p>
          <p style="margin-bottom: 0;"><strong>Tipo:</strong> ${readerType}</p>
        </div>
        <p style="font-size: 0.9em; color: #6c757d;">El código será enviado al sistema para su procesamiento.</p>
      </div>
    `;
  }