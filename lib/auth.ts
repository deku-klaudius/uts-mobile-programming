import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'Mahasiswa' | 'Dosen' | 'Admin';
  nimOrNidn?: string;
  className?: string;
  password: string;
}

// Akun Bawaan (Default Accounts) yang langsung bisa dipakai login
export const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'user_1',
    username: 'klaudius',
    email: 'klaudius@lp3i.ac.id',
    fullName: 'Klaudius Oe Naimnou',
    phone: '081234567890',
    role: 'Mahasiswa',
    nimOrNidn: '240444020010',
    className: 'Informatika Komputer (IK-24)',
    password: '123456',
  },
  {
    id: 'user_2',
    username: 'dosen',
    email: 'sata@lp3i.ac.id',
    fullName: 'Sata Lesmana, M.Kom.',
    phone: '081987654321',
    role: 'Dosen',
    nimOrNidn: 'NIDN: 0423088901',
    className: 'Dosen Mobile Programming',
    password: '123456',
  },
  {
    id: 'user_3',
    username: 'admin',
    email: 'admin@lp3i.ac.id',
    fullName: 'Admin Akademik LP3I',
    phone: '081122334455',
    role: 'Admin',
    nimOrNidn: 'ADM-01',
    className: 'Bagian Akademik',
    password: '123456',
  },
];

const STORAGE_USERS_KEY = '@uts_users_list_v2';
const STORAGE_ACTIVE_SESSION = '@uts_session_user_v2';

export const authService = {
  /**
   * Mengambil semua daftar akun (akun default + akun yang baru didaftarkan)
   */
  async getAllUsers(): Promise<UserAccount[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_USERS_KEY);
      if (!raw) {
        await AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
        return DEFAULT_ACCOUNTS;
      }
      const parsed: UserAccount[] = JSON.parse(raw);
      return parsed;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  },

  /**
   * Mendaftar akun baru
   */
  async register(params: {
    fullName: string;
    emailOrUsername: string;
    phone: string;
    password: string;
  }): Promise<UserAccount> {
    const { fullName, emailOrUsername, phone, password } = params;
    const cleanIdentifier = emailOrUsername.trim().toLowerCase();

    const users = await this.getAllUsers();

    // Cek apakah email/username sudah pernah didaftarkan
    const exists = users.find(
      (u) =>
        u.email.toLowerCase() === cleanIdentifier ||
        u.username.toLowerCase() === cleanIdentifier
    );

    if (exists) {
      throw new Error('Email atau username sudah terdaftar! Silakan gunakan yang lain.');
    }

    const newUser: UserAccount = {
      id: `user_${Date.now()}`,
      username: cleanIdentifier.includes('@') ? cleanIdentifier.split('@')[0] : cleanIdentifier,
      email: cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@student.lp3i.ac.id`,
      fullName: fullName.trim(),
      phone: phone.trim() || '081234567890',
      role: 'Mahasiswa',
      nimOrNidn: '240444020010',
      className: 'Informatika Komputer (IK-24)',
      password: password,
    };

    const updatedList = [...users, newUser];
    await AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedList));

    return newUser;
  },

  /**
   * Login pengguna (bisa menggunakan Username ATAU Email)
   */
  async login(identifier: string, password: string): Promise<UserAccount> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const users = await this.getAllUsers();

    const matched = users.find(
      (u) =>
        (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
        u.password === cleanPass
    );

    if (!matched) {
      throw new Error('Username/Email atau Password salah! Periksa kembali data login Anda.');
    }

    // Simpan sesi aktif
    await AsyncStorage.setItem(STORAGE_ACTIVE_SESSION, JSON.stringify(matched));
    return matched;
  },

  /**
   * Mengambil sesi pengguna yang sedang login
   */
  async getActiveSession(): Promise<UserAccount | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_ACTIVE_SESSION);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return null;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_ACTIVE_SESSION);
    } catch {}
  },
};
