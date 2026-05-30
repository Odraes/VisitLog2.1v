import QRCode from "qrcode";

/**
 * Generate a base64 PNG data URL encoding the given access code.
 * The result can be rendered directly in an <img src="..."> tag.
 */
export async function generateQRCodeDataURL(code: string): Promise<string> {
  return QRCode.toDataURL(code, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
  });
}
