import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  authService,
  UserData,
  NoteItem,
  isSupabaseConfigured,
} from "../../lib/supabase";

export default function DashboardScreen() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick Notes state
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const activeUser = await authService.getActiveSession();
      if (!activeUser) {
        // Jika tidak ada sesi, redirect ke login
        router.replace("/login");
        return;
      }
      setUser(activeUser);

      const savedNotes = await authService.getNotes();
      setNotes(savedNotes);
    } catch (e) {
      console.warn("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Keluar",
      "Apakah anda yakin ingin keluar dari akun?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            await authService.logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  const handleAddNote = async () => {
    if (!newNoteTitle.trim()) {
      Alert.alert("Perhatian", "Judul catatan tidak boleh kosong.");
      return;
    }

    setSavingNote(true);
    try {
      const updated = await authService.addNote(
        newNoteTitle.trim(),
        newNoteContent.trim() || "-"
      );
      setNotes(updated);
      setNewNoteTitle("");
      setNewNoteContent("");
      setModalVisible(false);
      Alert.alert("Berhasil", "Catatan berhasil ditambahkan!");
    } catch (e: any) {
      Alert.alert("Gagal", e.message || "Gagal menyimpan catatan.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = (id: string) => {
    Alert.alert("Hapus Catatan", "Hapus catatan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          const updated = await authService.deleteNote(id);
          setNotes(updated);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color="#2B92E4" />
        <Text style={{ marginTop: 12, color: "#64748B", fontSize: 14 }}>
          Memuat Dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "KO";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>
              Halo, {user?.fullName || "Klaudius"}! 👋
            </Text>
            <Text style={styles.subGreetingText}>
              Selamat datang di Dashboard Mahasiswa
            </Text>
          </View>

          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
        </View>

        {/* Database Status Banner */}
        <View
          style={[
            styles.statusBanner,
            user?.source === "supabase"
              ? styles.statusSupabase
              : styles.statusLocal,
          ]}
        >
          <View style={styles.statusDot} />
          <Text style={styles.statusBannerText}>
            {user?.source === "supabase"
              ? "🟢 Terhubung ke Supabase Cloud Database"
              : "🟡 Mode Lokal / Offline Storage Aktif"}
          </Text>
        </View>

        {/* Identitas Mahasiswa (KETENTUAN UTAMA SOAL UTS) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🎓 Identitas Mahasiswa (UTS)</Text>
            <View style={styles.badgePrimary}>
              <Text style={styles.badgePrimaryText}>Style 6</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Nama Mahasiswa</Text>
            <Text style={styles.tableValue}>Klaudius Oe Naimnou</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>NIM</Text>
            <Text style={styles.tableValue}>240444020010</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Kelas</Text>
            <Text style={styles.tableValue}>Informatika Komputer (IK-24)</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Mata Kuliah</Text>
            <Text style={styles.tableValue}>Mobile Programming</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Dosen Pengampu</Text>
            <Text style={styles.tableValue}>Sata Lesmana, M.Kom.</Text>
          </View>

          <View style={styles.tableRowLast}>
            <Text style={styles.tableLabel}>Akun Login Saat Ini</Text>
            <Text style={[styles.tableValue, { color: "#2B92E4" }]}>
              {user?.email || "dekuizuku811@gmail.com"}
            </Text>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📚</Text>
            <Text style={styles.statValue}>4 SKS</Text>
            <Text style={styles.statLabel}>Beban SKS</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={styles.statValue}>200 Menit</Text>
            <Text style={styles.statLabel}>Waktu Ujian</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statValue}>Selesai</Text>
            <Text style={styles.statLabel}>Status UTS</Text>
          </View>
        </View>

        {/* Jadwal Kuliah Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Jadwal Perkuliahan Hari Ini</Text>

          <View style={styles.scheduleItem}>
            <View style={styles.scheduleTimeBadge}>
              <Text style={styles.scheduleTimeText}>08:00 - 11:20</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.scheduleSubject}>Mobile Programming</Text>
              <Text style={styles.scheduleDetail}>
                Dosen: Sata Lesmana, M.Kom. • Lab Komputer 2
              </Text>
            </View>
          </View>

          <View style={styles.scheduleItem}>
            <View
              style={[
                styles.scheduleTimeBadge,
                { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
              ]}
            >
              <Text style={[styles.scheduleTimeText, { color: "#1D4ED8" }]}>
                13:00 - 15:30
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.scheduleSubject}>Rekayasa Perangkat Lunak</Text>
              <Text style={styles.scheduleDetail}>
                Teori & Praktik Basis Data • Ruang Teori 104
              </Text>
            </View>
          </View>
        </View>

        {/* Fitur Sederhana: Catatan Cepat Mahasiswa */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📝 Catatan Cepat Mahasiswa</Text>
            <TouchableOpacity
              style={styles.addNoteBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.addNoteBtnText}>+ Tambah</Text>
            </TouchableOpacity>
          </View>

          {notes.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada catatan. Tambah sekarang!</Text>
          ) : (
            notes.map((item) => (
              <View key={item.id} style={styles.noteItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.noteTitle}>{item.title}</Text>
                  <Text style={styles.noteContent}>{item.content}</Text>
                  <Text style={styles.noteDate}>{item.createdAt}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteNote(item.id)}
                  style={styles.deleteNoteBtn}
                >
                  <Text style={styles.deleteNoteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Action Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutButtonText}>Keluar / Logout Akun</Text>
        </TouchableOpacity>

        <Text style={styles.footerCopyright}>
          UTS Mobile Programming 2026/2027 • LP3I
        </Text>
      </ScrollView>

      {/* Modal Tambah Catatan */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Catatan Baru</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Judul catatan (contoh: Link GitHub UTS)"
              placeholderTextColor="#94A3B8"
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
            />

            <TextInput
              style={[styles.modalInput, { height: 90, textAlignVertical: "top" }]}
              placeholder="Isi catatan..."
              placeholderTextColor="#94A3B8"
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleAddNote}
                disabled={savingNote}
              >
                {savingNote ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  subGreetingText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2B92E4",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2B92E4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  statusSupabase: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  statusLocal: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 8,
  },
  statusBannerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#065F46",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  badgePrimary: {
    backgroundColor: "#2B92E4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgePrimaryText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tableRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  tableLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  tableValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  scheduleTimeBadge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  scheduleTimeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  scheduleSubject: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  scheduleDetail: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  addNoteBtn: {
    backgroundColor: "#2B92E4",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addNoteBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginVertical: 12,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  noteContent: {
    fontSize: 12,
    color: "#475569",
    marginTop: 3,
  },
  noteDate: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 4,
  },
  deleteNoteBtn: {
    padding: 8,
    marginLeft: 6,
  },
  deleteNoteBtnText: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginTop: 8,
    marginBottom: 16,
  },
  logoutButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
  },
  footerCopyright: {
    textAlign: "center",
    fontSize: 11,
    color: "#94A3B8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#1E293B",
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  modalSaveBtn: {
    backgroundColor: "#2B92E4",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalSaveText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
