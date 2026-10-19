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

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Silahkan masukkan alamat email anda.");
      return;
    }
    if (!password) {
      setErrorMessage("Silahkan masukkan password anda.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({
        email: cleanEmail,
        password,
      });

      // Berhasil login
      router.replace("/dashboard");
    } catch (err: any) {
      const msg = err.message || "Gagal masuk. Periksa kembali email dan password anda.";
      setErrorMessage(msg);
      Alert.alert("Gagal Masuk", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Lupa Password",
      "Untuk reset password, silakan hubungi pengelola akun atau daftarkan akun baru.",
      [{ text: "Mengerti" }]
    );
  };

  const handleSocialLogin = (platform: "Google" | "Facebook") => {
    Alert.alert(
      `Login dengan ${platform}`,
      `Fitur masuk menggunakan ${platform} siap dihubungkan dengan OAuth Supabase.`,
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
              <Text style={styles.styleBadgeText}>Style 6 - Login</Text>
            </View>
          </View>

          {/* Illustration Card */}
          <View style={styles.illustrationCard}>
            <Image
              source={require("../../assets/images/illustrations/login-partnership.png")}
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

            {/* Email Field */}
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
                autoComplete="email"
              />
            </View>

            {/* Password Field with Eye Toggle */}
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

            {/* Lupa Password */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                <Text style={styles.forgotPasswordText}>Lupa password?</Text>
              </TouchableOpacity>
            </View>

            {/* Masuk Button */}
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

            {/* Footer: Belum punya akun? Mendaftar sekarang */}
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
    marginBottom: 12,
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
    paddingVertical: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  illustrationImage: {
    width: 170,
    height: 160,
  },
  formContainer: {
    marginTop: 8,
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
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
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: "#1E293B",
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
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
    marginBottom: 20,
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
    marginVertical: 18,
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
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
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
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
    marginTop: 4,
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
