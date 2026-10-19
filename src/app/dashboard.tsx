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

const STORAGE_PROFILE_KEY = "@uts_student_profile_custom";

export default function DashboardScreen() {
  const router = useRouter();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Identitas Mahasiswa
  const [studentName, setStudentName] = useState("Klaudius Oe Naimnou");
  const [studentNim, setStudentNim] = useState("240444020010");
  const [studentClass, setStudentClass] = useState("Informatika Komputer (IK-24)");

  // Modal Ubah Profil
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempNim, setTempNim] = useState("");
  const [tempClass, setTempClass] = useState("");

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

      // Load custom profile if previously edited
      const profileRaw = await AsyncStorage.getItem(STORAGE_PROFILE_KEY);
      if (profileRaw) {
        const parsed = JSON.parse(profileRaw);
        if (parsed.name) setStudentName(parsed.name);
        if (parsed.nim) setStudentNim(parsed.nim);
        if (parsed.className) setStudentClass(parsed.className);
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
            Status Login: Berhasil Masuk ({user?.username || "admin@gmail.com"})
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

      {/* MODAL: UBAH IDENTITAS MAHASISWA */}
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
    paddingTop: 16,
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
    marginBottom: 16,
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
    marginBottom: 20,
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tableRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
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
