import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { terbilang } from "./terbilang";

export interface ReceiptData {
  receiptNumber: string;
  paidAt: string; // ISO
  amount: number;
  studentName: string;
  parentName: string | null;
  subject: string;
  invoiceNumber: string | null;
  invoiceDueDate: string;
  invoiceNotes: string | null;
  paymentMethod: string | null;
  /** Nama guru / penyelenggara les */
  guruName: string;
  guruPhone: string | null;
  /** Branding (Business plan) */
  brandLogoUrl: string | null;
  brandColor: string | null;
  /** Cabang (Business plan) */
  branchName: string | null;
  branchAddress: string | null;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatTanggal(iso: string): string {
  const d = new Date(iso);
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1C1B19",
    lineHeight: 1.35,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 12,
    borderBottomWidth: 2,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    objectFit: "contain",
  },
  brandText: {
    flexDirection: "column",
  },
  brandName: {
    fontSize: 12,
    fontWeight: "bold",
  },
  brandSub: {
    fontSize: 8,
    color: "#6B6860",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  receiptNumber: {
    fontSize: 8,
    color: "#6B6860",
    marginTop: 3,
  },
  body: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 110,
    color: "#6B6860",
    fontSize: 9,
  },
  value: {
    flex: 1,
    fontSize: 9,
    fontWeight: "bold",
  },
  amountBox: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 4,
  },
  amountLabel: {
    fontSize: 8,
    color: "#6B6860",
    marginBottom: 3,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  terbilangText: {
    fontSize: 8,
    fontStyle: "italic",
    color: "#6B6860",
    marginTop: 4,
  },
  notes: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#F5F4F0",
    borderRadius: 3,
    fontSize: 8,
    color: "#6B6860",
  },
  signature: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signatureBox: {
    width: 160,
    alignItems: "center",
  },
  signatureLine: {
    marginTop: 36,
    borderTopWidth: 1,
    borderTopColor: "#1C1B19",
    width: "100%",
    paddingTop: 3,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 7,
    color: "#9CA3AF",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E4E2DC",
  },
});

export function ReceiptPDF({ data, branded }: { data: ReceiptData; branded: boolean }) {
  const accent = branded && data.brandColor ? data.brandColor : "#1C1B19";
  const showLogo = branded && data.brandLogoUrl;

  return (
    <Document
      title={`Kwitansi ${data.receiptNumber}`}
      author={data.guruName}
      subject={`Pembayaran les ${data.subject}`}
    >
      <Page size="A5" orientation="portrait" style={styles.page}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <View style={styles.headerLeft}>
            {showLogo && data.brandLogoUrl && (
              <Image src={data.brandLogoUrl} style={styles.logo} />
            )}
            <View style={styles.brandText}>
              <Text style={styles.brandName}>{data.guruName}</Text>
              <Text style={styles.brandSub}>
                {data.branchName
                  ? `${data.branchName}${data.branchAddress ? ` · ${data.branchAddress}` : ""}`
                  : "Les Privat"}
              </Text>
              {data.guruPhone && (
                <Text style={styles.brandSub}>WA: {data.guruPhone}</Text>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.receiptTitle, { color: accent }]}>KWITANSI</Text>
            <Text style={styles.receiptNumber}>No: {data.receiptNumber}</Text>
            <Text style={styles.receiptNumber}>
              Tanggal: {formatTanggal(data.paidAt)}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.label}>Telah diterima dari</Text>
            <Text style={styles.value}>
              {data.parentName || `Orang tua/wali ${data.studentName}`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Untuk pembayaran</Text>
            <Text style={styles.value}>
              Les {data.subject} - {data.studentName}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Periode tagihan</Text>
            <Text style={styles.value}>
              Jatuh tempo {formatTanggal(data.invoiceDueDate)}
            </Text>
          </View>
          {data.paymentMethod && (
            <View style={styles.row}>
              <Text style={styles.label}>Metode pembayaran</Text>
              <Text style={styles.value}>{data.paymentMethod}</Text>
            </View>
          )}

          <View style={[styles.amountBox, { borderColor: accent }]}>
            <Text style={styles.amountLabel}>Jumlah dibayar</Text>
            <Text style={[styles.amountValue, { color: accent }]}>
              {formatRupiah(data.amount)}
            </Text>
            <Text style={styles.terbilangText}>
              Terbilang: {terbilang(data.amount)}
            </Text>
          </View>

          {data.invoiceNotes && (
            <Text style={styles.notes}>Catatan: {data.invoiceNotes}</Text>
          )}
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <View style={styles.signatureBox}>
            <Text style={{ fontSize: 9, color: "#6B6860" }}>
              {data.branchName ?? ""}
              {data.branchName ? ", " : ""}
              {formatTanggal(data.paidAt)}
            </Text>
            <Text style={styles.signatureLine}>{data.guruName}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Kwitansi ini sah dan diterbitkan secara elektronik · Dicetak via LesKas
        </Text>
      </Page>
    </Document>
  );
}
