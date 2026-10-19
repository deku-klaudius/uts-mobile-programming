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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService, UserAccount } from "../../lib/auth";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  date: string;
}

const STORAGE_NOTES_KEY = "@uts_notes_dashboard";
const STORAGE_PROFILE_KEY = "@uts_student_profile_custom";

export default function DashboardScreen() {
  const router = useRouter();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Identitas Mahasiswa yang bisa diubah (Editable Student Profile)
  const [studentName, setStudentName] = useState("Klaudius Oe Naimnou");
  const [studentNim, setStudentNim] = useState("240444020010");
  const [studentClass, setStudentClass] = useState("Informatika Komputer (IK-24)");

  // Modal Ubah Profil
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempNim, setTempNim] = useState("");
  const [tempClass, setTempClass] = useState("");

  // Quick Notes state (Tambah & Ubah & Hapus)
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const activeUser = await authService.getActiveSession();
      if (!activeUser) {
        router.replace("/login");
        return;
      }
      setUser(activeUser);

      // Load custom profile if edited
      const profileRaw = await AsyncStorage.getItem(STORAGE_PROFILE_KEY);
      if (profileRaw) {
        const parsed = JSON.parse(profileRaw);
        if (parsed.name) setStudentName(parsed.name);
        if (parsed.nim) setStudentNim(parsed.nim);
        if (parsed.className) setStudentClass(parsed.className);
      }

      // Load notes
      const notesRaw = await AsyncStorage.getItem(STORAGE_NOTES_KEY);
      if (notesRaw) {
        setNotes(JSON.parse(notesRaw));
      } else {
        const defaultNotes: NoteItem[] = [
          {
            id: "1",
            title: "Tugas UTS Mobile Programming",
            content: "Dosen: Sata Lesmana, M.Kom. • Selesai dikerjakan sesuai Style 6",
            date: new Date().toLocaleDateString("id-ID"),
          },
          {
            id: "2",
            title: "Status Akun Login",
            content: "Berhasil masuk menggunakan akun: admin@gmail.com (test123)",
            date: new Date().toLocaleDateString("id-ID"),
          },
        ];
        setNotes(defaultNotes);
        await AsyncStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(defaultNotes));
      }
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

  // --- LOGIKA EDIT & HAPUS IDENTITAS MAHASISWA ---
  const handleOpenEditProfile = () => {
    setTempName(studentName);
    setTempNim(studentNim);
    setTempClass(studentClass);
    setProfileModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!tempName.trim()) {
      Alert.alert("Perhatian", "Nama tidak boleh kosong.");
      return;
    }
    const updatedProfile = {
      name: tempName.trim(),
      nim: tempNim.trim() || studentNim,
      className: tempClass.trim() || studentClass,
    };
    setStudentName(updatedProfile.name);
    setStudentNim(updatedProfile.nim);
    setStudentClass(updatedProfile.className);
    await AsyncStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updatedProfile));
    setProfileModalVisible(false);
    Alert.alert("Berhasil", "Data identitas mahasiswa berhasil diperbarui!");
  };

  const handleResetProfile = async () => {
    const defaultProfile = {
      name: "Klaudius Oe Naimnou",
      nim: "240444020010",
      className: "Informatika Komputer (IK-24)",
    };
    setStudentName(defaultProfile.name);
    setStudentNim(defaultProfile.nim);
    setStudentClass(defaultProfile.className);
    await AsyncStorage.removeItem(STORAGE_PROFILE_KEY);
    setProfileModalVisible(false);
    Alert.alert("Direset", "Identitas dikembalikan ke default data mahasiswa!");
  };

  // --- LOGIKA TAMBAH, UBAH & HAPUS CATATAN ---
  const handleOpenAddNote = () => {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteModalVisible(true);
  };

  const handleOpenEditNote = (item: NoteItem) => {
    setEditingNoteId(item.id);
    setNoteTitle(item.title);
    setNoteContent(item.content);
    setNoteModalVisible(true);
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) {
      Alert.alert("Perhatian", "Judul catatan tidak boleh kosong.");
      return;
    }

    setSavingNote(true);
    try {
      if (editingNoteId) {
        // Mode UBAH (Edit)
        const updated = notes.map((n) =>
          n.id === editingNoteId
            ? {
                ...n,
                title: noteTitle.trim(),
                content: noteContent.trim() || "-",
                date: new Date().toLocaleDateString("id-ID") + " (diedit)",
              }
            : n
        );
        setNotes(updated);
        await AsyncStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(updated));
        Alert.alert("Berhasil", "Catatan berhasil diperbarui!");
      } else {
        // Mode TAMBAH (Add)
        const newNote: NoteItem = {
          id: String(Date.now()),
          title: noteTitle.trim(),
          content: noteContent.trim() || "-",
          date: new Date().toLocaleDateString("id-ID"),
        };
        const updated = [newNote, ...notes];
        setNotes(updated);
        await AsyncStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(updated));
        Alert.alert("Berhasil", "Catatan baru berhasil ditambahkan!");
      }

      setNoteModalVisible(false);
      setEditingNoteId(null);
      setNoteTitle("");
      setNoteContent("");
    } catch (e: any) {
      Alert.alert("Gagal", e.message || "Gagal menyimpan catatan.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = (id: string) => {
    Alert.alert("Hapus Catatan", "Apakah anda yakin ingin menghapus catatan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          const updated = notes.filter((n) => n.id !== id);
          setNotes(updated);
          await AsyncStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(updated));
          Alert.alert("Dihapus", "Catatan telah berhasil dihapus.");
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

  const userInitials = studentName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
              Halo, {studentName}! 👋
            </Text>
            <Text style={styles.subGreetingText}>
              Dashboard Utama • Sata Lesmana, M.Kom.
            </Text>
          </View>

          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{userInitials || "KO"}</Text>
          </View>
        </View>

        {/* Status Login Sukses Banner */}
        <View style={styles.statusSuccessBanner}>
          <View style={styles.statusDot} />
          <Text style={styles.statusSuccessBannerText}>
            Status Login: Berhasil Masuk ({user?.username})
          </Text>
        </View>

        {/* Identitas Mahasiswa (KETENTUAN UTAMA SOAL UTS DARI DOSEN) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🎓 Identitas Mahasiswa (UTS)</Text>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={handleOpenEditProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.editProfileButtonText}>✏️ Ubah Data</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Nama Mahasiswa</Text>
            <Text style={styles.tableValue}>{studentName}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>NIM</Text>
            <Text style={styles.tableValue}>{studentNim}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Kelas</Text>
            <Text style={styles.tableValue}>{studentClass}</Text>
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
              {user?.email || "admin@gmail.com"}
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
            <Text style={styles.statLabel}>Waktu UTS</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statValue}>Selesai</Text>
            <Text style={styles.statLabel}>Status Modul</Text>
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
                Dosen: Sata Lesmana, M.Kom. • Lab Komputer
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
                Praktikum Basis Data • Ruang Teori 104
              </Text>
            </View>
          </View>
        </View>

        {/* Fitur Sederhana: Catatan Cepat Mahasiswa (Ada Tombol Ubah & Hapus) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>📝 Catatan Cepat Mahasiswa</Text>
              <Text style={styles.cardSubtitle}>
                Bisa Tambah, Ubah (Edit), atau Hapus catatan
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addNoteBtn}
              onPress={handleOpenAddNote}
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
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.noteTitle}>{item.title}</Text>
                  <Text style={styles.noteContent}>{item.content}</Text>
                  <Text style={styles.noteDate}>{item.date}</Text>
                </View>

                {/* Tombol UBAH dan HAPUS yang JELAS */}
                <View style={styles.noteActionsRow}>
                  <TouchableOpacity
                    onPress={() => handleOpenEditNote(item)}
                    style={styles.actionBtnEdit}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.actionBtnEditText}>✏️ Ubah</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteNote(item.id)}
                    style={styles.actionBtnDelete}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.actionBtnDeleteText}>🗑️ Hapus</Text>
                  </TouchableOpacity>
                </View>
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

      {/* MODAL 1: UBAH IDENTITAS MAHASISWA */}
      <Modal
        visible={profileModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ Ubah Identitas Mahasiswa</Text>

            <Text style={styles.inputFieldLabel}>Nama Lengkap:</Text>
            <TextInput
              style={styles.modalInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Nama Lengkap"
            />

            <Text style={styles.inputFieldLabel}>NIM:</Text>
            <TextInput
              style={styles.modalInput}
              value={tempNim}
              onChangeText={setTempNim}
              placeholder="NIM Mahasiswa"
              keyboardType="number-pad"
            />

            <Text style={styles.inputFieldLabel}>Kelas / Rombel:</Text>
            <TextInput
              style={styles.modalInput}
              value={tempClass}
              onChangeText={setTempClass}
              placeholder="Kelas (cth: Informatika Komputer)"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={handleResetProfile}
              >
                <Text style={styles.modalResetText}>Reset Asli</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalSaveText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: TAMBAH / UBAH CATATAN */}
      <Modal
        visible={noteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingNoteId ? "✏️ Ubah Catatan" : "📝 Tambah Catatan Baru"}
            </Text>

            <Text style={styles.inputFieldLabel}>Judul Catatan:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Judul catatan"
              placeholderTextColor="#94A3B8"
              value={noteTitle}
              onChangeText={setNoteTitle}
            />

            <Text style={styles.inputFieldLabel}>Isi Catatan:</Text>
            <TextInput
              style={[styles.modalInput, { height: 90, textAlignVertical: "top" }]}
              placeholder="Isi catatan..."
              placeholderTextColor="#94A3B8"
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
            />

            <View style={styles.modalActions}>
              {editingNoteId ? (
                <TouchableOpacity
                  style={styles.modalDeleteInsideBtn}
                  onPress={() => {
                    setNoteModalVisible(false);
                    handleDeleteNote(editingNoteId);
                  }}
                >
                  <Text style={styles.modalDeleteInsideText}>🗑️ Hapus</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setNoteModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveNote}
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
    marginBottom: 14,
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
  statusSuccessBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginBottom: 14,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 8,
  },
  statusSuccessBannerText: {
    fontSize: 12,
    fontWeight: "700",
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
  cardSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  editProfileButton: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  editProfileButtonText: {
    color: "#1D4ED8",
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
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  noteContent: {
    fontSize: 12,
    color: "#475569",
    marginTop: 3,
    lineHeight: 18,
  },
  noteDate: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 6,
  },
  noteActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  actionBtnEdit: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#93C5FD",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionBtnEditText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  actionBtnDelete: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionBtnDeleteText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
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
    maxWidth: 380,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  inputFieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: "#1E293B",
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  modalResetBtn: {
    marginRight: "auto",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  modalResetText: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "700",
  },
  modalDeleteInsideBtn: {
    marginRight: "auto",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modalDeleteInsideText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "700",
  },
  modalCancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  modalSaveBtn: {
    backgroundColor: "#2B92E4",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  modalSaveText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
