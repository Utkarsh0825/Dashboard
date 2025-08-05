import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface SyncStatusRow {
  tool: string;
  status: string;
  frequency: string;
  comments: string;
}

interface BusinessReportPDFProps {
  user: any;
  date: string;
  insights?: { summary?: string };
  recommendations?: string[];
  chartImages?: { scorecard?: string; attribution?: string };
  syncStatus?: SyncStatusRow[];
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 12,
    fontFamily: 'Helvetica',
    backgroundColor: '#f4f4f4',
  },
  header: {
    backgroundColor: '#fff',
    padding: 32,
    borderBottom: '2pt solid #222',
    marginBottom: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#444',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#fff',
    margin: 24,
    marginTop: 0,
    padding: 24,
    borderRadius: 8,
    // boxShadow removed for PDF compatibility
  },
  summary: {
    fontSize: 12,
    color: '#222',
    marginBottom: 16,
    lineHeight: 1.5,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  chartBox: {
    flex: 1,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginLeft: 8,
    padding: 8,
  },
  chartTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  tableSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  table: {
    display: 'flex', // changed from 'table' to 'flex' for PDF compatibility
    flexDirection: 'column',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#222',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    padding: 6,
    borderRight: '1pt solid #fff',
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    color: '#222',
    padding: 6,
    borderRight: '1pt solid #e9ecef',
    borderBottom: '1pt solid #e9ecef',
  },
  tableCellLast: {
    borderRight: 0,
  },
  recommendationsTitle: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#222',
    marginTop: 16,
    marginBottom: 6,
  },
  recommendation: {
    fontSize: 11,
    color: '#333',
    marginBottom: 2,
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#888',
    padding: 12,
  },
});

export function BusinessReportPDF({ user, date, insights, recommendations, chartImages, syncStatus }: BusinessReportPDFProps) {
  const safeSummary = insights && insights.summary ? insights.summary : 'No summary provided.';
  const safeRecommendations = recommendations || [];
  const safeChartImages = chartImages || {};
  const safeSyncStatus = syncStatus || [];

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Diagnostic Report: Data Hygiene & Business Clarity</Text>
        <Text style={styles.subtitle}>Date: {date} | Powered by NBLK</Text>
      </View>
      {/* Main Section */}
      <View style={styles.section}>
        {/* Executive Summary */}
        <Text style={styles.summary}>{safeSummary}</Text>
        {/* Charts Row (placeholders) */}
        <View style={styles.chartRow}>
          <View style={styles.chartBox}>
            <Text style={styles.chartTitle}>Data Consistency Scorecard</Text>
            <Text style={{ color: '#888', fontSize: 10 }}>[Chart Placeholder]</Text>
          </View>
          <View style={styles.chartBox}>
            <Text style={styles.chartTitle}>Source Attribution Health</Text>
            <Text style={{ color: '#888', fontSize: 10 }}>[Chart Placeholder]</Text>
          </View>
        </View>
        {/* Table Section */}
        <View style={styles.tableSection}>
          <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>Cross-Tool Sync Status</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Tool</Text>
              <Text style={styles.tableHeader}>Sync Status</Text>
              <Text style={styles.tableHeader}>Frequency</Text>
              <Text style={[styles.tableHeader, styles.tableCellLast]}>Comments</Text>
            </View>
            {safeSyncStatus.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>-</Text>
                <Text style={styles.tableCell}>-</Text>
                <Text style={styles.tableCell}>-</Text>
                <Text style={[styles.tableCell, styles.tableCellLast]}>-</Text>
              </View>
            ) : (
              safeSyncStatus.map((row: SyncStatusRow, idx: number) => (
                <View style={styles.tableRow} key={idx}>
                  <Text style={styles.tableCell}>{row.tool}</Text>
                  <Text style={styles.tableCell}>{row.status}</Text>
                  <Text style={styles.tableCell}>{row.frequency}</Text>
                  <Text style={[styles.tableCell, styles.tableCellLast]}>{row.comments}</Text>
                </View>
              ))
            )}
          </View>
        </View>
        {/* Recommendations */}
        <Text style={styles.recommendationsTitle}>Strategic Recommendations</Text>
        {safeRecommendations.length === 0 ? (
          <Text style={styles.recommendation}>-</Text>
        ) : (
          safeRecommendations.map((rec: string, idx: number) => (
            <Text style={styles.recommendation} key={idx}>• {rec}</Text>
          ))
        )}
      </View>
      {/* Footer */}
      <Text style={styles.footer}>
        NBLK Consulting | 442 5th Avenue, #2304, New York, NY 10018 | admin@nblkconsulting.com
      </Text>
    </Page>
  );
} 