const crypto = require('crypto');
const AdmZip = require('adm-zip');

// Minimal 1x1 transparent PNG buffer to satisfy Apple Wallet bundle requirements
const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

class WalletService {
  /**
   * Gera um buffer binário do arquivo .pkpass (Apple Wallet Pass)
   * compatível com a especificação PassKit da Apple.
   */
  generateAppleWalletPass(ticket) {
    const passengerName = ticket.passengerName || 'Guilherme Santos';
    const departure = (ticket.departure || 'São Paulo').split(' - ')[0];
    const arrival = (ticket.arrival || 'Rio de Janeiro').split(' - ')[0];
    const seat = String(ticket.seat || '14');
    const ticketId = ticket.ticketId || 'ITG-4829-SP';
    const qrMessage = ticket.utHash || ticketId;

    const passJson = {
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.integra.boardingpass',
      serialNumber: ticketId,
      teamIdentifier: 'INTEGRA',
      organizationName: 'ClickBus - ÍNTEGRA',
      description: 'Passagem Digital ÍNTEGRA',
      logoText: 'ÍNTEGRA',
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(26, 5, 51)',
      labelColor: 'rgb(190, 150, 235)',
      boardingPass: {
        transitType: 'PKTransitTypeBus',
        headerFields: [
          {
            key: 'seat',
            label: 'POLTRONA',
            value: seat,
          },
        ],
        primaryFields: [
          {
            key: 'origin',
            label: 'ORIGEM',
            value: departure,
          },
          {
            key: 'destination',
            label: 'DESTINO',
            value: arrival,
          },
        ],
        secondaryFields: [
          {
            key: 'passenger',
            label: 'PASSAGEIRO',
            value: passengerName,
          },
          {
            key: 'terminal',
            label: 'EMBARQUE',
            value: 'Terminal Tietê · P8',
          },
        ],
        auxiliaryFields: [
          {
            key: 'departTime',
            label: 'HORÁRIO',
            value: '14:30',
          },
          {
            key: 'ticketRef',
            label: 'BILHETE',
            value: ticketId.slice(0, 12),
          },
        ],
      },
      barcodes: [
        {
          format: 'PKBarcodeFormatQR',
          message: qrMessage,
          messageEncoding: 'iso-8859-1',
          altText: 'Apresente para embarque',
        },
      ],
      barcode: {
        format: 'PKBarcodeFormatQR',
        message: qrMessage,
        messageEncoding: 'iso-8859-1',
        altText: 'Apresente para embarque',
      },
    };

    const passBuffer = Buffer.from(JSON.stringify(passJson, null, 2), 'utf8');

    // Montar o ZIP .pkpass
    const zip = new AdmZip();
    zip.addFile('pass.json', passBuffer);
    zip.addFile('icon.png', PIXEL_PNG);
    zip.addFile('icon@2x.png', PIXEL_PNG);
    zip.addFile('logo.png', PIXEL_PNG);
    zip.addFile('logo@2x.png', PIXEL_PNG);

    // Calcular hashes para o manifest.json
    const manifest = {
      'pass.json': crypto.createHash('sha1').update(passBuffer).digest('hex'),
      'icon.png': crypto.createHash('sha1').update(PIXEL_PNG).digest('hex'),
      'icon@2x.png': crypto.createHash('sha1').update(PIXEL_PNG).digest('hex'),
      'logo.png': crypto.createHash('sha1').update(PIXEL_PNG).digest('hex'),
      'logo@2x.png': crypto.createHash('sha1').update(PIXEL_PNG).digest('hex'),
    };
    zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'));

    return zip.toBuffer();
  }
}

module.exports = new WalletService();
