import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Attestation d'inscription PDF generator.
 *
 * Produces a one-page A4 PDF matching the official Belgian sports club
 * registration certificate template. Members use this document to claim
 * a partial reimbursement from their mutuelle (health insurance).
 */

interface AttestationData {
  memberName: string;
  season: string;
  amount: number;
  paidAt: Date;
}

/** Club header constants — change here if the club moves or the bureau changes. */
const CLUB_NAME = "La DTC";
const CLUB_TAGLINE = "Club de course à pied & trail";
const CLUB_ADDRESS = "Rue de Renaix 41 – 7890 Ellezelles";
const PRESIDENT_NAME = "Matthieu Deramée";

/** Club brand color (orange #FF8C00). */
const CLUB_ORANGE = "#FF8C00";

const BUREAU = [
  "Président : Deramée Matthieu",
  "Vice-président : Carton-Delcourt Bruno",
  "Secrétaire : Carton-Delcourt Benoît",
  "Trésorier : Vanrechem François",
];

/** Formats a Date as DD/MM/YYYY (French/Belgian convention). */
function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Reorders a name from "Prénom Nom" to "Nom Prénom" for the attestation.
 * The database stores names as "Prénom Nom" (registration form concatenates
 * firstName + lastName), but the attestation label reads "Nom, prénom".
 * Only swaps the first and second word — multi-word names like
 * "Jean Carton-Delcourt" stay intact.
 */
function formatMemberName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  return `${parts.slice(1).join(" ")} ${parts[0]}`;
}

/**
 * Generates the attestation PDF as a Buffer.
 *
 * @param data - Member and payment information to fill into the template
 * @returns PDF file content as a Node Buffer
 */
export function generateAttestationPdf(data: AttestationData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const margin = 72;

    // ─── Logo (centered) ───────────────────────────────────────────────
    const logoPath = path.join(process.cwd(), "public/images/logo.png");
    if (fs.existsSync(logoPath)) {
      const logoWidth = 120;
      const logoHeight = 80;
      const logoX = (pageWidth - logoWidth) / 2;
      doc.image(logoPath, logoX, margin, { width: logoWidth, height: logoHeight });
      doc.y = margin + logoHeight + 15;
    }

  // ─── Header ──────────────────────────────────────────────────────────
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(CLUB_ORANGE)
    .text(`${CLUB_NAME} – ${CLUB_TAGLINE}`, { align: "left" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("black")
    .text(CLUB_ADDRESS, { align: "left" });

  // Separator line
  const lineY = doc.y + 10;
  doc
    .moveTo(margin, lineY)
    .lineTo(pageWidth - margin, lineY)
    .lineWidth(1)
    .strokeColor(CLUB_ORANGE)
    .stroke();
  doc.moveDown(2);

  // ─── Title ──────────────────────────────────────────────────────────
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(CLUB_ORANGE)
    .text("ATTESTATION D'INSCRIPTION À UN CLUB SPORTIF", {
      align: "center",
    });
  doc.moveDown(2);

  // ─── Body ───────────────────────────────────────────────────────────
  doc.font("Helvetica").fontSize(11).fillColor("black");

  doc.text(
    `Je soussigné ${PRESIDENT_NAME}, président du club ${CLUB_NAME}, certifie que :`,
    { align: "justify", lineGap: 4 },
  );
  doc.moveDown(1);

  const nameStr = data.memberName
    ? formatMemberName(data.memberName)
    : "....................................................................";

  doc.text(nameStr, { lineGap: 4 });
  doc.moveDown(1);

  doc.text(
    `est affilié(e) à notre club de course à pied & trail pour la saison sportive ${data.season}.`,
    { align: "justify", lineGap: 4 },
  );
  doc.moveDown(1);

  doc.text(
    `Le montant de l'inscription s'élève à ${data.amount.toFixed(0)} €, versé à la date du ${formatDate(data.paidAt)}.`,
    { align: "justify", lineGap: 4 },
  );
  doc.moveDown(1);

  doc.text(
    "Cette attestation est délivrée afin de permettre au membre de solliciter, auprès de sa mutuelle, le remboursement prévu dans le cadre des activités sportives.",
    { align: "justify", lineGap: 4 },
  );
  doc.moveDown(2);

  // Separator line
  const line2Y = doc.y;
  doc
    .moveTo(margin, line2Y)
    .lineTo(pageWidth - margin, line2Y)
    .lineWidth(1)
    .strokeColor(CLUB_ORANGE)
    .stroke();
  doc.moveDown(1.5);

  // ─── Signature block ────────────────────────────────────────────────
  const today = formatDate(new Date());
  doc.font("Helvetica").fontSize(11).fillColor("black");
  doc.text(`Fait à Ellezelles, le ${today}`, { align: "left" });
  doc.moveDown(1);

  // Signature and stamp images, placed side by side
  const signaturePath = path.join(process.cwd(), "public/images/signature.png");
  const stampPath = path.join(process.cwd(), "public/images/cachet.png");
  const sigY = doc.y;
  let hasSignature = false;

  if (fs.existsSync(signaturePath)) {
    doc.image(signaturePath, margin, sigY, { width: 130 });
    hasSignature = true;
  }
  if (fs.existsSync(stampPath)) {
    const stampX = hasSignature ? margin + 140 : margin;
    doc.image(stampPath, stampX, sigY, { width: 100 });
  }

  // Move below the signature/stamp block
  doc.y = sigY + 80;

  doc.font("Helvetica-Bold").fillColor(CLUB_ORANGE).text(PRESIDENT_NAME, { align: "left" });

  doc.moveDown(0.5);
  // Signature underline
  doc
    .moveTo(margin, doc.y)
    .lineTo(margin + 150, doc.y)
    .lineWidth(0.5)
    .strokeColor(CLUB_ORANGE)
    .stroke();
  doc.moveDown(2);

  // ─── Bureau ─────────────────────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(10).fillColor(CLUB_ORANGE);
  doc.text("Bureau du club :", { align: "left" });
  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(10).fillColor("black");
  for (const line of BUREAU) {
    doc.text(line, { align: "left", lineGap: 2 });
  }

    doc.end();
  });
}
