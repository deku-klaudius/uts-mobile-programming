import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { authService, UserAccount } from "../../lib/auth";

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const user = await authService.getActiveSession();
      if (user) {
        setActiveUser(user);
      }
    } catch (e) {
      console.warn("Session check error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Badge */}
        <View style={styles.topBadgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>UTS Mobile Programming • LP3I</Text>
          </View>
        </View>

        {/* Hero Illustration */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={require("../../assets/images/illustrations/welcome-scooter.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Title & Subtitle */}
        <View style={styles.contentSection}>
          <Text style={styles.mainTitle}>Sistem Login & Registrasi</Text>
          <Text style={styles.subtitle}>
            Aplikasi Berfokus pada Module Login & Registrasi Berdasarkan Template Figma Style 6
          </Text>

          {/* Student Identity Card Sesuai Soal UTS */}
          <View style={styles.studentCard}>
            <View style={styles.studentCardHeader}>
              <View style={styles.avatarMini}>
                <Text style={styles.avatarMiniText}>KO</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.studentName}>Klaudius Oe Naimnou</Text>
                <Text style={styles.studentNim}>NIM: 240444020010</Text>
              </View>
              <View style={styles.styleBadge}>
                <Text style={styles.styleBadgeText}>Style 6</Text>
              </View>
            </View>

            <View style={styles.studentDivider} />

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Mata Kuliah:</Text>
              <Text style={styles.metaValue}>Mobile Programming</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Dosen Pengampu:</Text>
              <Text style={styles.metaValue}>Sata Lesmana, M.Kom.</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Program / Kelas:</Text>
              <Text style={styles.metaValue}>Informatika Komputer (IK-24)</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#2B92E4" style={{ marginVertical: 20 }} />
          ) : activeUser ? (
            <View style={styles.sessionBox}>
              <Text style={styles.sessionText}>
                Sesi aktif: <Text style={{ fontWeight: "700" }}>{activeUser.fullName}</Text>
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={() => router.push("/dashboard")}
              >
                <Text style={styles.primaryButtonText}>Lanjut ke Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.textButton}
                activeOpacity={0.7}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.textButtonLabel}>Ganti Akun / Login Lain</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.primaryButtonText}>Masuk / Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.85}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.secondaryButtonText}>Daftar Akun Baru</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  topBadgeContainer: {
    alignItems: "center",
    marginTop: 6,
  },
  badge: {
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#B8DCF9",
  },
  badgeText: {
    color: "#1877F2",
    fontSize: 12,
    fontWeight: "700",
  },
  illustrationWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 14,
  },
  heroImage: {
    width: 210,
    height: 180,
  },
  contentSection: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  studentCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  studentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarMini: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2B92E4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMiniText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  studentNim: {
    fontSize: 12,
    color: "#64748B",
  },
  styleBadge: {
    backgroundColor: "#2B92E4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  styleBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  studentDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
  },
  actionContainer: {
    marginTop: "auto",
    paddingTop: 8,
  },
  sessionBox: {
    alignItems: "center",
    marginBottom: 10,
  },
  sessionText: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 10,
  },
  buttonGroup: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#2B92E4",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2B92E4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2B92E4",
  },
  secondaryButtonText: {
    color: "#2B92E4",
    fontSize: 15,
    fontWeight: "700",
  },
  textButton: {
    paddingVertical: 8,
  },
  textButtonLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
});