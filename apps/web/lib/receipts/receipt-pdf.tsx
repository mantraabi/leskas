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
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1C1B19",
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 18,
    borderBottomWidth: 2,
    marginBottom: 22,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: "contain",
  },
  brandText: {
    flexDirection: "column",
  },
  brandName: {
    fontSize: 13,
    fontWeight: "bold",
  },
  brandSub: {
    fontSize: 9,
    color: "#6B6860",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  receiptNumber: {
    fontSize: 9,
    color: "#6B6860",
    marginTop: 4,
  },
  body: {
    marginBottom: 26,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: 130,
    color: "#6B6860",
    fontSize: 10,
  },
  value: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
  },
  amountBox: {
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 6,
  },
  amountLabel: {
    fontSize: 9,
    color: "#6B6860",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  terbilangText: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#6B6860",
    marginTop: 6,
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#F5F4F0",
    borderRadius: 4,
    fontSize: 9,
    color: "#6B6860",
  },
  signature: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signatureBox: {
    width: 200,
    alignItems: "center",
  },
  signatureLine: {
    marginTop: 50,
    borderTopWidth: 1,
    borderTopColor: "#1C1B19",
    width: "100%",
    paddingTop: 4,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 24,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF",
    paddingTop: 8,
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
      <Page size="A5" orientation="landscape" style={styles.page}>
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
