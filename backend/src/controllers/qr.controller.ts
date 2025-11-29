import QRCode from 'qrcode';
import { Request, Response } from 'express';

const IP = '172.20.31.62'

export async function getQR(req: Request, res: Response) {
  try {
    const serverIP = IP;
    const protocol = req.protocol;
    
    // Generate QR codes for both ports
    const url3001 = `${protocol}://${serverIP}:3001`;
    const url3002 = `${protocol}://${serverIP}:3002`;
    
    const qr3001 = await QRCode.toDataURL(url3001);
    const qr3002 = await QRCode.toDataURL(url3002);
    
    res.json({ 
      qr3001: qr3001,
      qr3002: qr3002,
      url3001: url3001,
      url3002: url3002
    });
  } catch (err) {
    console.error("QR Error:", err);
    res.status(500).json({ error: "Failed to generate QR" });
  }
};