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
import { authService, DEFAULT_ACCOUNTS } from "../../lib/auth";

export default function LoginScreen() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage("Silahkan masukkan username atau email anda.");
      return;
    }
    if (!password) {
      setErrorMessage("Silahkan masukkan password anda.");
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(cleanId, password);
      // Berhasil login
      router.replace("/dashboard");
    } catch (err: any) {
      const msg = err.message || "Gagal masuk. Periksa kembali username dan password.";
      setErrorMessage(msg);
      Alert.alert("Gagal Masuk", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoAccount = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setErrorMessage(null);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Lupa Password",
      "Akun siap pakai:\n• klaudius (pass: 123456)\n• dosen (pass: 123456)\n• admin (pass: 123456)",
      [{ text: "Mengerti" }]
    );
  };

  const handleSocialLogin = (platform: "Google" | "Facebook") => {
    Alert.alert(
      `Login dengan ${platform}`,
      `Fitur masuk via ${platform} (Simulasi Login Cepat)`,
      [
        {
          text: "Masuk sebagai Mahasiswa",
          onPress: () => handleSelectDemoAccount("klaudius", "123456"),
        },
        { text: "Batal", style: "cancel" },
      ]
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
              <Text style={styles.styleBadgeText}>Style 6 - Login</Text>
            </View>
          </View>

          {/* Illustration Card (Style 6) */}
          <View style={styles.illustrationCard}>
            <Image
              source={require("../../assets/images/illustrations/login-partnership.png")}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>

          {/* Quick Demo Accounts Helper */}
          <View style={styles.demoHelperCard}>
            <Text style={styles.demoHelperTitle}>
              💡 Akun Siap Pakai (Tap untuk Isi Otomatis):
            </Text>
            <View style={styles.demoChipsRow}>
              {DEFAULT_ACCOUNTS.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[
                    styles.demoChip,
                    identifier === acc.username && styles.demoChipActive,
                  ]}
                  onPress={() => handleSelectDemoAccount(acc.username, acc.password)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.demoChipText,
                      identifier === acc.username && styles.demoChipTextActive,
                    ]}
                  >
                    {acc.role}: {acc.username}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Form Inputs */}
          <View style={styles.formContainer}>
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Email / Username Field */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Email atau Username (cth: klaudius)"
                placeholderTextColor="#94A3B8"
                value={identifier}
                onChangeText={(t) => {
                  setIdentifier(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                autoComplete="username"
              />
            </View>

            {/* Password Field with Eye Toggle */}
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password (cth: 123456)"
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

            {/* Lupa Password */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                <Text style={styles.forgotPasswordText}>Lupa password?</Text>
              </TouchableOpacity>
            </View>

            {/* Masuk Button (Style 6) */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>MASUK</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Atau masuk menggunakan</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.85}
              onPress={() => handleSocialLogin("Google")}
            >
              <View style={styles.socialContent}>
                <Text style={styles.googleLogo}>G</Text>
                <Text style={styles.googleButtonText}>Google</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.facebookButton}
              activeOpacity={0.85}
              onPress={() => handleSocialLogin("Facebook")}
            >
              <View style={styles.socialContent}>
                <Text style={styles.facebookLogo}>f</Text>
                <Text style={styles.facebookButtonText}>Facebook</Text>
              </View>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerNormalText}>Belum punya akun? </Text>
              <TouchableOpacity
                onPress={() => router.push("/register")}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLinkText}>Mendaftar sekarang</Text>
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
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    paddingVertical: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  illustrationImage: {
    width: 160,
    height: 150,
  },
  demoHelperCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  demoHelperTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0369A1",
    marginBottom: 6,
  },
  demoChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  demoChip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7DD3FC",
  },
  demoChipActive: {
    backgroundColor: "#2B92E4",
    borderColor: "#2B92E4",
  },
  demoChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0284C7",
  },
  demoChipTextActive: {
    color: "#FFFFFF",
  },
  formContainer: {
    marginTop: 4,
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
    marginBottom: 8,
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
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 18,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
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
    marginBottom: 18,
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
