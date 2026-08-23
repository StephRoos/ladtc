import PDFDocument from "pdfkit";

/**
 * Attestation d'inscription PDF generator.
 *
 * Produces a one-page A4 PDF matching the official Belgian sports club
 * registration certificate template. Members use this document to claim
 * a partial reimbursement from their mutuelle (health insurance).
 */

interface AttestationData {
  memberName: string;
  dateOfBirth: Date | null;
  season: string;
  amount: number;
  paidAt: Date;
}

/** Club header constants — change here if the club moves or the bureau changes. */
const CLUB_NAME = "La DTC";
const CLUB_TAGLINE = "Club de course à pied & trail";
const CLUB_ADDRESS = "Rue de Renaix 41 – 7890 Ellezelles";
const PRESIDENT_NAME = "Matthieu Deramée";

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
  const contentWidth = pageWidth - margin * 2;

  // ─── Header ──────────────────────────────────────────────────────────
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(`${CLUB_NAME} – ${CLUB_TAGLINE}`, { align: "left" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(CLUB_ADDRESS, { align: "left" });

  // Separator line
  const lineY = doc.y + 10;
  doc
    .moveTo(margin, lineY)
    .lineTo(pageWidth - margin, lineY)
    .lineWidth(0.5)
    .stroke();
  doc.moveDown(2);

  // ─── Title ──────────────────────────────────────────────────────────
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("ATTESTATION D'INSCRIPTION À UN CLUB SPORTIF", {
      align: "center",
    });
  doc.moveDown(2);

  // ─── Body ───────────────────────────────────────────────────────────
  doc.font("Helvetica").fontSize(11);

  doc.text(
    `Je soussigné ${PRESIDENT_NAME}, président du club ${CLUB_NAME}, certifie que :`,
    { align: "justify", lineGap: 4 },
  );
  doc.moveDown(1);

  const birthStr = data.dateOfBirth
    ? formatDate(data.dateOfBirth)
    : "....................................................................";
  const nameStr = data.memberName || "....................................................................";

  doc.text(`Nom, prénom du membre : ${nameStr}`, { lineGap: 4 });
  doc.moveDown(0.5);
  doc.text(`Date de naissance : ${birthStr}`, { lineGap: 4 });
  doc.moveDown(1);

  doc.text(
    `est affilié(e) à notre club de course à pied & trail pour la saison sportive ${data.season}.`,
    { align: "justify", lineGap: 4 },
  );
  doc.moveDown(1);

  doc.text(
    `Le montant de l'inscription s'élève à ${data.amount.toFixed(0)} €, versé à la date du : ${formatDate(data.paidAt)}.`,
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
    .lineWidth(0.5)
    .stroke();
  doc.moveDown(1.5);

  // ─── Signature block ────────────────────────────────────────────────
  const today = formatDate(new Date());
  doc.font("Helvetica").fontSize(11);
  doc.text(`Fait à Ellezelles, le ${today}`, { align: "left" });
  doc.moveDown(2);
  doc.font("Helvetica-Bold").text(PRESIDENT_NAME, { align: "left" });

  doc.moveDown(0.5);
  // Signature underline
  doc
    .moveTo(margin, doc.y)
    .lineTo(margin + 150, doc.y)
    .lineWidth(0.5)
    .stroke();
  doc.moveDown(2);

  // ─── Bureau ─────────────────────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Bureau du club :", { align: "left" });
  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(10);
  for (const line of BUREAU) {
    doc.text(line, { align: "left", lineGap: 2 });
  }

    doc.end();
  });
}
