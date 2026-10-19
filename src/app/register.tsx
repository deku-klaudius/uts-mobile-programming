import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { authService } from "../../lib/supabase";

export default function RegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setErrorMessage("Silahkan masukkan nama lengkap anda.");
      return;
    }
    if (!cleanEmail) {
      setErrorMessage("Silahkan masukkan alamat email anda.");
      return;
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Format email tidak valid.");
      return;
    }
    if (!cleanPhone) {
      setErrorMessage("Silahkan masukkan nomor HP anda.");
      return;
    }
    if (!password) {
      setErrorMessage("Silahkan buat password akun anda.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password minimal harus 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi password tidak cocok dengan password.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password,
      });

      // Pendaftaran berhasil, arahkan ke layar Sukses / Verifikasi Style 6
      router.push({
        pathname: "/success",
        params: {
          fullName: cleanName,
          email: cleanEmail,
          isFallback: String(res.isFallback),
        },
      });
    } catch (err: any) {
      const msg = err.message || "Gagal melakukan pendaftaran. Silakan coba lagi.";
      setErrorMessage(msg);
      Alert.alert("Gagal Mendaftar", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (platform: "Google" | "Facebook") => {
    Alert.alert(
      `Daftar dengan ${platform}`,
      `Fitur pendaftaran instan menggunakan ${platform} siap dihubungkan ke Supabase Auth.`,
      [{ text: "Tutup" }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← Kembali</Text>
            </TouchableOpacity>
            <View style={styles.styleBadge}>
              <Text style={styles.styleBadgeText}>Style 6 - Register</Text>
            </View>
          </View>

          {/* Illustration Section */}
          <View style={styles.illustrationCard}>
            <Image
              source={require("../../assets/images/illustrations/register-scooter.png")}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>

          {/* Form Inputs */}
          <View style={styles.formContainer}>
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Nama Lengkap */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Nama Lengkap"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={(t) => {
                  setFullName(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Nomor HP */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Nomor HP"
                placeholderTextColor="#94A3B8"
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                keyboardType="phone-pad"
              />
            </View>

            {/* Password */}
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIconText}>{showPassword ? "👁" : "👁‍🗨"}</Text>
              </TouchableOpacity>
            </View>

            {/* Konfirmasi Password */}
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Konfirmasi Password"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIconText}>{showConfirmPassword ? "👁" : "👁‍🗨"}</Text>
              </TouchableOpacity>
            </View>

            {/* Mendaftar Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>MENDAFTAR</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Atau daftar menggunakan</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.85}
              onPress={() => handleSocialRegister("Google")}
            >
              <View style={styles.socialContent}>
                <Text style={styles.googleLogo}>G</Text>
                <Text style={styles.googleButtonText}>Google</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.facebookButton}
              activeOpacity={0.85}
              onPress={() => handleSocialRegister("Facebook")}
            >
              <View style={styles.socialContent}>
                <Text style={styles.facebookLogo}>f</Text>
                <Text style={styles.facebookButtonText}>Facebook</Text>
              </View>
            </TouchableOpacity>

            {/* Footer: Sudah punya akun? silahkan masuk */}
            <View style={styles.footerRow}>
              <Text style={styles.footerNormalText}>Sudah punya akun? silahkan </Text>
              <TouchableOpacity
                onPress={() => router.push("/login")}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLinkText}>masuk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: 8,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: "#2B92E4",
    fontWeight: "600",
  },
  styleBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  styleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  illustrationCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  illustrationImage: {
    width: 200,
    height: 130,
  },
  formContainer: {
    marginTop: 6,
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorBannerText: {
    color: "#DC2626",
    fontSize: 13,
    textAlign: "center",
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1E293B",
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1E293B",
  },
  eyeIcon: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  eyeIconText: {
    fontSize: 16,
    color: "#64748B",
  },
  primaryButton: {
    backgroundColor: "#2B92E4",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    shadowColor: "#2B92E4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EA4335",
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  socialContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleLogo: {
    fontSize: 16,
    fontWeight: "900",
    color: "#EA4335",
    marginRight: 10,
  },
  googleButtonText: {
    color: "#EA4335",
    fontSize: 14,
    fontWeight: "600",
  },
  facebookButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#1877F2",
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  facebookLogo: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1877F2",
    marginRight: 10,
  },
  facebookButtonText: {
    color: "#1877F2",
    fontSize: 14,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  footerNormalText: {
    fontSize: 13,
    color: "#64748B",
  },
  footerLinkText: {
    fontSize: 13,
    color: "#2B92E4",
    fontWeight: "700",
  },
});